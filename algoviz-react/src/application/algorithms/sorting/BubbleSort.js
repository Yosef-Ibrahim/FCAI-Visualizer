import { SortingAlgorithm } from './SortingAlgorithm';
import { genBubbleSteps } from '../../../algorithms/sorting/sortingGenerators';
import { Step } from '../../../domain/algorithms/Step';

export class BubbleSort extends SortingAlgorithm {
  constructor() {
    super('bubble');
  }

  generateSteps(input) {
    return genBubbleSteps([...input]).map(s => new Step(s));
  }
}
