import { describe, it, expect } from 'vitest';
import {
  MAX_SUFFIX_ARRAY_LEN,
  buildSuffixArray,
  searchSuffixArray,
} from './SuffixArray.js';
import { compareSuffixes } from './suffixUtils.js';

function bruteForceOccurrences(text, pattern) {
  const positions = [];
  for (let i = 0; i <= text.length - pattern.length; i += 1) {
    if (text.slice(i, i + pattern.length) === pattern) {
      positions.push(i);
    }
  }
  return positions;
}

function naiveLcp(textWithSentinel, sa) {
  const lcp = [0];
  for (let r = 1; r < sa.length; r += 1) {
    const a = sa[r - 1];
    const b = sa[r];
    let k = 0;
    while (
      a + k < textWithSentinel.length
      && b + k < textWithSentinel.length
      && textWithSentinel[a + k] === textWithSentinel[b + k]
    ) {
      k += 1;
    }
    lcp.push(k);
  }
  return lcp;
}

describe('SuffixArray', () => {
  it('rejects invalid and over-length inputs', () => {
    for (const bad of ['', '   ', 'a b', 'ab$c', 'a'.repeat(MAX_SUFFIX_ARRAY_LEN + 1)]) {
      const res = buildSuffixArray(bad);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toBeTruthy();
      expect(res.steps).toEqual([]);
    }
    expect(MAX_SUFFIX_ARRAY_LEN).toBe(24);
  });

  it('computes exact SA, LCP, and LRS for classic "banana"', () => {
    const res = buildSuffixArray('banana');
    expect(res.ok).toBe(true);
    expect(res.textWithSentinel).toBe('banana$');
    // $ (6), a$ (5), ana$ (3), anana$ (1), banana$ (0), na$ (4), nana$ (2)
    expect(res.sa).toEqual([6, 5, 3, 1, 0, 4, 2]);
    expect(res.lcp).toEqual([0, 0, 1, 3, 0, 0, 2]);
    expect(res.lrs.length).toBe(3);
    expect(res.lrs.substring).toBe('ana');
    expect(res.lrs.positions).toEqual([1, 3]);
  });

  it.each(['banana', 'aaaa', 'a', 'mississippi', 'ababa', 'gattaca'])(
    'satisfies SA permutation, ordering, Kasai LCP oracle, and Step contract for "%s"',
    (input) => {
      const res = buildSuffixArray(input);
      expect(res.ok).toBe(true);
      const m = input.length + 1;

      // SA is a permutation of 0..n
      expect(res.sa).toHaveLength(m);
      expect([...res.sa].sort((a, b) => a - b)).toEqual(Array.from({ length: m }, (_, i) => i));

      // SA is strictly sorted by compareSuffixes
      for (let r = 1; r < m; r += 1) {
        expect(compareSuffixes(res.textWithSentinel, res.sa[r - 1], res.sa[r])).toBeLessThan(0);
      }

      // Kasai LCP matches naive pairwise LCP oracle
      expect(res.lcp).toEqual(naiveLcp(res.textWithSentinel, res.sa));

      // LRS agrees with max(LCP)
      const maxLcp = Math.max(...res.lcp);
      expect(res.lrs.length).toBe(maxLcp);
      if (maxLcp > 0) {
        expect(res.lrs.substring.length).toBe(maxLcp);
        expect(res.lrs.positions.length).toBeGreaterThanOrEqual(2);
        for (const pos of res.lrs.positions) {
          expect(input.slice(pos, pos + maxLcp)).toBe(res.lrs.substring);
        }
      }

      // Step contract
      expect(res.steps.length).toBeGreaterThan(2);
      for (const step of res.steps) {
        expect(typeof step.msg).toBe('string');
        expect(step.msg.length).toBeGreaterThan(0);
        expect(step.msgKey).toMatch(/^suffix:steps\./);
      }
    },
  );

  it.each(['banana', 'aaaa', 'a', 'mississippi'])(
    'binary search matches brute-force oracle for all substrings and misses on "%s"',
    (input) => {
      const built = buildSuffixArray(input);
      expect(built.ok).toBe(true);

      const tested = new Set();
      for (let i = 0; i < input.length; i += 1) {
        for (let j = i + 1; j <= input.length; j += 1) {
          const pat = input.slice(i, j);
          if (tested.has(pat)) continue;
          tested.add(pat);
          const expected = bruteForceOccurrences(input, pat);
          const found = searchSuffixArray(built.textWithSentinel, built.sa, pat, built.lcp);
          expect(found.ok).toBe(true);
          expect(found.found).toBe(true);
          expect(found.positions).toEqual(expected);
          expect(found.rightBound - found.leftBound).toBe(expected.length);
          expect(found.steps.length).toBeGreaterThan(0);
        }
      }

      for (const miss of ['z', 'xyz', `${input}z`, '0', 'qq']) {
        if (input.includes(miss)) continue;
        const found = searchSuffixArray(built.textWithSentinel, built.sa, miss, built.lcp);
        expect(found.ok).toBe(true);
        expect(found.found).toBe(false);
        expect(found.positions).toEqual([]);
        expect(found.leftBound).toBe(found.rightBound);
      }
    },
  );

  it('rejects invalid search patterns', () => {
    const built = buildSuffixArray('banana');
    expect(searchSuffixArray(built.textWithSentinel, built.sa, '').ok).toBe(false);
    expect(searchSuffixArray(built.textWithSentinel, built.sa, 'na$').ok).toBe(false);
  });
});
