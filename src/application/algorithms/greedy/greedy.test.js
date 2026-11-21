import { describe, it, expect } from 'vitest';
import { ActivitySelection, FractionalKnapsack, GreedyCoinChange } from './index';

const LANGUAGES = ['js', 'python', 'cpp', 'java', 'csharp'];
const ALL_GREEDY = [
  new ActivitySelection(),
  new FractionalKnapsack(),
  new GreedyCoinChange(),
];

describe('Greedy algorithms Step & Registry contract', () => {
  it('registers expected unique ids and greedy category', () => {
    const ids = ALL_GREEDY.map((a) => a.id);
    expect(ids).toEqual(['activity-selection', 'fractional-knapsack', 'greedy-coin-change']);
    for (const algo of ALL_GREEDY) {
      expect(algo.category).toBe('greedy');
      expect(typeof algo.name).toBe('string');
      expect(algo.complexity).toBeTruthy();
      expect(algo.explanation).toBeTruthy();
    }
  });

  it('provides all 5 languages and keeps every step codeLines strictly in bounds', () => {
    for (const algo of ALL_GREEDY) {
      const snippets = algo.codeSnippets;
      expect(Object.keys(snippets).sort()).toEqual([...LANGUAGES].sort());

      const steps = algo.generateSteps(algo.getDefaultInput());
      expect(steps.length).toBeGreaterThan(0);

      steps.forEach((step, idx) => {
        expect(typeof step.msg === 'string' && step.msg.trim().length > 0, `${algo.id}[${idx}].msg`).toBe(true);
        expect(typeof step.msgKey === 'string' && step.msgKey.startsWith('greedy:steps.'), `${algo.id}[${idx}].msgKey`).toBe(true);
        expect(step.greedy, `${algo.id}[${idx}].greedy`).toBeTruthy();

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

describe('ActivitySelection', () => {
  const algo = new ActivitySelection();

  it('selects maximum non-overlapping activities sorted by finish time', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.greedy.kind).toBe('activity');
    expect(last.greedy.accepted.length).toBe(4);
    const chosen = last.greedy.accepted.map((idx) => last.greedy.items[idx]);
    expect(chosen.map((a) => a.name)).toEqual(['A2', 'A4', 'A6', 'A7']);

    for (let i = 1; i < chosen.length; i++) {
      expect(chosen[i].start).toBeGreaterThanOrEqual(chosen[i - 1].end);
    }
  });

  it('breaks finish-time ties deterministically by original index', () => {
    const steps = algo.generateSteps({
      activities: [
        { name: 'First', start: 2, end: 5 },
        { name: 'Second', start: 1, end: 5 },
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.greedy.items.map((a) => a.name)).toEqual(['First', 'Second']);
    expect(last.greedy.accepted).toEqual([0]);
    expect(last.greedy.rejected).toEqual([1]);
  });

  it('rejects invalid intervals with start >= end or too many activities', () => {
    expect(() => algo.generateSteps({ activities: [{ name: 'Bad', start: 5, end: 5 }] })).toThrow();
    expect(() => algo.generateSteps({ activities: [{ name: 'Bad', start: 7, end: 3 }] })).toThrow();
    expect(() => algo.generateSteps({ activities: [] })).toThrow();
  });
});

describe('FractionalKnapsack', () => {
  const algo = new FractionalKnapsack();

  it('computes optimal value 240 with whole, fractional, and skipped items', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.greedy.kind).toBe('fractional-knapsack');
    expect(last.greedy.metrics.totalValue).toBe(240);
    expect(last.greedy.metrics.usedWeight).toBe(50);
    expect(last.greedy.accepted.map((e) => e.name)).toEqual(['A', 'B', 'C']);
    expect(last.greedy.accepted[2].fraction).toBeCloseTo(0.67, 1);
    expect(last.greedy.rejected).toEqual([3]);
  });

  it('breaks equal ratio ties deterministically by original index', () => {
    const steps = algo.generateSteps({
      capacity: 10,
      items: [
        { name: 'X', weight: 10, value: 40 },
        { name: 'Y', weight: 5, value: 20 },
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.greedy.items.map((i) => i.name)).toEqual(['X', 'Y']);
    expect(last.greedy.accepted[0].name).toBe('X');
  });

  it('rejects non-positive weight or capacity', () => {
    expect(() => algo.generateSteps({ capacity: 0, items: [{ name: 'A', weight: 5, value: 10 }] })).toThrow();
    expect(() => algo.generateSteps({ capacity: 10, items: [{ name: 'A', weight: 0, value: 10 }] })).toThrow();
  });
});

describe('GreedyCoinChange', () => {
  const algo = new GreedyCoinChange();

  it('finds optimal 4 coins on canonical US coins [1, 5, 10, 25] for target 41', () => {
    const steps = algo.generateSteps(algo.getDefaultInput());
    const last = steps[steps.length - 1];

    expect(last.greedy.kind).toBe('coin-change');
    expect(last.greedy.accepted).toEqual([25, 10, 5, 1]);
    expect(last.greedy.optimalComparison.isOptimal).toBe(true);
    expect(last.greedy.optimalComparison.greedyCount).toBe(4);
    expect(last.greedy.optimalComparison.optimalCount).toBe(4);
  });

  it('detects suboptimal greedy pick on failing case [1, 3, 4] for target 6', () => {
    const steps = algo.generateSteps({ coins: [1, 3, 4], amount: 6 });
    const last = steps[steps.length - 1];

    expect(last.greedy.accepted).toEqual([4, 1, 1]);
    expect(last.greedy.optimalComparison.isOptimal).toBe(false);
    expect(last.greedy.optimalComparison.greedyCount).toBe(3);
    expect(last.greedy.optimalComparison.optimalCount).toBe(2);
    expect(last.greedy.optimalComparison.optimalCoins).toEqual([3, 3]);
  });

  it('detects when greedy fails to reach exact change while DP succeeds', () => {
    const steps = algo.generateSteps({ coins: [3, 5], amount: 9 });
    const last = steps[steps.length - 1];

    expect(last.greedy.optimalComparison.greedyReachable).toBe(false);
    expect(last.greedy.optimalComparison.remaining).toBe(1);
    expect(last.greedy.optimalComparison.optimalReachable).toBe(true);
    expect(last.greedy.optimalComparison.optimalCount).toBe(3);
    expect(last.greedy.optimalComparison.isOptimal).toBe(false);
  });

  it('handles impossible target cleanly for both greedy and DP', () => {
    const steps = algo.generateSteps({ coins: [2, 4], amount: 5 });
    const last = steps[steps.length - 1];

    expect(last.greedy.optimalComparison.greedyReachable).toBe(false);
    expect(last.greedy.optimalComparison.optimalReachable).toBe(false);
  });
});
