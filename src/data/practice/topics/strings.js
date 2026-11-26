// ── Practice bank: tries & suffix structures ───────────────────────────────
// Node counts, prefix matches, suffix arrays and LCP values are built from the
// input words/strings with the same structures shown on the course pages.

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'trie-suffix';
const WORDS = ['cat', 'car', 'card', 'care', 'cart', 'dog', 'do', 'dot', 'dove', 'ant', 'ante', 'anti', 'ban', 'band', 'bank', 'bar', 'bark', 'barn'];

const STRING_EASY_CONCEPTS = [
  { lvl: 'easy', q: 'What does each edge of a trie represent?', a: 'One character', d: ['One whole word', 'One bit', 'One hash value'], e: 'Walking from the root spells a prefix one character at a time.' },
  { lvl: 'easy', q: 'What string does the root of a trie represent?', a: 'The empty string', d: ['The alphabet', 'The longest word', 'The first word inserted'], e: 'Every stored word is a path starting at the empty root.' },
  { lvl: 'easy', q: 'How long does a trie search take for a word of length L?', a: 'O(L)', d: ['O(1)', 'O(n) where n is the number of words', 'O(L log n)'], e: 'The search follows one edge per character of the word.' },
  { lvl: 'easy', q: 'How many characters are stored in a single trie node?', a: 'None — characters label the edges', d: ['Exactly one', 'Two', 'All characters of the word'], e: 'A path of edges spells the word; nodes mark prefixes and word endings.' },
  { lvl: 'easy', q: 'What is a suffix array?', a: 'The starting positions of all suffixes sorted lexicographically', d: ['An array of the characters of the string', 'A hash table of prefixes', 'A tree of all rotations'], e: 'It lists where each sorted suffix begins in the original string.' },
  { lvl: 'easy', q: 'How many suffixes does a string of length n have?', a: 'n', d: ['n − 1', 'n + 1', '2n'], e: 'Every index 0…n − 1 starts one suffix.' },
  { lvl: 'easy', q: 'What does LCP stand for in string structures?', a: 'Longest Common Prefix', d: ['Least Common Path', 'Longest Character Position', 'Left Child Pointer'], e: 'LCP values compare adjacent suffixes during construction and search.' },
  { lvl: 'easy', q: 'Which structure is built from all suffixes of a single string?', a: 'A suffix tree', d: ['A trie of prefixes only', 'A binary heap', 'A hash set'], e: 'A suffix tree compresses every suffix of one text into a single tree.' },
  { lvl: 'easy', q: 'Which structure is best for prefix autocomplete?', a: 'A trie', d: ['A sorted linked list', 'A binary heap', 'A circular queue'], e: 'Walking the prefix lands on the subtree that holds every matching word.' },
  { lvl: 'easy', q: 'What marks the end of a stored word in a trie?', a: 'A terminal flag on its last node', d: ['A null edge', 'A second root', 'A negative character value'], e: 'The flag distinguishes a word that is a prefix of another word from a full word.' },
  { lvl: 'easy', q: 'What does the trie space cost depend on?', a: 'The number of distinct prefixes (nodes)', d: ['Only the number of words', 'Only the alphabet size', 'The hash of each word'], e: 'Shared prefixes share nodes, so the node count tracks distinct prefixes.' },
  { lvl: 'easy', q: 'In a suffix array, what does the value at index k mean?', a: 'The starting position of the k-th smallest suffix', d: ['The k-th character of the string', 'The length of the k-th suffix', 'The k-th distinct word'], e: 'Each entry points back to where that sorted suffix begins.' },
];

const STRING_CONCEPTS = [
  { lvl: 'easy', q: 'What does a trie store in each node?', a: 'A character and links to child characters', d: ['A full word', 'A hash value', 'A frequency table'], e: 'A path from the root spells a prefix.' },
  { lvl: 'medium', q: 'What is the lookup cost of a word of length L in a trie?', a: 'O(L)', d: ['O(n)', 'O(log n)', 'O(L²)'], e: 'One node is followed per character.' },
  { lvl: 'medium', q: 'How many nodes does a trie need for a single word of length L (counting the root)?', a: 'L + 1', d: ['L', '2L', 'L²'], e: 'The root plus one node per character.' },
  { lvl: 'medium', q: 'What is the main space disadvantage of a trie?', a: 'Many nodes, especially for sparse alphabets', d: ['It cannot store prefixes', 'It requires sorted words', 'It hashes every word'], e: 'Each character may introduce its own node.' },
  { lvl: 'medium', q: 'Which task is a trie especially good at?', a: 'Prefix search and autocomplete', d: ['Sorting numbers', 'Computing shortest paths', 'Balancing heights'], e: 'A prefix is a path from the root.' },
  { lvl: 'easy', q: 'In a suffix trie, what is inserted for a string of length n?', a: 'Every suffix of the string', d: ['Every prefix once', 'Only the full string', 'Every substring twice'], e: 'Suffixes make substring queries path queries.' },
  { lvl: 'medium', q: 'How many suffixes does a string of length n have?', a: 'n', d: ['n − 1', 'n + 1', '2n'], e: 'Suffixes start at each position 0 through n − 1.' },
  { lvl: 'medium', q: 'How many nodes can a suffix trie have for a string of length n (distinct characters)?', a: 'n(n + 1)/2 + 1', d: ['n', '2n − 1', 'n²'], e: 'All suffixes of distinct characters share only the root.' },
  { lvl: 'medium', q: 'What does a suffix tree compress compared with a suffix trie?', a: 'Unary paths into single labeled edges', d: ['Leaves into one node', 'Characters into bytes', 'Suffixes into prefixes'], e: 'Path compression reduces node count to O(n).' },
  { lvl: 'medium', q: 'How many leaves does a suffix tree for a string of length n (with a terminator) have?', a: 'n', d: ['n − 1', '2n', 'n²'], e: 'Each suffix ends at its own leaf.' },
  { lvl: 'hard', q: 'What is the maximum number of nodes in a suffix tree for a string of length n?', a: '2n − 1', d: ['n', 'n²', 'n log n'], e: 'A compact tree has at most 2n − 1 nodes including the root.' },
  { lvl: 'medium', q: 'What does a suffix array store?', a: 'The starting indexes of suffixes in sorted order', d: ['Every suffix string', 'All prefixes', 'Character frequencies'], e: 'It is an array of offsets, not the suffixes themselves.' },
  { lvl: 'medium', q: 'What is the length of a suffix array for a string of length n?', a: 'n', d: ['n − 1', 'n + 1', '2n'], e: 'One entry per suffix.' },
  { lvl: 'medium', q: 'What does the LCP array store?', a: 'The longest common prefix length of adjacent suffixes', d: ['The longest prefix of the whole string', 'The number of distinct characters', 'The suffix lengths'], e: 'LCP[i] compares suffix i with suffix i − 1 in suffix-array order.' },
  { lvl: 'medium', q: 'Which algorithm computes the LCP array in O(n)?', a: 'Kasai’s algorithm', d: ['Kruskal’s algorithm', 'Dijkstra’s algorithm', 'Kahn’s algorithm'], e: 'Kasai reuses the previous LCP to avoid rescanning.' },
  { lvl: 'medium', q: 'How is a pattern searched in a suffix array?', a: 'Binary search over the sorted suffixes', d: ['Linear scan of all suffixes', 'Hash the pattern', 'Build a heap'], e: 'Sorted suffix order supports binary search.' },
  { lvl: 'medium', q: 'What is the search cost of a pattern of length m in a suffix array with binary search?', a: 'O(m log n)', d: ['O(m + n)', 'O(log n)', 'O(n)'], e: 'Each of the log n comparisons may inspect up to m characters.' },
  { lvl: 'medium', q: 'Which structure finds all occurrences of a substring fastest after preprocessing?', a: 'Suffix tree or suffix automaton', d: ['Unsorted array', 'Stack', 'Hash set of prefixes'], e: 'A substring is a path; its leaf count gives occurrences.' },
  { lvl: 'medium', q: 'How many occurrences of "ana" are in "banana"?', a: '2', d: ['1', '3', '0'], e: 'The matches start at indexes 1 and 3.' },
  { lvl: 'medium', q: 'What does path compression do in a suffix tree?', a: 'Merges chains of single-child nodes into labeled edges', d: ['Removes all leaves', 'Sorts the children', 'Duplicates suffixes'], e: 'Edges carry substrings instead of one character each.' },
  { lvl: 'medium', q: 'Which traversal lists suffixes in lexicographic order?', a: 'A DFS that visits children in character order', d: ['A BFS by level', 'A post-order only traversal', 'A random walk'], e: 'Lexicographic order follows sorted child labels.' },
  { lvl: 'medium', q: 'What is the space complexity of a suffix array?', a: 'O(n)', d: ['O(n²)', 'O(n log n)', 'O(1)'], e: 'It stores one integer per suffix.' },
  { lvl: 'medium', q: 'What does a trie mark to indicate that a path is a complete word?', a: 'An end-of-word flag on the node', d: ['A hash of the word', 'A special child character', 'The depth of the root'], e: 'Without the flag, prefixes would be indistinguishable from words.' },
  { lvl: 'medium', q: 'Which operation is slow in a plain trie of characters?', a: 'Enumerating all words under a prefix', d: ['Looking up a word', 'Inserting a word', 'Checking a prefix exists'], e: 'The subtree must be traversed to list completions.' },
  { lvl: 'medium', q: 'A compressed trie is also known as what?', a: 'A radix tree', d: ['A binary heap', 'A B+ tree', 'A skip list'], e: 'Radix trees compress unary paths.' },
  { lvl: 'medium', q: 'What is the LCP of "banana" and "bandana"?', a: '"ban"', d: ['"bana"', '"ba"', '"banan"'], e: 'The common prefix is b-a-n, three characters.' },
  { lvl: 'medium', q: 'What is the LCP of "abc" and "abd"?', a: '"ab"', d: ['"abc"', '"a"', '""'], e: 'The strings differ at the third character.' },
  { lvl: 'medium', q: 'Which suffix of "banana" is lexicographically smallest?', a: '"a"', d: ['"banana"', '"na"', '"anana"'], e: 'The suffix starting at the last character is "a".' },
  { lvl: 'medium', q: 'Which suffix of "banana" is lexicographically largest?', a: '"nana"', d: ['"banana"', '"ana"', '"a"'], e: 'Suffixes starting with n sort after those starting with b or a.' },
  { lvl: 'medium', q: 'What is the suffix array of "aba"?', a: '[2, 0, 1]', d: ['[0, 1, 2]', '[1, 0, 2]', '[2, 1, 0]'], e: 'Sorted suffixes are "a" (index 2), "aba" (0), "ba" (1).' },
  { lvl: 'medium', q: 'Which string has the suffix array [3, 2, 1, 0]?', a: 'aaaa', d: ['abcd', 'abab', 'aaaaa'], e: 'All suffixes of "aaaa" sort from shortest to longest, giving decreasing indexes.' },
  { lvl: 'medium', q: 'What is the time to build a suffix array with a simple comparison sort?', a: 'O(n² log n)', d: ['O(n)', 'O(n log n)', 'O(log n)'], e: 'There are n suffixes of length up to n, and sorting costs another log n.' },
  { lvl: 'hard', q: 'Which algorithm builds a suffix array in O(n log n) with doubling?', a: 'Prefix-doubling (Manber–Myers)', d: ['Kruskal', 'Kasai', 'Boyer–Moore'], e: 'Ranks of length 2^k substrings are doubled each round.' },
  { lvl: 'medium', q: 'What does the Burrows–Wheeler transform produce?', a: 'A reversible permutation of the text based on sorted rotations', d: ['A Huffman tree', 'A suffix trie', 'A DCT block'], e: 'It clusters similar characters for better compression.' },
  { lvl: 'medium', q: 'Which structure would best support autocomplete for a dictionary?', a: 'A trie', d: ['A stack', 'A queue', 'A binary heap'], e: 'Prefix paths give completions directly.' },
  { lvl: 'medium', q: 'What is the root of a suffix trie?', a: 'An empty-prefix node with one branch per starting character', d: ['The full string', 'The first suffix', 'A leaf'], e: 'Every suffix path starts at the root.' },
  { lvl: 'medium', q: 'A trie lookup of a missing word fails when which condition occurs?', a: 'A required child link is missing', d: ['The root is empty', 'The word is longer than 10 characters', 'The trie has duplicate letters'], e: 'The path cannot be followed any further.' },
  { lvl: 'medium', q: 'What does the LCP value 0 between adjacent suffixes mean?', a: 'They start with different characters', d: ['They are identical', 'One suffix is empty', 'They share one character'], e: 'No common prefix characters exist.' },
  { lvl: 'medium', q: 'Which structure stores all suffixes compactly and supports substring counting?', a: 'Suffix tree', d: ['Binary heap', 'Hash set', 'Circular queue'], e: 'Each substring corresponds to a path location.' },
  { lvl: 'medium', q: 'How many internal nodes can a compact suffix tree have at most?', a: 'n − 1', d: ['n', '2n', 'n²'], e: 'With n leaves, a compact tree has at most n − 1 internal nodes.' },
];

function buildTrie(words) {
  const root = { children: {}, terminal: false };
  let nodes = 1;
  for (const word of words) {
    let current = root;
    for (const char of word) {
      if (!current.children[char]) {
        current.children[char] = { children: {}, terminal: false };
        nodes += 1;
      }
      current = current.children[char];
    }
    current.terminal = true;
  }
  return { root, nodes };
}

function countPrefix(root, prefix) {
  let current = root;
  for (const char of prefix) {
    current = current.children[char];
    if (!current) return 0;
  }
  const collect = (node) => (node.terminal ? 1 : 0)
    + Object.values(node.children).reduce((sum, child) => sum + collect(child), 0);
  return collect(current);
}

function autocomplete(root, prefix) {
  let current = root;
  for (const char of prefix) {
    current = current.children[char];
    if (!current) return [];
  }
  const out = [];
  const walk = (node, path) => {
    if (node.terminal) out.push(path);
    for (const [char, child] of Object.entries(node.children)) walk(child, path + char);
  };
  walk(current, prefix);
  return out.sort();
}

function suffixArray(text) {
  return Array.from({ length: text.length }, (_, index) => index)
    .sort((a, b) => text.slice(a).localeCompare(text.slice(b)));
}

function lcpArray(text, sa) {
  return sa.map((index, position) => {
    if (position === 0) return 0;
    const previous = text.slice(sa[position - 1]);
    const current = text.slice(index);
    let length = 0;
    while (length < previous.length && length < current.length && previous[length] === current[length]) length += 1;
    return length;
  });
}

function occurrences(text, pattern) {
  let count = 0;
  for (let i = 0; i + pattern.length <= text.length; i += 1) {
    if (text.slice(i, i + pattern.length) === pattern) count += 1;
  }
  return count;
}

const SUFFIX_STRINGS = ['banana', 'abab', 'aabaa', 'mississippi', 'abcabx', 'cacao', 'tatat', 'zebra', 'level', 'radar', 'tenet', 'banter', 'cocoon', 'papaya', 'ananas', 'banan', 'kayak', 'stats', 'rotor', 'abracadabra'];

export function buildStringQuestions() {
  const rand = makeRng(0x63c7);
  const qs = [];

  for (let i = 0; i < 30; i += 1) {
    const words = [];
    while (words.length < randInt(rand, 3, 5)) {
      const word = WORDS[randInt(rand, 0, WORDS.length - 1)];
      if (!words.includes(word)) words.push(word);
    }
    const { root, nodes } = buildTrie(words);
    const prefix = words[0].slice(0, Math.max(1, Math.min(2, words[0].length - 1)));
    const matches = autocomplete(root, prefix);
    qs.push(mcq({
      id: `strings-trie-nodes-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Words ${list(words)} are inserted into a trie (counting the root). How many nodes does it contain?`,
      correct: `${nodes}`,
      distractors: [`${nodes + 1}`, `${Math.max(1, nodes - 1)}`, `${words.join('').length}`],
      explanation: `Shared prefixes merge, leaving ${nodes} nodes including the root.`,
    }, rand));
    qs.push(mcq({
      id: `strings-trie-prefix-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A trie contains ${list(words)}. How many stored words start with "${prefix}"?`,
      correct: `${countPrefix(root, prefix)}`,
      distractors: [`${countPrefix(root, prefix) + 1}`, `${Math.max(0, countPrefix(root, prefix) - 1)}`, `${words.length}`],
      explanation: `Walking the prefix path and counting terminals in its subtree gives ${countPrefix(root, prefix)}.`,
    }, rand));
    qs.push(mcq({
      id: `strings-trie-completions-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A trie contains ${list(words)}. Which words are returned for the prefix "${prefix}"?`,
      correct: matches.length ? list(matches) : 'No words',
      distractors: [list(words), list(words.slice(0, matches.length + 1)), list([prefix])],
      explanation: `The subtree under "${prefix}" contains ${matches.join(', ') || 'no words'}.`,
    }, rand));
  }

  SUFFIX_STRINGS.forEach((text, i) => {
    const sa = suffixArray(text);
    qs.push(mcq({
      id: `strings-sa-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `What is the suffix array of "${text}"?`,
      correct: list(sa).replace('[', '[').replace(']', ']'),
      distractors: [
        list(sa.map((index) => text.length - 1 - index)),
        list(Array.from({ length: text.length }, (_, index) => index)),
        list([...sa].reverse()),
      ],
      explanation: `Sorting the suffixes of "${text}" lexicographically gives indexes ${sa.join(', ')}.`,
    }, rand));
    const lcp = lcpArray(text, sa);
    qs.push(mcq({
      id: `strings-lcp-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `For "${text}" with suffix array ${list(sa)}, what is the LCP value at suffix-array position 2?`,
      correct: `${lcp[2]}`,
      distractors: [`${lcp[2] + 1}`, `${Math.max(0, lcp[2] - 1)}`, `${text.length}`],
      explanation: `LCP[2] compares suffixes at ${sa[1]} and ${sa[2]}, sharing ${lcp[2]} characters.`,
    }, rand));
    if (i < 8) {
      const pattern = text.slice(0, 3);
      qs.push(mcq({
        id: `strings-occurrences-${i}`,
        topic: TOPIC,
        difficulty: 'medium',
        question: `How many times does "${pattern}" occur in "${text}" (overlapping matches allowed)?`,
        correct: `${occurrences(text, pattern)}`,
        distractors: [`${occurrences(text, pattern) + 1}`, `${Math.max(0, occurrences(text, pattern) - 1)}`, `${text.length}`],
        explanation: `Scanning all start positions counts ${occurrences(text, pattern)} occurrence(s).`,
      }, rand));
    }
  });

  // Suffix trie node counts for distinct-character strings.
  for (let length = 4; length <= 16; length += 1) {
    const nodes = (length * (length + 1)) / 2 + 1;
    qs.push(mcq({
      id: `strings-suffix-trie-${length}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A string of length ${length} has all distinct characters. How many nodes does its suffix trie have (including the root)?`,
      correct: `${nodes}`,
      distractors: [`${nodes - 1}`, `${length * length}`, `${2 * length}`],
      explanation: `All suffixes share only the root: 1 + 1 + 2 + … + ${length} = ${nodes}.`,
    }, rand));
  }

  // Suffix tree bounds.
  for (let length = 5; length <= 19; length += 1) {
    qs.push(mcq({
      id: `strings-suffix-tree-${length}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `What is the maximum number of nodes in a suffix tree for a string of length ${length}?`,
      correct: `${2 * length - 1}`,
      distractors: [`${length}`, `${length * length}`, `${2 * length + 1}`],
      explanation: 'A compact suffix tree has at most 2n − 1 nodes including the root.',
    }, rand));
  }

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'strings', concepts: [...STRING_CONCEPTS, ...STRING_EASY_CONCEPTS], rand })],
    (question) => question.id,
  );
}
