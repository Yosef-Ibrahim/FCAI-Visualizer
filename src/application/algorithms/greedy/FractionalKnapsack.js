import { GreedyAlgorithm } from './GreedyAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  SORT: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
  TAKE_WHOLE: { js: 6, python: 7, cpp: 6, java: 6, csharp: 6 },
  TAKE_FRAC: { js: 9, python: 10, cpp: 9, java: 9, csharp: 9 },
  SKIP_FULL: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
  DONE: { js: 13, python: 12, cpp: 13, java: 13, csharp: 13 },
};

const round2 = (n) => Math.round(n * 100) / 100;

export class FractionalKnapsack extends GreedyAlgorithm {
  constructor() {
    super('fractional-knapsack');
  }

  getDefaultInput() {
    return {
      capacity: 50,
      items: [
        { name: 'A', weight: 10, value: 60 },
        { name: 'B', weight: 20, value: 100 },
        { name: 'C', weight: 30, value: 120 },
        { name: 'D', weight: 15, value: 45 },
      ],
    };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const capacity = Number(input?.capacity);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error('Fractional Knapsack capacity must be a positive number');
    }

    const rawItems = Array.isArray(input?.items) ? input.items : [];
    if (rawItems.length === 0 || rawItems.length > 10) {
      throw new Error('Fractional Knapsack requires between 1 and 10 items');
    }

    const normalized = rawItems.map((item, idx) => {
      const weight = Number(item?.weight);
      const value = Number(item?.value);
      if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error(`Item ${idx + 1} weight must be positive`);
      }
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Item ${idx + 1} value must be non-negative`);
      }
      const name = String(item?.name || String.fromCharCode(65 + idx)).trim() || String.fromCharCode(65 + idx);
      return {
        name,
        weight,
        value,
        ratio: value / weight,
        originalIndex: idx,
      };
    });

    const sorted = [...normalized].sort(
      (a, b) => (b.ratio - a.ratio) || (a.originalIndex - b.originalIndex),
    );

    const accepted = [];
    const rejected = [];
    let remaining = capacity;
    let totalValue = 0;
    const steps = [];

    const pushStep = ({
      activeIndex = null,
      phase = 'scan',
      msg,
      msgKey,
      msgParams = {},
      codeLines,
    }) => {
      const usedWeight = round2(capacity - remaining);
      steps.push(new Step({
        msg,
        msgKey,
        msgParams,
        codeLine: codeLines.js,
        codeLines,
        greedy: {
          kind: 'fractional-knapsack',
          phase,
          items: sorted.map((it) => ({ ...it })),
          activeIndex,
          accepted: accepted.map((entry) => ({ ...entry })),
          rejected: [...rejected],
          metrics: {
            capacity,
            usedWeight,
            remainingWeight: round2(remaining),
            totalValue: round2(totalValue),
            fillPercent: round2((usedWeight / capacity) * 100),
          },
        },
      }));
    };

    pushStep({
      phase: 'sort',
      msg: `Sorted ${sorted.length} items by value/weight ratio descending (capacity = ${capacity}).`,
      msgKey: 'greedy:steps.fracSort',
      msgParams: { count: sorted.length, capacity },
      codeLines: LINES.SORT,
    });

    sorted.forEach((item, idx) => {
      if (remaining <= 1e-9) {
        rejected.push(idx);
        pushStep({
          activeIndex: idx,
          msg: `Skip ${item.name} — knapsack is already full (${capacity}/${capacity}).`,
          msgKey: 'greedy:steps.fracSkipFull',
          msgParams: { name: item.name, capacity },
          codeLines: LINES.SKIP_FULL,
        });
        return;
      }

      if (item.weight <= remaining + 1e-9) {
        remaining = Math.max(0, remaining - item.weight);
        totalValue += item.value;
        accepted.push({
          index: idx,
          name: item.name,
          takenWeight: round2(item.weight),
          takenValue: round2(item.value),
          fraction: 1,
        });
        pushStep({
          activeIndex: idx,
          msg: `Take all of ${item.name} (wt=${item.weight}, val=${item.value}, ratio=${round2(item.ratio)}). Remaining capacity: ${round2(remaining)}.`,
          msgKey: 'greedy:steps.fracTakeWhole',
          msgParams: {
            name: item.name,
            weight: item.weight,
            value: item.value,
            ratio: round2(item.ratio),
            remaining: round2(remaining),
          },
          codeLines: LINES.TAKE_WHOLE,
        });
      } else {
        const fraction = remaining / item.weight;
        const gainedValue = item.value * fraction;
        const takenWeight = remaining;
        totalValue += gainedValue;
        remaining = 0;
        accepted.push({
          index: idx,
          name: item.name,
          takenWeight: round2(takenWeight),
          takenValue: round2(gainedValue),
          fraction: round2(fraction),
        });
        pushStep({
          activeIndex: idx,
          msg: `Take ${round2(fraction * 100)}% of ${item.name} (${round2(takenWeight)}/${item.weight} weight → +${round2(gainedValue)} value). Knapsack full.`,
          msgKey: 'greedy:steps.fracTakePart',
          msgParams: {
            percent: round2(fraction * 100),
            name: item.name,
            takenWeight: round2(takenWeight),
            weight: item.weight,
            gainedValue: round2(gainedValue),
          },
          codeLines: LINES.TAKE_FRAC,
        });
      }
    });

    pushStep({
      phase: 'done',
      activeIndex: null,
      msg: `Done! Maximum value = ${round2(totalValue)} using ${round2(capacity - remaining)}/${capacity} capacity.`,
      msgKey: 'greedy:steps.fracDone',
      msgParams: {
        totalValue: round2(totalValue),
        usedWeight: round2(capacity - remaining),
        capacity,
      },
      codeLines: LINES.DONE,
    });

    return steps;
  }
}
