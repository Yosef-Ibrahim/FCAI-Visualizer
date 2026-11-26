// ── Practice bank: trees (BST, AVL, red-black, B-tree) ─────────────────────
// Trees are built with small local implementations so every structural answer
// (root, height, traversal, rotation) is computed rather than transcribed.

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'trees';

const TREE_CONCEPTS = [
  { lvl: 'easy', q: 'In a binary search tree, where are values smaller than a node stored?', a: 'In its left subtree', d: ['In its right subtree', 'In the root', 'In any subtree'], e: 'BST order requires left subtree < node < right subtree.' },
  { lvl: 'easy', q: 'Which traversal of a BST visits values in ascending order?', a: 'In-order', d: ['Pre-order', 'Post-order', 'Level-order'], e: 'In-order visits left subtree, node, then right subtree.' },
  { lvl: 'medium', q: 'What is the worst-case height of a BST with n nodes?', a: 'n − 1 edges', d: ['⌊log₂ n⌋ edges', '⌈n / 2⌉ edges', 'Always 1 edge'], e: 'Inserting sorted values creates a chain of n nodes.' },
  { lvl: 'medium', q: 'What is the best-case height of a BST with n nodes?', a: '⌊log₂ n⌋ edges', d: ['n − 1 edges', 'n / 2 edges', '1 edge'], e: 'A balanced tree halves the remaining nodes at every level.' },
  { lvl: 'easy', q: 'Which traversal visits a node before its children?', a: 'Pre-order', d: ['In-order', 'Post-order', 'Level-order'], e: 'Pre-order is node, left, right.' },
  { lvl: 'easy', q: 'Which traversal visits both children before the node?', a: 'Post-order', d: ['Pre-order', 'In-order', 'Level-order'], e: 'Post-order is left, right, node.' },
  { lvl: 'medium', q: 'Which traversal uses a queue?', a: 'Level-order (breadth-first)', d: ['Pre-order', 'In-order', 'Post-order'], e: 'Level-order processes nodes level by level with FIFO order.' },
  { lvl: 'medium', q: 'What is the search cost in a balanced BST of n nodes?', a: 'O(log n)', d: ['O(1)', 'O(n)', 'O(n log n)'], e: 'Each comparison discards one subtree, and the height is logarithmic.' },
  { lvl: 'medium', q: 'Deleting a node with two children from a BST replaces it with which value?', a: 'Its in-order successor or predecessor', d: ['The smallest value in the tree', 'The root value', 'A random leaf'], e: 'The successor or predecessor preserves BST ordering.' },
  { lvl: 'medium', q: 'What is the in-order successor of a node in a BST?', a: 'The smallest value greater than the node', d: ['The largest value smaller than the node', 'The node’s left child', 'The root'], e: 'It is the leftmost node of the right subtree, or the lowest ancestor whose left subtree contains the node.' },
  { lvl: 'medium', q: 'Where is the minimum value of a BST found?', a: 'By following left children from the root', d: ['By following right children', 'At the root', 'In the last inserted node'], e: 'The leftmost node holds the minimum.' },
  { lvl: 'medium', q: 'Where is the maximum value of a BST found?', a: 'By following right children from the root', d: ['By following left children', 'At the root', 'At any leaf'], e: 'The rightmost node holds the maximum.' },
  { lvl: 'medium', q: 'What does the balance factor of an AVL node equal?', a: 'Height(left) − height(right)', d: ['Height(left) + height(right)', 'Number of left nodes − right nodes', 'Depth − height'], e: 'AVL keeps the balance factor in {−1, 0, 1}.' },
  { lvl: 'medium', q: 'Which balance factors are allowed for every AVL node?', a: '−1, 0 or 1', d: ['−2 to 2', '0 only', 'Any integer'], e: 'Larger magnitudes trigger a rotation.' },
  { lvl: 'easy', q: 'In the project convention, what is the height of an empty AVL subtree?', a: '−1', d: ['0', '1', 'Undefined'], e: 'A leaf has height 0, so an empty subtree is one below it at −1.' },
  { lvl: 'medium', q: 'An AVL insertion creates a left-left imbalance. Which rotation restores balance?', a: 'A single right rotation', d: ['A single left rotation', 'A left-right double rotation', 'A right-left double rotation'], e: 'The left child is too tall on its left, so one right rotation fixes it.' },
  { lvl: 'medium', q: 'An AVL insertion creates a right-right imbalance. Which rotation restores balance?', a: 'A single left rotation', d: ['A single right rotation', 'A left-right double rotation', 'A right-left double rotation'], e: 'The right child is too tall on its right, so one left rotation fixes it.' },
  { lvl: 'medium', q: 'An AVL insertion creates a left-right imbalance. Which rotation restores balance?', a: 'Left rotation on the child, then right rotation on the node', d: ['A single right rotation', 'A single left rotation', 'Right then left rotation'], e: 'The inner grandchild must be lifted first.' },
  { lvl: 'medium', q: 'An AVL insertion creates a right-left imbalance. Which rotation restores balance?', a: 'Right rotation on the child, then left rotation on the node', d: ['A single left rotation', 'A single right rotation', 'Left then right rotation'], e: 'The inner grandchild is rotated right before the node rotates left.' },
  { lvl: 'hard', q: 'What is the maximum number of rotations for one AVL insertion?', a: '2', d: ['1', '3', 'O(log n)'], e: 'A double rotation is the worst case for insertion.' },
  { lvl: 'hard', q: 'What is the maximum number of rotations for one AVL deletion?', a: 'O(log n)', d: ['1', '2', 'O(n)'], e: 'A deletion can unbalance every ancestor on the path.' },
  { lvl: 'medium', q: 'What is the height of an AVL tree with n nodes bounded by?', a: 'About 1.44 log₂ n', d: ['n − 1', '2n', 'log₂ log₂ n'], e: 'AVL height is at most about 1.44 log₂(n + 2) − 0.33.' },
  { lvl: 'easy', q: 'What color must the root of a red-black tree be?', a: 'Black', d: ['Red', 'Either red or black', 'It depends on the height'], e: 'The root is always black by the red-black rules.' },
  { lvl: 'medium', q: 'Can a red node have a red child in a red-black tree?', a: 'No', d: ['Yes, always', 'Only at the root', 'Only in the left subtree'], e: 'Red nodes must have black children.' },
  { lvl: 'medium', q: 'Every path from a red-black node to its NIL leaves contains the same number of which nodes?', a: 'Black nodes', d: ['Red nodes', 'Leaves', 'Left children'], e: 'Equal black height is the core balancing rule.' },
  { lvl: 'medium', q: 'What color is a newly inserted red-black node before fix-up?', a: 'Red', d: ['Black', 'It alternates', 'It takes the parent’s color'], e: 'Inserting red avoids changing black height, then violations are repaired.' },
  { lvl: 'medium', q: 'What is the maximum number of rotations during one red-black insertion?', a: '2', d: ['1', '3', 'O(log n)'], e: 'Recoloring handles the rest of the fix-up.' },
  { lvl: 'medium', q: 'What is the maximum number of rotations during one red-black deletion?', a: '3', d: ['1', '2', 'O(log n)'], e: 'At most three rotations plus recoloring are needed.' },
  { lvl: 'medium', q: 'Which tree guarantees O(log n) search with fewer rotations than AVL?', a: 'Red-black tree', d: ['Plain BST', 'AVL tree', 'Binary heap'], e: 'Red-black trees allow more height variation but rebalance less often.' },
  { lvl: 'medium', q: 'What is the maximum height of a red-black tree with n internal nodes?', a: '2 log₂(n + 1)', d: ['log₂ n', 'n − 1', '√n'], e: 'Black height is at least half the total height, giving the 2 log bound.' },
  { lvl: 'medium', q: 'How many NIL leaves does a red-black tree with n internal nodes have?', a: 'n + 1', d: ['n', 'n − 1', '2n'], e: 'Every binary tree with n internal nodes has n + 1 external leaves.' },
  { lvl: 'medium', q: 'In a B-tree of order m, what is the maximum number of keys in a node?', a: 'm − 1', d: ['m', 'm + 1', '⌈m / 2⌉'], e: 'A node with m − 1 keys has exactly m children.' },
  { lvl: 'medium', q: 'In a B-tree of order m, what is the minimum number of keys in a non-root node?', a: '⌈m / 2⌉ − 1', d: ['⌈m / 2⌉', 'm − 1', '1'], e: 'Non-root nodes must stay at least half full.' },
  { lvl: 'medium', q: 'When a B-tree node overflows, which key is promoted to the parent?', a: 'The median key', d: ['The smallest key', 'The largest key', 'The most recently inserted key'], e: 'Splitting around the median keeps both halves balanced.' },
  { lvl: 'medium', q: 'Where do all leaves of a B-tree sit?', a: 'At the same depth', d: ['At varying depths', 'Only on the left', 'Only on the right'], e: 'B-trees are perfectly height-balanced.' },
  { lvl: 'medium', q: 'Which tree stores several keys per node to reduce disk accesses?', a: 'B-tree', d: ['Binary search tree', 'AVL tree', 'Trie'], e: 'High fan-out keeps the height small, reducing I/O.' },
  { lvl: 'medium', q: 'Which variant stores all keys in the leaves and links those leaves?', a: 'B+ tree', d: ['B-tree', 'AVL tree', 'Red-black tree'], e: 'Linked leaves make range scans efficient.' },
  { lvl: 'hard', q: 'What is the worst-case height of a B-tree of order m with n keys?', a: 'O(log_m n)', d: ['O(n)', 'O(log₂ n) always', 'O(m n)'], e: 'Each level multiplies the number of children by at least ⌈m / 2⌉.' },
  { lvl: 'medium', q: 'What is the tree height convention used by this project’s AVL nodes?', a: 'Leaf height 0, empty subtree −1', d: ['Leaf height 1, empty 0', 'Root height 0 only', 'Height counts nodes, empty is 1'], e: 'The project’s AVL code uses 0 for a leaf and −1 for an empty subtree.' },
  { lvl: 'hard', q: 'What is the maximum number of nodes in a binary tree of height h (height counted in edges)?', a: '2^(h + 1) − 1', d: ['2^h', '2^h − 1', 'h²'], e: 'Every level is full: 1 + 2 + … + 2^h = 2^(h + 1) − 1.' },
  { lvl: 'medium', q: 'In a binary tree, how many nodes have exactly one child at most?', a: 'It depends on the tree shape', d: ['Exactly one', 'Never more than one', 'Always half the nodes'], e: 'Unary nodes depend on structure, not a fixed rule.' },
  { lvl: 'medium', q: 'A complete binary tree of n nodes has height equal to which value?', a: '⌊log₂ n⌋', d: ['n / 2', 'n − 1', '⌈n / 2⌉'], e: 'A complete tree fills levels from left to right.' },
];

function node(value) {
  return { v: value, l: null, r: null };
}

function insertBst(root, value) {
  if (!root) return node(value);
  if (value < root.v) root.l = insertBst(root.l, value);
  else if (value > root.v) root.r = insertBst(root.r, value);
  return root;
}

function buildBst(values) {
  return values.reduce((root, value) => insertBst(root, value), null);
}

function height(root) {
  if (!root) return -1;
  return 1 + Math.max(height(root.l), height(root.r));
}

function inorder(root, out = []) {
  if (!root) return out;
  inorder(root.l, out);
  out.push(root.v);
  inorder(root.r, out);
  return out;
}

function preorder(root, out = []) {
  if (!root) return out;
  out.push(root.v);
  preorder(root.l, out);
  preorder(root.r, out);
  return out;
}

function postorder(root, out = []) {
  if (!root) return out;
  postorder(root.l, out);
  postorder(root.r, out);
  out.push(root.v);
  return out;
}

function countNodes(root) {
  if (!root) return 0;
  return 1 + countNodes(root.l) + countNodes(root.r);
}

function countLeaves(root) {
  if (!root) return 0;
  if (!root.l && !root.r) return 1;
  return countLeaves(root.l) + countLeaves(root.r);
}

function searchComparisons(root, value) {
  let current = root;
  let comparisons = 0;
  while (current) {
    comparisons += 1;
    if (value === current.v) return { found: true, comparisons };
    current = value < current.v ? current.l : current.r;
  }
  return { found: false, comparisons };
}

function avlHeight(root) {
  return root ? root.h : -1;
}

function avlUpdate(root) {
  root.h = 1 + Math.max(avlHeight(root.l), avlHeight(root.r));
}

function rotateLeft(root) {
  const pivot = root.r;
  root.r = pivot.l;
  pivot.l = root;
  avlUpdate(root);
  avlUpdate(pivot);
  return pivot;
}

function rotateRight(root) {
  const pivot = root.l;
  root.l = pivot.r;
  pivot.r = root;
  avlUpdate(root);
  avlUpdate(pivot);
  return pivot;
}

function insertAvl(root, value, rotations = []) {
  if (!root) return { v: value, l: null, r: null, h: 0 };
  if (value < root.v) root.l = insertAvl(root.l, value, rotations);
  else if (value > root.v) root.r = insertAvl(root.r, value, rotations);
  else return root;
  avlUpdate(root);
  const balance = avlHeight(root.l) - avlHeight(root.r);
  if (balance > 1) {
    if (value < root.l.v) {
      rotations.push('LL');
      return rotateRight(root);
    }
    rotations.push('LR');
    root.l = rotateLeft(root.l);
    return rotateRight(root);
  }
  if (balance < -1) {
    if (value > root.r.v) {
      rotations.push('RR');
      return rotateLeft(root);
    }
    rotations.push('RL');
    root.r = rotateRight(root.r);
    return rotateLeft(root);
  }
  return root;
}

function buildAvl(values) {
  const rotations = [];
  let root = null;
  for (const value of values) root = insertAvl(root, value, rotations);
  return { root, rotations };
}

function uniqueSequences(rand, count, length, max) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard += 1;
    const values = [];
    while (values.length < length) {
      const value = randInt(rand, 1, max);
      if (!values.includes(value)) values.push(value);
    }
    const key = values.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(values);
  }
  return out;
}

const ROTATION_LABEL = {
  LL: 'A single right rotation (LL case)',
  RR: 'A single left rotation (RR case)',
  LR: 'A left-right double rotation (LR case)',
  RL: 'A right-left double rotation (RL case)',
};

export function buildTreesQuestions() {
  const rand = makeRng(0x35d1);
  const qs = [];

  const sequences = uniqueSequences(rand, 20, randInt(rand, 6, 8), 60);
  sequences.forEach((values, i) => {
    const root = buildBst(values);
    qs.push(mcq({
      id: `trees-bst-root-${i}`,
      topic: TOPIC,
      subtopic: 'bst',
      difficulty: 'medium',
      question: `Values ${list(values)} are inserted into an empty BST in this order. Which value becomes the root?`,
      correct: `${values[0]}`,
      distractors: [inorder(root)[0], inorder(root)[inorder(root).length - 1], values[values.length - 1]],
      explanation: 'The first inserted value becomes the root; later values move left or right.',
    }, rand));
    qs.push(mcq({
      id: `trees-bst-height-${i}`,
      topic: TOPIC,
      subtopic: 'bst',
      difficulty: 'hard',
      question: `A BST is built by inserting ${list(values)}. What is its height in edges (a single node has height 0)?`,
      correct: `${height(root)}`,
      distractors: [height(root) + 1, Math.max(0, height(root) - 1), countNodes(root) - 1],
      explanation: `The longest root-to-leaf path contains ${height(root)} edges.`,
    }, rand));
    qs.push(mcq({
      id: `trees-bst-inorder-${i}`,
      topic: TOPIC,
      subtopic: 'bst',
      difficulty: 'medium',
      question: `What is the in-order traversal of the BST built from ${list(values)}?`,
      correct: list(inorder(root)),
      distractors: [list(preorder(root)), list(postorder(root)), list([...values].reverse())],
      explanation: 'An in-order traversal of a BST returns the keys in ascending order.',
    }, rand));
    if (i < 12) {
      const target = values[randInt(rand, 0, values.length - 1)];
      const found = searchComparisons(root, target);
      qs.push(mcq({
        id: `trees-bst-search-${i}`,
        topic: TOPIC,
        subtopic: 'bst',
        difficulty: 'hard',
        question: `Searching the BST built from ${list(values)} for ${target}. How many node comparisons are needed?`,
        correct: `${found.comparisons}`,
        distractors: [found.comparisons + 1, Math.max(1, found.comparisons - 1), countNodes(root)],
        explanation: `The search path compares one node per level and finds ${target} after ${found.comparisons} comparisons.`,
      }, rand));
    }
    if (i < 8) {
      qs.push(mcq({
        id: `trees-bst-leaves-${i}`,
        topic: TOPIC,
        subtopic: 'bst',
        difficulty: 'medium',
        question: `The BST built from ${list(values)} has how many leaves?`,
        correct: `${countLeaves(root)}`,
        distractors: [countLeaves(root) + 1, Math.max(1, countLeaves(root) - 1), countNodes(root)],
        explanation: `Leaves are nodes without children; this tree has ${countLeaves(root)}.`,
      }, rand));
    }
  });

  const avlSequences = uniqueSequences(rand, 10, 7, 40);
  avlSequences.forEach((values, i) => {
    const { root } = buildAvl(values);
    qs.push(mcq({
      id: `trees-avl-root-${i}`,
      topic: TOPIC,
      subtopic: 'avl',
      difficulty: 'hard',
      question: `Values ${list(values)} are inserted into an empty AVL tree. Which value is at the root afterwards?`,
      correct: `${root.v}`,
      distractors: [values[0], values[values.length - 1], inorder(root)[Math.floor(inorder(root).length / 2)]],
      explanation: `Rotations during insertion leave ${root.v} at the root.`,
    }, rand));
    qs.push(mcq({
      id: `trees-avl-height-${i}`,
      topic: TOPIC,
      subtopic: 'avl',
      difficulty: 'hard',
      question: `After inserting ${list(values)} into an AVL tree, what is its height in edges?`,
      correct: `${height(root)}`,
      distractors: [height(root) + 1, Math.max(0, height(root) - 1), values.length - 1],
      explanation: `AVL balancing keeps the height at ${height(root)} for these ${values.length} keys.`,
    }, rand));
    qs.push(mcq({
      id: `trees-avl-inorder-${i}`,
      topic: TOPIC,
      subtopic: 'avl',
      difficulty: 'medium',
      question: `What is the in-order traversal of the AVL tree built from ${list(values)}?`,
      correct: list(inorder(root)),
      distractors: [list(preorder(root)), list(postorder(root)), list([...values].reverse())],
      explanation: 'Rotations change the shape but not the BST in-order sequence.',
    }, rand));
  });

  const rotationCases = [
    { values: [30, 20, 10], expected: 'LL' },
    { values: [100, 200, 300], expected: 'RR' },
    { values: [30, 10, 20], expected: 'LR' },
    { values: [10, 30, 20], expected: 'RL' },
    { values: [50, 40, 30], expected: 'LL' },
    { values: [5, 15, 25], expected: 'RR' },
    { values: [60, 20, 40], expected: 'LR' },
    { values: [20, 60, 40], expected: 'RL' },
  ];
  rotationCases.forEach((testCase, i) => {
    const { rotations } = buildAvl(testCase.values);
    const rotation = rotations[0] ?? testCase.expected;
    qs.push(mcq({
      id: `trees-avl-rotation-${i}`,
      topic: TOPIC,
      subtopic: 'avl',
      difficulty: 'medium',
      question: `Inserting ${list(testCase.values)} into an empty AVL tree triggers which rotation?`,
      correct: ROTATION_LABEL[rotation],
      distractors: Object.values(ROTATION_LABEL).filter((label) => label !== ROTATION_LABEL[rotation]),
      explanation: `The imbalance matches the ${rotation} case, fixed by ${ROTATION_LABEL[rotation].toLowerCase()}.`,
    }, rand));
  });

  // Red-black numeric facts.
  for (let blackHeight = 1; blackHeight <= 8; blackHeight += 1) {
    const minimum = 2 ** blackHeight - 1;
    qs.push(mcq({
      id: `trees-rb-min-${blackHeight}`,
      topic: TOPIC,
      subtopic: 'red-black',
      difficulty: 'hard',
      question: `A red-black tree has black-height ${blackHeight}. What is the minimum number of internal nodes it can contain?`,
      correct: `${minimum}`,
      distractors: [2 ** blackHeight, 2 ** blackHeight + 1, blackHeight * 2],
      explanation: `A black node with black-height bh needs at least 2^bh − 1 internal nodes: 2^${blackHeight} − 1 = ${minimum}.`,
    }, rand));
  }
  [7, 15, 31, 63, 100, 255, 1000].forEach((size) => {
    const bound = Math.ceil(2 * Math.log2(size + 1));
    qs.push(mcq({
      id: `trees-rb-height-${size}`,
      topic: TOPIC,
      subtopic: 'red-black',
      difficulty: 'hard',
      question: `What is the maximum height of a red-black tree with ${size} internal nodes?`,
      correct: `${bound}`,
      distractors: [Math.ceil(Math.log2(size + 1)), bound + 1, Math.ceil(size / 2)],
      explanation: `Height ≤ 2 log₂(n + 1) = 2 log₂(${size + 1}) ≈ ${bound}.`,
    }, rand));
  });
  [3, 6, 9, 12, 20].forEach((size) => {
    qs.push(mcq({
      id: `trees-rb-nil-${size}`,
      topic: TOPIC,
      subtopic: 'red-black',
      difficulty: 'medium',
      question: `A red-black tree has ${size} internal nodes. How many NIL leaves (external nodes) does it have?`,
      correct: `${size + 1}`,
      distractors: [`${size}`, `${size - 1}`, `${size * 2}`],
      explanation: 'Every binary tree with n internal nodes has n + 1 external leaves.',
    }, rand));
  });

  // B-tree arithmetic for orders 3–10.
  for (let order = 3; order <= 10; order += 1) {
    const minKeys = Math.ceil(order / 2) - 1;
    qs.push(mcq({
      id: `trees-btree-max-${order}`,
      topic: TOPIC,
      subtopic: 'b-tree',
      difficulty: 'medium',
      question: `A B-tree has order ${order}. What is the maximum number of keys in one node?`,
      correct: `${order - 1}`,
      distractors: [`${order}`, `${order + 1}`, `${Math.ceil(order / 2)}`],
      explanation: 'A node with m − 1 keys has m children, which is the order.',
    }, rand));
    qs.push(mcq({
      id: `trees-btree-min-${order}`,
      topic: TOPIC,
      subtopic: 'b-tree',
      difficulty: 'medium',
      question: `A B-tree has order ${order}. What is the minimum number of keys in a non-root node?`,
      correct: `${minKeys}`,
      distractors: [`${Math.ceil(order / 2)}`, `${order - 1}`, '1'],
      explanation: `⌈m / 2⌉ − 1 = ⌈${order} / 2⌉ − 1 = ${minKeys}.`,
    }, rand));
    qs.push(mcq({
      id: `trees-btree-children-${order}`,
      topic: TOPIC,
      subtopic: 'b-tree',
      difficulty: 'medium',
      question: `What is the maximum number of children of a B-tree node of order ${order}?`,
      correct: `${order}`,
      distractors: [`${order - 1}`, `${order + 1}`, `${minKeys + 1}`],
      explanation: 'Order m is defined as the maximum number of children in a node.',
    }, rand));
  }

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'trees', concepts: TREE_CONCEPTS, rand })],
    (question) => question.id,
  );
}
