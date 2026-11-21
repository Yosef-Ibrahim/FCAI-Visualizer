import { describe, it, expect } from 'vitest';
import { FibonacciDP, Knapsack01, LCS, CoinChangeDP } from './index';

const LANGUAGES = ['js', 'python', 'cpp', 'java', 'csharp'];
const ALL_DP = [
  new FibonacciDP(),
  new Knapsack01(),
  new LCS(),
  new CoinChangeDP(),
];

describe('DP algorithms Step & Registry contract', () => {
  it('registers expected unique ids and dp category', () => {
    const ids = ALL_DP.map((a) => a.id);
    expect(ids).toEqual(['fibonacci-dp', 'knapsack-01', 'lcs', 'coin-change-dp']);
    for (const algo of ALL_DP) {
      expect(algo.category).toBe('dp');
      expect(typeof algo.name).toBe('string');
      expect(algo.complexity).toBeTruthy();
      expect(algo.explanation).toBeTruthy();
    }
  });

  it('provides all 5 languages and keeps every step codeLines strictly in bounds', () => {
    for (const algo of ALL_DP) {
      const snippets = algo.codeSnippets;
      expect(Object.keys(snippets).sort()).toEqual([...LANGUAGES].sort());

      const steps = algo.generateSteps(algo.getDefaultInput());
      expect(steps.length).toBeGreaterThan(0);

      steps.forEach((step, idx) => {
        expect(typeof step.msg === 'string' && step.msg.trim().length > 0, `${algo.id}[${idx}].msg`).toBe(true);
        expect(typeof step.msgKey === 'string' && step.msgKey.startsWith('dp:steps.'), `${algo.id}[${idx}].msgKey`).toBe(true);
        expect(step.dp, `${algo.id}[${idx}].dp`).toBeTruthy();

        for (const lang of LANGUAGES) {
          const line = step.codeLines?.[lang];
          expect(Number.isInteger(line), `${algo.id}[${idx}].codeLines.${lang}`).toBe(true);
          expect(line, `${algo.id}[${idx}].codeLines.${lang} >= 0`).toBeGreaterThanOrEqual(0);
          expect(line, `${algo.id}[${idx}].codeLines.${lang} < len`).toBeLessThan(snippets[lang].length);
        }

        for (const field of ['arr', 'compare', 'swap', 'sorted']) {
          if (step[field] !== undefined && step[field] !== null) {
            expect(Array.isArray(step[field])).toBe(true);
          }
        }
      });
    }
  });
});

describe('FibonacciDP', () => {
  const algo = new FibonacciDP();

  it('computes F(7) = 13 with dependency cells on each fill step', () => {
    const steps = algo.generateSteps({ n: 7 });
    const last = steps[steps.length - 1];
    expect(last.dp.phase).toBe('done');
    expect(last.dp.result).toBe(13);
    expect(last.dp.table[0]).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);

    const fillSteps = steps.filter((s) => s.dp.phase === 'fill');
    expect(fillSteps.length).toBe(6);
    expect(fillSteps[0].dp.activeCell).toEqual([0, 2]);
    expect(fillSteps[0].dp.dependencies).toEqual([[0, 1], [0, 0]]);
  });

  it('handles boundary n=1 and n=12', () => {
    const s1 = algo.generateSteps({ n: 1 });
    expect(s1[s1.length - 1].dp.result).toBe(1);

    const s12 = algo.generateSteps({ n: 12 });
    expect(s12[s12.length - 1].dp.result).toBe(144);
  });

  it('rejects out-of-range or non-integer inputs', () => {
    expect(() => algo.generateSteps({ n: 0 })).toThrow();
    expect(() => algo.generateSteps({ n: 13 })).toThrow();
    expect(() => algo.generateSteps({ n: 3.5 })).toThrow();
  });
});

describe('Knapsack01', () => {
  const algo = new Knapsack01();

  it('solves the default 0/1 knapsack with optimal value 9 and valid traceback', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.dp.phase).toBe('done');
    expect(last.dp.result.maxValue).toBe(9);
    expect(last.dp.result.selectedItems.map((i) => i.name)).toEqual(['B', 'C']);
    expect(last.dp.result.totalWeight).toBe(7);

    const traceSteps = steps.filter((s) => s.dp.phase === 'traceback');
    expect(traceSteps.length).toBeGreaterThan(0);
    expect(last.dp.traceback.length).toBeGreaterThan(1);
  });

  it('handles zero capacity cleanly', () => {
    const steps = algo.generateSteps({
      capacity: 0,
      items: [{ name: 'A', weight: 2, value: 10 }],
    });
    const last = steps[steps.length - 1];
    expect(last.dp.result.maxValue).toBe(0);
    expect(last.dp.result.selectedItems).toEqual([]);
  });

  it('rejects invalid capacities or item counts', () => {
    expect(() => algo.generateSteps({ capacity: -1, items: [{ name: 'A', weight: 1, value: 1 }] })).toThrow();
    expect(() => algo.generateSteps({ capacity: 13, items: [{ name: 'A', weight: 1, value: 1 }] })).toThrow();
    expect(() => algo.generateSteps({ capacity: 5, items: [] })).toThrow();
    expect(() => algo.generateSteps({ capacity: 5, items: [{ name: 'A', weight: 0, value: 5 }] })).toThrow();
  });
});

describe('LCS', () => {
  const algo = new LCS();

  it('finds GTAB (length 4) for AGGTAB and GXTXAYB with traceback', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.dp.phase).toBe('done');
    expect(last.dp.result.length).toBe(4);
    expect(last.dp.result.subsequence).toBe('GTAB');
    expect(steps.some((s) => s.dp.phase === 'traceback')).toBe(true);
  });

  it('handles empty strings and disjoint strings', () => {
    const emptySteps = algo.generateSteps({ a: '', b: 'ABC' });
    expect(emptySteps[emptySteps.length - 1].dp.result).toEqual({ length: 0, subsequence: '' });

    const disjointSteps = algo.generateSteps({ a: 'ABC', b: 'XYZ' });
    expect(disjointSteps[disjointSteps.length - 1].dp.result).toEqual({ length: 0, subsequence: '' });
  });

  it('rejects strings longer than 10 characters', () => {
    expect(() => algo.generateSteps({ a: 'ABCDEFGHIJK', b: 'ABC' })).toThrow();
  });
});

describe('CoinChangeDP', () => {
  const algo = new CoinChangeDP();

  it('finds optimal 2 coins [3, 3] on classic non-greedy case [1, 3, 4] for target 6', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.dp.phase).toBe('done');
    expect(last.dp.result.reachable).toBe(true);
    expect(last.dp.result.minCoins).toBe(2);
    expect(last.dp.result.coins.reduce((a, b) => a + b, 0)).toBe(6);
    expect(last.dp.result.coins).toEqual([3, 3]);
  });

  it('marks unreachable amounts with ∞ and returns reachable: false', () => {
    const steps = algo.generateSteps({ coins: [2, 5], amount: 3 });
    const last = steps[steps.length - 1];

    expect(last.dp.result.reachable).toBe(false);
    expect(last.dp.result.minCoins).toBe(-1);
    expect(last.dp.table[0][3]).toBe('∞');
  });

  it('handles target amount 0', () => {
    const steps = algo.generateSteps({ coins: [2, 5], amount: 0 });
    const last = steps[steps.length - 1];
    expect(last.dp.result).toEqual({ minCoins: 0, coins: [], reachable: true });
  });

  it('rejects invalid coins or out-of-range amounts', () => {
    expect(() => algo.generateSteps({ coins: [0, 2], amount: 4 })).toThrow();
    expect(() => algo.generateSteps({ coins: [1, 2], amount: 21 })).toThrow();
    expect(() => algo.generateSteps({ coins: [], amount: 5 })).toThrow();
  });
});
