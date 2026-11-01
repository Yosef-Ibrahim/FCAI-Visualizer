import { describe, it, expect } from 'vitest';
import { ArrayDS } from './ArrayDS.js';

/** The values currently in the array, in index order. */
const valuesOf = (array) =>
  array.nodes.filter((node) => !node.isDeleted).map((node) => node.val);

describe('ArrayDS', () => {
  it('starts empty', () => {
    const array = new ArrayDS();

    expect(array.getSize()).toBe(0);
    expect(valuesOf(array)).toEqual([]);
  });

  it('inserts a value at an index', () => {
    const array = new ArrayDS();

    array.insert(0, 42);
    array.insert(1, 7);

    expect(array.getSize()).toBe(2);
    expect(valuesOf(array)).toEqual([42, 7]);
  });

  it('rejects indexes beyond the current length instead of silently appending', () => {
    const array = new ArrayDS();
    array.insert(0, 10);
    array.insert(1, 20);
    array.insert(2, 30);

    expect(array.insert(7, 99)).toBe(false);
    expect(array.insert(-1, 99)).toBe(false);
    expect(array.insert(1.5, 99)).toBe(false);
    expect(valuesOf(array)).toEqual([10, 20, 30]);
  });

  it('allows insertion exactly at the current length', () => {
    const array = new ArrayDS();
    array.insert(0, 10);
    array.insert(1, 20);

    expect(array.insert(2, 30)).toBe(true);
    expect(valuesOf(array)).toEqual([10, 20, 30]);
  });

  it('does not insert an empty value', () => {
    const array = new ArrayDS();

    expect(array.insert(0, '')).toBe(false);
    expect(array.insert(0, null)).toBe(false);
    expect(array.getSize()).toBe(0);
  });

  it('inserts in the middle', () => {
    const array = new ArrayDS();

    array.insert(0, 1);
    array.insert(1, 3);
    array.insert(1, 2);

    expect(valuesOf(array)).toEqual([1, 2, 3]);
  });

  it('overwrites a value at an index', () => {
    const array = new ArrayDS();

    array.insert(0, 1);
    array.setVal(0, 99);

    expect(valuesOf(array)).toEqual([99]);
    expect(array.getSize()).toBe(1);
  });

  it('ignores a write to an index that does not exist', () => {
    const array = new ArrayDS();

    array.insert(0, 1);
    array.setVal(5, 99);

    expect(valuesOf(array)).toEqual([1]);
  });

  it('deletes a value and reports it', () => {
    const array = new ArrayDS();

    array.insert(0, 1);
    array.insert(1, 2);

    expect(array.delete(0)).toBe(1);
    expect(array.getSize()).toBe(1);
    expect(valuesOf(array)).toEqual([2]);
  });

  it('reports nothing when deleting an index that does not exist', () => {
    const array = new ArrayDS();

    array.insert(0, 1);

    expect(array.delete(9)).toBe('');
    expect(array.getSize()).toBe(1);
  });

  it('clears every value', () => {
    const array = new ArrayDS();

    array.insert(0, 1);
    array.insert(1, 2);
    array.clear();

    expect(array.getSize()).toBe(0);
    expect(valuesOf(array)).toEqual([]);
  });
});
