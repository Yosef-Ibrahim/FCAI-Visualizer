import { GreedyAlgorithm } from './GreedyAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  SORT: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
  CHECK: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 },
  ACCEPT: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
  DONE: { js: 10, python: 8, cpp: 10, java: 10, csharp: 10 },
};

export class ActivitySelection extends GreedyAlgorithm {
  constructor() {
    super('activity-selection');
  }

  getDefaultInput() {
    return {
      activities: [
        { name: 'A1', start: 0, end: 7 },
        { name: 'A2', start: 1, end: 3 },
        { name: 'A3', start: 2, end: 5 },
        { name: 'A4', start: 4, end: 6 },
        { name: 'A5', start: 5, end: 9 },
        { name: 'A6', start: 6, end: 8 },
        { name: 'A7', start: 8, end: 10 },
      ],
    };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const rawList = Array.isArray(input?.activities) ? input.activities : [];
    if (rawList.length === 0 || rawList.length > 12) {
      throw new Error('Activity Selection requires between 1 and 12 activities');
    }

    const normalized = rawList.map((act, idx) => {
      const start = Number(act?.start);
      const end = Number(act?.end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
        throw new Error(`Activity ${idx + 1} must have finite start < end`);
      }
      const name = String(act?.name || `A${idx + 1}`).trim() || `A${idx + 1}`;
      return { name, start, end, originalIndex: idx };
    });

    const sorted = [...normalized].sort(
      (a, b) => (a.end - b.end) || (a.originalIndex - b.originalIndex),
    );

    const minTime = Math.min(...sorted.map((a) => a.start));
    const maxTime = Math.max(...sorted.map((a) => a.end));

    const accepted = [];
    const rejected = [];
    let lastEnd = -Infinity;
    const steps = [];

    const pushStep = ({
      activeIndex = null,
      msg,
      msgKey,
      msgParams = {},
      codeLines,
      phase = 'scan',
    }) => {
      steps.push(new Step({
        msg,
        msgKey,
        msgParams,
        codeLine: codeLines.js,
        codeLines,
        greedy: {
          kind: 'activity',
          phase,
          items: sorted.map((a) => ({ ...a })),
          activeIndex,
          accepted: [...accepted],
          rejected: [...rejected],
          metrics: {
            selectedCount: accepted.length,
            rejectedCount: rejected.length,
            totalCount: sorted.length,
            lastEnd: Number.isFinite(lastEnd) ? lastEnd : null,
            minTime,
            maxTime,
          },
        },
      }));
    };

    pushStep({
      phase: 'sort',
      msg: `Sorted ${sorted.length} activities by earliest finish time ascending.`,
      msgKey: 'greedy:steps.activitySort',
      msgParams: { count: sorted.length },
      codeLines: LINES.SORT,
    });

    sorted.forEach((act, idx) => {
      if (act.start >= lastEnd) {
        accepted.push(idx);
        const prevEndLabel = Number.isFinite(lastEnd) ? `${lastEnd}` : '−∞';
        lastEnd = act.end;
        pushStep({
          activeIndex: idx,
          msg: `Accept ${act.name} [${act.start}, ${act.end}] because start ${act.start} ≥ last finish ${prevEndLabel}.`,
          msgKey: 'greedy:steps.activityAccept',
          msgParams: { name: act.name, start: act.start, end: act.end, prevEnd: prevEndLabel },
          codeLines: LINES.ACCEPT,
        });
      } else {
        rejected.push(idx);
        pushStep({
          activeIndex: idx,
          msg: `Reject ${act.name} [${act.start}, ${act.end}] — overlaps previous finish at ${lastEnd}.`,
          msgKey: 'greedy:steps.activityReject',
          msgParams: { name: act.name, start: act.start, end: act.end, lastEnd },
          codeLines: LINES.CHECK,
        });
      }
    });

    const chosenNames = accepted.map((idx) => sorted[idx].name).join(', ');
    pushStep({
      phase: 'done',
      activeIndex: null,
      msg: `Done! Selected ${accepted.length} non-overlapping activities: ${chosenNames}.`,
      msgKey: 'greedy:steps.activityDone',
      msgParams: { count: accepted.length, selected: chosenNames },
      codeLines: LINES.DONE,
    });

    return steps;
  }
}
