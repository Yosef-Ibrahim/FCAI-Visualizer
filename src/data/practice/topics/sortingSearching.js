// ── Practice bank: sorting & searching ──────────────────────────────────────
// Every computed question is derived from a local trace, so the recorded answer
// follows the implementation described in the project (bubble without early
// exit, Lomuto quick sort with the last element as pivot, and so on).

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const SORT_FACTS = [
  { id: 'bubble', name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Stable', inPlace: 'In-place' },
  { id: 'selection', name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Unstable', inPlace: 'In-place' },
  { id: 'insertion', name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Stable', inPlace: 'In-place' },
  { id: 'merge', name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Stable', inPlace: 'Out-of-place' },
  { id: 'quick', name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'Unstable', inPlace: 'In-place' },
  { id: 'heap', name: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: 'Unstable', inPlace: 'In-place' },
  { id: 'counting', name: 'Counting Sort', best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(k)', stable: 'Stable', inPlace: 'Out-of-place' },
  { id: 'radix', name: 'Radix Sort', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n + k)', stable: 'Stable', inPlace: 'Out-of-place' },
];

const SORT_CONCEPTS = [
  { lvl: 'easy', q: 'Which sorting algorithm is stable and in-place but has O(n²) average time?', a: 'Insertion Sort', d: ['Heap Sort', 'Quick Sort', 'Merge Sort'], e: 'Insertion sort keeps equal elements in order, sorts in place, and costs O(n²) on average.' },
  { lvl: 'medium', q: 'Why is merge sort preferred for sorting a linked list?', a: 'It needs sequential access only and splits by node counts', d: ['It uses O(1) extra space', 'It is always faster than quick sort', 'It uses binary search'], e: 'Linked lists cannot be indexed, and merge sort merges by walking nodes.' },
  { lvl: 'medium', q: 'Which input makes quick sort with a last-element pivot degrade to O(n²)?', a: 'Already sorted input', d: ['Random input', 'Input with all equal values', 'Input of size 2'], e: 'A sorted array makes every partition maximally unbalanced.' },
  { lvl: 'hard', q: 'What does a 3-way partition improve in quick sort?', a: 'Performance on arrays with many duplicate keys', d: ['Memory usage of the call stack', 'Stability of the sort', 'The cost of choosing a pivot'], e: 'Equal keys are grouped once and excluded from further recursion.' },
  { lvl: 'medium', q: 'Which sorting algorithm is guaranteed O(n log n) in the worst case and in-place?', a: 'Heap Sort', d: ['Quick Sort', 'Merge Sort', 'Insertion Sort'], e: 'Heap sort is O(n log n) regardless of input and uses O(1) auxiliary space.' },
  { lvl: 'medium', q: 'Which comparison-based sorting algorithms have O(n log n) worst-case time?', a: 'Merge Sort and Heap Sort', d: ['Quick Sort and Selection Sort', 'Bubble Sort and Insertion Sort', 'Counting Sort and Radix Sort'], e: 'Merge and heap sort avoid quick sort’s quadratic worst case.' },
  { lvl: 'easy', q: 'Which sorting algorithm works without comparing elements?', a: 'Counting Sort', d: ['Merge Sort', 'Quick Sort', 'Insertion Sort'], e: 'Counting sort uses value frequencies over a known key range.' },
  { lvl: 'medium', q: 'When is counting sort a poor choice?', a: 'When the range of values is much larger than n', d: ['When the array is sorted', 'When values are integers', 'When n is small'], e: 'Its O(k) extra space and time grow with the value range k.' },
  { lvl: 'medium', q: 'Radix sort processes keys in which order for least-significant-digit first?', a: 'From the least significant digit to the most significant', d: ['From the most significant digit to the least', 'In random digit order', 'Only the most significant digit'], e: 'Stable passes from the least significant digit preserve earlier ordering.' },
  { lvl: 'medium', q: 'Which sort performs best on nearly sorted data?', a: 'Insertion Sort', d: ['Selection Sort', 'Heap Sort', 'Counting Sort'], e: 'Almost-sorted input needs few shifts, approaching O(n).' },
  { lvl: 'easy', q: 'Which sort always performs O(n²) comparisons regardless of input?', a: 'Selection Sort', d: ['Insertion Sort', 'Bubble Sort with early exit', 'Merge Sort'], e: 'Selection sort scans the remaining elements on every pass.' },
  { lvl: 'medium', q: 'What is the lower bound for comparison-based sorting of n elements?', a: 'Ω(n log n)', d: ['Ω(n)', 'Ω(n²)', 'Ω(log n)'], e: 'A decision tree with n! leaves needs Ω(n log n) comparisons.' },
  { lvl: 'medium', q: 'Which sorting algorithm is adaptive without losing stability?', a: 'Insertion Sort', d: ['Selection Sort', 'Heap Sort', 'Quick Sort'], e: 'Insertion sort benefits from existing order and keeps equal keys in place.' },
  { lvl: 'hard', q: 'What is the recurrence for merge sort time?', a: 'T(n) = 2T(n/2) + O(n)', d: ['T(n) = T(n − 1) + O(n)', 'T(n) = T(n/2) + O(1)', 'T(n) = 2T(n/2) + O(n²)'], e: 'Two halves are sorted and merged in linear time, giving O(n log n).' },
  { lvl: 'medium', q: 'What happens when merge sort merges two equal elements?', a: 'The left element is taken first to preserve stability', d: ['The right element is taken first', 'One element is dropped', 'The order is random'], e: 'Taking the left element first preserves the original relative order.' },
  { lvl: 'medium', q: 'Which sort is usually used inside standard library introsort after a recursion-depth limit?', a: 'Heap Sort', d: ['Bubble Sort', 'Counting Sort', 'Radix Sort'], e: 'Introsort switches to heap sort to bound the worst case.' },
  { lvl: 'medium', q: 'Which sort would you choose for very small arrays inside a larger hybrid sort?', a: 'Insertion Sort', d: ['Merge Sort', 'Counting Sort', 'Radix Sort'], e: 'Insertion sort has low overhead and is fast on tiny inputs.' },
  { lvl: 'hard', q: 'What is the space complexity of merge sort on an array?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n²)'], e: 'Merging needs an auxiliary buffer for the combined run.' },
  { lvl: 'medium', q: 'Which property makes a sort stable?', a: 'Equal keys keep their original relative order', d: ['It uses O(1) memory', 'It never swaps elements', 'It runs in O(n log n)'], e: 'Stability is about the order of equal keys, not speed.' },
  { lvl: 'medium', q: 'Bubble sort can stop early when a pass makes no swaps. What does that prove?', a: 'The array is already sorted', d: ['The array is reversed', 'The array has duplicates', 'The array is empty'], e: 'No swap means every adjacent pair is already in order.' },
  { lvl: 'medium', q: 'Which sort repeatedly selects the smallest remaining element?', a: 'Selection Sort', d: ['Insertion Sort', 'Merge Sort', 'Quick Sort'], e: 'Each pass scans the unsorted suffix for its minimum.' },
  { lvl: 'medium', q: 'What is the best-case time of bubble sort with an early-exit flag?', a: 'O(n)', d: ['O(1)', 'O(n log n)', 'O(n²)'], e: 'One pass over a sorted array makes no swaps and stops.' },
  { lvl: 'hard', q: 'External merge sort is used when which condition holds?', a: 'The data does not fit in memory', d: ['The data is already sorted', 'The data contains only integers', 'The array has fewer than 100 items'], e: 'Sorted runs are merged from disk in several passes.' },
  { lvl: 'medium', q: 'Which sort is not comparison-based and can run in linear time for a small key range?', a: 'Counting Sort', d: ['Merge Sort', 'Heap Sort', 'Quick Sort'], e: 'Counting sort avoids comparisons by indexing counts of values.' },
  { lvl: 'medium', q: 'What is the main advantage of quick sort in practice?', a: 'Good cache behaviour and low constant factors', d: ['Guaranteed O(n log n) worst case', 'It is stable', 'It uses O(n) extra memory'], e: 'In-place partitioning gives excellent locality on typical inputs.' },
  { lvl: 'hard', q: 'Which median-of-three pivot choice improves which case?', a: 'Avoiding the worst case on sorted input', d: ['Making the sort stable', 'Removing recursion', 'Reducing space to O(1)'], e: 'A better pivot keeps partitions balanced on ordered inputs.' },
  { lvl: 'medium', q: 'Which sort is most suitable when stability is required and memory is not a constraint?', a: 'Merge Sort', d: ['Heap Sort', 'Quick Sort', 'Selection Sort'], e: 'Merge sort is stable and gives predictable O(n log n) time.' },
  { lvl: 'hard', q: 'What is the worst-case number of comparisons for merge sort of n elements?', a: 'O(n log n)', d: ['O(n)', 'O(n²)', 'O(log n)'], e: 'The recursion has log n levels and each level merges O(n) elements.' },
  { lvl: 'medium', q: 'Which sort is in-place but unstable and has O(n log n) worst-case time?', a: 'Heap Sort', d: ['Merge Sort', 'Insertion Sort', 'Counting Sort'], e: 'Heap sort swaps distant elements, which can reorder equal keys.' },
  { lvl: 'easy', q: 'Sorting an array that is already sorted with insertion sort costs which time?', a: 'O(n)', d: ['O(n log n)', 'O(n²)', 'O(1)'], e: 'Each new element is already in place, so the inner loop stops immediately.' },
];

function bubbleStats(values) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  const passResults = [];
  for (let i = 0; i < a.length - 1; i += 1) {
    for (let j = 0; j < a.length - i - 1; j += 1) {
      comparisons += 1;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps += 1;
      }
    }
    passResults.push([...a]);
  }
  return { comparisons, swaps, passResults, sorted: a };
}

function selectionStats(values) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  const passResults = [];
  for (let i = 0; i < a.length - 1; i += 1) {
    let min = i;
    for (let j = i + 1; j < a.length; j += 1) {
      comparisons += 1;
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swaps += 1;
    }
    passResults.push([...a]);
  }
  return { comparisons, swaps, passResults };
}

function insertionStats(values) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  const prefixes = [];
  for (let i = 1; i < a.length; i += 1) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0) {
      comparisons += 1;
      if (a[j] <= key) break;
      a[j + 1] = a[j];
      swaps += 1;
      j -= 1;
    }
    a[j + 1] = key;
    prefixes.push([...a]);
  }
  return { comparisons, swaps, prefixes };
}

function mergeStats(values) {
  let comparisons = 0;
  function sort(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const left = sort(a.slice(0, mid));
    const right = sort(a.slice(mid));
    const out = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      comparisons += 1;
      if (left[i] <= right[j]) out.push(left[i++]);
      else out.push(right[j++]);
    }
    while (i < left.length) out.push(left[i++]);
    while (j < right.length) out.push(right[j++]);
    return out;
  }
  sort(values);
  return comparisons;
}

function quickStats(values) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  function partition(low, high) {
    const pivot = a[high];
    let i = low;
    for (let j = low; j < high; j += 1) {
      comparisons += 1;
      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps += 1;
        } else {
          [a[i], a[j]] = [a[j], a[i]];
        }
        i += 1;
      }
    }
    [a[i], a[high]] = [a[high], a[i]];
    if (i !== high) swaps += 1;
    return i;
  }
  function sort(low, high) {
    if (low >= high) return;
    const pivot = partition(low, high);
    sort(low, pivot - 1);
    sort(pivot + 1, high);
  }
  sort(0, a.length - 1);
  return { comparisons, swaps };
}

function heapStats(values) {
  const a = [...values];
  let comparisons = 0;
  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size) {
      comparisons += 1;
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      comparisons += 1;
      if (a[right] > a[largest]) largest = right;
    }
    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      heapify(size, largest);
    }
  }
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i -= 1) heapify(a.length, i);
  for (let end = a.length - 1; end > 0; end -= 1) {
    [a[0], a[end]] = [a[end], a[0]];
    heapify(end, 0);
  }
  return comparisons;
}

function sampleArrays(rand, count, length) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard < count * 50) {
    guard += 1;
    const values = Array.from({ length }, () => randInt(rand, 0, 9));
    const key = values.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(values);
  }
  return out;
}

function factQuestions(topic, prefix, facts, rand) {
  const qs = [];
  for (const fact of facts) {
    qs.push(mcq({
      id: `${prefix}-${fact.id}-avg`,
      topic,
      difficulty: 'easy',
      question: `What is the average-case time complexity of ${fact.name}?`,
      correct: fact.avg,
      distractors: [fact.best, fact.worst, 'O(1)'],
      explanation: `${fact.name} runs in ${fact.avg} on average.`,
      algorithm: fact.id,
    }, rand));
    qs.push(mcq({
      id: `${prefix}-${fact.id}-worst`,
      topic,
      difficulty: 'medium',
      question: `What is the worst-case time complexity of ${fact.name}?`,
      correct: fact.worst,
      distractors: [fact.avg, fact.best, 'O(1)'],
      explanation: `${fact.name} runs in ${fact.worst} in the worst case.`,
      algorithm: fact.id,
    }, rand));
    qs.push(mcq({
      id: `${prefix}-${fact.id}-best`,
      topic,
      difficulty: 'medium',
      question: `What is the best-case time complexity of ${fact.name}?`,
      correct: fact.best,
      distractors: [fact.avg, fact.worst, 'O(n²)'],
      explanation: `${fact.name} runs in ${fact.best} on its best input.`,
      algorithm: fact.id,
    }, rand));
    qs.push(mcq({
      id: `${prefix}-${fact.id}-space`,
      topic,
      difficulty: 'medium',
      question: `What is the auxiliary space complexity of ${fact.name}?`,
      correct: fact.space,
      distractors: [fact.avg, 'O(1)', 'O(n²)'],
      explanation: `${fact.name} needs ${fact.space} auxiliary space.`,
      algorithm: fact.id,
    }, rand));
    qs.push(mcq({
      id: `${prefix}-${fact.id}-stable`,
      topic,
      difficulty: 'easy',
      question: `Is ${fact.name} stable?`,
      correct: fact.stable,
      distractors: [fact.stable === 'Stable' ? 'Unstable' : 'Stable', 'Only for integers', 'Only for sorted input'],
      explanation: `${fact.name} is ${fact.stable.toLowerCase()}.`,
      algorithm: fact.id,
    }, rand));
    qs.push(mcq({
      id: `${prefix}-${fact.id}-place`,
      topic,
      difficulty: 'medium',
      question: `Does ${fact.name} sort in place?`,
      correct: fact.inPlace === 'In-place' ? 'Yes, it sorts in place' : 'No, it needs extra storage',
      distractors: [
        fact.inPlace === 'In-place' ? 'No, it needs extra storage' : 'Yes, it sorts in place',
        'Only when the array has no duplicates',
        'Only for arrays of size 2',
      ],
      explanation: `${fact.name} is ${fact.inPlace.toLowerCase()}.`,
      algorithm: fact.id,
    }, rand));
  }
  return qs;
}

function buildSorting(rand) {
  const topic = 'sorting';
  const qs = [...factQuestions(topic, 'sorting-fact', SORT_FACTS, rand)];
  const arrays = sampleArrays(rand, 24, randInt(rand, 5, 7));

  arrays.forEach((values, i) => {
    const bubble = bubbleStats(values);
    qs.push(mcq({
      id: `sorting-bubble-pass-${i}`,
      topic,
      difficulty: 'medium',
      question: `After one complete pass of bubble sort on ${list(values)}, what is the array?`,
      correct: list(bubble.passResults[0] ?? values),
      distractors: [list(values), list([...values].sort((a, b) => a - b)), list([...values].reverse())],
      explanation: 'One pass compares every adjacent pair and moves the largest remaining value to the end.',
      algorithm: 'bubble',
    }, rand));
    qs.push(mcq({
      id: `sorting-bubble-swaps-${i}`,
      topic,
      difficulty: 'hard',
      question: `How many swaps does bubble sort perform while sorting ${list(values)}?`,
      correct: `${bubble.swaps}`,
      distractors: [bubble.swaps + 1, Math.max(0, bubble.swaps - 1), bubble.comparisons],
      explanation: `Tracing adjacent swaps on ${list(values)} counts ${bubble.swaps} swaps.`,
      algorithm: 'bubble',
    }, rand));

    const selection = selectionStats(values);
    qs.push(mcq({
      id: `sorting-selection-pass-${i}`,
      topic,
      difficulty: 'hard',
      question: `After two passes of selection sort on ${list(values)}, what is the array?`,
      correct: list(selection.passResults[1] ?? selection.passResults[0] ?? values),
      distractors: [list(selection.passResults[0] ?? values), list([...values].sort((a, b) => a - b)), list(values)],
      explanation: 'Each selection pass places the smallest remaining value at the next position.',
      algorithm: 'selection',
    }, rand));

    const insertion = insertionStats(values);
    qs.push(mcq({
      id: `sorting-insertion-prefix-${i}`,
      topic,
      difficulty: 'medium',
      question: `Insertion sort processes ${list(values)} left to right. What is the array after the first ${Math.min(4, values.length)} elements have been processed?`,
      correct: list(insertion.prefixes[Math.min(3, insertion.prefixes.length - 1)] ?? values),
      distractors: [list(values), list([...values].sort((a, b) => a - b)), list([...values].reverse())],
      explanation: 'Insertion sort keeps a sorted prefix; after processing 4 elements the first 4 values are in order.',
      algorithm: 'insertion',
    }, rand));
  });

  // Comparison counts for the advanced algorithms.
  arrays.slice(0, 10).forEach((values, i) => {
    const merge = mergeStats(values);
    qs.push(mcq({
      id: `sorting-merge-compares-${i}`,
      topic,
      difficulty: 'hard',
      question: `How many key comparisons does top-down merge sort perform on ${list(values)}?`,
      correct: `${merge}`,
      distractors: [merge + 2, merge - 2, merge + 5],
      explanation: `Tracing the merges counts ${merge} comparisons for this input.`,
      algorithm: 'merge',
    }, rand));

    const quick = quickStats(values);
    qs.push(mcq({
      id: `sorting-quick-compares-${i}`,
      topic,
      difficulty: 'hard',
      question: `Using Lomuto partitioning with the last element as pivot, how many comparisons does quick sort perform on ${list(values)}?`,
      correct: `${quick.comparisons}`,
      distractors: [quick.comparisons + 1, Math.max(0, quick.comparisons - 1), quick.comparisons + 3],
      explanation: `Each partition compares every non-pivot element with the pivot once, totalling ${quick.comparisons}.`,
      algorithm: 'quick',
    }, rand));

    const heap = heapStats(values);
    qs.push(mcq({
      id: `sorting-heap-compares-${i}`,
      topic,
      difficulty: 'hard',
      question: `How many comparisons does heap sort perform while sorting ${list(values)}?`,
      correct: `${heap}`,
      distractors: [heap + 2, Math.max(0, heap - 2), heap + 4],
      explanation: `Building the max-heap and extracting every maximum costs ${heap} comparisons for this input.`,
      algorithm: 'heap',
    }, rand));
  });

  // Non-comparison sorts.
  arrays.slice(0, 8).forEach((values, i) => {
    qs.push(mcq({
      id: `sorting-counting-compares-${i}`,
      topic,
      difficulty: 'medium',
      question: `How many element-to-element comparisons does counting sort perform on ${list(values)}?`,
      correct: '0',
      distractors: [String(values.length), String(values.length * 2), String(Math.max(...values))],
      explanation: 'Counting sort uses value frequencies instead of comparing elements, so it performs no comparisons.',
      algorithm: 'counting',
    }, rand));
  });

  return [...qs, ...conceptBatch({ topic, prefix: 'sorting', concepts: SORT_CONCEPTS, rand })];
}

// ── Searching ───────────────────────────────────────────────────────────────
const SEARCH_CONCEPTS = [
  { lvl: 'easy', q: 'Binary search requires its input to be which of the following?', a: 'Sorted', d: ['Hashed', 'Stored in a linked list', 'A balanced tree'], e: 'Binary search discards half the range using order.' },
  { lvl: 'easy', q: 'What is the worst-case time complexity of linear search?', a: 'O(n)', d: ['O(1)', 'O(log n)', 'O(n log n)'], e: 'Every element may need to be checked.' },
  { lvl: 'medium', q: 'What is the worst-case time complexity of binary search?', a: 'O(log n)', d: ['O(n)', 'O(1)', 'O(n log n)'], e: 'The search range halves on every comparison.' },
  { lvl: 'medium', q: 'What is the step size in jump search over an array of n elements?', a: '⌊√n⌋', d: ['n / 2', 'log₂ n', '2'], e: 'Jump search advances by about √n and then scans one block linearly.' },
  { lvl: 'medium', q: 'What is the worst-case time complexity of jump search?', a: 'O(√n)', d: ['O(log n)', 'O(n)', 'O(n log n)'], e: 'About √n jumps plus a linear scan of one block.' },
  { lvl: 'medium', q: 'How many comparisons can binary search need to search 1,000 sorted elements?', a: 'About 10', d: ['About 1,000', 'About 100', 'About 3'], e: 'log₂ 1000 ≈ 10, so ten halvings suffice.' },
  { lvl: 'medium', q: 'What is the minimum number of comparisons needed to search n sorted elements in the worst case?', a: '⌈log₂(n + 1)⌉', d: ['n', '⌈n / 2⌉', '2n'], e: 'A binary decision tree with n + 1 outcomes has height ⌈log₂(n + 1)⌉.' },
  { lvl: 'easy', q: 'Which search works on unsorted data?', a: 'Linear search', d: ['Binary search', 'Jump search', 'Interpolation search'], e: 'Linear search makes no assumption about order.' },
  { lvl: 'medium', q: 'Interpolation search performs best when values are which?', a: 'Uniformly distributed', d: ['All equal', 'Reverse sorted', 'Clustered at one end'], e: 'It estimates the target position from its value, which assumes a uniform spread.' },
  { lvl: 'hard', q: 'Which search estimates the target index from the key value?', a: 'Interpolation search', d: ['Binary search', 'Jump search', 'Linear search'], e: 'Interpolation uses the value ratio to guess the position.' },
  { lvl: 'medium', q: 'What is the average-case time of binary search?', a: 'O(log n)', d: ['O(n)', 'O(1)', 'O(√n)'], e: 'The range halves on each step regardless of the exact target.' },
  { lvl: 'medium', q: 'Which structure supports O(log n) search through ordered keys?', a: 'A balanced binary search tree', d: ['A stack', 'A queue', 'An unsorted array'], e: 'Ordered structure plus height balance gives logarithmic search.' },
  { lvl: 'hard', q: 'What is the space complexity of iterative binary search?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n log n)'], e: 'Only a few indexes are stored.' },
  { lvl: 'hard', q: 'What is the space complexity of recursive binary search?', a: 'O(log n) due to the call stack', d: ['O(1)', 'O(n)', 'O(n²)'], e: 'Each recursive call adds a frame, and the depth is logarithmic.' },
  { lvl: 'medium', q: 'Binary search on a linked list is inefficient because of which property?', a: 'It cannot access the middle element in O(1)', d: ['It stores duplicate values', 'It cannot be sorted', 'It uses more memory than an array'], e: 'Reaching the middle requires a traversal, adding O(n) per step.' },
  { lvl: 'medium', q: 'After comparing the target with the middle element of a sorted array, what does binary search do?', a: 'Discard the half that cannot contain the target', d: ['Scan the whole array', 'Swap the middle element', 'Sort the array again'], e: 'Order tells which half can still contain the target.' },
  { lvl: 'medium', q: 'Which search returns the first occurrence of a duplicate key with a lower-bound variant?', a: 'Binary search for the leftmost match', d: ['Jump search only', 'Linear search only', 'Hash lookup'], e: 'A lower-bound binary search keeps moving left on an equal match.' },
  { lvl: 'hard', q: 'What is the best-case time of linear search?', a: 'O(1)', d: ['O(n)', 'O(log n)', 'O(n²)'], e: 'The target may be the first element checked.' },
  { lvl: 'medium', q: 'What is the best-case time of binary search?', a: 'O(1)', d: ['O(log n)', 'O(n)', 'O(√n)'], e: 'The first middle element may already be the target.' },
  { lvl: 'medium', q: 'A hash table search is expected O(1) under which condition?', a: 'A good hash function keeps collisions low', d: ['Keys are sorted', 'The table stores only integers', 'The table is a linked list'], e: 'Uniform hashing gives constant expected probe counts.' },
  { lvl: 'medium', q: 'Searching a sorted array for a value that is absent with binary search ends when what happens?', a: 'The low index passes the high index', d: ['The array becomes empty', 'A swap is made', 'The middle element is removed'], e: 'An empty range means the target cannot be present.' },
  { lvl: 'medium', q: 'Which condition makes jump search valid?', a: 'The array must be sorted', d: ['Values must be unique', 'The length must be a power of two', 'The array must be circular'], e: 'Jumping forward and scanning back relies on sorted order.' },
  { lvl: 'medium', q: 'Exponential search is useful when which property holds?', a: 'The target is near the beginning of a large sorted array', d: ['The array is unsorted', 'The array is stored in a stack', 'The target is always the maximum'], e: 'It doubles the bound until the target range is found, then binary searches.' },
  { lvl: 'hard', q: 'What is the search cost for a target near index 0 with exponential search?', a: 'O(log i) for the position i', d: ['O(n)', 'O(1)', 'O(n log n)'], e: 'The doubling bound reaches i in logarithmic steps.' },
  { lvl: 'medium', q: 'Which search is the best choice for an unsorted array that is searched only once?', a: 'Linear search', d: ['Binary search', 'Jump search', 'Interpolation search'], e: 'Sorting first would cost more than one linear scan.' },
  { lvl: 'medium', q: 'What is the cost of sorting an array before running binary search once?', a: 'The sort dominates at O(n log n)', d: ['Binary search dominates', 'Both cost O(n)', 'Both cost O(1)'], e: 'One O(log n) search is cheaper than sorting unless many searches follow.' },
];

function binarySearchSteps(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  let comparisons = 0;
  const visited = [];
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    visited.push(mid);
    comparisons += 1;
    if (sorted[mid] === target) return { found: true, index: mid, comparisons, visited };
    if (sorted[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return { found: false, index: -1, comparisons, visited };
}

function buildSearching(rand) {
  const topic = 'searching';
  const qs = [];

  const algorithmFacts = [
    { id: 'linear-search', name: 'Linear Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    { id: 'binary-search', name: 'Binary Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    { id: 'jump-search', name: 'Jump Search', best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
  ];
  for (const fact of algorithmFacts) {
    for (const [label, value, otherA, otherB] of [
      ['average-case', fact.avg, fact.worst, fact.best],
      ['worst-case', fact.worst, fact.avg, fact.best],
      ['best-case', fact.best, fact.avg, fact.worst],
      ['auxiliary space', fact.space, 'O(n)', 'O(log n)'],
    ]) {
      qs.push(mcq({
        id: `searching-${fact.id}-${label.replace(/\s+/g, '-')}`,
        topic,
        difficulty: label === 'best-case' ? 'medium' : 'easy',
        question: `What is the ${label} complexity of ${fact.name}?`,
        correct: value,
        distractors: [otherA, otherB, 'O(n²)'],
        explanation: `${fact.name}: ${label} complexity is ${value}.`,
        algorithm: fact.id,
      }, rand));
    }
  }

  // Linear search counts.
  const arrays = sampleArrays(rand, 32, randInt(rand, 5, 9));
  arrays.forEach((values, i) => {
    const index = randInt(rand, 0, values.length - 1);
    qs.push(mcq({
      id: `searching-linear-present-${i}`,
      topic,
      difficulty: 'easy',
      question: `Linear search scans ${list(values)} for ${values[index]}. How many comparisons are needed if the first match is returned?`,
      correct: `${index + 1}`,
      distractors: [index, values.length, values.length - index],
      explanation: `The first match is at index ${index}, so the scan makes ${index + 1} comparisons.`,
      algorithm: 'linear-search',
    }, rand));
    const missing = Math.max(...values) + 1;
    qs.push(mcq({
      id: `searching-linear-absent-${i}`,
      topic,
      difficulty: 'medium',
      question: `Linear search scans ${list(values)} for ${missing}, which is absent. How many comparisons are performed?`,
      correct: `${values.length}`,
      distractors: [values.length - 1, values.length + 1, 1],
      explanation: 'Every element is checked before the search can report that the value is absent.',
      algorithm: 'linear-search',
    }, rand));
  });

  // Binary search: comparisons, first midpoint, presence.
  arrays.slice(0, 24).forEach((values, i) => {
    const sorted = [...values].sort((a, b) => a - b);
    const target = sorted[randInt(rand, 0, sorted.length - 1)];
    const result = binarySearchSteps(sorted, target);
    const firstMid = Math.floor((sorted.length - 1) / 2);
    qs.push(mcq({
      id: `searching-binary-mid-${i}`,
      topic,
      difficulty: 'medium',
      question: `Binary search runs on the sorted array ${list(sorted)}. Which index is inspected first?`,
      correct: `${firstMid}`,
      distractors: [0, sorted.length - 1, Math.floor(sorted.length / 2) + 1],
      explanation: `The first midpoint is ⌊(0 + ${sorted.length - 1}) / 2⌋ = ${firstMid}.`,
      algorithm: 'binary-search',
    }, rand));
    qs.push(mcq({
      id: `searching-binary-count-${i}`,
      topic,
      difficulty: 'hard',
      question: `Binary search looks for ${target} in ${list(sorted)}. How many comparisons are needed?`,
      correct: `${result.comparisons}`,
      distractors: [result.comparisons + 1, Math.max(1, result.comparisons - 1), sorted.length],
      explanation: `The visited midpoints are ${result.visited.join(', ')}, so ${result.comparisons} comparisons are made.`,
      algorithm: 'binary-search',
    }, rand));
    if (i < 6) {
      const absent = sorted[sorted.length - 1] + randInt(rand, 1, 4);
      const missingResult = binarySearchSteps(sorted, absent);
      qs.push(mcq({
        id: `searching-binary-absent-${i}`,
        topic,
        difficulty: 'hard',
        question: `Binary search looks for the absent value ${absent} in ${list(sorted)}. How many comparisons does it perform before reporting failure?`,
        correct: `${missingResult.comparisons}`,
        distractors: [missingResult.comparisons + 1, sorted.length, Math.max(1, missingResult.comparisons - 1)],
        explanation: 'Each comparison halves the remaining range until the range becomes empty.',
        algorithm: 'binary-search',
      }, rand));
    }
  });

  // Jump search block sizes.
  [16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 200, 225, 256, 300, 400, 500, 625, 700, 900, 1000, 1024, 1500, 2000, 2500, 3000, 4000, 5000, 6400, 8100, 10000, 12000, 15000].forEach((size) => {
    const block = Math.floor(Math.sqrt(size));
    qs.push(mcq({
      id: `searching-jump-${size}`,
      topic,
      difficulty: 'medium',
      question: `Jump search runs on an array of ${size} sorted elements. What is its jump step ⌊√n⌋?`,
      correct: `${block}`,
      distractors: [Math.ceil(size / 2), Math.ceil(Math.sqrt(size)) + 1, Math.floor(size / 10)],
      explanation: `⌊√${size}⌋ = ${block}.`,
      algorithm: 'jump-search',
    }, rand));
  });

  // Minimum worst-case comparisons for binary search.
  [7, 15, 31, 63, 100, 127, 255, 511, 1000, 1023, 2000, 4095, 8000, 10000, 16000, 32000, 64000, 100000, 500000, 1000000].forEach((size) => {
    const comparisons = Math.ceil(Math.log2(size + 1));
    qs.push(mcq({
      id: `searching-min-compare-${size}`,
      topic,
      difficulty: 'hard',
      question: `What is the minimum number of comparisons binary search needs in the worst case for ${size} sorted elements?`,
      correct: `${comparisons}`,
      distractors: [comparisons + 1, Math.max(1, comparisons - 1), Math.ceil(size / 2)],
      explanation: `⌈log₂(${size} + 1)⌉ = ${comparisons}.`,
      algorithm: 'binary-search',
    }, rand));
  });

  return [...qs, ...conceptBatch({ topic, prefix: 'searching', concepts: SEARCH_CONCEPTS, rand })];
}

export function buildSortingQuestions() {
  return uniqueBy(buildSorting(makeRng(0x2c91)), (question) => question.id);
}

export function buildSearchingQuestions() {
  return uniqueBy(buildSearching(makeRng(0x7ab3)), (question) => question.id);
}
