import { DataStructureAlgorithm } from './DataStructureAlgorithm';

export class OrderedLinkedList extends DataStructureAlgorithm {
  constructor() {
    super('ordered-ll');
  }

  generateSteps(input) {
    const values = [];
    const steps = [];

    steps.push({
      ds: 'linked-list', data: { values: [], type: 'ordered', highlighted: -1, head: null },
      msg: 'Initialize empty ordered linked list (sorted)', codeLine: 0, codeLines: {},
    });

    for (const op of input) {
      if (op.op === 'insert') {
        let insertIdx = values.length;
        const numVal = Number(op.value);
        for (let i = 0; i < values.length; i++) {
          if (Number(values[i]) > numVal) { insertIdx = i; break; }
        }
        values.splice(insertIdx, 0, op.value);
        steps.push({
          ds: 'linked-list', data: { values: [...values], type: 'ordered', highlighted: insertIdx, head: values[0] ?? null, operation: 'insert' },
          msg: `Insert ${op.value} at sorted position ${insertIdx}`, codeLine: 1, codeLines: {},
        });
      } else if (op.op === 'delete') {
        const idx = op.index ?? values.length - 1;
        if (idx < values.length) {
          const removed = values.splice(idx, 1)[0];
          steps.push({
            ds: 'linked-list', data: { values: [...values], type: 'ordered', highlighted: -1, head: values[0] ?? null, operation: 'delete' },
            msg: `Delete ${removed} at position ${idx}`, codeLine: 2, codeLines: {},
          });
        }
      }
    }

    return steps;
  }
}
