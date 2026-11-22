import { SchedulingAlgorithm } from './SchedulingAlgorithm';
import {
  normalizeSchedulingInput,
  createSimProcesses,
  compareArrivalOrder,
  recordGanttSlice,
  buildCompletionFormula,
  buildSummaryFormula,
  formatMetric,
  makeCodeLines,
  sameLine,
  createSchedStep,
} from './schedulingUtils';

const LINES = {
  init: sameLine(2),
  arrive: sameLine(4),
  idle: sameLine(8),
  dispatch: sameLine(10),
  run: sameLine(13),
  complete: sameLine(16),
  demote: sameLine(17),
  preempt: sameLine(18),
  done: makeCodeLines(20, 19, 20, 20, 20),
};

export class MultilevelFeedbackQueue extends SchedulingAlgorithm {
  constructor() {
    super('mlfq');
  }

  generateSteps(rawInput) {
    const { processes, mlfqQuanta } = normalizeSchedulingInput(rawInput ?? this.getDefaultInput());
    const [q0Limit, q1Limit] = mlfqQuanta;
    const quanta = [q0Limit, q1Limit, Infinity];

    const simProcs = createSimProcesses(processes).map((p) => ({
      ...p,
      queue: 0,
      sliceLeft: q0Limit,
    }));
    const ordered = [...simProcs].sort(compareArrivalOrder);

    const steps = [];
    const queues = [[], [], []];
    const gantt = [];
    let time = 0;
    let busyTime = 0;
    let contextSwitches = 0;
    let lastRunningPid = null;
    let nextIdx = 0;
    let completedCount = 0;

    const getReadyQueues = () => [
      { level: 0, label: 'Q0 (High)', policy: `RR (q=${q0Limit})`, pids: queues[0].map((p) => p.pid) },
      { level: 1, label: 'Q1 (Medium)', policy: `RR (q=${q1Limit})`, pids: queues[1].map((p) => p.pid) },
      { level: 2, label: 'Q2 (Low)', policy: 'FCFS', pids: queues[2].map((p) => p.pid) },
    ];

    const policyForLevel = (lvl) => {
      if (lvl === 0) return `RR (q=${q0Limit})`;
      if (lvl === 1) return `RR (q=${q1Limit})`;
      return 'FCFS';
    };

    steps.push(
      createSchedStep({
        msg: `Initialized MLFQ scheduler (Q0 q=${q0Limit} → Q1 q=${q1Limit} → Q2 FCFS) with ${simProcs.length} processes.`,
        msgKey: 'scheduling:steps.init',
        msgParams: { count: simProcs.length },
        codeLines: LINES.init,
        time,
        phase: 'init',
        readyQueues: getReadyQueues(),
        gantt,
        simProcs,
        busyTime,
        contextSwitches,
      }),
    );

    const enqueueNewArrivals = (runningPid = null, activeQueueLevel = null) => {
      while (nextIdx < ordered.length && ordered[nextIdx].arrival <= time) {
        const p = ordered[nextIdx++];
        p.queue = 0;
        p.sliceLeft = q0Limit;
        p.state = 'ready';
        queues[0].push(p);
        steps.push(
          createSchedStep({
            msg: `${p.pid} arrived at t=${p.arrival} and entered Q0.`,
            msgKey: 'scheduling:steps.arriveQueue',
            msgParams: { pid: p.pid, time: p.arrival, queue: 'Q0' },
            codeLines: LINES.arrive,
            time,
            phase: 'arrive',
            runningPid,
            activeQueueLevel,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
          }),
        );
      }
    };

    while (completedCount < simProcs.length) {
      enqueueNewArrivals();

      const lvl = queues.findIndex((q) => q.length > 0);
      if (lvl === -1) {
        const nextTime = ordered[nextIdx].arrival;
        const idleStart = time;
        recordGanttSlice(gantt, 'IDLE', idleStart, nextTime, null, true);
        time = nextTime;
        steps.push(
          createSchedStep({
            msg: `CPU idle from t=${idleStart} to t=${nextTime} waiting for next arrival.`,
            msgKey: 'scheduling:steps.idle',
            msgParams: { start: idleStart, end: nextTime },
            codeLines: LINES.idle,
            time,
            phase: 'idle',
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
          }),
        );
        continue;
      }

      const p = queues[lvl].shift();
      if (lastRunningPid !== null && lastRunningPid !== p.pid) {
        contextSwitches += 1;
      }
      lastRunningPid = p.pid;
      p.state = 'running';
      if (p.startTime === null) {
        p.startTime = time;
        p.response = time - p.arrival;
      }

      const policy = policyForLevel(lvl);
      steps.push(
        createSchedStep({
          msg: `Dispatched ${p.pid} from Q${lvl} (${policy}) at t=${time}.`,
          msgKey: 'scheduling:steps.dispatchQueue',
          msgParams: { pid: p.pid, time, queue: `Q${lvl}`, policy },
          codeLines: LINES.dispatch,
          time,
          phase: 'dispatch',
          runningPid: p.pid,
          activeQueueLevel: lvl,
          readyQueues: getReadyQueues(),
          gantt,
          simProcs,
          busyTime,
          contextSwitches,
          highlightPid: p.pid,
          formulaHint: `Highest non-empty queue = Q${lvl} (${policy}) | Remaining(${p.pid}) = ${p.remaining}`,
        }),
      );

      // Higher-priority arrivals always enter Q0, so they preempt running Q1/Q2 processes
      const nextArrival = lvl > 0 && nextIdx < ordered.length ? ordered[nextIdx].arrival : Infinity;
      const allowance = Number.isFinite(p.sliceLeft) ? p.sliceLeft : quanta[lvl];
      const slice = Math.min(p.remaining, allowance, nextArrival - time);
      const start = time;
      const end = start + slice;

      recordGanttSlice(gantt, p.pid, start, end, lvl, false);
      busyTime += slice;
      time = end;
      p.remaining -= slice;
      if (Number.isFinite(p.sliceLeft)) {
        p.sliceLeft -= slice;
      }

      steps.push(
        createSchedStep({
          msg: `${p.pid} ran from t=${start} to t=${end} in Q${lvl} (remaining=${p.remaining}).`,
          msgKey: 'scheduling:steps.runSlice',
          msgParams: { pid: p.pid, start, end, remaining: p.remaining },
          codeLines: LINES.run,
          time,
          phase: 'run',
          runningPid: p.pid,
          activeQueueLevel: lvl,
          readyQueues: getReadyQueues(),
          gantt,
          simProcs,
          busyTime,
          contextSwitches,
          highlightPid: p.pid,
        }),
      );

      enqueueNewArrivals(p.remaining > 0 ? p.pid : null, p.remaining > 0 ? lvl : null);

      if (p.remaining === 0) {
        p.finishTime = time;
        p.turnaround = p.finishTime - p.arrival;
        p.waiting = p.turnaround - p.burst;
        p.state = 'done';
        completedCount += 1;

        steps.push(
          createSchedStep({
            msg: `${p.pid} completed at t=${p.finishTime} (TAT=${p.turnaround}, WT=${p.waiting}, RT=${p.response}).`,
            msgKey: 'scheduling:steps.complete',
            msgParams: {
              pid: p.pid,
              finish: p.finishTime,
              turnaround: p.turnaround,
              waiting: p.waiting,
              response: p.response,
            },
            codeLines: LINES.complete,
            time,
            phase: 'complete',
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
            formulaHint: buildCompletionFormula(p),
          }),
        );
      } else if (lvl < 2 && p.sliceLeft === 0) {
        const nextLevel = lvl + 1;
        p.queue = nextLevel;
        p.sliceLeft = quanta[nextLevel];
        p.state = 'ready';
        queues[nextLevel].push(p);

        steps.push(
          createSchedStep({
            msg: `${p.pid} exhausted its Q${lvl} quantum at t=${time} and was demoted to Q${nextLevel} (remaining=${p.remaining}).`,
            msgKey: 'scheduling:steps.demote',
            msgParams: {
              pid: p.pid,
              fromQueue: `Q${lvl}`,
              toQueue: `Q${nextLevel}`,
              time,
              remaining: p.remaining,
            },
            codeLines: LINES.demote,
            time,
            phase: 'demote',
            runningPid: null,
            activeQueueLevel: null,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
            formulaHint: `Demotion: ${p.pid} used full Q${lvl} quantum (${quanta[lvl]}) → Q${nextLevel} (${policyForLevel(nextLevel)})`,
          }),
        );
      } else {
        // Preempted by a higher-priority Q0 arrival before exhausting current queue quantum
        p.state = 'ready';
        queues[lvl].unshift(p);
        const incomingPid = queues[0][0] ? queues[0][0].pid : 'Q0';
        const reason = `higher-priority Q0 arrival while running in Q${lvl}`;

        steps.push(
          createSchedStep({
            msg: `${incomingPid} preempted ${p.pid} at t=${time} (${reason}).`,
            msgKey: 'scheduling:steps.preempt',
            msgParams: {
              currentPid: p.pid,
              incomingPid,
              time,
              reason,
            },
            codeLines: LINES.preempt,
            time,
            phase: 'preempt',
            runningPid: null,
            activeQueueLevel: null,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: incomingPid,
            formulaHint: `Preempt: Q0 > Q${lvl} (${p.pid} keeps remaining slice in Q${lvl})`,
          }),
        );
      }
    }

    const doneStep = createSchedStep({
      msg: '',
      msgKey: 'scheduling:steps.done',
      msgParams: {},
      codeLines: LINES.done,
      time,
      phase: 'done',
      readyQueues: getReadyQueues(),
      gantt,
      simProcs,
      busyTime,
      contextSwitches,
    });
    const m = doneStep.sched.metrics;
    doneStep.msg = `MLFQ complete: Avg Wait=${formatMetric(m.avgWaiting)}, Avg TAT=${formatMetric(m.avgTurnaround)}, Avg Response=${formatMetric(m.avgResponse)}, CPU Util=${formatMetric(m.cpuUtilization)}%.`;
    doneStep.msgParams = {
      avgWaiting: formatMetric(m.avgWaiting),
      avgTurnaround: formatMetric(m.avgTurnaround),
      avgResponse: formatMetric(m.avgResponse),
      cpuUtilization: formatMetric(m.cpuUtilization),
    };
    doneStep.sched.formulaHint = buildSummaryFormula(m);
    steps.push(doneStep);

    return steps;
  }
}
