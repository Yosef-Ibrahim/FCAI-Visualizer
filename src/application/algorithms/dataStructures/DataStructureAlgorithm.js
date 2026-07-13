import { Algorithm } from '../../../domain/algorithms/Algorithm';
import { complexity as allComplexity, algoNames } from '../../../data/algorithmData';

export class DataStructureAlgorithm extends Algorithm {
  constructor(id) {
    super();
    this._id = id;
    this._complexity = allComplexity[id];
    this._name = algoNames[id];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get category() { return 'data-structures'; }
  get complexity() { return this._complexity; }
  get codeSnippets() { return {}; }
  get explanation() { return null; }

  getDefaultInput() {
    return [
      { op: 'insert', value: 42, index: 0 },
      { op: 'insert', value: 15, index: 0 },
      { op: 'insert', value: 73, index: 2 },
    ];
  }
}
