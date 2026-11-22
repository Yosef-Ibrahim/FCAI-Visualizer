import { describe, it, expect } from 'vitest';
import {
  FCFS,
  SJF,
  SRTF,
  PriorityScheduling,
  RoundRobin,
  MultilevelQueue,
  MultilevelFeedbackQueue,
  SCHEDULING_PRESETS,
  normalizeSchedulingInput,
  compareSchedulersOnWorkload,
} from './index';
import {
  schedulingComplexity,
  schedulingExplanations,
  schedulingAlgoNames,
  schedulingCodeSnippets,
} from '../../../data/schedulingData';

const LANGUAGES = ['js', 'python', 'cpp', 'java', 'csharp'];

const ALLOWED_MSG_KEYS = new Set([
  'scheduling:steps.init',
  'scheduling:steps.arrive',
  'scheduling:steps.arriveQueue',
  'scheduling:steps.idle',
  'scheduling:steps.dispatch',
  'scheduling:steps.dispatchPriority',
  'scheduling:steps.dispatchQuantum',
  'scheduling:steps.dispatchQueue',
  'scheduling:steps.runSlice',
  'scheduling:steps.preempt',
  'scheduling:steps.quantumExpire',
  'scheduling:steps.demote',
  'scheduling:steps.complete',
  'scheduling:steps.done',
]);

const ALLOWED_PHASES = new Set([
  'init',
  'arrive',
  'idle',
  'dispatch',
  'run',
  'preempt',
  'demote',
  'complete',
  'done',
]);

const ALL_SCHEDULERS = [
  new FCFS(),
  new SJF(),
  new SRTF(),
  new PriorityScheduling(),
  new RoundRobin(),
  new MultilevelQueue(),
  new MultilevelFeedbackQueue(),
];

function getPreset(algoId, presetId) {
  const found = SCHEDULING_PRESETS[algoId].find((p) => p.id === presetId);
  if (!found) throw new Error(`Preset ${algoId}/${presetId} not found`);
  return found.input;
}

function finalSched(scheduler, input) {
  const steps = scheduler.generateSteps(input);
  return steps[steps.length - 1].sched;
}

describe('Silberschatz Ch. 6 & FCAI-CU Slide Calculations', () => {
  it('FCFS Slide 11 gives exact avgWaiting = 17 and Slide 12 Convoy gives avgWaiting = 3', () => {
    const fcfs = new FCFS();
    const slide11 = finalSched(fcfs, getPreset('fcfs', 'fcfsSlide11'));
    expect(slide11.metrics.avgWaiting).toBe(17);
    expect(slide11.metrics.avgTurnaround).toBe(27);
    expect(slide11.metrics.cpuUtilization).toBe(100);

    const convoy = finalSched(fcfs, getPreset('fcfs', 'fcfsConvoy'));
    expect(convoy.metrics.avgWaiting).toBe(3);
    expect(convoy.metrics.avgTurnaround).toBe(13);
  });

  it('SJF Slide 14 gives avgWaiting = 7 and Slide 19 gives avgWaiting = 4', () => {
    const sjf = new SJF();
    const slide14 = finalSched(sjf, getPreset('sjf', 'sjfSlide14'));
    expect(slide14.metrics.avgWaiting).toBe(7);

    const slide19 = finalSched(sjf, getPreset('sjf', 'sjfSlide19'));
    expect(slide19.metrics.avgWaiting).toBe(4);
    expect(slide19.metrics.avgTurnaround).toBe(8);
  });

  it('SRTF Slide 20 gives avgWaiting = 3 and Slide 21 gives avgWaiting = 6.5', () => {
    const srtf = new SRTF();
    const slide20 = finalSched(srtf, getPreset('srtf', 'srtfSlide20'));
    expect(slide20.metrics.avgWaiting).toBe(3);
    expect(slide20.metrics.avgTurnaround).toBe(7);

    const slide21 = finalSched(srtf, getPreset('srtf', 'srtfSlide21'));
    expect(slide21.metrics.avgWaiting).toBe(6.5);
    expect(slide21.metrics.avgTurnaround).toBe(13);
  });

  it('Priority Slide 23 (non-preemptive) gives avgWaiting = 8.2 and preemptive mode preempts lower priority', () => {
    const prio = new PriorityScheduling();
    const slide23 = finalSched(prio, getPreset('priority', 'prioSlide23'));
    expect(slide23.metrics.avgWaiting).toBeCloseTo(8.2, 6);

    const preemptiveSteps = prio.generateSteps(getPreset('priority', 'prioPreemptive'));
    const hasPreempt = preemptiveSteps.some((s) => s.sched.phase === 'preempt');
    expect(hasPreempt).toBe(true);
    const preemptiveFinal = preemptiveSteps[preemptiveSteps.length - 1].sched;
    expect(preemptiveFinal.metrics.avgWaiting).toBe(5.25);
  });

  it('Round Robin Slide 25 (q=4) gives avgWaiting = 17/3 (5.67) and Slide 26 (q=20) gives avgWaiting = 73', () => {
    const rr = new RoundRobin();
    const slide25 = finalSched(rr, getPreset('round-robin', 'rrSlide25'));
    expect(slide25.metrics.avgWaiting).toBeCloseTo(17 / 3, 2);

    const slide26 = finalSched(rr, getPreset('round-robin', 'rrSlide26'));
    expect(slide26.metrics.avgWaiting).toBe(73);
  });

  it('Deterministic Evaluation Slide 39 ([10, 29, 3, 7, 12], q=10): FCFS=28, SJF=13, RR=23', () => {
    const slide39 = getPreset('round-robin', 'rrSlide39');
    const results = compareSchedulersOnWorkload(slide39.processes, { quantum: 10 });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.fcfs.avgWaiting).toBe(28);
    expect(byId.sjf.avgWaiting).toBe(13);
    expect(byId.srtf.avgWaiting).toBe(13);
    expect(byId['round-robin'].avgWaiting).toBe(23);
    expect(results).toHaveLength(5);
  });
});

describe('Multilevel Queue (MLQ) & Multilevel Feedback Queue (MLFQ)', () => {
  it('MLQ schedules Q0 Foreground processes strictly ahead of Q1 Background processes', () => {
    const mlq = new MultilevelQueue();
    const result = finalSched(mlq, getPreset('mlq', 'mlqDefault'));

    const q0FinishTimes = result.processes
      .filter((p) => p.queue === 0)
      .map((p) => p.finishTime);
    const q1StartTimes = result.processes
      .filter((p) => p.queue === 1)
      .map((p) => p.startTime);

    expect(Math.max(...q0FinishTimes)).toBeLessThanOrEqual(Math.min(...q1StartTimes));
  });

  it('MLQ preempts a running Q1 background process when a Q0 foreground process arrives', () => {
    const mlq = new MultilevelQueue();
    const steps = mlq.generateSteps({
      processes: [
        { pid: 'P1', arrival: 0, burst: 8, priority: 1, queue: 1 },
        { pid: 'P2', arrival: 2, burst: 3, priority: 1, queue: 0 },
      ],
      quantum: 4,
    });

    const preemptStep = steps.find((s) => s.sched.phase === 'preempt');
    expect(preemptStep).toBeDefined();
    expect(preemptStep.msgKey).toBe('scheduling:steps.preempt');
    expect(preemptStep.sched.time).toBe(2);

    const gantt = steps[steps.length - 1].sched.gantt;
    expect(gantt.map((g) => `${g.pid}:${g.start}-${g.end}`)).toEqual([
      'P1:0-2',
      'P2:2-5',
      'P1:5-11',
    ]);
  });

  it('MLFQ demotes long job P1 (burst 26) from Q0 (after 8) -> Q1 (after 16) -> Q2 (FCFS)', () => {
    const mlfq = new MultilevelFeedbackQueue();
    const steps = mlfq.generateSteps(getPreset('mlfq', 'mlfqSlide32'));

    const p1Demotions = steps.filter(
      (s) => s.sched.phase === 'demote' && s.msgParams?.pid === 'P1',
    );
    expect(p1Demotions).toHaveLength(2);
    expect(p1Demotions[0].msgParams).toMatchObject({
      pid: 'P1',
      fromQueue: 'Q0',
      toQueue: 'Q1',
      remaining: 18,
    });
    expect(p1Demotions[1].msgParams).toMatchObject({
      pid: 'P1',
      fromQueue: 'Q1',
      toQueue: 'Q2',
      remaining: 2,
    });

    const final = steps[steps.length - 1].sched;
    const p1Slices = final.gantt.filter((g) => g.pid === 'P1');
    expect(p1Slices.map((s) => ({ start: s.start, end: s.end, q: s.queueLevel }))).toEqual([
      { start: 0, end: 8, q: 0 },
      { start: 26, end: 42, q: 1 },
      { start: 46, end: 48, q: 2 },
    ]);

    // Short jobs P2 (burst 6) and P4 (burst 4) complete inside Q0 without demotion
    expect(final.processes.find((p) => p.pid === 'P2').queue).toBe(0);
    expect(final.processes.find((p) => p.pid === 'P4').queue).toBe(0);
  });

  it('MLFQ preempts a Q1 process when a new job arrives in Q0', () => {
    const mlfq = new MultilevelFeedbackQueue();
    const steps = mlfq.generateSteps({
      processes: [
        { pid: 'P1', arrival: 0, burst: 15, priority: 1, queue: 0 },
        { pid: 'P2', arrival: 10, burst: 3, priority: 1, queue: 0 },
      ],
      mlfqQuanta: [8, 16],
    });

    const preemptStep = steps.find((s) => s.sched.phase === 'preempt');
    expect(preemptStep).toBeDefined();
    expect(preemptStep.sched.time).toBe(10);
    const gantt = steps[steps.length - 1].sched.gantt;
    expect(gantt.map((g) => `${g.pid}:Q${g.queueLevel}:${g.start}-${g.end}`)).toEqual([
      'P1:Q0:0-8',
      'P1:Q1:8-10',
      'P2:Q0:10-13',
      'P1:Q1:13-18',
    ]);
  });
});

describe('CPU IDLE handling & input normalization', () => {
  it('FCFS Idle preset creates an IDLE segment from 4 to 6 and lowers CPU utilization', () => {
    const fcfs = new FCFS();
    const steps = fcfs.generateSteps(getPreset('fcfs', 'fcfsIdle'));
    const final = steps[steps.length - 1].sched;

    const idleSeg = final.gantt.find((seg) => seg.pid === 'IDLE');
    expect(idleSeg).toEqual({ pid: 'IDLE', start: 4, end: 6, queueLevel: null });
    expect(final.metrics.busyTime).toBe(9);
    expect(final.metrics.totalTime).toBe(11);
    expect(final.metrics.cpuUtilization).toBeCloseTo((9 / 11) * 100, 5);
  });

  it('all 7 schedulers handle arrival gaps and non-zero first arrivals with IDLE blocks', () => {
    const gapInput = {
      processes: [
        { pid: 'P1', arrival: 3, burst: 2, priority: 1, queue: 0 },
        { pid: 'P2', arrival: 8, burst: 3, priority: 2, queue: 1 },
      ],
      quantum: 2,
      preemptive: true,
      mlfqQuanta: [2, 4],
    };

    for (const scheduler of ALL_SCHEDULERS) {
      const final = finalSched(scheduler, gapInput);
      const idleSegments = final.gantt.filter((seg) => seg.pid === 'IDLE');
      expect(idleSegments.length, `${scheduler.id} idle segments`).toBeGreaterThanOrEqual(2);
      expect(idleSegments[0]).toMatchObject({ pid: 'IDLE', start: 0, end: 3 });
      expect(idleSegments[1]).toMatchObject({ pid: 'IDLE', start: 5, end: 8 });
      expect(final.metrics.busyTime).toBe(5);
      expect(final.metrics.totalTime).toBe(11);
    }
  });

  it('normalizeSchedulingInput preserves explicit 0 arrival, clamps ranges, and caps 1..8 processes', () => {
    const normalized = normalizeSchedulingInput({
      processes: [
        { pid: 'P1', arrival: 0, burst: 0, priority: -5, queue: 3 },
        { pid: 'P1', arrival: -4, burst: 250, priority: 2, queue: 1 },
        ...Array.from({ length: 10 }, (_, i) => ({ pid: `X${i}`, arrival: i, burst: 2 })),
      ],
      quantum: 99,
      mlfqQuanta: [0, 50],
    });

    expect(normalized.processes).toHaveLength(8);
    expect(normalized.processes[0]).toEqual({
      pid: 'P1',
      arrival: 0,
      burst: 1,
      priority: 1,
      queue: 1,
    });
    expect(normalized.processes[1].pid).toBe('P1_2');
    expect(normalized.processes[1].arrival).toBe(0);
    expect(normalized.processes[1].burst).toBe(100);
    expect(normalized.quantum).toBe(30);
    expect(normalized.mlfqQuanta).toEqual([1, 30]);

    const emptyFallback = normalizeSchedulingInput(null);
    expect(emptyFallback.processes).toHaveLength(1);
    expect(emptyFallback.processes[0].arrival).toBe(0);
  });
});

describe('Step contract, metadata & 5-language codeLines bounds across all 7 schedulers', () => {
  it('exports complete metadata, explanations, and 5-language snippets for all 7 IDs', () => {
    for (const scheduler of ALL_SCHEDULERS) {
      const id = scheduler.id;
      expect(scheduler.category).toBe('scheduling');
      expect(schedulingAlgoNames[id]).toBeTruthy();
      expect(schedulingComplexity[id]).toMatchObject({
        best: expect.any(String),
        avg: expect.any(String),
        worst: expect.any(String),
        space: expect.any(String),
        note: expect.any(String),
      });
      expect(schedulingExplanations[id]).toMatchObject({
        title: expect.any(String),
        summary: expect.any(String),
        keyPoints: expect.any(Array),
        formulas: expect.any(Array),
        pros: expect.any(Array),
        cons: expect.any(Array),
        body: expect.any(String),
      });
      for (const lang of LANGUAGES) {
        expect(Array.isArray(schedulingCodeSnippets[id][lang]), `${id}.${lang}`).toBe(true);
        expect(schedulingCodeSnippets[id][lang].length, `${id}.${lang}`).toBeGreaterThan(5);
      }
    }
  });

  it('enforces valid Step contract, msgKey allowlist, immutable snapshots, and codeLines bounds on all presets', () => {
    for (const scheduler of ALL_SCHEDULERS) {
      const snippets = scheduler.codeSnippets;
      const presets = SCHEDULING_PRESETS[scheduler.id];
      expect(presets.length, `${scheduler.id} presets`).toBeGreaterThan(0);

      for (const preset of presets) {
        const steps = scheduler.generateSteps(preset.input);
        expect(steps.length, `${scheduler.id}/${preset.id} steps`).toBeGreaterThan(2);

        let prevTime = 0;
        steps.forEach((step, idx) => {
          expect(typeof step.msg === 'string' && step.msg.trim().length > 0, `${scheduler.id}/${preset.id}#${idx} msg`).toBe(true);
          expect(ALLOWED_MSG_KEYS.has(step.msgKey), `${scheduler.id}/${preset.id}#${idx} msgKey=${step.msgKey}`).toBe(true);
          expect(ALLOWED_PHASES.has(step.sched.phase), `${scheduler.id}/${preset.id}#${idx} phase=${step.sched.phase}`).toBe(true);
          expect(step.sched.time, `${scheduler.id}/${preset.id}#${idx} monotonic time`).toBeGreaterThanOrEqual(prevTime);
          prevTime = step.sched.time;

          expect(Array.isArray(step.sched.readyQueues)).toBe(true);
          expect(Array.isArray(step.sched.gantt)).toBe(true);
          expect(Array.isArray(step.sched.processes)).toBe(true);
          expect(step.sched.metrics).toMatchObject({
            avgWaiting: expect.any(Number),
            avgTurnaround: expect.any(Number),
            avgResponse: expect.any(Number),
            cpuUtilization: expect.any(Number),
            throughput: expect.any(Number),
            contextSwitches: expect.any(Number),
            totalTime: expect.any(Number),
            busyTime: expect.any(Number),
          });

          for (const lang of LANGUAGES) {
            const line = step.codeLines?.[lang];
            expect(Number.isInteger(line), `${scheduler.id}/${preset.id}#${idx} codeLines.${lang}`).toBe(true);
            expect(line, `${scheduler.id}/${preset.id}#${idx} ${lang} >= 0`).toBeGreaterThanOrEqual(0);
            expect(line, `${scheduler.id}/${preset.id}#${idx} ${lang} < len`).toBeLessThan(snippets[lang].length);
          }
        });

        // Verify snapshots are immutable (first step gantt is still empty after simulation completes)
        expect(steps[0].sched.phase).toBe('init');
        expect(steps[0].sched.gantt).toEqual([]);
        expect(steps[steps.length - 1].sched.phase).toBe('done');
        expect(steps[steps.length - 1].sched.processes.every((p) => p.state === 'done')).toBe(true);
      }
    }
  });
});
