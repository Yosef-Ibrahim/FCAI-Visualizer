import { SearchingAlgorithm } from './SearchingAlgorithm';

export class LinearSearch extends SearchingAlgorithm {
  constructor() {
    super('linear-search');
  }

  generateSteps(input) {
    const { arr, target } = input;
    const a = [...arr];
    const steps = [];
    const n = a.length;
    for (let i = 0; i < n; i++) {
      steps.push({
        arr: [...a], compare: [i], current: [i],
        msg: `Checking index ${i}: value = ${a[i]} ${a[i] === target ? '→ FOUND!' : '≠ ' + target}`,
        codeLine: 1,
        codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      });
      if (a[i] === target) {
        steps.push({
          arr: [...a], found: [i],
          msg: `✅ Found ${target} at index ${i}!`,
          codeLine: 2,
          codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
        });
        return steps;
      }
    }
    steps.push({
      arr: [...a],
      msg: `❌ ${target} not found in array`,
      codeLine: -1,
    });
    return steps;
  }
}
