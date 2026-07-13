import { TreeAlgorithm } from './TreeAlgorithm';

export class BSTree extends TreeAlgorithm {
  constructor() {
    super('bst');
  }

  generateSteps(input) {
    const values = [...input];
    return values.map((val, i) => ({
      arr: values.slice(0, i + 1),
      current: [i],
      msg: `Insert ${val} into BST`,
      codeLine: 1,
      codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
    }));
  }
}
