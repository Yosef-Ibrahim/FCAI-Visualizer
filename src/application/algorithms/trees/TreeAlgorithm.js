import { Algorithm } from '../../../domain/algorithms/Algorithm';
import { complexity as allComplexity, explanations, algoNames, codeSnippets } from '../../../data/algorithmData';

export class TreeAlgorithm extends Algorithm {
  constructor(id) {
    super();
    this._id = id;
    this._complexity = allComplexity[id];
    this._explanation = explanations[id];
    this._name = algoNames[id];
    this._snippets = codeSnippets[id];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get category() { return 'trees'; }
  get complexity() { return this._complexity; }
  get codeSnippets() { return this._snippets; }
  get explanation() { return this._explanation; }

  getDefaultInput() {
    return [30, 20, 40, 10, 25, 35, 50];
  }
}
