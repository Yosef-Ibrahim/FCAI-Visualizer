import { TreeAlgorithm } from './TreeAlgorithm';

export class HeapTree extends TreeAlgorithm {
  constructor() {
    super('heap-tree');
  }

  generateSteps(input) {
    const values = [...input];
    return values.map((val, i) => ({
      arr: values.slice(0, i + 1),
      current: [i],
      msg: `Building heap: inserted ${val}`,
      codeLine: 1,
      codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
    }));
  }
}
