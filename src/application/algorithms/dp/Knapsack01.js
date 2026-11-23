import { DPAlgorithm } from './DPAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  INIT: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
  SKIP: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
  COMPARE: { js: 8, python: 8, cpp: 8, java: 8, csharp: 8 },
  DONE: { js: 12, python: 9, cpp: 12, java: 12, csharp: 12 },
};

const clone2D = (matrix) => matrix.map((row) => row.slice());

export class Knapsack01 extends DPAlgorithm {
  constructor() {
    super('knapsack-01');
  }

  getDefaultInput() {
    return {
      capacity: 7,
      items: [
        { name: 'A', weight: 1, value: 1 },
        { name: 'B', weight: 3, value: 4 },
        { name: 'C', weight: 4, value: 5 },
        { name: 'D', weight: 5, value: 7 },
      ],
    };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const capacity = Number(input?.capacity);
    if (!Number.isInteger(capacity) || capacity < 0 || capacity > 12) {
      throw new Error('Knapsack capacity must be an integer between 0 and 12');
    }

    const rawItems = Array.isArray(input?.items) ? input.items : [];
    if (rawItems.length === 0 || rawItems.length > 6) {
      throw new Error('Knapsack requires between 1 and 6 items');
    }

    const items = rawItems.map((item, idx) => {
      const weight = Number(item?.weight);
      const value = Number(item?.value);
      if (!Number.isInteger(weight) || weight <= 0) {
        throw new Error(`Item ${idx + 1} weight must be a positive integer`);
      }
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Item ${idx + 1} value must be a non-negative number`);
      }
      return {
        name: String(item?.name || String.fromCharCode(65 + idx)).trim() || String.fromCharCode(65 + idx),
        weight,
        value,
      };
    });

    const n = items.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
    const directions = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(null));
    const rowLabels = ['∅', ...items.map((it) => `${it.name} (w=${it.weight}, v=${it.value})`)];
    const colLabels = Array.from({ length: capacity + 1 }, (_, w) => `w=${w}`);
    const steps = [];

    const pushStep = ({
      activeCell = null,
      dependencies = [],
      traceback = [],
      phase = 'fill',
      recurrenceText = '',
      result = null,
      summary = '',
      msg,
      msgKey,
      msgParams = {},
      codeLines,
    }) => {
      steps.push(new Step({
        msg,
        msgKey,
        msgParams,
        codeLine: codeLines.js,
        codeLines,
        dp: {
          dims: 2,
          table: clone2D(dp),
          directions: clone2D(directions),
          rowLabels,
          colLabels,
          activeCell,
          dependencies,
          traceback: traceback.map((c) => c.slice()),
          phase,
          recurrenceText,
          result,
          summary,
        },
      }));
    };

    pushStep({
      phase: 'init',
      recurrenceText: 'dp[i][w] = max(dp[i-1][w], valᵢ + dp[i-1][w - wtᵢ])',
      msg: `Initialize (${n + 1}) × (${capacity + 1}) table with 0s for base row and column.`,
      msgKey: 'dp:steps.knapsackInit',
      msgParams: { rows: n + 1, cols: capacity + 1, capacity, count: n },
      codeLines: LINES.INIT,
    });

    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];
      for (let w = 0; w <= capacity; w++) {
        const skipVal = dp[i - 1][w];
        if (item.weight > w) {
          dp[i][w] = skipVal;
          directions[i][w] = '↑';
          pushStep({
            activeCell: [i, w],
            dependencies: [[i - 1, w]],
            phase: 'fill',
            recurrenceText: `${item.name} (wt=${item.weight}) > w=${w} → skip: dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skipVal}`,
            msg: `Item ${item.name} (wt=${item.weight}) does not fit in capacity ${w}; keep skip value ${skipVal}.`,
            msgKey: 'dp:steps.knapsackNoFit',
            msgParams: { item: item.name, weight: item.weight, w, skipVal },
            codeLines: LINES.SKIP,
          });
        } else {
          const takeVal = item.value + dp[i - 1][w - item.weight];
          const choseTake = takeVal > skipVal;
          dp[i][w] = choseTake ? takeVal : skipVal;
          directions[i][w] = choseTake ? '↖' : '↑';
          pushStep({
            activeCell: [i, w],
            dependencies: [[i - 1, w], [i - 1, w - item.weight]],
            phase: 'fill',
            recurrenceText: `dp[${i}][${w}] = max(skip=${skipVal}, take=${item.value}+${dp[i - 1][w - item.weight]}=${takeVal}) = ${dp[i][w]}`,
            msg: choseTake
              ? `Item ${item.name} at w=${w}: taking (${takeVal}) beats skipping (${skipVal}) → dp[${i}][${w}] = ${dp[i][w]}.`
              : `Item ${item.name} at w=${w}: skipping (${skipVal}) ≥ taking (${takeVal}) → dp[${i}][${w}] = ${dp[i][w]}.`,
            msgKey: choseTake ? 'dp:steps.knapsackTake' : 'dp:steps.knapsackSkip',
            msgParams: { item: item.name, i, w, skipVal, takeVal, best: dp[i][w] },
            codeLines: LINES.COMPARE,
          });
        }
      }
    }

    // Traceback phase
    const tracebackCells = [[n, capacity]];
    const chosenItems = [];
    let i = n;
    let w = capacity;

    while (i > 0 && w >= 0) {
      const item = items[i - 1];
      if (w >= item.weight && dp[i][w] !== dp[i - 1][w] && dp[i][w] === item.value + dp[i - 1][w - item.weight]) {
        chosenItems.push(item);
        const nextW = w - item.weight;
        pushStep({
          activeCell: [i, w],
          dependencies: [[i - 1, nextW]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback: include ${item.name} (wt=${item.weight}, val=${item.value}), move to (${i - 1}, ${nextW})`,
          msg: `Traceback at (${i}, ${w}): dp[${i}][${w}] ≠ dp[${i - 1}][${w}], so include ${item.name} and jump to w=${nextW}.`,
          msgKey: 'dp:steps.knapsackTraceTake',
          msgParams: { i, w, item: item.name, weight: item.weight, value: item.value, nextW },
          codeLines: LINES.DONE,
        });
        w = nextW;
        i -= 1;
      } else {
        pushStep({
          activeCell: [i, w],
          dependencies: [[i - 1, w]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback: exclude ${item.name}, move up to (${i - 1}, ${w})`,
          msg: `Traceback at (${i}, ${w}): value came from above, so exclude ${item.name}.`,
          msgKey: 'dp:steps.knapsackTraceSkip',
          msgParams: { i, w, item: item.name },
          codeLines: LINES.DONE,
        });
        i -= 1;
      }
      tracebackCells.push([i, w]);
    }

    chosenItems.reverse();
    const chosenNames = chosenItems.map((it) => it.name);
    const totalWeight = chosenItems.reduce((sum, it) => sum + it.weight, 0);
    const maxValue = dp[n][capacity];
    const itemsLabel = chosenNames.length ? chosenNames.join(', ') : '∅';

    pushStep({
      activeCell: [n, capacity],
      traceback: tracebackCells,
      phase: 'done',
      recurrenceText: `Optimal value = ${maxValue} · Items: ${itemsLabel} (weight ${totalWeight}/${capacity})`,
      result: { maxValue, selectedItems: chosenItems, totalWeight },
      summary: `Value ${maxValue} · [${itemsLabel}]`,
      msg: `Done! Maximum value = ${maxValue} using items [${itemsLabel}] (weight ${totalWeight}/${capacity}).`,
      msgKey: 'dp:steps.knapsackDone',
      msgParams: { maxValue, items: itemsLabel, totalWeight, capacity },
      codeLines: LINES.DONE,
    });

    return steps;
  }
}
