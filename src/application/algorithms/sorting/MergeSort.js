import { SortingAlgorithm } from './SortingAlgorithm';
import { genMergeSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class MergeSort extends SortingAlgorithm {
  constructor() {
    super('merge');
  }

  generateSteps(input) {
    return genMergeSteps([...input]).map(s => new Step(s));
  }
}
