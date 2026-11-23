import { describe, it, expect } from 'vitest';
import { StackDS } from './StackDS.js';

/** The values currently on the stack, bottom first. */
const valuesOf = (stack) =>
  stack.nodes.filter((node) => !node.isDeleted).map((node) => node.val);

describe('StackDS', () => {
  it('provides C++ code for every visualized operation', () => {
    const structure = new StackDS();
    const snippets = structure.getOpsCode();

    for (const operation of ["push","pop","peek"]) {
      expect(snippets[operation].cpp).toBeDefined();
      expect(snippets[operation].cpp.length).toBeGreaterThan(0);
      expect(snippets[operation].cpp.join('\n')).toMatch(/\b(void|int|bool|#include|struct)\b/);
    }
  });

  it('starts empty', () => {
    const stack = new StackDS();

    expect(stack.getSize()).toBe(0);
    expect(valuesOf(stack)).toEqual([]);
  });

  it('pushes values onto the top', () => {
    const stack = new StackDS();

    stack.push(1);
    stack.push(2);

    expect(stack.getSize()).toBe(2);
    expect(valuesOf(stack)).toEqual([1, 2]);
  });

  it('pops the last pushed value first (LIFO)', () => {
    const stack = new StackDS();

    stack.push(1);
    stack.push(2);
    stack.push(3);

    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.getSize()).toBe(1);
    expect(valuesOf(stack)).toEqual([1]);
  });

  it('reports nothing when popping an empty stack', () => {
    const stack = new StackDS();

    expect(stack.pop()).toBe('');
    expect(stack.getSize()).toBe(0);
  });

  it('clears every value', () => {
    const stack = new StackDS();

    stack.push(1);
    stack.push(2);
    stack.clear();

    expect(stack.getSize()).toBe(0);
    expect(valuesOf(stack)).toEqual([]);
  });
});
