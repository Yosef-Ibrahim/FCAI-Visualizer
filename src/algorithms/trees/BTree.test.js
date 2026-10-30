import { describe, expect, it } from 'vitest';
import {
  BTree,
  BTREE_MAX_KEYS,
  BTREE_MAX_ORDER,
  BTREE_MIN_KEYS,
  BTREE_MIN_ORDER,
  BTREE_ORDER,
} from './BTree.js';

function getInOrder(node, values = []) {
  if (!node) return values;
  node.keys.forEach((key, index) => {
    if (node.children.length) getInOrder(node.children[index], values);
    values.push(key);
  });
  if (node.children.length) getInOrder(node.children[node.keys.length], values);
  return values;
}

function expectValidTree(tree) {
  if (!tree.root) return;
  let leafDepth = null;

  function visit(node, depth, min = -Infinity, max = Infinity, isRoot = false) {
    expect(node.keys.length).toBeLessThanOrEqual(tree.maxKeys);
    if (!isRoot) expect(node.keys.length).toBeGreaterThanOrEqual(tree.minKeys);
    expect(node.keys).toEqual([...node.keys].sort((a, b) => a - b));
    node.keys.forEach((key) => {
      expect(key).toBeGreaterThan(min);
      expect(key).toBeLessThan(max);
    });

    if (node.children.length === 0) {
      if (leafDepth === null) leafDepth = depth;
      expect(depth).toBe(leafDepth);
      return;
    }

    expect(node.children).toHaveLength(node.keys.length + 1);
    node.children.forEach((child, index) => {
      visit(
        child,
        depth + 1,
        index === 0 ? min : node.keys[index - 1],
        index === node.keys.length ? max : node.keys[index],
      );
    });
  }

  visit(tree.root, 0, -Infinity, Infinity, true);
}

describe('BTree (Ord = 3)', () => {
  it('uses Ord as maximum child count, with at most two keys per stable node', () => {
    expect(BTREE_ORDER).toBe(3);
    expect(BTREE_MAX_KEYS).toBe(2);
    expect(BTREE_MIN_KEYS).toBe(1);
  });

  it('validates the supported order range and derives limits from the configured order', () => {
    expect(() => new BTree(2)).toThrow(/order must be an integer/i);
    expect(() => new BTree(BTREE_MAX_ORDER + 1)).toThrow(/order must be an integer/i);

    for (let order = BTREE_MIN_ORDER; order <= BTREE_MAX_ORDER; order += 1) {
      const tree = new BTree(order);
      expect(tree.order).toBe(order);
      expect(tree.maxKeys).toBe(order - 1);
      expect(tree.minKeys).toBe(Math.floor((order - 1) / 2));
    }
  });

  it('inserts into a leaf, searches for present and absent keys, and rejects duplicates', () => {
    const tree = new BTree();
    expect(tree.insert(8).inserted).toBe(true);
    expect(tree.insert(3).inserted).toBe(true);
    expect(tree.root.keys).toEqual([3, 8]);
    expect(tree.search(3).found).toBe(true);
    expect(tree.search(7).found).toBe(false);

    const duplicate = tree.insert(3);
    expect(duplicate.inserted).toBe(false);
    expect(duplicate.steps.at(-1).kind).toBe('duplicate');
    expect(getInOrder(tree.root)).toEqual([3, 8]);
  });

  it('validates keys as safe integers', () => {
    const tree = new BTree();
    expect(() => tree.insert(1.5)).toThrow(/safe integers/i);
    expect(() => tree.search(Number.NaN)).toThrow(/safe integers/i);
    expect(() => tree.delete(Number.MAX_SAFE_INTEGER + 1)).toThrow(/safe integers/i);
  });

  it('preserves ordering and invariants for ascending, descending, and negative keys', () => {
    for (const values of [
      [-9, -6, -3, 0, 3, 6, 9],
      [9, 6, 3, 0, -3, -6, -9],
    ]) {
      const tree = new BTree();
      values.forEach((value) => {
        expect(tree.insert(value).inserted).toBe(true);
        expectValidTree(tree);
      });

      expect(getInOrder(tree.root)).toEqual([...values].sort((a, b) => a - b));
      values.forEach((value) => expect(tree.search(value).found).toBe(true));
      [...values].forEach((value) => {
        expect(tree.delete(value).deleted).toBe(true);
        expectValidTree(tree);
      });
      expect(tree.root).toBeNull();
      expect(tree.getHeight()).toBe(0);
    }
  });

  it('splits a full leaf and promotes its middle key to a new root', () => {
    const tree = new BTree();
    [1, 5].forEach((value) => tree.insert(value));
    const result = tree.insert(0);

    expect(tree.root.keys).toEqual([1]);
    expect(tree.root.children.map((child) => child.keys)).toEqual([[0], [5]]);
    expect(tree.getHeight()).toBe(2);
    expect(result.steps.some((step) => step.kind === 'split')).toBe(true);
    expect(result.steps.some((step) => step.kind === 'root-split')).toBe(true);
    expectValidTree(tree);
  });

  it('propagates consecutive splits and splits the root as in the C++ example', () => {
    const tree = new BTree();
    [1, 5, 0, 4, 3, 2, 6].forEach((value) => tree.insert(value));
    const result = tree.insert(7);

    expect(tree.root.keys).toEqual([4]);
    expect(tree.root.children.map((child) => child.keys)).toEqual([[1], [6]]);
    expect(tree.root.children[0].children.map((child) => child.keys)).toEqual([[0], [2, 3]]);
    expect(tree.root.children[1].children.map((child) => child.keys)).toEqual([[5], [7]]);
    expect(tree.getHeight()).toBe(3);
    expect(result.steps.some((step) => step.kind === 'promote')).toBe(true);
    expect(result.steps.some((step) => step.kind === 'root-split')).toBe(true);
    expectValidTree(tree);
  });

  it('replaces an internal key with its predecessor and deletes it from the leaf', () => {
    const tree = new BTree();
    [1, 5, 0, 4, 3, 2].forEach((value) => tree.insert(value));
    const result = tree.delete(4);

    expect(result.deleted).toBe(true);
    expect(result.steps.some((step) => step.kind === 'predecessor')).toBe(true);
    expect(tree.root.keys).toEqual([1, 3]);
    expect(getInOrder(tree.root)).toEqual([0, 1, 2, 3, 5]);
    expectValidTree(tree);
  });

  it('merges nodes and shrinks the root after cascading underflow', () => {
    const tree = new BTree();
    [1, 5, 0, 4, 3, 2, 6, 7].forEach((value) => tree.insert(value));
    const result = tree.delete(7);

    expect(result.deleted).toBe(true);
    expect(result.steps.filter((step) => step.kind === 'merge')).toHaveLength(2);
    expect(result.steps.some((step) => step.kind === 'root-shrink')).toBe(true);
    expect(tree.root.keys).toEqual([1, 4]);
    expect(tree.root.children.map((child) => child.keys)).toEqual([[0], [2, 3], [5, 6]]);
    expect(tree.getHeight()).toBe(2);
    expectValidTree(tree);
  });


  it('keeps the predecessor in the merged leaf and removes it from the root after deletion', () => {
    const tree = new BTree(5);
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((value) => {
      tree.insert(value);
    });

    const result = tree.delete(30);

    expect(result.deleted).toBe(true);
    expect(tree.root.keys).toEqual([60]);
    expect(tree.root.children.map((child) => child.keys)).toEqual([
      [10, 20, 40, 50],
      [70, 80, 90, 100],
    ]);
    expect(getInOrder(tree.root)).toEqual([10, 20, 40, 50, 60, 70, 80, 90, 100]);
    expectValidTree(tree);

    const finalSnapshot = result.steps.at(-1).snapshot;
    expect(finalSnapshot.keys).toEqual([60]);
    expect(finalSnapshot.children[0].keys).toEqual([10, 20, 40, 50]);
    expect(finalSnapshot.children[0].keys.filter((key) => key === 20)).toHaveLength(1);
  });

  it('borrows from the right sibling and reports missing-key searches and deletes', () => {
    const tree = new BTree();
    [1, 5, 0, 4, 3, 2, 6, 7].forEach((value) => tree.insert(value));
    tree.delete(7);
    const result = tree.delete(0);

    expect(result.steps.some((step) => step.operation === 'borrow-right')).toBe(true);
    expect(tree.root.keys).toEqual([2, 4]);
    expect(tree.root.children.map((child) => child.keys)).toEqual([[1], [3], [5, 6]]);
    expect(tree.search(99).found).toBe(false);
    expect(tree.delete(99).deleted).toBe(false);
    expectValidTree(tree);
  });

  it('borrows from the left sibling when the right sibling cannot lend', () => {
    const tree = new BTree();
    [6, 2, 7, 1].forEach((value) => tree.insert(value));
    const result = tree.delete(7);

    expect(result.steps.some((step) => step.operation === 'borrow-left')).toBe(true);
    expectValidTree(tree);
    expect(getInOrder(tree.root)).toEqual([1, 2, 6]);
  });

  it('deletes the last key and supports an empty tree', () => {
    const tree = new BTree();
    expect(tree.search(1).steps.at(-1).kind).toBe('not-found');
    expect(tree.delete(1).deleted).toBe(false);

    tree.insert(1);
    const result = tree.delete(1);
    expect(result.deleted).toBe(true);
    expect(tree.root).toBeNull();
    expect(result.steps.some((step) => step.kind === 'root-shrink')).toBe(true);
  });

  it('preserves B-Tree invariants through deterministic mixed operations', () => {
    const tree = new BTree();
    const expected = new Set();
    let seed = 0x51f15e;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed;
    };

    for (let operation = 0; operation < 500; operation += 1) {
      const value = random() % 80;
      if (random() % 3 === 0) {
        expect(tree.delete(value).deleted).toBe(expected.delete(value));
      } else {
        const existed = expected.has(value);
        expect(tree.insert(value).inserted).toBe(!existed);
        expected.add(value);
      }

      expectValidTree(tree);
      expect(getInOrder(tree.root)).toEqual([...expected].sort((a, b) => a - b));
      const searched = random() % 80;
      expect(tree.search(searched).found).toBe(expected.has(searched));
    }
  });

  it('preserves B-Tree invariants across every supported order', () => {
    for (let order = BTREE_MIN_ORDER; order <= BTREE_MAX_ORDER; order += 1) {
      const tree = new BTree(order);
      const values = Array.from({ length: 90 }, (_, index) => (index * 37) % 97);
      values.forEach((value) => {
        tree.insert(value);
        expectValidTree(tree);
      });
      values.filter((_, index) => index % 2 === 0).forEach((value) => {
        tree.delete(value);
        expectValidTree(tree);
      });
    }
  });
});
