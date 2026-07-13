import { DataStructureAlgorithm } from './DataStructureAlgorithm';

export class StackDS extends DataStructureAlgorithm {
  constructor() {
    super('stack-ds');
  }

  generateSteps(input) {
    const values = [];
    const steps = [];

    steps.push({
      ds: 'stack', data: { values: [], highlighted: -1 },
      msg: 'Initialize empty stack (LIFO)', codeLine: 0, codeLines: {},
    });

    for (const op of input) {
      if (op.op === 'push' || op.op === 'insert') {
        values.push(op.value);
        steps.push({
          ds: 'stack', data: { values: [...values], highlighted: values.length - 1, operation: 'push' },
          msg: `Push ${op.value} onto stack`, codeLine: 1, codeLines: {},
        });
      } else if (op.op === 'pop' || op.op === 'delete') {
        if (values.length === 0) continue;
        const val = values.pop();
        steps.push({
          ds: 'stack', data: { values: [...values], highlighted: -1, operation: 'pop' },
          msg: `Pop ${val} from stack`, codeLine: 2, codeLines: {},
        });
      } else if (op.op === 'peek') {
        steps.push({
          ds: 'stack', data: { values: [...values], highlighted: values.length - 1, operation: 'peek' },
          msg: `Peek top: ${values[values.length - 1]}`, codeLine: 3, codeLines: {},
        });
      }
    }

    return steps;
  }
}
