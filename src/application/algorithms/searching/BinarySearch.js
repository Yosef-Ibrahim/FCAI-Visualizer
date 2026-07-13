import { SearchingAlgorithm } from './SearchingAlgorithm';

export class BinarySearch extends SearchingAlgorithm {
  constructor() {
    super('binary-search');
  }

  generateSteps(input) {
    const { arr, target } = input;
    const a = [...arr];
    const steps = [];
    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      steps.push({
        arr: [...a], compare: [mid], current: [lo, hi],
        msg: `Searching [${lo}..${hi}], mid = ${mid}, value = ${a[mid]}`,
        codeLine: 2,
        codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      });
      if (a[mid] === target) {
        steps.push({
          arr: [...a], found: [mid],
          msg: `✅ Found ${target} at index ${mid}!`,
          codeLine: 3,
          codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
        });
        return steps;
      }
      if (a[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    steps.push({
      arr: [...a],
      msg: `❌ ${target} not found in array`,
      codeLine: -1,
    });
    return steps;
  }
}
