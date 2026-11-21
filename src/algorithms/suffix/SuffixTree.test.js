import { describe, it, expect } from 'vitest';
import {
  MAX_SUFFIX_TREE_LEN,
  buildSuffixTree,
  computeSuffixSpaceStats,
  searchSuffixTree,
} from './SuffixTree.js';
import { buildSuffixTrie } from './SuffixTrie.js';

function bruteForceOccurrences(text, pattern) {
  const positions = [];
  for (let i = 0; i <= text.length - pattern.length; i += 1) {
    if (text.slice(i, i + pattern.length) === pattern) {
      positions.push(i);
    }
  }
  return positions;
}

function verifyTreeInvariants(root, textWithSentinel) {
  const chars = Array.from(textWithSentinel);
  const leaves = [];
  let totalNodes = 0;

  function dfs(node, pathLabel, isRoot) {
    totalNodes += 1;
    if (!isRoot) {
      expect(node.edge).toBeTruthy();
      const { start, end, label } = node.edge;
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeGreaterThanOrEqual(start);
      expect(end).toBeLessThan(chars.length);
      expect(label).toBe(chars.slice(start, end + 1).join(''));
    } else {
      expect(node.edge).toBeNull();
    }

    const nextLabel = pathLabel + (node.edge ? node.edge.label : '');

    if (node.children.length === 0) {
      expect(node.suffixIndex).not.toBeNull();
      leaves.push({ path: nextLabel, suffixIndex: node.suffixIndex });
    } else {
      expect(node.suffixIndex).toBeNull();
      // Every non-root internal node must have degree >= 2
      if (!isRoot) {
        expect(node.children.length).toBeGreaterThanOrEqual(2);
      }
      // Sibling edges must start with distinct characters
      const firstChars = new Set();
      for (const child of node.children) {
        const first = Array.from(child.edge.label)[0];
        expect(firstChars.has(first)).toBe(false);
        firstChars.add(first);
        dfs(child, nextLabel, false);
      }
    }
  }

  dfs(root, '', true);
  return { totalNodes, leaves };
}

describe('SuffixTree', () => {
  it('rejects invalid and over-length inputs', () => {
    for (const bad of ['', '   ', 'a b', 'ab$c', 'a'.repeat(MAX_SUFFIX_TREE_LEN + 1)]) {
      const res = buildSuffixTree(bad);
      expect(res.ok).toBe(false);
      expect(res.errorKey).toBeTruthy();
      expect(res.steps).toEqual([]);
    }
    expect(MAX_SUFFIX_TREE_LEN).toBe(16);
  });

  it.each(['banana', 'aaaa', 'a', 'mississippi', 'ababa', 'gattaca'])(
    'satisfies all compressed Suffix Tree invariants and Step contract for "%s"',
    (input) => {
      const res = buildSuffixTree(input);
      expect(res.ok).toBe(true);
      expect(res.textWithSentinel).toBe(`${input}$`);

      const n = input.length;
      const { totalNodes, leaves } = verifyTreeInvariants(res.root, res.textWithSentinel);

      // Leaf count === n + 1 and total nodes <= 2 * (n + 1)
      expect(leaves).toHaveLength(n + 1);
      expect(totalNodes).toBeLessThanOrEqual(2 * (n + 1));
      expect(res.stats.nodes).toBe(totalNodes);
      expect(res.stats.leaves).toBe(n + 1);

      // Every leaf path spells out T[suffixIndex..]$
      const seen = new Set();
      for (const { path, suffixIndex } of leaves) {
        expect(suffixIndex).toBeGreaterThanOrEqual(0);
        expect(suffixIndex).toBeLessThanOrEqual(n);
        expect(seen.has(suffixIndex)).toBe(false);
        seen.add(suffixIndex);
        expect(path).toBe(res.textWithSentinel.slice(suffixIndex));
      }

      // Step contract
      expect(res.steps.length).toBeGreaterThan(2);
      for (const step of res.steps) {
        expect(typeof step.msg).toBe('string');
        expect(step.msg.length).toBeGreaterThan(0);
        expect(step.msgKey).toMatch(/^suffix:steps\./);
        expect(step.root).toBeTruthy();
      }
    },
  );

  it.each(['banana', 'aaaa', 'a', 'mississippi'])(
    'matches brute-force search oracle for all substrings and misses on "%s"',
    (input) => {
      const built = buildSuffixTree(input);
      expect(built.ok).toBe(true);

      const tested = new Set();
      for (let i = 0; i < input.length; i += 1) {
        for (let j = i + 1; j <= input.length; j += 1) {
          const pat = input.slice(i, j);
          if (tested.has(pat)) continue;
          tested.add(pat);
          const expected = bruteForceOccurrences(input, pat);
          const found = searchSuffixTree(built.root, built.textWithSentinel, pat);
          expect(found.ok).toBe(true);
          expect(found.found).toBe(true);
          expect(found.positions).toEqual(expected);
          expect(found.steps.length).toBeGreaterThan(1);
        }
      }

      for (const miss of ['z', 'xyz', `${input}x`, 'anb', 'ssz']) {
        if (input.includes(miss)) continue;
        const found = searchSuffixTree(built.root, built.textWithSentinel, miss);
        expect(found.ok).toBe(true);
        expect(found.found).toBe(false);
        expect(found.positions).toEqual([]);
      }
    },
  );

  it('computes exact live space comparison stats across Trie, Tree, and SA', () => {
    for (const input of ['banana', 'aaaa', 'a', 'ababa', 'gattaca']) {
      const stats = computeSuffixSpaceStats(input);
      const trie = buildSuffixTrie(input);
      const tree = buildSuffixTree(input);
      expect(stats.ok).toBe(true);
      expect(stats.trieNodes).toBe(trie.stats.nodes);
      expect(stats.treeNodes).toBe(tree.stats.nodes);
      expect(stats.saLength).toBe(input.length + 1);
      expect(stats.treeNodes).toBeLessThanOrEqual(stats.trieNodes);
    }

    // Also works for strings longer than MAX_SUFFIX_TRIE_LEN (e.g. 'mississippi')
    const missStats = computeSuffixSpaceStats('mississippi');
    const missTree = buildSuffixTree('mississippi');
    expect(missStats.ok).toBe(true);
    expect(missStats.treeNodes).toBe(missTree.stats.nodes);
    expect(missStats.saLength).toBe(12);
    expect(missStats.trieNodes).toBeGreaterThan(missStats.treeNodes);

    expect(computeSuffixSpaceStats('').ok).toBe(false);
    expect(computeSuffixSpaceStats('a$b').ok).toBe(false);
  });
});
