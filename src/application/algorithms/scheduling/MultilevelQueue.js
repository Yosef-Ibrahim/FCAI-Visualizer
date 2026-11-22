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
  idle: sameLine(7),
  dispatchQ0: sameLine(10),
  runQ0: sameLine(11),
  expireQ0: sameLine(13),
  completeQ0: makeCodeLines(13, 14, 13, 13, 13),
  dispatchQ1: makeCodeLines(15, 16, 15, 15, 15),
  runQ1: makeCodeLines(17, 18, 17, 17, 17),
  preemptQ1: makeCodeLines(19, 20, 19, 19, 19),
  completeQ1: makeCodeLines(19, 21, 19, 19, 19),
  done: sameLine(22),
};

export class MultilevelQueue extends SchedulingAlgorithm {
  constructor() {
    super('mlq');
  }

  generateSteps(rawInput) {
    const { processes, quantum } = normalizeSchedulingInput(rawInput ?? this.getDefaultInput());
    const simProcs = createSimProcesses(processes);
    const ordered = [...simProcs].sort(compareArrivalOrder);

    const steps = [];
    const q0 = [];
    const q1 = [];
    const gantt = [];
    let time = 0;
    let busyTime = 0;
    let contextSwitches = 0;
    let lastRunningPid = null;
    let nextIdx = 0;
    let completedCount = 0;

    const getReadyQueues = () => [
      { level: 0, label: 'Q0 Foreground', policy: `RR (q=${quantum})`, pids: q0.map((p) => p.pid) },
      { level: 1, label: 'Q1 Background', policy: 'FCFS', pids: q1.map((p) => p.pid) },
    ];

    steps.push(
      createSchedStep({
        msg: `Initialized Multilevel Queue scheduler (Q0 RR q=${quantum}, Q1 FCFS) with ${simProcs.length} processes.`,
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

    const enqueueArrivals = (runningPid = null, activeQueueLevel = null) => {
      while (nextIdx < ordered.length && ordered[nextIdx].arrival <= time) {
        const p = ordered[nextIdx++];
        p.state = 'ready';
        if (p.queue === 0) {
          q0.push(p);
        } else {
          q1.push(p);
        }
        steps.push(
          createSchedStep({
            msg: `${p.pid} arrived at t=${p.arrival} and entered Q${p.queue}.`,
            msgKey: 'scheduling:steps.arriveQueue',
            msgParams: { pid: p.pid, time: p.arrival, queue: `Q${p.queue}` },
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

    const nextQ0ArrivalAfter = () => {
      for (let i = nextIdx; i < ordered.length; i += 1) {
        if (ordered[i].queue === 0) return ordered[i].arrival;
      }
      return Infinity;
    };

    while (completedCount < simProcs.length) {
      enqueueArrivals();

      if (q0.length === 0 && q1.length === 0) {
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

      if (q0.length > 0) {
        const p = q0.shift();
        if (lastRunningPid !== null && lastRunningPid !== p.pid) {
          contextSwitches += 1;
        }
        lastRunningPid = p.pid;
        p.state = 'running';
        if (p.startTime === null) {
          p.startTime = time;
          p.response = time - p.arrival;
        }

        const policy = `RR (q=${quantum})`;
        const slice = Math.min(p.remaining, quantum);
        steps.push(
          createSchedStep({
            msg: `Dispatched ${p.pid} from Q0 (${policy}) at t=${time}.`,
            msgKey: 'scheduling:steps.dispatchQueue',
            msgParams: { pid: p.pid, time, queue: 'Q0', policy },
            codeLines: LINES.dispatchQ0,
            time,
            phase: 'dispatch',
            runningPid: p.pid,
            activeQueueLevel: 0,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
            formulaHint: `Q0 Foreground (RR q=${quantum}) > Q1 Background (FCFS) | Slice = ${slice}`,
          }),
        );

        const start = time;
        const end = start + slice;
        recordGanttSlice(gantt, p.pid, start, end, 0, false);
        busyTime += slice;
        time = end;
        p.remaining -= slice;

        steps.push(
          createSchedStep({
            msg: `${p.pid} ran from t=${start} to t=${end} in Q0 (remaining=${p.remaining}).`,
            msgKey: 'scheduling:steps.runSlice',
            msgParams: { pid: p.pid, start, end, remaining: p.remaining },
            codeLines: LINES.runQ0,
            time,
            phase: 'run',
            runningPid: p.pid,
            activeQueueLevel: 0,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
          }),
        );

        enqueueArrivals(p.remaining > 0 ? p.pid : null, p.remaining > 0 ? 0 : null);

        if (p.remaining > 0) {
          p.state = 'ready';
          q0.push(p);
          steps.push(
            createSchedStep({
              msg: `${p.pid}'s Q0 quantum expired at t=${time}; re-queued in Q0 (remaining=${p.remaining}).`,
              msgKey: 'scheduling:steps.quantumExpire',
              msgParams: { pid: p.pid, time, remaining: p.remaining },
              codeLines: LINES.expireQ0,
              time,
              phase: 'preempt',
              runningPid: null,
              activeQueueLevel: null,
              readyQueues: getReadyQueues(),
              gantt,
              simProcs,
              busyTime,
              contextSwitches,
              highlightPid: p.pid,
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
              codeLines: LINES.completeQ0,
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
      } else {
        const p = q1.shift();
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
            msg: `Dispatched ${p.pid} from Q1 (FCFS) at t=${time} because Q0 is empty.`,
            msgKey: 'scheduling:steps.dispatchQueue',
            msgParams: { pid: p.pid, time, queue: 'Q1', policy: 'FCFS' },
            codeLines: LINES.dispatchQ1,
            time,
            phase: 'dispatch',
            runningPid: p.pid,
            activeQueueLevel: 1,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
            formulaHint: `Q0 empty → dispatch Q1 Background (FCFS) | Response(${p.pid}) = ${p.response}`,
          }),
        );

        const nextQ0 = nextQ0ArrivalAfter();
        const slice = Math.min(p.remaining, nextQ0 - time);
        const start = time;
        const end = start + slice;
        recordGanttSlice(gantt, p.pid, start, end, 1, true);
        busyTime += slice;
        time = end;
        p.remaining -= slice;

        steps.push(
          createSchedStep({
            msg: `${p.pid} ran from t=${start} to t=${end} in Q1 (remaining=${p.remaining}).`,
            msgKey: 'scheduling:steps.runSlice',
            msgParams: { pid: p.pid, start, end, remaining: p.remaining },
            codeLines: LINES.runQ1,
            time,
            phase: 'run',
            runningPid: p.pid,
            activeQueueLevel: 1,
            readyQueues: getReadyQueues(),
            gantt,
            simProcs,
            busyTime,
            contextSwitches,
            highlightPid: p.pid,
          }),
        );

        enqueueArrivals(p.remaining > 0 ? p.pid : null, p.remaining > 0 ? 1 : null);

        if (p.remaining > 0) {
          p.state = 'ready';
          q1.unshift(p);
          const incomingPid = q0[0] ? q0[0].pid : 'Q0';
          const reason = 'higher-priority Q0 foreground arrival';
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
              codeLines: LINES.preemptQ1,
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
              formulaHint: `Fixed priority Q0 > Q1: ${incomingPid} preempts ${p.pid}`,
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
              codeLines: LINES.completeQ1,
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
    doneStep.msg = `MLQ complete: Avg Wait=${formatMetric(m.avgWaiting)}, Avg TAT=${formatMetric(m.avgTurnaround)}, Avg Response=${formatMetric(m.avgResponse)}, CPU Util=${formatMetric(m.cpuUtilization)}%.`;
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
