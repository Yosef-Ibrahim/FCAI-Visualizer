// ── Practice bank: arrays, stacks, queues, linked lists ─────────────────────
// Exam-style questions derived from computed traces (shift counts, addresses,
// postfix evaluation, circular-queue arithmetic) plus reviewed concept items.

import { conceptBatch, list, makeRng, mcq, pick, randInt, uniqueBy } from '../core.js';

const TOPIC_IDS = ['arrays', 'stacks', 'queues', 'linked-lists'];

function sequenceArrays(rand, count, length) {
  const arrays = [];
  const seen = new Set();
  let guard = 0;
  while (arrays.length < count && guard < count * 40) {
    guard += 1;
    const values = Array.from({ length }, () => randInt(rand, 0, 9));
    const key = values.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    arrays.push(values);
  }
  return arrays;
}

// ── Arrays ──────────────────────────────────────────────────────────────────
const ARRAY_CONCEPTS = [
  { lvl: 'easy', q: 'What is the index of the last element of an array with n elements?', a: 'n − 1', d: ['n', 'n + 1', '0'], e: 'A zero-indexed array of length n stores valid indexes 0 through n − 1.' },
  { lvl: 'easy', q: 'How much time does reading arr[k] take in a contiguous array?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(k)'], e: 'The address is computed directly as base + k × element size, so access is constant time.' },
  { lvl: 'easy', q: 'How are the elements of a one-dimensional array stored in memory?', a: 'In contiguous memory locations', d: ['In separate heap blocks linked by pointers', 'In a balanced tree', 'In hash buckets'], e: 'Contiguous storage is what gives arrays O(1) indexed access and good cache locality.' },
  { lvl: 'medium', q: 'Inserting at the beginning of an array with n elements costs which time in the worst case?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'Every existing element must shift one position to the right.' },
  { lvl: 'medium', q: 'Deleting the last element of an array with n elements costs which time?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'No element has to move when the removed element is at the end.' },
  { lvl: 'medium', q: 'For an array of n elements, inserting a new element at index i (0 ≤ i ≤ n) shifts how many elements?', a: 'n − i', d: ['n − i − 1', 'n − i + 1', 'i'], e: 'Indexes i through n − 1 all move one place right, which is n − i elements.' },
  { lvl: 'medium', q: 'Deleting the element at index i from an array of n elements shifts how many elements?', a: 'n − i − 1', d: ['n − i', 'n − i + 1', 'i + 1'], e: 'Only the elements after i move left, and there are n − 1 − i of them.' },
  { lvl: 'easy', q: 'What is arr[arr.length] for a zero-indexed array?', a: 'An out-of-bounds access', d: ['The last element', 'Always 0', 'The array length'], e: 'Valid indexes stop at length − 1, so length is one past the end.' },
  { lvl: 'medium', q: 'In row-major order, where is element (r, c) of a rows × cols array stored?', a: 'At offset (r × cols + c) × elementSize', d: ['At offset (c × rows + r) × elementSize', 'At offset (r + c) × elementSize', 'At offset r × c × elementSize'], e: 'Row-major order stores whole rows one after another, so each completed row contributes cols elements.' },
  { lvl: 'easy', q: 'Which operation is the main weakness of a fixed-size array?', a: 'Growing beyond its capacity', d: ['Reading an element by index', 'Overwriting an element', 'Iterating from left to right'], e: 'A fixed-size array cannot grow; a dynamic array must allocate a larger block and copy.' },
  { lvl: 'medium', q: 'Searching for a value in an unsorted array of n elements takes which time in the worst case?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(√n)'], e: 'Without order there is no way to discard elements, so every element may need checking.' },
  { lvl: 'medium', q: 'Which statement about array cache behaviour is correct?', a: 'Arrays usually have better locality than linked lists', d: ['Linked lists always fit in one cache line', 'Arrays cannot be cached', 'Both have identical locality'], e: 'Contiguous elements share cache lines, while linked-list nodes may be scattered.' },
  { lvl: 'medium', q: 'A dynamic array doubles its capacity when full. Appending n elements costs which amortized time per append?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'Doubling spreads the cost of copying over many appends, giving O(1) amortized insertion.' },
  { lvl: 'hard', q: 'What is the total cost of n appends to an empty dynamic array that doubles when full?', a: 'O(n)', d: ['O(n log n)', 'O(n²)', 'O(1)'], e: 'Copies cost 1 + 2 + 4 + … < 2n, so the whole sequence is linear.' },
  { lvl: 'easy', q: 'Which index is valid for an array of length 7?', a: '6', d: ['7', '8', '−1'], e: 'A length-7 array has valid indexes 0 through 6.' },
  { lvl: 'medium', q: 'What is the result of setting index 1 to 9 in [4, 5, 6]?', a: '[4, 9, 6]', d: ['[9, 5, 6]', '[4, 5, 9]', '[4, 9]'], e: 'Only the element at index 1 is replaced; the rest keep their positions.' },
  { lvl: 'medium', q: 'Finding the maximum value in an unsorted array of n elements costs which time?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'Every element must be inspected at least once.' },
  { lvl: 'easy', q: 'Which algorithm requires its input array to be sorted?', a: 'Binary search', d: ['Linear search', 'Counting occurrences with a loop', 'Finding the maximum'], e: 'Binary search discards half the range per step, which is only valid on sorted data.' },
  { lvl: 'medium', q: 'Why can a static array overflow?', a: 'Its capacity is fixed at creation', d: ['It stores only numbers', 'It cannot be indexed', 'Its elements are pointers'], e: 'Without spare capacity there is nowhere to put an additional element.' },
  { lvl: 'medium', q: 'Traversing every element of an array of n elements costs which time?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n²)'], e: 'One visit per element gives a linear pass.' },
  { lvl: 'hard', q: 'An array holds n elements and each element is 8 bytes. How much memory does the data itself occupy?', a: '8n bytes', d: ['n bytes', '8 + n bytes', 'n² bytes'], e: 'Contiguous elements of equal size take element size × count bytes.' },
  { lvl: 'medium', q: 'Which task is array rotation by one position to the right?', a: 'Shift every element right and move the last element to index 0', d: ['Swap the first and last elements only', 'Reverse the array', 'Delete the last element'], e: 'Rotation keeps every value but changes positions cyclically.' },
  { lvl: 'medium', q: 'Compared with a linked list, an array uses how much per-element pointer overhead?', a: 'None', d: ['One pointer per element', 'Two pointers per element', 'One pointer per 8 elements'], e: 'Array elements are stored back to back with no next/previous links.' },
  { lvl: 'hard', q: 'What is the cost of inserting into a sorted array while keeping it sorted?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'Finding the position is O(log n), but shifting the tail is O(n).' },
  { lvl: 'easy', q: 'Which array access pattern is impossible without scanning?', a: 'Fetching the k-th element of a linked list', d: ['Fetching arr[k]', 'Overwriting arr[k]', 'Reading the first element'], e: 'Random access by index exists only for contiguous indexed storage.' },
];

function buildArrays(rand) {
  const qs = [];
  let n = 0;
  const add = (spec) => qs.push(mcq({ ...spec, id: `arrays-g${++n}`, topic: 'arrays' }, rand));

  // Address arithmetic: address = base + index × element size.
  for (let i = 0; i < 26; i += 1) {
    const base = 1000 + i * 400;
    const size = pick(rand, [2, 4, 8]);
    const length = randInt(rand, 6, 24);
    const index = randInt(rand, 0, length - 1);
    const address = base + index * size;
    add({
      difficulty: 'medium',
      question: `An array starts at address ${base} and each element occupies ${size} bytes. What is the address of arr[${index}]?`,
      correct: `${address}`,
      distractors: [base + (index + 1) * size, base + index * size + 1, base + index * size + size],
      explanation: `Address = base + index × element size = ${base} + ${index} × ${size} = ${address}.`,
    });
  }

  // Row-major 2D offset.
  for (let i = 0; i < 20; i += 1) {
    const rows = randInt(rand, 3, 6);
    const cols = randInt(rand, 4, 8);
    const size = pick(rand, [2, 4]);
    const base = 1000 + i * 300;
    const row = randInt(rand, 0, rows - 1);
    const col = randInt(rand, 0, cols - 1);
    const offset = (row * cols + col) * size;
    add({
      difficulty: 'hard',
      question: `A ${rows}×${cols} array is stored in row-major order at base address ${base}, with ${size}-byte elements. What is the address of element (${row}, ${col})?`,
      correct: `${base + offset}`,
      distractors: [base + (col * rows + row) * size, base + (row + col) * size, base + (row * cols + col)],
      explanation: `Row-major offset = (row × cols + col) × size = (${row} × ${cols} + ${col}) × ${size} = ${offset}; address = ${base} + ${offset} = ${base + offset}.`,
    });
  }

  // Insert / delete shift counts.
  for (let length = 5; length <= 19; length += 2) {
    for (const index of [0, 1, Math.floor(length / 2), length - 1, length]) {
      add({
        difficulty: 'medium',
        question: `An array has ${length} elements. Inserting a new element at index ${index} shifts how many existing elements?`,
        correct: `${length - index}`,
        distractors: [Math.max(0, length - index - 1), Math.max(0, length - index + 1), index],
        explanation: `Elements at indexes ${index} through ${length - 1} move right: ${length} − ${index} = ${length - index} elements.`,
      });
      if (index < length) {
        add({
          difficulty: 'medium',
          question: `An array has ${length} elements. Deleting the element at index ${index} shifts how many elements?`,
          correct: `${length - index - 1}`,
          distractors: [length - index, Math.max(0, length - index + 1), index + 1],
          explanation: `Only elements after index ${index} move left: ${length} − ${index} − 1 = ${length - index - 1}.`,
        });
      }
    }
  }

  // Operation results.
  const arrays = sequenceArrays(rand, 26, 5);
  arrays.forEach((values, i) => {
    const index = randInt(rand, 0, values.length - 1);
    const next = values.map((value, position) => (position === index ? randInt(rand, 10, 19) : value));
    add({
      difficulty: 'easy',
      question: `What is ${list(values)} after setting index ${index} to ${next[index]}?`,
      correct: list(next),
      distractors: [
        list(values.map((value, position) => (position === 0 ? next[index] : value))),
        list(values.map((value, position) => (position === index ? value + 1 : value))),
        list(next.filter((_, position) => position !== index)),
      ],
      explanation: `Only index ${index} changes, so the array becomes ${list(next)}.`,
    });
    if (i < 9) {
      add({
        difficulty: 'medium',
        question: `Array ${list(values)} is traversed with a linear search for the value ${values[index]}. How many comparisons are needed if the first match is returned?`,
        correct: `${index + 1}`,
        distractors: [index, values.length, values.length - index],
        explanation: `The value sits at index ${index}, so the scan checks ${index + 1} elements.`,
      });
    }
  });

  // Invalid index identification.
  for (let length = 4; length <= 27; length += 1) {
    add({
      difficulty: 'easy',
      question: `Which index is out of bounds for an array of length ${length}?`,
      correct: `${length}`,
      distractors: [0, length - 1, Math.max(0, length - 2)],
      explanation: `Valid indexes are 0 to ${length - 1}; index ${length} is one past the end.`,
    });
  }

  return [...qs, ...conceptBatch({ topic: 'arrays', prefix: 'arrays', concepts: ARRAY_CONCEPTS, rand })];
}

// ── Stacks ──────────────────────────────────────────────────────────────────
const STACK_CONCEPTS = [
  { lvl: 'easy', q: 'A stack follows which access order?', a: 'Last in, first out (LIFO)', d: ['First in, first out (FIFO)', 'Random access', 'Sorted order'], e: 'Push adds to the top and pop removes from the top, so the newest item leaves first.' },
  { lvl: 'easy', q: 'Which operation reads the top of a stack without removing it?', a: 'peek / top', d: ['pop', 'push', 'enqueue'], e: 'Peek returns the top element and leaves the stack unchanged.' },
  { lvl: 'easy', q: 'What is the cost of push on a stack?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'Inserting at the top touches one position only.' },
  { lvl: 'easy', q: 'What is the cost of pop on a stack?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'Removing the top element does not require shifting any other element.' },
  { lvl: 'medium', q: 'What is the worst-case cost of searching for a value in a stack?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'A stack has no ordering, so a search may inspect every element.' },
  { lvl: 'easy', q: 'Popping an empty stack causes which condition?', a: 'Underflow', d: ['Overflow', 'Collision', 'Underflow of the heap'], e: 'Removing from an empty stack is stack underflow; adding to a full one is overflow.' },
  { lvl: 'easy', q: 'Pushing onto a full fixed-size stack causes which condition?', a: 'Overflow', d: ['Underflow', 'Rehashing', 'Fragmentation'], e: 'A full stack has no space for another element.' },
  { lvl: 'medium', q: 'An array-based stack uses top = −1 to represent what?', a: 'An empty stack', d: ['A full stack', 'A stack with one element', 'A corrupted stack'], e: 'Top starts before index 0 and increments with each push.' },
  { lvl: 'medium', q: 'A stack backed by an array of capacity n has its maximum top index equal to what?', a: 'n − 1', d: ['n', 'n + 1', '0'], e: 'Valid indexes stop at n − 1; pushing there fills the stack.' },
  { lvl: 'easy', q: 'Which feature is a classic stack application?', a: 'Undo history in an editor', d: ['Printer job queue', 'Round-robin scheduling', 'Breadth-first search'], e: 'Undo reverses the most recent action first, which is LIFO.' },
  { lvl: 'medium', q: 'Which traversal uses a stack explicitly or through recursion?', a: 'Depth-first search', d: ['Breadth-first search', 'Level-order traversal', 'Round-robin scheduling'], e: 'DFS goes as deep as possible and backtracks, which is stack behaviour.' },
  { lvl: 'easy', q: 'What does the call stack store for an active function call?', a: 'Its return address and local state', d: ['Only its return value', 'The whole heap', 'A copy of the file system'], e: 'Each frame holds the return address, parameters and locals.' },
  { lvl: 'medium', q: 'Which algorithm evaluates a postfix expression conveniently?', a: 'A stack of operands', d: ['A queue of operands', 'A hash table', 'A binary heap'], e: 'Operands are pushed and each operator pops two values and pushes the result.' },
  { lvl: 'medium', q: 'In a postfix expression, where does an operator take its operands from?', a: 'The two most recently pushed values', d: ['The two earliest pushed values', 'The largest two values', 'A random pair'], e: 'Postfix evaluation is LIFO: the right operand is the most recent push.' },
  { lvl: 'medium', q: 'Which problem is solved by matching each closing bracket with the most recent opening bracket?', a: 'Balanced parentheses', d: ['Sorting brackets', 'Finding the shortest path', 'Hashing brackets'], e: 'A stack naturally matches the nearest unmatched opener.' },
  { lvl: 'medium', q: 'How can a queue be implemented with two stacks?', a: 'Push into an in-stack and pop from an out-stack, refilling when empty', d: ['Push and pop from the same stack', 'Alternate stacks on every operation', 'Use both stacks only for peeking'], e: 'Reversing the in-stack into the out-stack restores FIFO order; each element moves O(1) amortized.' },
  { lvl: 'hard', q: 'What is the amortized cost of dequeue in a queue built from two stacks?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'Each element is moved between stacks at most once, so the total work is linear.' },
  { lvl: 'medium', q: 'A min-stack supports push, pop, top and getMin in O(1). What does it store besides the values?', a: 'The minimum so far for every level', d: ['A sorted copy of the stack', 'A hash of each value', 'Nothing extra'], e: 'A parallel stack of running minima keeps getMin constant time.' },
  { lvl: 'medium', q: 'Which data structure does a browser back button most closely resemble?', a: 'A stack', d: ['A queue', 'A priority queue', 'A hash table'], e: 'Back navigation returns to the most recently visited page first.' },
  { lvl: 'medium', q: 'Reversing a string with a stack works because of which property?', a: 'LIFO order', d: ['FIFO order', 'Sorted order', 'Hashing'], e: 'Characters popped in reverse push order come out reversed.' },
  { lvl: 'medium', q: 'Which operation is NOT a standard stack operation?', a: 'enqueue', d: ['push', 'pop', 'peek'], e: 'Enqueue belongs to a queue; stacks push and pop.' },
  { lvl: 'hard', q: 'What is the cost of converting an infix expression to postfix with a stack?', a: 'O(n)', d: ['O(n log n)', 'O(n²)', 'O(1)'], e: 'Each token is read once and pushed or popped at most once.' },
  { lvl: 'medium', q: 'A linked-list stack pushes at which end to keep push O(1)?', a: 'The head', d: ['The tail without a tail pointer', 'A random node', 'The middle'], e: 'Inserting at the head needs no traversal.' },
  { lvl: 'medium', q: 'Which statement about stack and recursion is correct?', a: 'Recursion uses the call stack to remember pending calls', d: ['Recursion uses a queue of calls', 'Recursion needs no memory', 'Recursion is always O(1) space'], e: 'Each pending call keeps a frame until it returns, so recursion depth consumes stack space.' },
  { lvl: 'medium', q: 'Two stacks sharing one array grow toward each other. When are they full?', a: 'When their top indexes meet', d: ['When either stack is empty', 'When both tops are at index 0', 'When the array is half empty'], e: 'Meeting tops mean no free slot remains between them.' },
];

const INFIX_POSTFIX = [
  ['A + B * C', 'A B C * +'],
  ['(A + B) * C', 'A B + C *'],
  ['A * (B + C)', 'A B C + *'],
  ['A + B + C', 'A B + C +'],
  ['A - B + C', 'A B - C +'],
  ['A / B * C', 'A B / C *'],
  ['A * B - C', 'A B * C -'],
  ['(A - B) / C', 'A B - C /'],
  ['A + (B - C) * D', 'A B C - D * +'],
  ['(A + B) / (C - D)', 'A B + C D - /'],
  ['A * B + C / D', 'A B * C D / +'],
  ['A - (B + C)', 'A B C + -'],
  ['(A * B) + (C * D)', 'A B * C D * +'],
  ['A + B * C - D', 'A B C * + D -'],
  ['A / (B * C)', 'A B C * /'],
  ['(A + B + C) * D', 'A B + C + D *'],
  ['A * (B + C * D)', 'A B C D * + *'],
  ['A - B - C', 'A B - C -'],
  ['A / B / C', 'A B / C /'],
  ['(A / B) * (C + D)', 'A B / C D + *'],
  ['A + (B * (C - D))', 'A B C D - * +'],
  ['(A - B) * (C - D)', 'A B - C D - *'],
  ['A * B * C + D', 'A B * C * D +'],
  ['A + B / (C - D)', 'A B C D - / +'],
  ['(A + B) * (C - D) / E', 'A B + C D - * E /'],
];

const POSTFIX_EXPRESSIONS = [
  ['5 3 +', 8], ['9 2 -', 7], ['4 6 *', 24], ['8 2 /', 4],
  ['5 3 + 2 *', 16], ['9 4 - 3 *', 15], ['2 3 4 * +', 14], ['6 2 3 * -', 0],
  ['7 2 5 * +', 17], ['8 3 2 * -', 2], ['5 1 2 + 4 * + 3 -', 14],
  ['6 2 3 + *', 30], ['9 3 / 2 +', 5], ['4 5 + 2 *', 18], ['3 4 + 5 *', 35],
  ['7 3 - 2 *', 8], ['8 2 2 * +', 12], ['6 4 * 3 -', 21], ['5 5 * 5 /', 5],
  ['2 3 + 4 5 + *', 45], ['9 8 - 7 +', 8], ['1 2 3 * +', 7], ['6 3 / 2 *', 4],
  ['3 3 * 3 3 * +', 18], ['8 4 / 4 4 * -', -14],
  ['2 2 2 * *', 8], ['7 7 + 7 -', 7], ['9 1 - 2 /', 4], ['5 6 + 2 -', 9],
  ['4 4 4 + +', 12], ['6 6 * 6 /', 6], ['3 5 - 4 *', -8], ['10 2 / 3 +', 8],
  ['8 8 * 8 -', 56], ['2 4 6 + *', 20], ['9 2 3 * +', 15], ['1 1 1 + + 5 *', 15],
];

const STACK_EASY_CONCEPTS = [
  { lvl: 'easy', q: 'At which end of a stack does push add an element?', a: 'The top', d: ['The bottom', 'Both ends', 'The middle'], e: 'Push and pop both work at the top, which is why the newest element is the first out.' },
  { lvl: 'easy', q: 'Which element does pop remove from a stack?', a: 'The most recently pushed element', d: ['The oldest element', 'The smallest element', 'A random element'], e: 'A stack is LIFO, so pop removes the top element.' },
  { lvl: 'easy', q: 'What does LIFO stand for?', a: 'Last In, First Out', d: ['First In, First Out', 'Last In, Final Out', 'Left In, Front Out'], e: 'The last element pushed is the first one removed.' },
  { lvl: 'easy', q: 'Which structure stores the frames of active recursive calls?', a: 'The call stack', d: ['A heap', 'A hash table', 'A queue'], e: 'Each pending call keeps a frame on the call stack until it returns.' },
  { lvl: 'easy', q: 'What is the result of evaluating the postfix expression "2 3 +"?', a: '5', d: ['23', '6', '1'], e: 'Push 2, push 3, then + pops both and pushes 2 + 3 = 5.' },
  { lvl: 'easy', q: 'Which stack operation reads the top element without removing it?', a: 'peek', d: ['pop', 'push', 'enqueue'], e: 'Peek (or top) returns the value and leaves the stack unchanged.' },
  { lvl: 'easy', q: 'A stack with top index −1 represents which state?', a: 'An empty stack', d: ['A full stack', 'A stack with one element', 'A stack that overflowed'], e: 'Top starts before index 0, so −1 means nothing has been pushed yet.' },
  { lvl: 'easy', q: 'Which application is a natural fit for a stack?', a: 'Undo in a text editor', d: ['Serving print jobs in order', 'Storing a phone book', 'Scheduling processes round-robin'], e: 'Undo reverses the most recent action first, which is LIFO.' },
];

function buildStacks(rand) {
  const qs = [];
  let n = 0;
  const add = (spec) => qs.push(mcq({ ...spec, id: `stacks-g${++n}`, topic: 'stacks' }, rand));

  // Push/pop traces.
  for (let i = 0; i < 60; i += 1) {
    const stack = [];
    const operations = [];
    const log = [];
    let value = randInt(rand, 1, 9);
    const steps = randInt(rand, 3, 6);
    for (let step = 0; step < steps; step += 1) {
      if (stack.length === 0 || rand() < 0.62) {
        const pushed = value;
        value += 1;
        stack.push(pushed);
        operations.push(`push(${pushed})`);
        log.push(`push ${pushed}`);
      } else {
        const popped = stack.pop();
        operations.push('pop()');
        log.push(`pop → ${popped}`);
      }
    }
    if (stack.length === 0) {
      stack.push(99);
      operations.push('push(99)');
      log.push('push 99');
    }
    const top = stack[stack.length - 1];
    add({
      difficulty: 'medium',
      question: `Starting from an empty stack, apply: ${operations.join(', ')}. What is the top element afterwards?`,
      correct: `${top}`,
      distractors: [stack[0], stack[Math.max(0, stack.length - 2)], top + 1],
      explanation: `Tracing the operations (${log.join('; ')}) leaves ${list(stack)}, so the top is ${top}.`,
    });
    if (i < 40) {
      add({
        difficulty: 'hard',
        question: `Starting from an empty stack, apply: ${operations.join(', ')}. Which stack contents result, top written last?`,
        correct: list(stack),
        distractors: [
          list([...stack].reverse()),
          list(stack.slice(1)),
          list([top, ...stack.slice(0, -1)]),
        ],
        explanation: `The trace is ${log.join('; ')}, giving ${list(stack)} from bottom to top.`,
      });
    }
  }

  // Postfix evaluation.
  POSTFIX_EXPRESSIONS.forEach(([expression, value]) => {
    add({
      difficulty: 'medium',
      question: `Evaluate the postfix expression "${expression}". What is the result?`,
      correct: `${value}`,
      distractors: [value + 1, value - 2, -value],
      explanation: `Operands are pushed and each operator applies to the two most recent values, giving ${value}.`,
    });
  });

  // Balanced parentheses, generated with a known outcome.
  const GOOD = ['(a + b)', '[(a) + {b}]', '((a))', '{}', 'a(b[c]{d})', '[{()}]', '((a + b) * c)', '(())[]{}', 'f(g(h(i)))', '({a + [b * c]})'];
  const BAD = ['(a + b', 'a) + (b', '[(])', '{{a}} }', ')a(', '([)]', '((a)', 'a{b[c}', '[a + b]]', '({)}'];
  for (let i = 0; i < 20; i += 1) {
    const good = i % 2 === 0;
    const text = good ? GOOD[i % GOOD.length] : BAD[i % BAD.length];
    add({
      difficulty: 'medium',
      question: `Does a stack-based bracket checker accept the string "${text}"?`,
      correct: good ? 'Yes, the brackets are balanced' : 'No, the brackets are not balanced',
      distractors: [
        good ? 'No, one closing bracket is missing' : 'Yes, every bracket pair matches',
        'It cannot be decided without sorting the string',
        'Only if the string contains no letters',
      ],
      explanation: good
        ? 'Every closing bracket matches the most recent unmatched opener, and no opener is left over.'
        : 'At some point a closing bracket does not match the most recent opener, or openers remain at the end.',
    });
  }

  INFIX_POSTFIX.forEach(([infix, postfix]) => {
    add({
      difficulty: 'hard',
      question: `What is the postfix form of "${infix}"?`,
      correct: postfix,
      distractors: [
        infix.split(' ').filter((token) => token !== '(' && token !== ')').reverse().join(' '),
        postfix.split(' ').slice().reverse().join(' '),
        infix.replace(/[()]/g, '').trim(),
      ],
      explanation: `Using operator precedence and left-to-right associativity, "${infix}" becomes "${postfix}".`,
    });
  });

  return [...qs, ...conceptBatch({ topic: 'stacks', prefix: 'stacks', concepts: [...STACK_CONCEPTS, ...STACK_EASY_CONCEPTS], rand })];
}

// ── Queues ──────────────────────────────────────────────────────────────────
const QUEUE_CONCEPTS = [
  { lvl: 'easy', q: 'A queue follows which access order?', a: 'First in, first out (FIFO)', d: ['Last in, first out (LIFO)', 'Sorted order', 'Random order'], e: 'Enqueue adds at the rear and dequeue removes from the front.' },
  { lvl: 'easy', q: 'Where does enqueue add a new element?', a: 'At the rear', d: ['At the front', 'In sorted position', 'At the middle'], e: 'A queue appends at the rear and serves from the front.' },
  { lvl: 'easy', q: 'Where does dequeue remove an element?', a: 'At the front', d: ['At the rear', 'At the middle', 'At the most recently added position'], e: 'The element that has waited longest is served first.' },
  { lvl: 'easy', q: 'What is the cost of enqueue in a linked-list queue with a tail pointer?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'The tail pointer gives direct access to the insertion point.' },
  { lvl: 'medium', q: 'Why does a circular queue avoid shifting elements?', a: 'The rear index wraps around to reuse freed slots', d: ['It stores elements in a tree', 'It deletes from the rear', 'It doubles its size on every call'], e: 'Wrapping indexes reuse the space freed at the front, so no element moves.' },
  { lvl: 'medium', q: 'In a circular queue of capacity n, what is the next rear index after inserting at rear?', a: '(rear + 1) mod n', d: ['rear + 1', 'rear − 1', 'n − rear'], e: 'Modulo n wraps the pointer back to 0 at the end of the array.' },
  { lvl: 'medium', q: 'In a circular queue with front f, size s and capacity n, where is the next insertion?', a: '(f + s) mod n', d: ['(f + s + 1) mod n', '(f − s) mod n', 's mod n'], e: 'The rear is f + s − 1, so the next free slot is f + s, wrapped.' },
  { lvl: 'medium', q: 'A circular queue of capacity n is full when which condition holds?', a: 'Size equals n', d: ['Front equals rear', 'Rear equals 0', 'Front equals n − 1'], e: 'Tracking size distinguishes full from empty, which otherwise look identical without a spare slot.' },
  { lvl: 'medium', q: 'A circular queue is empty when which condition holds?', a: 'Size equals 0', d: ['Size equals n', 'Front equals 1', 'Rear equals front − 1'], e: 'An empty queue holds no elements regardless of index positions.' },
  { lvl: 'easy', q: 'Which application is a queue?', a: 'A printer spooler', d: ['Undo history', 'A function call stack', 'A binary search tree'], e: 'Print jobs are served in arrival order.' },
  { lvl: 'easy', q: 'Which traversal uses a queue?', a: 'Breadth-first search', d: ['Depth-first search', 'In-order traversal', 'Post-order traversal'], e: 'BFS explores vertices level by level, which requires FIFO order.' },
  { lvl: 'medium', q: 'What is the worst-case search cost in a queue?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'A queue is not ordered, so a search may scan every element.' },
  { lvl: 'medium', q: 'Which property distinguishes a priority queue from a plain queue?', a: 'Dequeue returns the highest-priority element, not the oldest', d: ['It stores only integers', 'It has no front', 'It cannot be implemented with a heap'], e: 'Priority decides service order instead of arrival time.' },
  { lvl: 'medium', q: 'Which structure is the standard efficient implementation of a priority queue?', a: 'A binary heap', d: ['A stack', 'A circular array', 'A linked list with a tail pointer'], e: 'A heap supports insert and extract-min/max in O(log n).' },
  { lvl: 'hard', q: 'What is the cost of extracting the minimum from a binary min-heap of n elements?', a: 'O(log n)', d: ['O(1)', 'O(n)', 'O(n log n)'], e: 'The root is removed and the heap is restored with a sift-down along one path.' },
  { lvl: 'medium', q: 'A double-ended queue (deque) supports which operations?', a: 'Insert and remove at both ends', d: ['Insert only at the rear', 'Remove only from the front', 'Access only in sorted order'], e: 'A deque generalizes stack and queue behaviour.' },
  { lvl: 'medium', q: 'Which is NOT a queue application?', a: 'Matching brackets in an expression', d: ['CPU round-robin scheduling', 'Keyboard buffer', 'BFS frontier'], e: 'Bracket matching needs the most recent opener, which is stack behaviour.' },
  { lvl: 'medium', q: 'What does a queue with a linked list need to keep enqueue and dequeue O(1)?', a: 'Both head and tail pointers', d: ['Only a head pointer', 'Only a tail pointer', 'A sorted list'], e: 'Head serves the front and tail appends at the rear.' },
  { lvl: 'medium', q: 'In an array-based queue that does not wrap, what is the drawback?', a: 'The front slot cannot be reused without shifting', d: ['Enqueue becomes O(log n)', 'The queue cannot be empty', 'Elements become sorted'], e: 'Discarding the front leaves wasted space unless indexes wrap or elements shift.' },
  { lvl: 'medium', q: 'A queue built from two stacks reverses order once. Which cost does that add?', a: 'Amortized O(1) per operation', d: ['O(n) per operation forever', 'O(log n) per operation', 'O(n²) per operation'], e: 'Each element moves between the stacks at most once over its lifetime.' },
  { lvl: 'hard', q: 'BFS computes shortest paths in which kind of graph?', a: 'Unweighted graphs', d: ['Only weighted graphs', 'Only trees with cycles', 'Only complete graphs'], e: 'BFS counts edges, so it finds the path with the fewest edges when every edge costs the same.' },
  { lvl: 'medium', q: 'What is the space cost of a queue holding n elements?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n²)'], e: 'Each stored element needs its own slot or node.' },
  { lvl: 'medium', q: 'A priority queue is full when its underlying heap array reaches which size?', a: 'Its capacity', d: ['Half its capacity', 'Capacity − 1', 'Zero'], e: 'A full heap array cannot accept another element without resizing.' },
  { lvl: 'medium', q: 'Which order results from inserting 3, 1, 2 into a min-priority queue and then removing all?', a: '1, 2, 3', d: ['3, 1, 2', '2, 1, 3', '3, 2, 1'], e: 'A min-priority queue returns the smallest value first.' },
  { lvl: 'medium', q: 'Which queue variant serves the same element repeatedly in round-robin scheduling?', a: 'A circular queue', d: ['A stack', 'A min-heap', 'A sorted array'], e: 'Re-enqueuing at the rear of a circular queue rotates service among processes.' },
];

const QUEUE_EASY_CONCEPTS = [
  { lvl: 'easy', q: 'What does FIFO stand for?', a: 'First In, First Out', d: ['First In, Final Out', 'Fast In, Fast Out', 'Last In, First Out'], e: 'The element that has waited longest is served first.' },
  { lvl: 'easy', q: 'At which end of a queue does enqueue add an element?', a: 'The rear', d: ['The front', 'The middle', 'Either end'], e: 'Enqueue appends at the rear; dequeue serves from the front.' },
  { lvl: 'easy', q: 'Which element does dequeue remove from a queue?', a: 'The one that arrived first', d: ['The one that arrived last', 'The largest one', 'Any element'], e: 'A queue serves elements in arrival order.' },
  { lvl: 'easy', q: 'Which application is a queue?', a: 'A printer spooler', d: ['Undo history', 'The call stack', 'Matching brackets'], e: 'Print jobs are served in the order they were submitted.' },
  { lvl: 'easy', q: 'Which data structure holds the frontier of a breadth-first search?', a: 'A queue', d: ['A stack', 'A binary search tree', 'A hash table'], e: 'BFS explores level by level, which needs FIFO order.' },
  { lvl: 'easy', q: 'A circular queue has capacity 5 and its front is at index 3. What is the front index after one dequeue?', a: '4', d: ['3', '2', '0'], e: 'Dequeue advances front by one: (3 + 1) mod 5 = 4.' },
  { lvl: 'easy', q: 'Starting from an empty queue, enqueue(1) then enqueue(2) then dequeue(). Which value is at the front now?', a: '2', d: ['1', '3', 'The queue is empty'], e: 'Dequeue removes 1, leaving 2 at the front.' },
  { lvl: 'easy', q: 'Which structure naturally supports round-robin CPU scheduling?', a: 'A queue', d: ['A stack', 'A max-heap', 'A sorted array'], e: 'Processes are served in order and re-enqueued at the rear, which rotates service.' },
];

function buildQueues(rand) {
  const qs = [];
  let n = 0;
  const add = (spec) => qs.push(mcq({ ...spec, id: `queues-g${++n}`, topic: 'queues' }, rand));

  for (let i = 0; i < 60; i += 1) {
    const queue = [];
    const operations = [];
    const log = [];
    let value = randInt(rand, 1, 9);
    const steps = randInt(rand, 3, 6);
    for (let step = 0; step < steps; step += 1) {
      if (queue.length === 0 || rand() < 0.6) {
        const added = value;
        value += 1;
        queue.push(added);
        operations.push(`enqueue(${added})`);
        log.push(`enqueue ${added}`);
      } else {
        const removed = queue.shift();
        operations.push('dequeue()');
        log.push(`dequeue → ${removed}`);
      }
    }
    if (queue.length === 0) {
      queue.push(42);
      operations.push('enqueue(42)');
      log.push('enqueue 42');
    }
    add({
      difficulty: 'medium',
      question: `Starting from an empty queue, apply: ${operations.join(', ')}. Which element is at the front afterwards?`,
      correct: `${queue[0]}`,
      distractors: [queue[queue.length - 1], queue[1] ?? queue[0] + 1, queue.length],
      explanation: `The trace (${log.join('; ')}) leaves ${list(queue)} front to rear, so the front is ${queue[0]}.`,
    });
    if (i < 40) {
      add({
        difficulty: 'hard',
        question: `Starting from an empty queue, apply: ${operations.join(', ')}. What are the queue contents, front written first?`,
        correct: list(queue),
        distractors: [list([...queue].reverse()), list(queue.slice(1)), list([queue[queue.length - 1], ...queue.slice(0, -1)])],
        explanation: `The trace is ${log.join('; ')}, leaving ${list(queue)} from front to rear.`,
      });
    }
  }

  // Circular queue arithmetic.
  for (let i = 0; i < 32; i += 1) {
    const capacity = randInt(rand, 5, 12);
    const front = randInt(rand, 0, capacity - 1);
    const size = randInt(rand, 0, capacity - 1);
    const next = (front + size) % capacity;
    add({
      difficulty: 'medium',
      question: `A circular queue has capacity ${capacity}, front index ${front} and ${size} elements. At which index is the next enqueue stored?`,
      correct: `${next}`,
      distractors: [(front + size + 1) % capacity, (front + size) % (capacity + 1), (front + capacity - 1) % capacity],
      explanation: `Rear = front + size − 1, so the next slot is (${front} + ${size}) mod ${capacity} = ${next}.`,
    });
    if (i < 10) {
      const afterDequeue = (front + 1) % capacity;
      add({
        difficulty: 'medium',
        question: `A circular queue has capacity ${capacity} and front index ${front}. After one dequeue, what is the new front index?`,
        correct: `${afterDequeue}`,
        distractors: [front + 1, (front + capacity - 1) % capacity, 0],
        explanation: `Dequeue advances front with wraparound: (${front} + 1) mod ${capacity} = ${afterDequeue}.`,
      });
    }
  }

  // Priority queue ordering.
  for (let i = 0; i < 34; i += 1) {
    const values = Array.from({ length: 5 }, () => randInt(rand, 1, 30));
    const sorted = [...values].sort((a, b) => a - b);
    add({
      difficulty: 'medium',
      question: `Values ${list(values)} are inserted into an empty min-priority queue. In which order are they removed?`,
      correct: list(sorted),
      distractors: [list(values), list([...values].sort((a, b) => b - a)), list([...values].reverse())],
      explanation: 'A min-priority queue always removes the smallest remaining value.',
    });
  }

  return [...qs, ...conceptBatch({ topic: 'queues', prefix: 'queues', concepts: [...QUEUE_CONCEPTS, ...QUEUE_EASY_CONCEPTS], rand })];
}

// ── Linked lists ────────────────────────────────────────────────────────────
const LINKED_LIST_CONCEPTS = [
  { lvl: 'easy', q: 'What does a singly linked list node store?', a: 'A value and a pointer to the next node', d: ['A value and two indexes', 'Only a value', 'A value and a pointer to the previous node only'], e: 'Each node holds its data plus the link that reaches the next node.' },
  { lvl: 'easy', q: 'How is the first node of a linked list reached?', a: 'Through the head pointer', d: ['Through arr[0]', 'Through the tail pointer', 'By scanning the list backwards'], e: 'The head stores the address of the first node.' },
  { lvl: 'medium', q: 'What is the cost of accessing the k-th node of a singly linked list?', a: 'O(k)', d: ['O(1)', 'O(log k)', 'O(n log k)'], e: 'The list must be walked from the head, so reaching k takes k steps.' },
  { lvl: 'easy', q: 'What is the cost of inserting at the head of a singly linked list?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'A new node points to the old head and the head pointer is updated.' },
  { lvl: 'medium', q: 'What is the cost of inserting at the tail of a singly linked list that has no tail pointer?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'The last node must be found by traversal before linking the new node.' },
  { lvl: 'medium', q: 'What is the cost of deleting a known node in a doubly linked list?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'The previous and next pointers let the neighbours be relinked directly.' },
  { lvl: 'medium', q: 'What is the cost of deleting a known node in a singly linked list without its predecessor?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'The predecessor must be found by scanning from the head.' },
  { lvl: 'medium', q: 'What is the worst-case search cost in a linked list?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'Without random access, every node may be visited.' },
  { lvl: 'easy', q: 'Which operation is faster in a linked list than in an array?', a: 'Inserting at the head', d: ['Reading the k-th element', 'Binary search', 'Accessing the last element by index'], e: 'A head insertion only rewires pointers, while an array shifts every element.' },
  { lvl: 'medium', q: 'What extra memory does each linked-list node need compared with an array slot?', a: 'At least one pointer', d: ['Nothing', 'A full copy of the list', 'A hash value'], e: 'Links are overhead that arrays avoid.' },
  { lvl: 'medium', q: 'In a circular linked list, what does the last node point to?', a: 'The head', d: ['NULL', 'Itself', 'A random node'], e: 'The cycle lets traversal continue from the end back to the start.' },
  { lvl: 'medium', q: 'What does a doubly linked list node store that a singly linked node does not?', a: 'A pointer to the previous node', d: ['A second value', 'An index', 'A hash'], e: 'The previous pointer enables backward traversal and O(1) deletion of a known node.' },
  { lvl: 'medium', q: 'How many pointer updates does inserting a node after a known node in a doubly linked list need?', a: 'Four', d: ['One', 'Two', 'Six'], e: 'The new node links both ways and both neighbours are updated.' },
  { lvl: 'medium', q: 'Reversing a singly linked list in place costs which time and space?', a: 'O(n) time and O(1) space', d: ['O(n log n) time and O(n) space', 'O(n) time and O(n) space', 'O(1) time and O(n) space'], e: 'Each link is reversed once with three pointers.' },
  { lvl: 'hard', q: 'Floyd’s cycle detection uses which two pointers?', a: 'A slow pointer moving one step and a fast pointer moving two', d: ['Two pointers moving one step each', 'A pointer from each end', 'A pointer and a hash set'], e: 'If a cycle exists the fast pointer eventually meets the slow one.' },
  { lvl: 'hard', q: 'What is the space complexity of Floyd’s cycle detection?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'Only two pointers are stored, no visited set.' },
  { lvl: 'medium', q: 'Merging two sorted linked lists of lengths m and n costs which time?', a: 'O(m + n)', d: ['O(m × n)', 'O(log(m + n))', 'O(max(m, n)²)'], e: 'Each step consumes one node from one of the lists.' },
  { lvl: 'medium', q: 'Which list variant is best for a browser history that supports forward and backward navigation?', a: 'A doubly linked list', d: ['A singly linked list', 'A circular singly linked list', 'A stack'], e: 'Backward and forward moves need links in both directions.' },
  { lvl: 'medium', q: 'Which statement about linked-list cache locality is correct?', a: 'Nodes may be scattered, so locality is usually worse than an array', d: ['Nodes are always contiguous', 'Linked lists cannot be cached', 'Locality is identical to arrays'], e: 'Following pointers can jump across memory, causing cache misses.' },
  { lvl: 'medium', q: 'When can a singly linked list be traversed safely while deleting the current node?', a: 'By keeping the previous node pointer', d: ['By using the head pointer only', 'By sorting first', 'By storing the list in an array'], e: 'The previous node must be relinked to the successor before the current node is freed.' },
  { lvl: 'medium', q: 'What is the cost of finding the middle node with two pointers?', a: 'O(n) time and O(1) space', d: ['O(n) time and O(n) space', 'O(log n) time and O(1) space', 'O(1) time'], e: 'The fast pointer reaches the end while the slow pointer is at the middle.' },
  { lvl: 'medium', q: 'A sentinel (dummy) head node simplifies which operations?', a: 'Insertion and deletion at the head', d: ['Only searching', 'Only sorting', 'Only printing'], e: 'A dummy node removes the special case where the head itself changes.' },
  { lvl: 'easy', q: 'What does NULL (or null) at the end of a singly linked list indicate?', a: 'There is no next node', d: ['The list is circular', 'The node is empty', 'The list is sorted'], e: 'The null link marks the end of the chain.' },
  { lvl: 'medium', q: 'Which operation on a linked list is O(1) when a tail pointer exists?', a: 'Appending at the end', d: ['Finding the k-th node', 'Reversing the list', 'Searching a value'], e: 'The tail pointer gives the insertion point directly.' },
  { lvl: 'hard', q: 'How can two linked lists be checked for intersection in O(m + n) time and O(1) space?', a: 'Compare lengths, advance the longer list, then walk both together', d: ['Store one list in a hash set', 'Sort both lists', 'Reverse both lists'], e: 'Aligning the starts makes the two pointers meet at the shared suffix.' },
];

function buildLinkedLists(rand) {
  const qs = [];
  let n = 0;
  const add = (spec) => qs.push(mcq({ ...spec, id: `linked-lists-g${++n}`, topic: 'linked-lists' }, rand));

  for (let i = 0; i < 45; i += 1) {
    const size = randInt(rand, 4, 7);
    const values = Array.from({ length: size }, () => randInt(rand, 1, 20));
    const target = values[randInt(rand, 0, size - 1)];
    add({
      difficulty: 'medium',
      question: `A singly linked list contains ${list(values)}. How many nodes are visited to find the value ${target}?`,
      correct: `${values.indexOf(target) + 1}`,
      distractors: [values.indexOf(target), size, size - values.indexOf(target)],
      explanation: `The scan starts at the head and stops at the first match at position ${values.indexOf(target) + 1}.`,
    });
    const headValue = randInt(rand, 21, 40);
    add({
      difficulty: 'easy',
      question: `A singly linked list is ${list(values)}. After inserting ${headValue} at the head, what is the list from head to tail?`,
      correct: list([headValue, ...values]),
      distractors: [list([...values, headValue]), list([...values.slice(1), headValue]), list([...values].reverse())],
      explanation: 'Head insertion puts the new node first and points it at the old head.',
    });
    if (i < 35) {
      const removed = values[randInt(rand, 0, size - 1)];
      add({
        difficulty: 'medium',
        question: `A singly linked list is ${list(values)}. After deleting the first node whose value is ${removed}, what remains?`,
        correct: list(values.filter((value, position) => position !== values.indexOf(removed))),
        distractors: [
          list(values.filter((value) => value !== removed)),
          list(values.slice(1)),
          list(values.map((value) => (value === removed ? 0 : value))),
        ],
        explanation: `Only the first matching node is unlinked; the others keep their order.`,
      });
      add({
        difficulty: 'hard',
        question: `A singly linked list is ${list(values)}. After reversing it in place, what is the new head-to-tail order?`,
        correct: list([...values].reverse()),
        distractors: [list(values), list([...values].sort((a, b) => a - b)), list([...values].sort((a, b) => b - a))],
        explanation: 'Reversal rewires every next pointer, producing the reverse order.',
      });
    }
  }

  // Pointer/cost questions generated from list lengths.
  for (let length = 3; length <= 20; length += 1) {
    add({
      difficulty: 'medium',
      question: `A singly linked list of ${length} nodes has no tail pointer. How many nodes must be visited to append a new node at the end?`,
      correct: `${length}`,
      distractors: [length - 1, 1, length + 1],
      explanation: 'Every node is visited so the last one can be found before linking the new node.',
    });
  }

  return [...qs, ...conceptBatch({ topic: 'linked-lists', prefix: 'linked-lists', concepts: LINKED_LIST_CONCEPTS, rand })];
}

const BUILDERS = {
  arrays: buildArrays,
  stacks: buildStacks,
  queues: buildQueues,
  'linked-lists': buildLinkedLists,
};

export function buildDataStructureTopic(topicId) {
  const builder = BUILDERS[topicId];
  if (!builder) throw new Error(`Unknown data-structure practice topic: ${topicId}`);
  const questions = builder(makeRng(0x51f3 + TOPIC_IDS.indexOf(topicId) * 97));
  return uniqueBy(questions, (question) => question.id);
}
