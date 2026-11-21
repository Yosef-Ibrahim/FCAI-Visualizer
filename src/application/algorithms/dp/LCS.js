import { DPAlgorithm } from './DPAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  INIT: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
  MATCH: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
  MISMATCH: { js: 8, python: 8, cpp: 8, java: 8, csharp: 8 },
  DONE: { js: 12, python: 9, cpp: 12, java: 12, csharp: 12 },
};

const clone2D = (matrix) => matrix.map((row) => row.slice());

export class LCS extends DPAlgorithm {
  constructor() {
    super('lcs');
  }

  getDefaultInput() {
    return { a: 'AGGTAB', b: 'GXTXAYB' };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const a = String(input?.a ?? '').trim();
    const b = String(input?.b ?? '').trim();
    if (a.length > 10 || b.length > 10) {
      throw new Error('LCS input strings must each be at most 10 characters');
    }

    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const directions = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const rowLabels = ['∅', ...a.split('')];
    const colLabels = ['∅', ...b.split('')];
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
      recurrenceText: 'if a[i-1] == b[j-1]: dp[i-1][j-1]+1 else max(dp[i-1][j], dp[i][j-1])',
      msg: `Initialize (${m + 1}) × (${n + 1}) LCS table for "${a}" and "${b}".`,
      msgKey: 'dp:steps.lcsInit',
      msgParams: { a: a || '∅', b: b || '∅', rows: m + 1, cols: n + 1 },
      codeLines: LINES.INIT,
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const chA = a[i - 1];
        const chB = b[j - 1];
        if (chA === chB) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          directions[i][j] = '↖';
          pushStep({
            activeCell: [i, j],
            dependencies: [[i - 1, j - 1]],
            phase: 'fill',
            recurrenceText: `'${chA}' == '${chB}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]} (↖)`,
            msg: `Match '${chA}' = '${chB}': extend diagonal dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
            msgKey: 'dp:steps.lcsMatch',
            msgParams: { chA, chB, i, j, value: dp[i][j] },
            codeLines: LINES.MATCH,
          });
        } else {
          const up = dp[i - 1][j];
          const left = dp[i][j - 1];
          dp[i][j] = Math.max(up, left);
          directions[i][j] = up >= left ? '↑' : '←';
          pushStep({
            activeCell: [i, j],
            dependencies: [[i - 1, j], [i, j - 1]],
            phase: 'fill',
            recurrenceText: `'${chA}' ≠ '${chB}' → dp[${i}][${j}] = max(↑${up}, ←${left}) = ${dp[i][j]}`,
            msg: `Mismatch '${chA}' ≠ '${chB}': take max(up=${up}, left=${left}) = ${dp[i][j]}.`,
            msgKey: 'dp:steps.lcsMismatch',
            msgParams: { chA, chB, i, j, up, left, value: dp[i][j] },
            codeLines: LINES.MISMATCH,
          });
        }
      }
    }

    // Traceback phase
    const tracebackCells = [[m, n]];
    const chars = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        chars.push(a[i - 1]);
        pushStep({
          activeCell: [i, j],
          dependencies: [[i - 1, j - 1]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback ↖: matched '${a[i - 1]}', move to (${i - 1}, ${j - 1})`,
          msg: `Traceback at (${i}, ${j}): characters match ('${a[i - 1]}') — record it and step diagonally.`,
          msgKey: 'dp:steps.lcsTraceMatch',
          msgParams: { i, j, ch: a[i - 1] },
          codeLines: LINES.DONE,
        });
        i -= 1;
        j -= 1;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        pushStep({
          activeCell: [i, j],
          dependencies: [[i - 1, j]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback ↑: dp[${i - 1}][${j}] ≥ dp[${i}][${j - 1}], move to (${i - 1}, ${j})`,
          msg: `Traceback at (${i}, ${j}): step up to (${i - 1}, ${j}).`,
          msgKey: 'dp:steps.lcsTraceUp',
          msgParams: { i, j, nextI: i - 1 },
          codeLines: LINES.DONE,
        });
        i -= 1;
      } else {
        pushStep({
          activeCell: [i, j],
          dependencies: [[i, j - 1]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback ←: dp[${i}][${j - 1}] > dp[${i - 1}][${j}], move to (${i}, ${j - 1})`,
          msg: `Traceback at (${i}, ${j}): step left to (${i}, ${j - 1}).`,
          msgKey: 'dp:steps.lcsTraceLeft',
          msgParams: { i, j, nextJ: j - 1 },
          codeLines: LINES.DONE,
        });
        j -= 1;
      }
      tracebackCells.push([i, wClamp(j)]);
    }

    const subsequence = chars.reverse().join('');
    const length = dp[m][n];

    pushStep({
      activeCell: [m, n],
      traceback: tracebackCells,
      phase: 'done',
      recurrenceText: `LCS = "${subsequence || '∅'}" (length ${length})`,
      result: { length, subsequence },
      summary: subsequence ? `"${subsequence}" (${length})` : `∅ (0)`,
      msg: `Done! LCS length = ${length}, subsequence = "${subsequence || '∅'}".`,
      msgKey: 'dp:steps.lcsDone',
      msgParams: { length, subsequence: subsequence || '∅' },
      codeLines: LINES.DONE,
    });

    return steps;
  }
}

function wClamp(val) {
  return Math.max(0, val);
}
