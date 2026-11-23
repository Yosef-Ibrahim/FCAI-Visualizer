import { SortingAlgorithm } from './SortingAlgorithm';
import { genCountingSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class CountingSort extends SortingAlgorithm {
  constructor() {
    super('counting');
  }

  getDefaultInput(size = 20) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 15) + 1);
  }

  generateSteps(input) {
    return genCountingSteps([...input]).map(s => new Step(s));
  }
}
