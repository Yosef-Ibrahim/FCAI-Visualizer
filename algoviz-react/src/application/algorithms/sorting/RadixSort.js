import { SortingAlgorithm } from './SortingAlgorithm';
import { genRadixSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class RadixSort extends SortingAlgorithm {
  constructor() {
    super('radix');
  }

  getDefaultInput() {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 900) + 100);
  }

  generateSteps(input) {
    return genRadixSteps([...input]).map(s => new Step(s));
  }
}
