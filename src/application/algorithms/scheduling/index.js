import { SchedulingAlgorithm } from './SchedulingAlgorithm';
import { FCFS } from './FCFS';
import { SJF } from './SJF';
import { SRTF } from './SRTF';
import { PriorityScheduling } from './PriorityScheduling';
import { RoundRobin } from './RoundRobin';
import { MultilevelQueue } from './MultilevelQueue';
import { MultilevelFeedbackQueue } from './MultilevelFeedbackQueue';
import { SCHEDULING_PRESETS, normalizeSchedulingInput, generateRandomWorkload } from './schedulingUtils';

const COMPARABLE_SCHEDULERS = [
  new FCFS(),
  new SJF(),
  new SRTF(),
  new PriorityScheduling(),
  new RoundRobin(),
];

export function compareSchedulersOnWorkload(processes, { quantum = 4, preemptive = false } = {}) {
  const baseInput = normalizeSchedulingInput({ processes, quantum, preemptive });

  return COMPARABLE_SCHEDULERS.map((scheduler) => {
    const steps = scheduler.generateSteps(baseInput);
    const finalMetrics = steps[steps.length - 1].sched.metrics;
    return {
      id: scheduler.id,
      avgWaiting: finalMetrics.avgWaiting,
      avgTurnaround: finalMetrics.avgTurnaround,
      avgResponse: finalMetrics.avgResponse,
      cpuUtilization: finalMetrics.cpuUtilization,
      throughput: finalMetrics.throughput,
      contextSwitches: finalMetrics.contextSwitches,
      totalTime: finalMetrics.totalTime,
    };
  });
}

export {
  SchedulingAlgorithm,
  FCFS,
  SJF,
  SRTF,
  PriorityScheduling,
  RoundRobin,
  MultilevelQueue,
  MultilevelFeedbackQueue,
  SCHEDULING_PRESETS,
  normalizeSchedulingInput,
  generateRandomWorkload,
};
