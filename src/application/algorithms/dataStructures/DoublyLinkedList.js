import { DataStructureAlgorithm } from './DataStructureAlgorithm';

export class DoublyLinkedList extends DataStructureAlgorithm {
  constructor() {
    super('doubly-ll');
  }

  generateSteps(input) {
    const values = [];
    const steps = [];

    steps.push({
      ds: 'linked-list', data: { values: [], type: 'doubly', highlighted: -1, head: null },
      msg: 'Initialize empty doubly linked list', codeLine: 0, codeLines: {},
    });

    for (const op of input) {
      if (op.op === 'insert') {
        const idx = op.index ?? (op.at === 'head' ? 0 : values.length);
        values.splice(idx, 0, op.value);
        steps.push({
          ds: 'linked-list', data: { values: [...values], type: 'doubly', highlighted: idx, head: values[0] ?? null, operation: 'insert' },
          msg: `Insert ${op.value} at position ${idx}`, codeLine: 1, codeLines: {},
        });
      } else if (op.op === 'delete') {
        const idx = op.index ?? 0;
        if (idx < values.length) {
          const removed = values.splice(idx, 1)[0];
          steps.push({
            ds: 'linked-list', data: { values: [...values], type: 'doubly', highlighted: -1, head: values[0] ?? null, operation: 'delete' },
            msg: `Delete ${removed} at position ${idx}`, codeLine: 2, codeLines: {},
          });
        }
      }
    }

    return steps;
  }
}
