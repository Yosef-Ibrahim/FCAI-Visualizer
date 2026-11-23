import { describe, it, expect } from 'vitest';
import { AVLTree } from './AVLTree.js';

/** Balance factor of every node, read through the public API. */
const balanceFactorsOf = (tree) =>
  tree.getInOrder().map((value) => tree.getBalanceFactor(value));

describe('AVLTree', () => {
  it('starts empty', () => {
    const tree = new AVLTree();

    expect(tree.root).toBeNull();
    expect(tree.getNodeCount()).toBe(0);
    expect(tree.getInOrder()).toEqual([]);
    expect(tree.getTreeHeight()).toBe(-1);
  });

  it('inserts values and keeps them sorted in order', () => {
    const tree = new AVLTree();

    [50, 30, 70, 20, 40, 60, 80].forEach((value) => tree.insert(value));

    expect(tree.getNodeCount()).toBe(7);
    expect(tree.getInOrder()).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it('uses height zero for leaves and does not rotate a balanced first insertion', () => {
    const tree = new AVLTree();
    const events = [];

    tree.insert(10, (event) => events.push(event));
    expect(tree.root.height).toBe(0);

    tree.insert(5, (event) => events.push(event));
    expect(tree.root.height).toBe(1);
    expect(events.some((event) => /rotat/i.test(event.operation))).toBe(false);
    expect(tree.getInOrder()).toEqual([5, 10]);
  });

  it.each([
    { name: 'LL', values: [30, 20, 10] },
    { name: 'RR', values: [10, 20, 30] },
    { name: 'LR', values: [30, 10, 20] },
    { name: 'RL', values: [10, 30, 20] },
  ])('performs the required $name rotation for a true imbalance', ({ values }) => {
    const tree = new AVLTree();
    values.forEach((value) => tree.insert(value));

    expect(tree.root.value).toBe(20);
    expect(tree.getInOrder()).toEqual([10, 20, 30]);
    for (const factor of balanceFactorsOf(tree)) {
      expect(Math.abs(factor)).toBeLessThanOrEqual(1);
    }
  });

  it('stays balanced for a sorted insert order', () => {
    const tree = new AVLTree();

    // A plain BST would degenerate into a list of height 8 here.
    for (let value = 1; value <= 8; value += 1) tree.insert(value);

    expect(tree.getNodeCount()).toBe(8);
    expect(tree.getInOrder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(tree.getTreeHeight()).toBeLessThanOrEqual(3);
    for (const factor of balanceFactorsOf(tree)) {
      expect(Math.abs(factor)).toBeLessThanOrEqual(1);
    }
  });

  it('stays balanced for a reversed insert order', () => {
    const tree = new AVLTree();

    for (let value = 8; value >= 1; value -= 1) tree.insert(value);

    expect(tree.getInOrder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(tree.getTreeHeight()).toBeLessThanOrEqual(3);
    for (const factor of balanceFactorsOf(tree)) {
      expect(Math.abs(factor)).toBeLessThanOrEqual(1);
    }
  });

  it('stays balanced while values are deleted again', () => {
    const tree = new AVLTree();

    [10, 20, 30, 40, 50, 25, 5].forEach((value) => tree.insert(value));
    [50, 10, 40].forEach((value) => tree.delete(value));

    expect(tree.getNodeCount()).toBe(4);
    expect(tree.getInOrder()).toEqual([5, 20, 25, 30]);
    for (const factor of balanceFactorsOf(tree)) {
      expect(Math.abs(factor)).toBeLessThanOrEqual(1);
    }
  });

  it('ignores duplicate values', () => {
    const tree = new AVLTree();

    tree.insert(10);
    tree.insert(10);

    expect(tree.getNodeCount()).toBe(1);
  });

  it('finds a stored value and rejects an unknown one', () => {
    const tree = new AVLTree();

    [50, 30, 70].forEach((value) => tree.insert(value));

    expect(tree.search(30)?.value).toBe(30);
    expect(tree.search(999)).toBeNull();
  });

  it('reports the balance factor of a node', () => {
    const tree = new AVLTree();

    [10, 20].forEach((value) => tree.insert(value));

    // 10 becomes the root with 20 on its right → difference of -1.
    expect(Math.abs(tree.getBalanceFactor(10))).toBeLessThanOrEqual(1);
    expect(tree.getBalanceFactor(999)).toBe(0);
  });

  it('does nothing when deleting a value that is not there', () => {
    const tree = new AVLTree();

    [50, 30].forEach((value) => tree.insert(value));
    tree.delete(999);

    expect(tree.getNodeCount()).toBe(2);
    expect(tree.getInOrder()).toEqual([30, 50]);
  });
});
