import { SearchingAlgorithm } from './SearchingAlgorithm';

export class JumpSearch extends SearchingAlgorithm {
  constructor() {
    super('jump-search');
  }

  generateSteps(input) {
    const { arr, target } = input;
    const a = [...arr];
    const steps = [];
    const n = a.length;
    const step = Math.floor(Math.sqrt(n));
    let prev = 0;

    steps.push({
      arr: [...a], current: [prev],
      msg: `Jump search: step = √${n} = ${step}, starting at index 0`,
      codeLine: 1,
      codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
    });

    while (prev < n && a[Math.min(prev, n - 1)] < target) {
      steps.push({
        arr: [...a], compare: [Math.min(prev, n - 1)],
        msg: `Jumping to index ${prev}: value ${a[Math.min(prev, n - 1)]} < ${target}`,
        codeLine: 2,
        codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      });
      prev += step;
    }

    const start = Math.max(0, prev - step);
    const end = Math.min(prev, n);
    for (let i = start; i < end; i++) {
      steps.push({
        arr: [...a], compare: [i],
        msg: `Linear scanning [${start}..${end}]: index ${i}, value = ${a[i]}`,
        codeLine: 3,
        codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
      });
      if (a[i] === target) {
        steps.push({
          arr: [...a], found: [i],
          msg: `✅ Found ${target} at index ${i}!`,
          codeLine: 4,
          codeLines: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
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
