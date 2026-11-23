import { describe, it, expect } from 'vitest';
import { LinkedListDS } from './LinkedListDS.js';

/** The values currently in the list, head first. */
const valuesOf = (list) =>
  list.nodes.filter((node) => !node.isDeleted).map((node) => node.val);

describe('LinkedListDS', () => {
  it('provides C++ code for every visualized operation', () => {
    const structure = new LinkedListDS();
    const snippets = structure.getOpsCode();

    for (const operation of ["insertHead","insertTail","insertAt","deleteAt","insertOrdered","deleteByValue"]) {
      expect(snippets[operation].cpp).toBeDefined();
      expect(snippets[operation].cpp.length).toBeGreaterThan(0);
      expect(snippets[operation].cpp.join('\n')).toMatch(/\b(void|int|bool|#include|struct)\b/);
    }
  });

  it('starts empty', () => {
    const list = new LinkedListDS();

    expect(list.getSize()).toBe(0);
    expect(valuesOf(list)).toEqual([]);
  });

  it('inserts values in order', () => {
    const list = new LinkedListDS();

    list.insert(0, 1);
    list.insert(1, 2);
    list.insert(2, 3);

    expect(list.getSize()).toBe(3);
    expect(valuesOf(list)).toEqual([1, 2, 3]);
  });

  it('inserts in the middle', () => {
    const list = new LinkedListDS();

    list.insert(0, 1);
    list.insert(1, 3);
    list.insert(1, 2);

    expect(valuesOf(list)).toEqual([1, 2, 3]);
  });

  it('deletes a value and reports it', () => {
    const list = new LinkedListDS();

    list.insert(0, 1);
    list.insert(1, 2);
    list.insert(2, 3);

    expect(list.delete(1)).toBe(2);
    expect(list.getSize()).toBe(2);
    expect(valuesOf(list)).toEqual([1, 3]);
  });

  it('reports nothing when deleting an index that does not exist', () => {
    const list = new LinkedListDS();

    list.insert(0, 1);

    expect(list.delete(9)).toBe('');
    expect(list.getSize()).toBe(1);
  });

  it('clears every value', () => {
    const list = new LinkedListDS();

    list.insert(0, 1);
    list.insert(1, 2);
    list.clear();

    expect(list.getSize()).toBe(0);
    expect(valuesOf(list)).toEqual([]);
  });
});
