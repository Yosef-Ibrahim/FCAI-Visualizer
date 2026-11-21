import { DPAlgorithm } from './DPAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  INIT: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
  BASE0: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
  BASE1: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
  FILL: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 },
  DONE: { js: 7, python: 6, cpp: 7, java: 7, csharp: 7 },
};

const clone1D = (arr) => [arr.slice()];

export class FibonacciDP extends DPAlgorithm {
  constructor() {
    super('fibonacci-dp');
  }

  getDefaultInput() {
    return { n: 7 };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const rawN = Number(input?.n);
    if (!Number.isInteger(rawN) || rawN < 1 || rawN > 12) {
      throw new Error('Fibonacci n must be an integer between 1 and 12');
    }

    const n = rawN;
    const dp = new Array(n + 1).fill(null);
    const colLabels = Array.from({ length: n + 1 }, (_, i) => `i=${i}`);
    const rowLabels = ['dp[i]'];
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
          dims: 1,
          table: clone1D(dp),
          rowLabels,
          colLabels,
          activeCell,
          dependencies,
          traceback,
          phase,
          recurrenceText,
          result,
          summary,
        },
      }));
    };

    pushStep({
      phase: 'init',
      recurrenceText: 'dp[i] = dp[i - 1] + dp[i - 2]',
      msg: `Initialize 1D DP table of size ${n + 1} for Fibonacci(${n}).`,
      msgKey: 'dp:steps.fibInit',
      msgParams: { n, size: n + 1 },
      codeLines: LINES.INIT,
    });

    dp[0] = 0;
    pushStep({
      activeCell: [0, 0],
      phase: 'init',
      recurrenceText: 'dp[0] = 0',
      msg: 'Base case: dp[0] = 0.',
      msgKey: 'dp:steps.fibBase',
      msgParams: { index: 0, value: 0 },
      codeLines: LINES.BASE0,
    });

    dp[1] = 1;
    pushStep({
      activeCell: [0, 1],
      phase: 'init',
      recurrenceText: 'dp[1] = 1',
      msg: 'Base case: dp[1] = 1.',
      msgKey: 'dp:steps.fibBase',
      msgParams: { index: 1, value: 1 },
      codeLines: LINES.BASE1,
    });

    for (let i = 2; i <= n; i++) {
      const prev1 = dp[i - 1];
      const prev2 = dp[i - 2];
      dp[i] = prev1 + prev2;

      pushStep({
        activeCell: [0, i],
        dependencies: [[0, i - 1], [0, i - 2]],
        phase: 'fill',
        recurrenceText: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${prev1} + ${prev2} = ${dp[i]}`,
        msg: `Compute dp[${i}] = dp[${i - 1}] (${prev1}) + dp[${i - 2}] (${prev2}) = ${dp[i]}.`,
        msgKey: 'dp:steps.fibFill',
        msgParams: { i, prev1Index: i - 1, prev2Index: i - 2, prev1, prev2, value: dp[i] },
        codeLines: LINES.FILL,
      });
    }

    pushStep({
      activeCell: [0, n],
      traceback: [[0, n]],
      phase: 'done',
      recurrenceText: `F(${n}) = dp[${n}] = ${dp[n]}`,
      result: dp[n],
      summary: `F(${n}) = ${dp[n]}`,
      msg: `Done! Fibonacci(${n}) = ${dp[n]}.`,
      msgKey: 'dp:steps.fibDone',
      msgParams: { n, result: dp[n] },
      codeLines: LINES.DONE,
    });

    return steps;
  }
}
