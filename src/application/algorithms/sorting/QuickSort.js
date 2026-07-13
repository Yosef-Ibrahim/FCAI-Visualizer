import { SortingAlgorithm } from './SortingAlgorithm';
import { genQuickSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class QuickSort extends SortingAlgorithm {
  constructor() {
    super('quick');
  }

  generateSteps(input) {
    return genQuickSteps([...input]).map(s => new Step(s));
  }
}
