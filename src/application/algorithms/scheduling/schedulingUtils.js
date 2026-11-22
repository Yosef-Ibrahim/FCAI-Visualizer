import { Step } from '../../../domain/algorithms/Step';

const MIN_PROCESSES = 1;
const MAX_PROCESSES = 8;
const MIN_BURST = 1;
const MAX_BURST = 100;
const MIN_QUANTUM = 1;
const MAX_QUANTUM = 30;

function makeProc(pid, arrival, burst, priority = 1, queue = 0) {
  return { pid, arrival, burst, priority, queue };
}

export const SCHEDULING_PRESETS = {
  fcfs: [
    {
      id: 'fcfsSlide11',
      labelKey: 'presets.fcfsSlide11',
      input: {
        processes: [
          makeProc('P1', 0, 24),
          makeProc('P2', 0, 3),
          makeProc('P3', 0, 3),
        ],
      },
    },
    {
      id: 'fcfsConvoy',
      labelKey: 'presets.fcfsConvoy',
      input: {
        processes: [
          makeProc('P2', 0, 3),
          makeProc('P3', 0, 3),
          makeProc('P1', 0, 24),
        ],
      },
    },
    {
      id: 'fcfsIdle',
      labelKey: 'presets.fcfsIdle',
      input: {
        processes: [
          makeProc('P1', 0, 4),
          makeProc('P2', 6, 3),
          makeProc('P3', 7, 2),
        ],
      },
    },
  ],
  sjf: [
    {
      id: 'sjfSlide19',
      labelKey: 'presets.sjfSlide19',
      input: {
        processes: [
          makeProc('P1', 0, 7),
          makeProc('P2', 2, 4),
          makeProc('P3', 4, 1),
          makeProc('P4', 5, 4),
        ],
      },
    },
    {
      id: 'sjfSlide14',
      labelKey: 'presets.sjfSlide14',
      input: {
        processes: [
          makeProc('P1', 0, 6),
          makeProc('P2', 0, 8),
          makeProc('P3', 0, 7),
          makeProc('P4', 0, 3),
        ],
      },
    },
  ],
  srtf: [
    {
      id: 'srtfSlide20',
      labelKey: 'presets.srtfSlide20',
      input: {
        processes: [
          makeProc('P1', 0, 7),
          makeProc('P2', 2, 4),
          makeProc('P3', 4, 1),
          makeProc('P4', 5, 4),
        ],
      },
    },
    {
      id: 'srtfSlide21',
      labelKey: 'presets.srtfSlide21',
      input: {
        processes: [
          makeProc('P1', 0, 8),
          makeProc('P2', 1, 4),
          makeProc('P3', 2, 9),
          makeProc('P4', 3, 5),
        ],
      },
    },
  ],
  priority: [
    {
      id: 'prioSlide23',
      labelKey: 'presets.prioSlide23',
      input: {
        processes: [
          makeProc('P1', 0, 10, 3),
          makeProc('P2', 0, 1, 1),
          makeProc('P3', 0, 2, 4),
          makeProc('P4', 0, 1, 5),
          makeProc('P5', 0, 5, 2),
        ],
        preemptive: false,
      },
    },
    {
      id: 'prioPreemptive',
      labelKey: 'presets.prioPreemptive',
      input: {
        processes: [
          makeProc('P1', 0, 8, 3),
          makeProc('P2', 1, 4, 1),
          makeProc('P3', 2, 3, 2),
          makeProc('P4', 4, 2, 4),
        ],
        preemptive: true,
      },
    },
  ],
  'round-robin': [
    {
      id: 'rrSlide25',
      labelKey: 'presets.rrSlide25',
      input: {
        processes: [
          makeProc('P1', 0, 24),
          makeProc('P2', 0, 3),
          makeProc('P3', 0, 3),
        ],
        quantum: 4,
      },
    },
    {
      id: 'rrSlide26',
      labelKey: 'presets.rrSlide26',
      input: {
        processes: [
          makeProc('P1', 0, 53),
          makeProc('P2', 0, 17),
          makeProc('P3', 0, 68),
          makeProc('P4', 0, 24),
        ],
        quantum: 20,
      },
    },
    {
      id: 'rrSlide39',
      labelKey: 'presets.rrSlide39',
      input: {
        processes: [
          makeProc('P1', 0, 10),
          makeProc('P2', 0, 29),
          makeProc('P3', 0, 3),
          makeProc('P4', 0, 7),
          makeProc('P5', 0, 12),
        ],
        quantum: 10,
      },
    },
  ],
  mlq: [
    {
      id: 'mlqDefault',
      labelKey: 'presets.mlqDefault',
      input: {
        processes: [
          makeProc('P1', 0, 8, 1, 0),
          makeProc('P2', 1, 6, 1, 1),
          makeProc('P3', 2, 5, 1, 0),
          makeProc('P4', 3, 4, 1, 1),
          makeProc('P5', 6, 3, 1, 0),
        ],
        quantum: 4,
      },
    },
  ],
  mlfq: [
    {
      id: 'mlfqSlide32',
      labelKey: 'presets.mlfqSlide32',
      input: {
        processes: [
          makeProc('P1', 0, 26),
          makeProc('P2', 2, 6),
          makeProc('P3', 5, 12),
          makeProc('P4', 10, 4),
        ],
        mlfqQuanta: [8, 16],
      },
    },
  ],
};

function toClampedInt(value, fallback, min, max) {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (max !== undefined && rounded > max) return max;
  return rounded;
}

export function normalizeSchedulingInput(input) {
  const rawList = Array.isArray(input)
    ? input
    : Array.isArray(input?.processes)
      ? input.processes
      : [];

  const sliced = rawList.slice(0, MAX_PROCESSES);
  const usedPids = new Set();

  const processes = sliced.map((raw, idx) => {
    const basePid =
      typeof raw?.pid === 'string' && raw.pid.trim().length > 0
        ? raw.pid.trim()
        : `P${idx + 1}`;
    let pid = basePid;
    let suffix = 2;
    while (usedPids.has(pid)) {
      pid = `${basePid}_${suffix}`;
      suffix += 1;
    }
    usedPids.add(pid);

    return {
      pid,
      arrival: toClampedInt(raw?.arrival, 0, 0),
      burst: toClampedInt(raw?.burst, 1, MIN_BURST, MAX_BURST),
      priority: toClampedInt(raw?.priority, 1, 1),
      queue: toClampedInt(raw?.queue, 0, 0, 1),
    };
  });

  if (processes.length < MIN_PROCESSES) {
    processes.push(makeProc('P1', 0, 4, 1, 0));
  }

  const quantum = toClampedInt(input?.quantum, 4, MIN_QUANTUM, MAX_QUANTUM);
  const preemptive = Boolean(input?.preemptive);
  const rawQuanta = Array.isArray(input?.mlfqQuanta) ? input.mlfqQuanta : [];
  const mlfqQuanta = [
    toClampedInt(rawQuanta[0], 8, MIN_QUANTUM, MAX_QUANTUM),
    toClampedInt(rawQuanta[1], 16, MIN_QUANTUM, MAX_QUANTUM),
  ];

  return { processes, quantum, preemptive, mlfqQuanta };
}

export function cloneInput(input) {
  return {
    ...input,
    processes: input.processes.map((p) => ({ ...p })),
    ...(input.mlfqQuanta ? { mlfqQuanta: [...input.mlfqQuanta] } : {}),
  };
}

export function createSimProcesses(normalizedProcesses) {
  return normalizedProcesses.map((p, origIndex) => ({
    pid: p.pid,
    arrival: p.arrival,
    burst: p.burst,
    priority: p.priority,
    queue: p.queue,
    remaining: p.burst,
    startTime: null,
    finishTime: null,
    turnaround: null,
    waiting: null,
    response: null,
    state: 'new',
    origIndex,
  }));
}

export function compareArrivalOrder(a, b) {
  return a.arrival - b.arrival || a.origIndex - b.origIndex;
}

export function formatMetric(value) {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
}

export function computeMetrics(simProcs, time, busyTime, contextSwitches) {
  const completed = simProcs.filter((p) => p.finishTime !== null);
  const started = simProcs.filter((p) => p.startTime !== null);

  const avgWaiting =
    completed.length > 0
      ? completed.reduce((sum, p) => sum + p.waiting, 0) / completed.length
      : 0;
  const avgTurnaround =
    completed.length > 0
      ? completed.reduce((sum, p) => sum + p.turnaround, 0) / completed.length
      : 0;
  const avgResponse =
    started.length > 0
      ? started.reduce((sum, p) => sum + p.response, 0) / started.length
      : 0;
  const cpuUtilization = time > 0 ? (busyTime / time) * 100 : 0;
  const throughput = time > 0 ? completed.length / time : 0;

  return {
    avgWaiting,
    avgTurnaround,
    avgResponse,
    cpuUtilization,
    throughput,
    contextSwitches,
    totalTime: time,
    busyTime,
  };
}

export function snapshotProcesses(simProcs) {
  return simProcs.map((p) => ({
    pid: p.pid,
    arrival: p.arrival,
    burst: p.burst,
    priority: p.priority,
    queue: p.queue,
    remaining: p.remaining,
    startTime: p.startTime,
    finishTime: p.finishTime,
    turnaround: p.turnaround,
    waiting: p.waiting,
    response: p.response,
    state: p.state,
  }));
}

export function snapshotReadyQueues(readyQueues) {
  return readyQueues.map((q) => ({
    level: q.level,
    label: q.label,
    policy: q.policy,
    pids: [...q.pids],
  }));
}

export function snapshotGantt(gantt) {
  return gantt.map((seg) => ({
    pid: seg.pid,
    start: seg.start,
    end: seg.end,
    queueLevel: seg.queueLevel ?? null,
  }));
}

export function recordGanttSlice(gantt, pid, start, end, queueLevel = null, mergeAdjacent = false) {
  if (end <= start) return;
  const last = gantt[gantt.length - 1];
  if (
    mergeAdjacent &&
    last &&
    last.pid === pid &&
    last.end === start &&
    (last.queueLevel ?? null) === (queueLevel ?? null)
  ) {
    last.end = end;
    return;
  }
  gantt.push({ pid, start, end, queueLevel: queueLevel ?? null });
}

export function buildCompletionFormula(p) {
  return (
    `Turnaround(${p.pid}) = ${p.finishTime} - ${p.arrival} = ${p.turnaround} | ` +
    `Waiting(${p.pid}) = ${p.finishTime} - (${p.arrival} + ${p.burst}) = ${p.waiting} | ` +
    `Response(${p.pid}) = ${p.startTime} - ${p.arrival} = ${p.response}`
  );
}

export function buildSummaryFormula(metrics) {
  return (
    `Avg Waiting = ${formatMetric(metrics.avgWaiting)} | ` +
    `Avg Turnaround = ${formatMetric(metrics.avgTurnaround)} | ` +
    `Avg Response = ${formatMetric(metrics.avgResponse)} | ` +
    `CPU Util = ${formatMetric(metrics.cpuUtilization)}%`
  );
}

export function makeCodeLines(js, python, cpp, java, csharp) {
  return { js, python, cpp, java, csharp };
}

export function sameLine(line) {
  return { js: line, python: line, cpp: line, java: line, csharp: line };
}

export function createSchedStep({
  msg,
  msgKey,
  msgParams,
  codeLines,
  time,
  phase,
  runningPid = null,
  activeQueueLevel = null,
  readyQueues = [],
  gantt = [],
  simProcs,
  busyTime,
  contextSwitches,
  highlightPid = null,
  formulaHint = '',
}) {
  const metrics = computeMetrics(simProcs, time, busyTime, contextSwitches);
  return new Step({
    msg,
    msgKey,
    msgParams,
    codeLine: codeLines.js,
    codeLines: { ...codeLines },
    sched: {
      time,
      phase,
      runningPid,
      activeQueueLevel,
      readyQueues: snapshotReadyQueues(readyQueues),
      gantt: snapshotGantt(gantt),
      processes: snapshotProcesses(simProcs),
      metrics,
      highlightPid,
      formulaHint,
    },
  });
}
