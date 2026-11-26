import { describe, it, expect } from 'vitest';
import {
  MAX_SUFFIX_TRIE_LEN,
  buildSuffixTrie,
  searchSuffixTrie,
} from './SuffixTrie.js';

function bruteForceOccurrences(text, pattern) {
  const positions = [];
  for (let i = 0; i <= text.length - pattern.length; i += 1) {
    if (text.slice(i, i + pattern.length) === pattern) {
      positions.push(i);
    }
  }
  return positions;
}

function collectLeafPaths(node, prefix = '', out = []) {
  const nextPrefix = prefix + node.char;
  if (node.children.length === 0) {
    out.push({ path: nextPrefix, suffixIndex: node.suffixIndex });
  } else {
    for (const child of node.children) {
      collectLeafPaths(child, nextPrefix, out);
    }
  }
  return out;
}

describe('SuffixTrie', () => {
  it('rejects invalid and over-length inputs', () => {
    for (const bad of ['', '   ', 'a b', 'ab$c', 'mississippi']) {
      const res = buildSuffixTrie(bad);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toBeTruthy();
      expect(res.steps).toEqual([]);
    }
    expect(MAX_SUFFIX_TRIE_LEN).toBe(10);
  });

  it.each(['banana', 'aaaa', 'a', 'ababa', 'gattaca'])(
    'builds valid Suffix Trie with all n+1 suffixes and immutable steps for "%s"',
    (input) => {
      const res = buildSuffixTrie(input);
      expect(res.ok).toBe(true);
      expect(res.textWithSentinel).toBe(`${input}$`);

      const n = input.length;
      expect(res.stats.leaves).toBe(n + 1);
      expect(res.stats.edges).toBe(res.stats.nodes - 1);

      // Every leaf path must correspond exactly to T[suffixIndex..]$
      const leafPaths = collectLeafPaths(res.root);
      expect(leafPaths).toHaveLength(n + 1);
      const seenIndices = new Set();
      for (const { path, suffixIndex } of leafPaths) {
        expect(suffixIndex).toBeGreaterThanOrEqual(0);
        expect(suffixIndex).toBeLessThanOrEqual(n);
        expect(seenIndices.has(suffixIndex)).toBe(false);
        seenIndices.add(suffixIndex);
        expect(path).toBe(res.textWithSentinel.slice(suffixIndex));
      }

      // Step contract & immutability
      expect(res.steps.length).toBeGreaterThan(2);
      expect(res.steps[0].stats.nodes).toBe(1);
      expect(res.steps[res.steps.length - 1].stats).toEqual(res.stats);
      for (const step of res.steps) {
        expect(typeof step.msg).toBe('string');
        expect(step.msg.length).toBeGreaterThan(0);
        expect(step.msgKey).toMatch(/^suffix:steps\./);
        expect(step.root).toBeTruthy();
        expect(step.codeTrace).toMatchObject({ functionKey: 'build', stepId: step.type });
      }
    },
  );

  it.each(['banana', 'aaaa', 'a', 'ababa'])(
    'matches brute-force search oracle for all substrings and misses on "%s"',
    (input) => {
      const built = buildSuffixTrie(input);
      expect(built.ok).toBe(true);

      const tested = new Set();
      for (let i = 0; i < input.length; i += 1) {
        for (let j = i + 1; j <= input.length; j += 1) {
          const pat = input.slice(i, j);
          if (tested.has(pat)) continue;
          tested.add(pat);
          const expected = bruteForceOccurrences(input, pat);
          const found = searchSuffixTrie(built.root, built.textWithSentinel, pat);
          expect(found.ok).toBe(true);
          expect(found.found).toBe(true);
          expect(found.positions).toEqual(expected);
          expect(found.steps.length).toBeGreaterThan(1);
          expect(found.steps.every((step) => step.codeTrace?.functionKey === 'search')).toBe(true);
        }
      }

      for (const miss of ['z', 'xyz', `${input}x`, 'bb']) {
        if (input.includes(miss)) continue;
        const found = searchSuffixTrie(built.root, built.textWithSentinel, miss);
        expect(found.ok).toBe(true);
        expect(found.found).toBe(false);
        expect(found.positions).toEqual([]);
      }
    },
  );

  it('rejects invalid search patterns', () => {
    const built = buildSuffixTrie('banana');
    expect(searchSuffixTrie(built.root, built.textWithSentinel, '').ok).toBe(false);
    expect(searchSuffixTrie(built.root, built.textWithSentinel, 'a$').ok).toBe(false);
  });
});
