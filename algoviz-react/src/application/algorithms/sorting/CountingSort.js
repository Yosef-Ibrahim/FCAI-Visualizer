import { SortingAlgorithm } from './SortingAlgorithm';
import { genCountingSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class CountingSort extends SortingAlgorithm {
  constructor() {
    super('counting');
  }

  getDefaultInput() {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 15) + 1);
  }

  generateSteps(input) {
    return genCountingSteps([...input]).map(s => new Step(s));
  }
}
