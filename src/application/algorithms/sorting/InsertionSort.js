import { SortingAlgorithm } from './SortingAlgorithm';
import { genInsertionSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class InsertionSort extends SortingAlgorithm {
  constructor() {
    super('insertion');
  }

  generateSteps(input) {
    return genInsertionSteps([...input]).map(s => new Step(s));
  }
}
