import { SortingAlgorithm } from './SortingAlgorithm';
import { genHeapSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class HeapSort extends SortingAlgorithm {
  constructor() {
    super('heap');
  }

  generateSteps(input) {
    return genHeapSteps([...input]).map(s => new Step(s));
  }
}
