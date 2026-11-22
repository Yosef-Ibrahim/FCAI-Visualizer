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
  init: sameLine(1),
  arrive: sameLine(3),
  idle: sameLine(6),
  dispatch: sameLine(9),
  preempt: sameLine(10),
  run: sameLine(12),
  complete: sameLine(14),
  done: makeCodeLines(16, 15, 16, 16, 16),
};

function compareRemainingOrder(a, b) {
  return a.remaining - b.remaining || compareArrivalOrder(a, b);
}

export class SRTF extends SchedulingAlgorithm {
  constructor() {
    super('srtf');
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
    let running = null;
    let nextIdx = 0;
    let completedCount = 0;

    const getReadyQueues = () => {
      readyQueue.sort(compareRemainingOrder);
      return [
        { level: 0, label: 'Ready Queue', policy: 'SRTF', pids: readyQueue.map((p) => p.pid) },
      ];
    };

    steps.push(
      createSchedStep({
        msg: `Initialized SRTF scheduler with ${simProcs.length} processes.`,
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
        readyQueue.sort(compareRemainingOrder);
        steps.push(
          createSchedStep({
            msg: `${p.pid} arrived at t=${p.arrival} (burst=${p.burst}) and entered the ready queue.`,
            msgKey: 'scheduling:steps.arrive',
            msgParams: { pid: p.pid, time: p.arrival, burst: p.burst },
            codeLines: LINES.arrive,
            time,
            phase: 'arrive',
            runningPid: running ? running.pid : null,
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

      if (running !== null && readyQueue.length > 0) {
        readyQueue.sort(compareRemainingOrder);
        const challenger = readyQueue[0];
        if (challenger.remaining < running.remaining) {
          const prev = running;
          prev.state = 'ready';
          readyQueue.push(prev);
          readyQueue.sort(compareRemainingOrder);
          running = null;
          const reason = `shorter remaining time (${challenger.remaining} < ${prev.remaining})`;
          steps.push(
            createSchedStep({
              msg: `${challenger.pid} preempted ${prev.pid} at t=${time} (${reason}).`,
              msgKey: 'scheduling:steps.preempt',
              msgParams: {
                currentPid: prev.pid,
                incomingPid: challenger.pid,
                time,
                reason,
              },
              codeLines: LINES.preempt,
              time,
              phase: 'preempt',
              runningPid: null,
              readyQueues: getReadyQueues(),
              gantt,
              simProcs,
              busyTime,
              contextSwitches,
              highlightPid: challenger.pid,
              formulaHint: `Preempt: remaining(${challenger.pid})=${challenger.remaining} < remaining(${prev.pid})=${prev.remaining}`,
            }),
          );
        }
      }

      if (running === null) {
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

        readyQueue.sort(compareRemainingOrder);
        running = readyQueue.shift();
        if (lastRunningPid !== null && lastRunningPid !== running.pid) {
          contextSwitches += 1;
        }
        lastRunningPid = running.pid;
        running.state = 'running';
        if (running.startTime === null) {
          running.startTime = time;
          running.response = time - running.arrival;
        }

        steps.push(
          createSchedStep({
            msg: `Dispatched ${running.pid} at t=${time} (remaining=${running.remaining}).`,
            msgKey: 'scheduling:steps.dispatch',
            msgParams: { pid: running.pid, time, remaining: running.remaining },
            codeLines: LINES.dispatch,
            time,
            phase: 'dispatch',
            runningPid: running.pid,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: running.pid,
            formulaHint: `Shortest remaining = ${running.remaining} | Response(${running.pid}) = ${running.startTime} - ${running.arrival} = ${running.response}`,
          }),
        );
      }

      const nextArrival = nextIdx < ordered.length ? ordered[nextIdx].arrival : Infinity;
      const slice = Math.min(running.remaining, nextArrival - time);
      const start = time;
      const end = start + slice;

      recordGanttSlice(gantt, running.pid, start, end, null, true);
      busyTime += slice;
      time = end;
      running.remaining -= slice;

      steps.push(
        createSchedStep({
          msg: `${running.pid} ran from t=${start} to t=${end} (remaining=${running.remaining}).`,
          msgKey: 'scheduling:steps.runSlice',
          msgParams: { pid: running.pid, start, end, remaining: running.remaining },
          codeLines: LINES.run,
          time,
          phase: 'run',
          runningPid: running.pid,
          readyQueues: getReadyQueues(),
          gantt,
          simProcs,
          busyTime,
          contextSwitches,
          highlightPid: running.pid,
        }),
      );

      if (running.remaining === 0) {
        const finished = running;
        finished.finishTime = time;
        finished.turnaround = finished.finishTime - finished.arrival;
        finished.waiting = finished.turnaround - finished.burst;
        finished.state = 'done';
        running = null;
        completedCount += 1;

        steps.push(
          createSchedStep({
            msg: `${finished.pid} completed at t=${finished.finishTime} (TAT=${finished.turnaround}, WT=${finished.waiting}, RT=${finished.response}).`,
            msgKey: 'scheduling:steps.complete',
            msgParams: {
              pid: finished.pid,
              finish: finished.finishTime,
              turnaround: finished.turnaround,
              waiting: finished.waiting,
              response: finished.response,
            },
            codeLines: LINES.complete,
            time,
            phase: 'complete',
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: finished.pid,
            formulaHint: buildCompletionFormula(finished),
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
    doneStep.msg = `SRTF complete: Avg Wait=${formatMetric(m.avgWaiting)}, Avg TAT=${formatMetric(m.avgTurnaround)}, Avg Response=${formatMetric(m.avgResponse)}, CPU Util=${formatMetric(m.cpuUtilization)}%.`;
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
