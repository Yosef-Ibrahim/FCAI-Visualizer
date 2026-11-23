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
  arrive: sameLine(3),
  idle: sameLine(5),
  dispatch: sameLine(7),
  run: sameLine(8),
  complete: sameLine(9),
  done: makeCodeLines(12, 11, 12, 12, 12),
};

export class FCFS extends SchedulingAlgorithm {
  constructor() {
    super('fcfs');
  }

  generateSteps(rawInput) {
    const { processes } = normalizeSchedulingInput(rawInput ?? this.getDefaultInput());
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
      { level: 0, label: 'Ready Queue', policy: 'FCFS', pids: readyQueue.map((p) => p.pid) },
    ];

    steps.push(
      createSchedStep({
        msg: `Initialized FCFS scheduler with ${simProcs.length} processes.`,
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

    const enqueueArrivals = () => {
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

      steps.push(
        createSchedStep({
          msg: `Dispatched ${p.pid} at t=${time} (remaining=${p.remaining}).`,
          msgKey: 'scheduling:steps.dispatch',
          msgParams: { pid: p.pid, time, remaining: p.remaining },
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
          formulaHint: `Response(${p.pid}) = ${p.startTime} - ${p.arrival} = ${p.response}`,
        }),
      );

      const start = time;
      const end = start + p.remaining;
      recordGanttSlice(gantt, p.pid, start, end, null, false);
      busyTime += p.remaining;
      time = end;
      p.remaining = 0;

      steps.push(
        createSchedStep({
          msg: `${p.pid} ran from t=${start} to t=${end} (remaining=0).`,
          msgKey: 'scheduling:steps.runSlice',
          msgParams: { pid: p.pid, start, end, remaining: 0 },
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
    doneStep.msg = `FCFS complete: Avg Wait=${formatMetric(m.avgWaiting)}, Avg TAT=${formatMetric(m.avgTurnaround)}, Avg Response=${formatMetric(m.avgResponse)}, CPU Util=${formatMetric(m.cpuUtilization)}%.`;
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
