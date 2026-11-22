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
  idle: sameLine(6),
  dispatch: sameLine(9),
  run: sameLine(11),
  quantumExpire: sameLine(14),
  complete: sameLine(15),
  done: makeCodeLines(17, 16, 17, 17, 17),
};

export class RoundRobin extends SchedulingAlgorithm {
  constructor() {
    super('round-robin');
  }

  generateSteps(rawInput) {
    const { processes, quantum } = normalizeSchedulingInput(rawInput ?? this.getDefaultInput());
    const simProcs = createSimProcesses(processes);
    const ordered = [...simProcs].sort(compareArrivalOrder);

    const steps = [];
    const readyQueue = [];
    const gantt = [];
    let time = 0;
    let busyTime = 0;
    let contextSwitches = 0;
    let lastRunningPid = null;
    let nextIdx = 0;
    let completedCount = 0;

    const getReadyQueues = () => [
      { level: 0, label: 'Ready Queue', policy: `RR (q=${quantum})`, pids: readyQueue.map((p) => p.pid) },
    ];

    steps.push(
      createSchedStep({
        msg: `Initialized Round Robin scheduler (q=${quantum}) with ${simProcs.length} processes.`,
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

    const enqueueArrivals = (runningPid = null) => {
      while (nextIdx < ordered.length && ordered[nextIdx].arrival <= time) {
        const p = ordered[nextIdx++];
        p.state = 'ready';
        readyQueue.push(p);
        steps.push(
          createSchedStep({
            msg: `${p.pid} arrived at t=${p.arrival} (burst=${p.burst}) and entered the ready queue.`,
            msgKey: 'scheduling:steps.arrive',
            msgParams: { pid: p.pid, time: p.arrival, burst: p.burst },
            codeLines: LINES.arrive,
            time,
            phase: 'arrive',
            runningPid,
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
      enqueueArrivals();

      if (readyQueue.length === 0) {
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

      const p = readyQueue.shift();
      if (lastRunningPid !== null && lastRunningPid !== p.pid) {
        contextSwitches += 1;
      }
      lastRunningPid = p.pid;
      p.state = 'running';
      if (p.startTime === null) {
        p.startTime = time;
        p.response = time - p.arrival;
      }

      const slice = Math.min(p.remaining, quantum);
      steps.push(
        createSchedStep({
          msg: `Dispatched ${p.pid} at t=${time} with quantum q=${quantum} (remaining=${p.remaining}).`,
          msgKey: 'scheduling:steps.dispatchQuantum',
          msgParams: { pid: p.pid, time, quantum, remaining: p.remaining },
          codeLines: LINES.dispatch,
          time,
          phase: 'dispatch',
          runningPid: p.pid,
          readyQueues: getReadyQueues(),
          gantt,
          simProcs,
          busyTime,
          contextSwitches,
          highlightPid: p.pid,
          formulaHint: `Slice = min(remaining=${p.remaining}, q=${quantum}) = ${slice}`,
        }),
      );

      const start = time;
      const end = start + slice;
      recordGanttSlice(gantt, p.pid, start, end, null, false);
      busyTime += slice;
      time = end;
      p.remaining -= slice;

      steps.push(
        createSchedStep({
          msg: `${p.pid} ran from t=${start} to t=${end} (remaining=${p.remaining}).`,
          msgKey: 'scheduling:steps.runSlice',
          msgParams: { pid: p.pid, start, end, remaining: p.remaining },
          codeLines: LINES.run,
          time,
          phase: 'run',
          runningPid: p.pid,
          readyQueues: getReadyQueues(),
          gantt,
          simProcs,
          busyTime,
          contextSwitches,
          highlightPid: p.pid,
        }),
      );

      // New arrivals up to `time` enter the queue BEFORE the expired process is re-queued
      enqueueArrivals(p.remaining > 0 ? p.pid : null);

      if (p.remaining > 0) {
        p.state = 'ready';
        readyQueue.push(p);
        steps.push(
          createSchedStep({
            msg: `${p.pid}'s time quantum expired at t=${time}; re-queued with remaining=${p.remaining}.`,
            msgKey: 'scheduling:steps.quantumExpire',
            msgParams: { pid: p.pid, time, remaining: p.remaining },
            codeLines: LINES.quantumExpire,
            time,
            phase: 'preempt',
            runningPid: null,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
            formulaHint: `Quantum expired: remaining(${p.pid}) = ${p.remaining} > 0 → tail of ready queue`,
          }),
        );
      } else {
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
    doneStep.msg = `Round Robin complete: Avg Wait=${formatMetric(m.avgWaiting)}, Avg TAT=${formatMetric(m.avgTurnaround)}, Avg Response=${formatMetric(m.avgResponse)}, CPU Util=${formatMetric(m.cpuUtilization)}%.`;
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
