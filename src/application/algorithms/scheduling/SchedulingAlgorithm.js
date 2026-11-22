import { Algorithm } from '../../../domain/algorithms/Algorithm';
import {
  schedulingComplexity,
  schedulingExplanations,
  schedulingAlgoNames,
  schedulingCodeSnippets,
} from '../../../data/schedulingData';
import { SCHEDULING_PRESETS, cloneInput } from './schedulingUtils';

export class SchedulingAlgorithm extends Algorithm {
  constructor(id) {
    super();
    this._id = id;
    this._complexity = schedulingComplexity[id];
    this._explanation = schedulingExplanations[id];
    this._name = schedulingAlgoNames[id];
    this._snippets = schedulingCodeSnippets[id];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get category() { return 'scheduling'; }
  get complexity() { return this._complexity; }
  get codeSnippets() { return this._snippets; }
  get explanation() { return this._explanation; }

  getDefaultInput() {
    const presets = SCHEDULING_PRESETS[this._id];
    if (presets && presets.length > 0) {
      return cloneInput(presets[0].input);
    }
    return {
      processes: [
        { pid: 'P1', arrival: 0, burst: 6, priority: 1, queue: 0 },
        { pid: 'P2', arrival: 1, burst: 4, priority: 2, queue: 0 },
      ],
    };
  }
}
