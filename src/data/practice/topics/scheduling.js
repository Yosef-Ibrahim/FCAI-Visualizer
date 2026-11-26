// ── Practice bank: CPU scheduling ──────────────────────────────────────────
// Metrics are simulated for FCFS, SJF, SRTF, priority and round robin, matching
// the conventions used by the OS course page (lower priority number = higher
// priority, waiting time excludes the first response).

import { conceptBatch, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'cpu-scheduling';
const NAMES = ['P1', 'P2', 'P3', 'P4'];

const SCHEDULING_CONCEPTS = [
  { lvl: 'easy', q: 'Which scheduling policy serves processes in arrival order?', a: 'First-Come, First-Served (FCFS)', d: ['Shortest Job First', 'Round Robin', 'Priority scheduling'], e: 'FCFS is a FIFO ready queue.' },
  { lvl: 'easy', q: 'Which policy selects the process with the smallest burst time?', a: 'Shortest Job First (SJF)', d: ['FCFS', 'Round Robin', 'Multilevel Queue'], e: 'SJF minimizes average waiting time for non-preemptive scheduling.' },
  { lvl: 'medium', q: 'What does SRTF add to SJF?', a: 'Preemption when a shorter job arrives', d: ['A larger time quantum', 'Priority levels', 'Multiple ready queues'], e: 'SRTF always runs the process with the shortest remaining time.' },
  { lvl: 'medium', q: 'What is the main disadvantage of FCFS?', a: 'The convoy effect: short jobs wait behind a long one', d: ['It needs a priority queue', 'It causes starvation', 'It requires preemption'], e: 'A single long job delays everyone behind it.' },
  { lvl: 'medium', q: 'What is the main disadvantage of SJF and SRTF?', a: 'Long jobs can starve', d: ['They ignore burst times', 'They need a time quantum', 'They cannot preempt'], e: 'Short jobs keep arriving and long jobs wait indefinitely.' },
  { lvl: 'medium', q: 'Which policy gives every process a fair share of the CPU using a time quantum?', a: 'Round Robin', d: ['FCFS', 'SJF', 'Priority'], e: 'Each process runs for a quantum, then re-queues.' },
  { lvl: 'medium', q: 'What happens if the round-robin quantum is too large?', a: 'It degenerates toward FCFS', d: ['It becomes SJF', 'It causes fewer context switches than FCFS', 'It stops preemption'], e: 'Long quanta mean processes usually finish before being preempted.' },
  { lvl: 'medium', q: 'What happens if the round-robin quantum is too small?', a: 'Context-switch overhead grows', d: ['Starvation disappears', 'Waiting time becomes zero', 'It becomes SJF'], e: 'Frequent switches spend CPU time on overhead rather than work.' },
  { lvl: 'medium', q: 'What is turnaround time?', a: 'Completion time − arrival time', d: ['Burst time − waiting time', 'Arrival time − completion time', 'Waiting time + burst time − quantum'], e: 'Turnaround covers the whole time from arrival to completion.' },
  { lvl: 'medium', q: 'What is waiting time?', a: 'Turnaround time − burst time', d: ['Completion time − arrival time', 'Burst time × quantum', 'Arrival time + burst time'], e: 'Waiting time is the total time spent in the ready queue.' },
  { lvl: 'medium', q: 'What is response time?', a: 'Time from arrival to the first CPU allocation', d: ['Total time in the system', 'Burst time + waiting time', 'The time quantum'], e: 'Response time measures how quickly a process starts.' },
  { lvl: 'medium', q: 'Which metric does round robin primarily optimize?', a: 'Response time fairness', d: ['Minimum average waiting time', 'Maximum throughput of long jobs', 'Zero context switches'], e: 'Time slicing gives every process an early turn.' },
  { lvl: 'medium', q: 'Which policy is non-preemptive?', a: 'FCFS', d: ['SRTF', 'Round Robin', 'MLFQ'], e: 'FCFS runs a process to completion.' },
  { lvl: 'medium', q: 'Which policy always preempts a running process when a shorter one arrives?', a: 'SRTF', d: ['SJF', 'FCFS', 'Priority without preemption'], e: 'SRTF compares remaining times continuously.' },
  { lvl: 'medium', q: 'In priority scheduling with smaller numbers meaning higher priority, which process runs first?', a: 'The smallest priority number', d: ['The largest priority number', 'The earliest arrival', 'The longest burst'], e: 'Lower numeric value means higher priority in this convention.' },
  { lvl: 'medium', q: 'What is aging used for in priority scheduling?', a: 'Increasing the priority of waiting processes to prevent starvation', d: ['Reducing burst times', 'Increasing the time quantum', 'Removing completed processes'], e: 'Aging gradually favors long-waiting processes.' },
  { lvl: 'medium', q: 'What is a multilevel queue scheduler?', a: 'Several queues with different priorities and policies', d: ['One queue with a single quantum', 'A queue sorted by arrival time only', 'A queue that stores no processes'], e: 'Processes are classified into queues, often by type.' },
  { lvl: 'medium', q: 'What distinguishes MLFQ from a static multilevel queue?', a: 'Processes can move between queues based on behaviour', d: ['It has only one queue', 'It never preempts', 'It ignores priorities'], e: 'MLFQ demotes CPU-bound processes and promotes interactive ones.' },
  { lvl: 'medium', q: 'Why does MLFQ demote a CPU-bound process?', a: 'To favor short interactive jobs', d: ['To increase its priority', 'To reduce its burst time', 'To remove it from the system'], e: 'Demotion keeps the top queue for short, responsive work.' },
  { lvl: 'medium', q: 'What is the convoy effect?', a: 'Many short jobs waiting behind one long job', d: ['All jobs finishing together', 'A queue with no arrivals', 'A priority inversion'], e: 'It is typical of FCFS with a long first job.' },
  { lvl: 'medium', q: 'Which scheduling algorithm has the minimum average waiting time for a fixed set of non-preemptive jobs?', a: 'SJF', d: ['FCFS', 'Round Robin', 'Priority'], e: 'Running the shortest job first minimizes total waiting.' },
  { lvl: 'medium', q: 'How is CPU utilization computed?', a: 'Busy time ÷ total time', d: ['Idle time ÷ total time', 'Completed processes ÷ arrivals', 'Burst time ÷ quantum'], e: 'Utilization is the fraction of time the CPU does work.' },
  { lvl: 'medium', q: 'What is throughput?', a: 'Number of processes completed per unit time', d: ['Average waiting time', 'Time quantum size', 'Number of context switches'], e: 'Throughput measures completed work per time.' },
  { lvl: 'medium', q: 'What causes a context switch?', a: 'The OS saving one process state and restoring another', d: ['A process finishing its I/O', 'A page fault only', 'A priority change only'], e: 'Switching is overhead that does no user work.' },
  { lvl: 'medium', q: 'How does a context switch affect scheduling metrics?', a: 'It adds overhead and can increase waiting time', d: ['It reduces burst time', 'It removes waiting time', 'It increases the quantum'], e: 'Switch time is pure overhead.' },
  { lvl: 'medium', q: 'Which queue holds processes ready to run?', a: 'The ready queue', d: ['The I/O queue', 'The job queue on disk', 'The device queue'], e: 'The scheduler picks from the ready queue.' },
  { lvl: 'medium', q: 'Which scheduler selects which process enters memory?', a: 'The long-term scheduler', d: ['The short-term scheduler', 'The medium-term scheduler', 'The dispatcher'], e: 'Long-term admission control decides the degree of multiprogramming.' },
  { lvl: 'medium', q: 'Which component actually performs the context switch after a scheduling decision?', a: 'The dispatcher', d: ['The long-term scheduler', 'The ready queue', 'The page table'], e: 'The dispatcher gives the CPU to the selected process.' },
  { lvl: 'medium', q: 'What is dispatch latency?', a: 'Time for the dispatcher to switch to a process', d: ['Time a process waits in the ready queue', 'The time quantum', 'The burst time'], e: 'Dispatch latency is switching overhead.' },
  { lvl: 'medium', q: 'Which policy can cause priority inversion?', a: 'Priority scheduling', d: ['Round Robin', 'FCFS', 'SJF without priorities'], e: 'A low-priority holder of a lock can block a high-priority process.' },
  { lvl: 'medium', q: 'What does a Gantt chart show?', a: 'The order and duration of CPU allocations over time', d: ['Memory layout', 'Disk blocks', 'Page tables'], e: 'It visualizes the schedule timeline.' },
  { lvl: 'medium', q: 'In round robin, where does a preempted process go?', a: 'The back of the ready queue', d: ['The front of the ready queue', 'The I/O queue', 'The completed queue'], e: 'Re-queuing at the back gives other processes a turn.' },
  { lvl: 'medium', q: 'What is the sum of all burst times equal to when the CPU never idles?', a: 'Total busy time', d: ['Average waiting time', 'Total turnaround time', 'The time quantum'], e: 'Every burst contributes to the busy period.' },
  { lvl: 'medium', q: 'Which metric is minimized by shortest-remaining-time-first?', a: 'Average waiting time', d: ['Maximum response time', 'Context switches', 'CPU utilization'], e: 'SRTF is the preemptive extension of the SJF optimality result.' },
  { lvl: 'medium', q: 'Which scheduling policy is typically used for interactive systems?', a: 'Round Robin or MLFQ', d: ['FCFS only', 'SJF only', 'Batch FIFO'], e: 'Time slicing keeps interactive processes responsive.' },
  { lvl: 'medium', q: 'What is a time quantum?', a: 'The maximum CPU time a process gets before preemption', d: ['The total burst time', 'The arrival interval', 'The I/O wait time'], e: 'It bounds how long one process runs in round robin.' },
  { lvl: 'medium', q: 'Which scheduling policy may never preempt a process that keeps running?', a: 'SJF (non-preemptive)', d: ['SRTF', 'Round Robin', 'MLFQ'], e: 'Non-preemptive SJF lets the chosen job finish.' },
  { lvl: 'medium', q: 'What is the average waiting time formula?', a: 'Sum of waiting times ÷ number of processes', d: ['Sum of burst times ÷ number of processes', 'Max waiting time', 'Total turnaround time'], e: 'Averages are taken over all processes.' },
  { lvl: 'medium', q: 'A process arrives at time 3 and completes at time 11. What is its turnaround time?', a: '8', d: ['11', '3', '14'], e: 'Turnaround = completion − arrival = 11 − 3 = 8.' },
  { lvl: 'medium', q: 'A process has turnaround time 12 and burst time 5. What is its waiting time?', a: '7', d: ['17', '5', '12'], e: 'Waiting = turnaround − burst = 12 − 5 = 7.' },
];

function simulate(processes, pickNext, { quantum = null, preemptive = false } = {}) {
  const remaining = processes.map((process) => ({ ...process, left: process.burst, firstStart: null, completion: null }));
  const timeline = [];
  let time = 0;
  let current = null;
  let quantumLeft = quantum;
  const finished = [];
  const ready = [];

  const arrived = () => remaining.filter((process) => process.arrival <= time && process.completion === null);

  while (finished.length < remaining.length) {
    if (preemptive || !current || current.left === 0) {
      if (current && current.left === 0) {
        current.completion = time;
        finished.push(current);
        current = null;
      }
      const candidates = arrived();
      if (candidates.length === 0) {
        timeline.push({ idle: true, start: time, end: time + 1 });
        time += 1;
        continue;
      }
      if (preemptive) {
        const best = candidates.reduce((a, b) => (b.left < a.left ? b : a));
        if (!current || best !== current) {
          if (current) ready.push(current);
          current = best;
          quantumLeft = quantum;
        }
      } else if (!current) {
        current = pickNext ? pickNext(candidates) : [...candidates].sort(byArrival)[0];
        quantumLeft = quantum;
      }
    }
    if (!current) continue;
    if (current.firstStart === null) current.firstStart = time;
    current.left -= 1;
    quantumLeft = quantum === null ? null : quantumLeft - 1;
    timeline.push({ process: current, start: time, end: time + 1 });
    time += 1;
    if (current.left === 0) {
      current.completion = time;
      finished.push(current);
      current = null;
      quantumLeft = quantum;
      continue;
    }
    if (quantum !== null && quantumLeft === 0) {
      ready.push(current);
      current = null;
      quantumLeft = quantum;
    }
  }

  const metrics = finished.map((process) => ({
    name: process.name,
    arrival: process.arrival,
    burst: process.burst,
    completion: process.completion,
    waiting: process.completion - process.arrival - process.burst,
    turnaround: process.completion - process.arrival,
    response: process.firstStart - process.arrival,
  }));
  return { metrics, timeline, finished };
}

function average(list, key) {
  return Number((list.reduce((sum, item) => sum + item[key], 0) / list.length).toFixed(2));
}

function completionOrder(result) {
  return result.metrics.map((metric) => metric.name).join(' → ');
}

function makeProcesses(rand) {
  return Array.from({ length: 4 }, (_, index) => ({
    name: NAMES[index],
    arrival: randInt(rand, 0, 5),
    burst: randInt(rand, 2, 8),
    priority: randInt(rand, 1, 4),
  }));
}

const byArrival = (a, b) => a.arrival - b.arrival || a.name.localeCompare(b.name);
const byBurst = (a, b) => a.burst - b.burst || a.arrival - b.arrival;
const byPriority = (a, b) => a.priority - b.priority || a.arrival - b.arrival;

export function buildSchedulingQuestions() {
  const rand = makeRng(0x74b9);
  const qs = [];

  for (let i = 0; i < 30; i += 1) {
    const processes = makeProcesses(rand);
    const description = processes.map((process) => `${process.name}(arr ${process.arrival}, burst ${process.burst}, prio ${process.priority})`).join(', ');

    const fcfs = simulate(processes, (candidates) => [...candidates].sort(byArrival)[0]);
    qs.push(mcq({
      id: `sched-fcfs-wait-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Processes: ${description}. For non-preemptive FCFS, what is the average waiting time?`,
      correct: `${average(fcfs.metrics, 'waiting')}`,
      distractors: [`${average(fcfs.metrics, 'turnaround')}`, `${Number((average(fcfs.metrics, 'waiting') + 1).toFixed(2))}`, `${Number(Math.max(0, average(fcfs.metrics, 'waiting') - 1).toFixed(2))}`],
      explanation: `FCFS runs jobs in arrival order; waiting times ${fcfs.metrics.map((metric) => `${metric.name}=${metric.waiting}`).join(', ')} average to ${average(fcfs.metrics, 'waiting')}.`,
    }, rand));
    if (i < 14) {
      qs.push(mcq({
        id: `sched-fcfs-order-${i}`,
        topic: TOPIC,
        difficulty: 'medium',
        question: `Processes: ${description}. What is the FCFS completion order?`,
        correct: completionOrder(fcfs),
        distractors: [
          completionOrder(simulate(processes, (candidates) => [...candidates].sort(byBurst)[0])),
          completionOrder(simulate(processes, (candidates) => [...candidates].sort(byPriority)[0])),
          processes.map((process) => process.name).reverse().join(' → '),
        ],
        explanation: 'FCFS serves the earliest arrival first.',
      }, rand));
    }

    const sjf = simulate(processes, (candidates) => [...candidates].sort(byBurst)[0]);
    qs.push(mcq({
      id: `sched-sjf-wait-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Processes: ${description}. For non-preemptive SJF, what is the average waiting time?`,
      correct: `${average(sjf.metrics, 'waiting')}`,
      distractors: [`${average(fcfs.metrics, 'waiting')}`, `${Number((average(sjf.metrics, 'waiting') + 1).toFixed(2))}`, `${Number(Math.max(0, average(sjf.metrics, 'waiting') - 1).toFixed(2))}`],
      explanation: `SJF always runs the shortest available burst, giving waiting times ${sjf.metrics.map((metric) => `${metric.name}=${metric.waiting}`).join(', ')}.`,
    }, rand));

    const priority = simulate(processes, (candidates) => [...candidates].sort(byPriority)[0]);
    qs.push(mcq({
      id: `sched-priority-wait-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Processes: ${description}. For non-preemptive priority scheduling (smaller number = higher priority), what is the average waiting time?`,
      correct: `${average(priority.metrics, 'waiting')}`,
      distractors: [`${average(sjf.metrics, 'waiting')}`, `${Number((average(priority.metrics, 'waiting') + 1).toFixed(2))}`, `${Number(Math.max(0, average(priority.metrics, 'waiting') - 1).toFixed(2))}`],
      explanation: `Priority order gives waiting times ${priority.metrics.map((metric) => `${metric.name}=${metric.waiting}`).join(', ')}.`,
    }, rand));

    if (i < 16) {
      const rr = simulate(processes, null, { quantum: 2 });
      qs.push(mcq({
        id: `sched-rr-wait-${i}`,
        topic: TOPIC,
        difficulty: 'hard',
        question: `Processes: ${description}. With round robin and quantum 2, what is the average waiting time?`,
        correct: `${average(rr.metrics, 'waiting')}`,
        distractors: [`${average(fcfs.metrics, 'waiting')}`, `${Number((average(rr.metrics, 'waiting') + 1).toFixed(2))}`, `${Number(Math.max(0, average(rr.metrics, 'waiting') - 1).toFixed(2))}`],
        explanation: `Time-slicing every 2 units produces waiting times ${rr.metrics.map((metric) => `${metric.name}=${metric.waiting}`).join(', ')}.`,
      }, rand));
    }

    if (i < 10) {
      const srtf = simulate(processes, null, { preemptive: true });
      qs.push(mcq({
        id: `sched-srtf-wait-${i}`,
        topic: TOPIC,
        difficulty: 'hard',
        question: `Processes: ${description}. With preemptive SRTF, what is the average waiting time?`,
        correct: `${average(srtf.metrics, 'waiting')}`,
        distractors: [`${average(sjf.metrics, 'waiting')}`, `${Number((average(srtf.metrics, 'waiting') + 1).toFixed(2))}`, `${Number(Math.max(0, average(srtf.metrics, 'waiting') - 2).toFixed(2))}`],
        explanation: `SRTF switches to the shortest remaining time, giving waiting times ${srtf.metrics.map((metric) => `${metric.name}=${metric.waiting}`).join(', ')}.`,
      }, rand));
    }
  }

  // Response-time and turnaround numeric drills.
  for (let i = 0; i < 20; i += 1) {
    const arrival = randInt(rand, 0, 20);
    const burst = randInt(rand, 1, 12);
    const completion = arrival + randInt(rand, burst, burst + 10);
    qs.push(mcq({
      id: `sched-turnaround-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A process arrives at time ${arrival} and completes at time ${completion}. What is its turnaround time?`,
      correct: `${completion - arrival}`,
      distractors: [`${completion}`, `${burst}`, `${completion + arrival}`],
      explanation: `Turnaround = completion − arrival = ${completion} − ${arrival} = ${completion - arrival}.`,
    }, rand));
    qs.push(mcq({
      id: `sched-waiting-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A process has turnaround time ${completion - arrival} and burst time ${burst}. What is its waiting time?`,
      correct: `${completion - arrival - burst}`,
      distractors: [`${completion - arrival + burst}`, `${burst}`, `${completion - arrival}`],
      explanation: `Waiting = turnaround − burst = ${completion - arrival} − ${burst} = ${completion - arrival - burst}.`,
    }, rand));
  }

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'scheduling', concepts: SCHEDULING_CONCEPTS, rand })],
    (question) => question.id,
  );
}
