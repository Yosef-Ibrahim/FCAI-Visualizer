import { SortingAlgorithm } from './SortingAlgorithm';
import { genSelectionSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class SelectionSort extends SortingAlgorithm {
  constructor() {
    super('selection');
  }

  generateSteps(input) {
    return genSelectionSteps([...input]).map(s => new Step(s));
  }
}
