import { Algorithm } from '../../../domain/algorithms/Algorithm';
import {
  dpGreedyComplexity,
  dpGreedyExplanations,
  dpGreedyAlgoNames,
  dpGreedyCodeSnippets,
} from '../../../data/algorithmDesignData';

export class DPAlgorithm extends Algorithm {
  constructor(id) {
    super();
    this._id = id;
    this._complexity = dpGreedyComplexity[id];
    this._explanation = dpGreedyExplanations[id];
    this._name = dpGreedyAlgoNames[id];
    this._snippets = dpGreedyCodeSnippets[id];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get category() { return 'dp'; }
  get complexity() { return this._complexity; }
  get codeSnippets() { return this._snippets; }
  get explanation() { return this._explanation; }
}
