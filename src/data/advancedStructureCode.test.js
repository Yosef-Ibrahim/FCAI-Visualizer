import { describe, expect, it } from 'vitest';
import { ADVANCED_STRUCTURE_CODE } from './advancedStructureCode.js';
import { getTreeImplementation, TREE_IMPLEMENTATION_LANGUAGES } from './treeImplementations.js';
import { getTreeCode, TREE_CODE_LANGUAGES } from '../algorithms/trees/treeCode.js';

const LANGUAGES = ['js', 'python', 'cpp', 'csharp', 'java'];
const TARGETS = ['btree', 'trie', 'suffixTrie', 'suffixTree', 'suffixArray'];
const TREE_TARGETS = ['bst', 'avl', 'rbt'];

describe('advanced structure code bundles', () => {
  it('covers all eight requested structures with full implementations in five languages', () => {
    for (const structure of TREE_TARGETS) {
      for (const language of TREE_IMPLEMENTATION_LANGUAGES) {
        expect(getTreeImplementation(structure, language).trim().length).toBeGreaterThan(0);
      }
    }
    for (const structure of TARGETS) {
      for (const language of LANGUAGES) {
        expect(ADVANCED_STRUCTURE_CODE[structure].implementations[language].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('covers the React visualizers in all five languages', () => {
    expect(Object.keys(ADVANCED_STRUCTURE_CODE).sort()).toEqual([...TARGETS].sort());
    for (const structure of TARGETS) {
      const bundle = ADVANCED_STRUCTURE_CODE[structure];
      for (const language of LANGUAGES) {
        expect(bundle.implementations[language].trim().length).toBeGreaterThan(0);
      }
      expect(Object.keys(bundle.helpers)).toContain(bundle.defaultHelper);
    }
  });

  it('provides mapped five-language helpers for the three shared tree visualizers', () => {
    expect([...TREE_CODE_LANGUAGES].sort()).toEqual([...LANGUAGES].sort());
    for (const structure of TREE_TARGETS) {
      for (const helper of Object.values(getTreeCode(structure))) {
        for (const language of LANGUAGES) {
          expect(helper[language].length).toBeGreaterThan(0);
          for (const mappedLine of Object.values(helper.semantic)) {
            expect(mappedLine[language]).toBeGreaterThanOrEqual(0);
            expect(mappedLine[language]).toBeLessThan(helper[language].length);
          }
        }
      }
    }
  });

  it('maps every supported animation step to a line in each language helper', () => {
    for (const structure of TARGETS) {
      const bundle = ADVANCED_STRUCTURE_CODE[structure];
      for (const helper of Object.values(bundle.helpers)) {
        for (const language of LANGUAGES) {
          expect(helper.codeByLang[language].length).toBeGreaterThan(0);
          const lines = helper.codeByLang[language];
          for (const line of Object.values(helper.lineByStep[language])) {
            expect(line).toBeGreaterThanOrEqual(0);
            expect(line).toBeLessThan(lines.length);
          }
        }
      }
    }
  });

  it('deletes B-Tree keys by predecessor replacement and sibling repair', () => {
    const source = ADVANCED_STRUCTURE_CODE.btree.implementations.js;
    expect(source).toContain('predecessor(node.children[i])');
    expect(source).toContain('fixChild(node, i)');
    expect(source).not.toContain('remaining.forEach');

    const values = [10, 20, 5, 6, 12, 30, 7, 17, 3, 2, 1, 25, 40, 50, 45];
    const BTree = new Function(`${source}; return BTree;`)();
    for (let order = 3; order <= 10; order++) {
      const tree = new BTree(order);
      const remaining = [...values];
      values.forEach(value => tree.insert(value));
      for (const value of [10, 6, 1, 20, 45, 2, 5, 12, 7, 3, 17, 25, 30, 40, 50]) {
        expect(tree.delete(value)).toBe(true);
        remaining.splice(remaining.indexOf(value), 1);
        expect(tree.traverse()).toEqual([...remaining].sort((a, b) => a - b));
        const leafDepths = new Set();
        const checkNode = (node, depth, isRoot = false) => {
          expect(node.keys.length).toBeLessThanOrEqual(order - 1);
          if (!isRoot) expect(node.keys.length).toBeGreaterThanOrEqual(Math.floor((order - 1) / 2));
          expect(node.keys).toEqual([...node.keys].sort((a, b) => a - b));
          if (!node.children.length) { leafDepths.add(depth); return; }
          expect(node.children).toHaveLength(node.keys.length + 1);
          node.children.forEach(child => checkNode(child, depth + 1));
        };
        checkNode(tree.root, 0, true);
        expect(leafDepths.size).toBe(1);
      }
      expect(tree.traverse()).toEqual([]);
    }
  });
});
