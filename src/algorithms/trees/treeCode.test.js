import { describe, it, expect } from 'vitest';
import {
  getTreeCode,
  getTreeCodeLine,
  getTreeStep,
  TREE_CODE_LANGUAGES,
} from './treeCode.js';
import { getTreeImplementation, getTreeImplementationLine } from '../../data/treeImplementations.js';

describe('tree code walkthroughs', () => {
  it('provides standalone full implementations in all five languages', () => {
    for (const type of ['bst', 'avl', 'rbt']) {
      for (const language of TREE_CODE_LANGUAGES) {
        const source = getTreeImplementation(type, language);
        expect(source).toContain(type === 'bst' ? 'class BST' : type === 'avl' ? 'class AVLTree' : 'class RedBlackTree');
        expect(source.toLowerCase()).toContain('insert');
        expect(source.toLowerCase()).toContain('search');
        expect(source.toLowerCase()).toContain(language === 'cpp' ? 'erase' : 'delete');
      }
      for (const helper of Object.keys(getTreeCode(type))) {
        for (const language of TREE_CODE_LANGUAGES) {
          expect(getTreeImplementationLine(type, helper, language)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('executes BST, AVL, and red-black full-source operations correctly in JavaScript', () => {
    const data = [
      ['bst', 'BST'],
      ['avl', 'AVLTree'],
      ['rbt', 'RedBlackTree'],
    ];
    const values = [18, 7, 25, 3, 12, 21, 31, 9, 15, 27, 35, 1, 5, 11, 14];
    for (const [type, className] of data) {
      const Tree = new Function(`${getTreeImplementation(type, 'js')}; return ${className};`)();
      const tree = new Tree();
      values.forEach(value => tree.insert(value));
      expect(tree.inorder()).toEqual([...values].sort((a, b) => a - b));
      for (const value of [18, 3, 31, 7, 25, 1, 35, 12]) {
        expect(tree.delete(value)).toBe(true);
        expect(tree.search(value)).toBeFalsy();
      }
      expect(tree.inorder()).toEqual(values.filter(value => ![18, 3, 31, 7, 25, 1, 35, 12].includes(value)).sort((a, b) => a - b));
      expect(tree.delete(1000)).toBe(false);
    }

    const AVL = new Function(`${getTreeImplementation('avl', 'js')}; return AVLTree;`)();
    const avl = new AVL();
    values.forEach(value => avl.insert(value));
    const checkAVL = node => {
      if (!node) return -1;
      const left = checkAVL(node.left), right = checkAVL(node.right);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
      expect(node.height).toBe(1 + Math.max(left, right));
      return node.height;
    };
    checkAVL(avl.root);

    const RBT = new Function(`${getTreeImplementation('rbt', 'js')}; return RedBlackTree;`)();
    const rbt = new RBT();
    values.forEach(value => rbt.insert(value));
    const checkRedBlack = node => {
      if (!node) return 1;
      if (node.red) {
        expect(node.left?.red ?? false).toBe(false);
        expect(node.right?.red ?? false).toBe(false);
      }
      const left = checkRedBlack(node.left), right = checkRedBlack(node.right);
      expect(left).toBe(right);
      return left + Number(!node.red);
    };
    expect(rbt.root.red).toBe(false);
    checkRedBlack(rbt.root);
    for (const value of [18, 3, 31, 7, 25, 1, 35, 12]) {
      rbt.delete(value);
      expect(rbt.search(value)).toBeFalsy();
      expect(rbt.root === null || rbt.root.red === false).toBe(true);
      checkRedBlack(rbt.root);
    }
  });

  it('provides mapped implementations in all five languages for every helper', () => {
    for (const type of ['bst', 'avl', 'rbt']) {
      const helpers = getTreeCode(type);
      for (const code of Object.values(helpers)) {
        for (const language of TREE_CODE_LANGUAGES) {
          expect(code[language].length).toBeGreaterThan(0);
          for (const line of Object.values(code.semantic)) {
            expect(line[language]).toBeGreaterThanOrEqual(0);
            expect(line[language]).toBeLessThan(code[language].length);
          }
        }
      }
    }
  });

  it('maps tree events to the active helper and semantic line', () => {
    const cases = [
      [{ operation: 'Set 7 as root' }, 'bst', 'insert', 'insert', 'root'],
      [{ operation: 'Attach 9' }, 'bst', 'insert', 'insert', 'attach'],
      [{ operation: 'Find successor of 7' }, 'bst', 'delete', 'delete', 'successor'],
      [{ operation: 'Right rotation completes rebalancing' }, 'avl', 'insert', 'rotateRight', 'rotate'],
      [{ operation: 'Check balance at 3' }, 'avl', 'delete', 'delete', 'balance'],
      [{ operation: 'Insert 7 as red' }, 'rbt', 'insert', 'insert', 'red'],
      [{ operation: 'Color root black' }, 'rbt', 'insert', 'insert', 'blackRoot'],
      [{ operation: 'Recolor parent and uncle' }, 'rbt', 'insert', 'fixAfterInsert', 'balance'],
      [{ operation: 'Deletion fix: red sibling' }, 'rbt', 'delete', 'fixAfterDelete', 'balance'],
      [{ operation: 'Resolve extra blackness' }, 'rbt', 'delete', 'fixAfterDelete', 'done'],
    ];

    for (const [event, type, action, helper, semantic] of cases) {
      const trace = getTreeStep(event, type, action);
      expect(trace).toEqual({ helper, semantic });
      expect(getTreeCodeLine(getTreeCode(type)[helper], semantic, 'js')).toBeGreaterThanOrEqual(0);
    }

    expect(getTreeCode('avl').delete.cpp.join('\n')).toContain('updateHeight(node)');
    expect(getTreeCode('bst').insert.java.join('\n')).toContain('double key');
  });
});
