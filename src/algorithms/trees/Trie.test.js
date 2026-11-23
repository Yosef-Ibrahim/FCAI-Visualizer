import { describe, expect, it } from 'vitest';
import { Trie } from './Trie.js';

describe('Trie', () => {
  it('shares common prefixes and marks words separately from prefixes', () => {
    const trie = new Trie();
    trie.insert('car');
    trie.insert('cart');
    trie.insert('cat');

    expect(trie.search('car')).toBe(true);
    expect(trie.search('cart')).toBe(true);
    expect(trie.search('cat')).toBe(true);
    expect(trie.search('ca')).toBe(false);
    expect(trie.startsWith('ca')).toBe(true);
    expect(trie.startsWith('dog')).toBe(false);
    expect(trie.getSnapshot().words).toEqual(['car', 'cart', 'cat']);
    expect(trie.getSnapshot().alphabet).toEqual(['a', 'c', 'r', 't']);
    expect(trie.getSnapshot().alphabetSize).toBe(4);

    const characters = trie.getSnapshot().nodes.map((node) => node.character);
    expect(characters.filter((character) => character === 'c')).toHaveLength(1);
    expect(characters.filter((character) => character === 'a')).toHaveLength(1);
  });

  it('reports whether each insertion reuses or creates nodes and ends a word', () => {
    const trie = new Trie();
    const first = trie.insert('to');
    const second = trie.insert('tea');

    expect(first.steps.map((step) => step.kind)).toEqual(['start', 'create', 'create', 'markEnd']);
    expect(second.steps.map((step) => step.kind)).toEqual(['start', 'follow', 'create', 'create', 'markEnd']);
    expect(second.steps[1].focusPath).toHaveLength(2);
    expect(second.steps[1].activeEdgeId).toBe('root:node-1');
  });

  it('does not duplicate a stored word or its terminal marker', () => {
    const trie = new Trie();
    trie.insert('hello');
    const before = trie.getSnapshot();
    const result = trie.insert('hello');

    expect(result.inserted).toBe(false);
    expect(result.steps.at(-1).kind).toBe('duplicate');
    expect(trie.getSnapshot()).toEqual(before);
  });

  it('keeps earlier step snapshots immutable as later characters are added', () => {
    const trie = new Trie();
    const result = trie.insert('abc');

    expect(result.steps[1].snapshot.nodes).toHaveLength(2);
    expect(result.steps[2].snapshot.nodes).toHaveLength(3);
    expect(result.steps.at(-1).snapshot.nodes).toHaveLength(4);
    expect(result.steps.at(-1).snapshot.nodes.at(-1).terminal).toBe(true);
  });

  it('treats text as case-sensitive Unicode code points', () => {
    const trie = new Trie();
    trie.insert('Cat');
    trie.insert('cat');
    trie.insert('猫');

    expect(trie.search('Cat')).toBe(true);
    expect(trie.search('cat')).toBe(true);
    expect(trie.search('猫')).toBe(true);
    expect(trie.search('CAT')).toBe(false);
    expect(trie.getSnapshot().alphabetSize).toBe(5);
  });

  it('updates alphabet size only when a new character is added', () => {
    const trie = new Trie();
    const first = trie.insert('aba');
    const second = trie.insert('abb');
    const third = trie.insert('abc');

    expect(first.steps.at(-1).snapshot.alphabetSize).toBe(2);
    expect(second.steps.at(-1).snapshot.alphabetSize).toBe(2);
    expect(third.steps.at(-1).snapshot.alphabetSize).toBe(3);
    expect(third.steps.at(-1).snapshot.alphabet).toEqual(['a', 'b', 'c']);
  });

  it('traces successful searches and distinguishes a prefix from a complete word', () => {
    const trie = new Trie();
    trie.insert('cart');

    const found = trie.searchWithSteps('cart');
    const prefix = trie.searchWithSteps('car');
    const missing = trie.searchWithSteps('cab');

    expect(found.found).toBe(true);
    expect(found.steps.map((step) => step.kind)).toEqual([
      'searchStart',
      'searchFollow',
      'searchFollow',
      'searchFollow',
      'searchFollow',
      'found',
    ]);
    expect(prefix.found).toBe(false);
    expect(prefix.steps.at(-1).kind).toBe('notFound');
    expect(missing.found).toBe(false);
    expect(missing.steps.at(-1).kind).toBe('notFound');
    expect(trie.search('cart')).toBe(true);
  });

  it('deletes only the terminal marker when the word is a prefix of another word', () => {
    const trie = new Trie();
    trie.insert('car');
    trie.insert('cart');
    const result = trie.delete('car');

    expect(result.deleted).toBe(true);
    expect(result.steps.map((step) => step.kind)).toEqual([
      'deleteStart',
      'searchFollow',
      'searchFollow',
      'searchFollow',
      'unmark',
      'deleted',
    ]);
    expect(trie.search('car')).toBe(false);
    expect(trie.search('cart')).toBe(true);
    expect(trie.startsWith('car')).toBe(true);
    expect(trie.getSnapshot().words).toEqual(['cart']);
  });

  it('prunes unused suffix nodes after deletion but keeps shared prefixes', () => {
    const trie = new Trie();
    trie.insert('car');
    trie.insert('cat');
    const result = trie.delete('car');

    expect(result.deleted).toBe(true);
    expect(result.steps.filter((step) => step.kind === 'prune').map((step) => step.character))
      .toEqual(['r']);
    expect(trie.search('car')).toBe(false);
    expect(trie.search('cat')).toBe(true);
    expect(trie.startsWith('ca')).toBe(true);
    expect(trie.getSnapshot().alphabet).toEqual(['a', 'c', 't']);
  });

  it('deletes all nodes for the final word and reports absent words without mutation', () => {
    const trie = new Trie();
    trie.insert('solo');
    expect(trie.delete('missing').deleted).toBe(false);
    expect(trie.search('solo')).toBe(true);

    const result = trie.delete('solo');
    expect(result.deleted).toBe(true);
    expect(result.steps.filter((step) => step.kind === 'prune')).toHaveLength(4);
    expect(trie.getSnapshot()).toMatchObject({
      nodes: [{ id: 'root', character: '', terminal: false }],
      edges: [],
      words: [],
      alphabet: [],
      alphabetSize: 0,
    });
  });

  it('rejects empty words and strings containing whitespace', () => {
    const trie = new Trie();

    for (const word of ['', 'two words', ' leading', 'trailing ']) {
      expect(() => trie.insert(word)).toThrow(/non-empty strings without whitespace/i);
      expect(() => trie.search(word)).toThrow(/non-empty strings without whitespace/i);
    }
    expect(() => trie.insert(null)).toThrow(/non-empty strings without whitespace/i);
    expect(trie.startsWith('')).toBe(true);
  });
});
