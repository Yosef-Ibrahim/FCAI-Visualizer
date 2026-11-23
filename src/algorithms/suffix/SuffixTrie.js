// ── Suffix Trie engine (pure JS, immutable step snapshots) ──────────────────
import {
  SENTINEL,
  compareChar,
  validatePattern,
  validateSuffixText,
} from './suffixUtils.js';

export const MAX_SUFFIX_TRIE_LEN = 10;

function createNode(id, char, depth) {
  return {
    id,
    char,
    depth,
    suffixIndex: null,
    children: new Map(),
  };
}

function snapshotTree(node) {
  const children = Array.from(node.children.values())
    .sort((a, b) => compareChar(a.char, b.char))
    .map(snapshotTree);
  return {
    id: node.id,
    char: node.char,
    depth: node.depth,
    suffixIndex: node.suffixIndex,
    children,
  };
}

function collectSubtree(node, positions, nodeIds) {
  nodeIds.push(node.id);
  if (node.suffixIndex !== null) {
    positions.push(node.suffixIndex);
  }
  for (const child of node.children) {
    collectSubtree(child, positions, nodeIds);
  }
}

/**
 * Build a Suffix Trie for `rawText` (appending sentinel '$') and record immutable
 * step-by-step snapshots suitable for interactive playback.
 */
export function buildSuffixTrie(rawText) {
  const validation = validateSuffixText(rawText, MAX_SUFFIX_TRIE_LEN);
  if (!validation.ok) {
    return {
      ok: false,
      errorKey: validation.errorKey,
      maxLen: MAX_SUFFIX_TRIE_LEN,
      text: '',
      textWithSentinel: '',
      root: null,
      stats: { nodes: 0, edges: 0, leaves: 0 },
      steps: [],
    };
  }

  const text = validation.value;
  const chars = [...validation.chars, SENTINEL];
  const textWithSentinel = chars.join('');
  const n = validation.chars.length;

  let nextId = 0;
  const root = createNode(`n${nextId++}`, '', 0);
  let nodeCount = 1;
  let leafCount = 0;
  const steps = [];

  const makeStats = () => ({
    nodes: nodeCount,
    edges: nodeCount - 1,
    leaves: leafCount,
  });

  steps.push({
    type: 'init',
    root: snapshotTree(root),
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [root.id],
    createdNodeId: root.id,
    matchedNodeIds: [],
    matchRanges: [],
    stats: makeStats(),
    msg: `Initialized empty Suffix Trie root for "${textWithSentinel}" (${n + 1} suffixes).`,
    msgKey: 'suffix:steps.trieInit',
    msgParams: { text: textWithSentinel, count: n + 1 },
  });

  for (let suffixIndex = 0; suffixIndex <= n; suffixIndex += 1) {
    let current = root;
    const path = [root.id];
    const suffixText = chars.slice(suffixIndex).join('');

    for (let cursor = suffixIndex; cursor < chars.length; cursor += 1) {
      const ch = chars[cursor];
      const existing = current.children.get(ch);

      if (existing) {
        current = existing;
        path.push(current.id);
        steps.push({
          type: 'traverse',
          root: snapshotTree(root),
          activeSuffixIndex: suffixIndex,
          activeSuffixEnd: chars.length - 1,
          cursorIndex: cursor,
          activePathNodeIds: [...path],
          createdNodeId: null,
          matchedNodeIds: [],
          matchRanges: [],
          stats: makeStats(),
          msg: `Suffix #${suffixIndex} ("${suffixText}"): reused edge '${ch}' at index ${cursor}.`,
          msgKey: 'suffix:steps.trieTraverse',
          msgParams: { suffixIndex, suffix: suffixText, char: ch, cursor },
        });
      } else {
        const created = createNode(`n${nextId++}`, ch, current.depth + 1);
        current.children.set(ch, created);
        nodeCount += 1;
        const isLeaf = cursor === chars.length - 1;
        if (isLeaf) {
          created.suffixIndex = suffixIndex;
          leafCount += 1;
        }
        current = created;
        path.push(current.id);

        steps.push({
          type: isLeaf ? 'leaf' : 'create',
          root: snapshotTree(root),
          activeSuffixIndex: suffixIndex,
          activeSuffixEnd: chars.length - 1,
          cursorIndex: cursor,
          activePathNodeIds: [...path],
          createdNodeId: created.id,
          matchedNodeIds: [],
          matchRanges: [],
          stats: makeStats(),
          msg: isLeaf
            ? `Suffix #${suffixIndex} ("${suffixText}"): added sentinel leaf '${ch}' marking start index ${suffixIndex}.`
            : `Suffix #${suffixIndex} ("${suffixText}"): created node '${ch}' at index ${cursor}.`,
          msgKey: isLeaf ? 'suffix:steps.trieLeaf' : 'suffix:steps.trieCreate',
          msgParams: { suffixIndex, suffix: suffixText, char: ch, cursor },
        });
      }
    }
  }

  const finalRoot = snapshotTree(root);
  const finalStats = makeStats();

  steps.push({
    type: 'complete',
    root: finalRoot,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [],
    createdNodeId: null,
    matchedNodeIds: [],
    matchRanges: [],
    stats: finalStats,
    msg: `Suffix Trie complete: ${finalStats.nodes} nodes, ${finalStats.edges} edges, ${finalStats.leaves} leaves.`,
    msgKey: 'suffix:steps.trieComplete',
    msgParams: finalStats,
  });

  return {
    ok: true,
    errorKey: null,
    text,
    textWithSentinel,
    root: finalRoot,
    stats: finalStats,
    steps,
  };
}

function countTreeStats(root) {
  if (!root) return { nodes: 0, edges: 0, leaves: 0 };
  let nodes = 0;
  let leaves = 0;
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    nodes += 1;
    if (node.suffixIndex !== null) leaves += 1;
    for (const child of node.children) stack.push(child);
  }
  return { nodes, edges: Math.max(0, nodes - 1), leaves };
}

/**
 * Trace a pattern from the Suffix Trie root char-by-char and collect all
 * descendant leaf `suffixIndex` values sorted ascending.
 */
export function searchSuffixTrie(treeRoot, textWithSentinel, rawPattern) {
  const validation = validatePattern(rawPattern);
  if (!validation.ok) {
    return {
      ok: false,
      errorKey: validation.errorKey,
      found: false,
      positions: [],
      steps: [],
    };
  }
  if (!treeRoot) {
    return {
      ok: false,
      errorKey: 'suffix:errors.emptyText',
      found: false,
      positions: [],
      steps: [],
    };
  }

  const pattern = validation.value;
  const pChars = validation.chars;
  const stats = countTreeStats(treeRoot);
  const steps = [];
  const path = [treeRoot.id];
  let current = treeRoot;

  steps.push({
    type: 'search-start',
    root: treeRoot,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [...path],
    createdNodeId: null,
    matchedNodeIds: [],
    matchRanges: [],
    stats,
    msg: `Starting substring search for "${pattern}" at the root.`,
    msgKey: 'suffix:steps.searchStart',
    msgParams: { pattern },
  });

  for (let i = 0; i < pChars.length; i += 1) {
    const ch = pChars[i];
    const next = current.children.find((child) => child.char === ch);
    if (!next) {
      steps.push({
        type: 'search-miss',
        root: treeRoot,
        activeSuffixIndex: -1,
        activeSuffixEnd: -1,
        cursorIndex: -1,
        activePathNodeIds: [...path],
        createdNodeId: null,
        matchedNodeIds: [],
        matchRanges: [],
        stats,
        msg: `No outgoing edge for '${ch}' (pattern index ${i}). "${pattern}" is not a substring.`,
        msgKey: 'suffix:steps.trieSearchMiss',
        msgParams: { char: ch, index: i, pattern },
      });
      return {
        ok: true,
        errorKey: null,
        found: false,
        positions: [],
        steps,
      };
    }

    current = next;
    path.push(current.id);
    steps.push({
      type: 'search-char',
      root: treeRoot,
      activeSuffixIndex: -1,
      activeSuffixEnd: -1,
      cursorIndex: -1,
      activePathNodeIds: [...path],
      createdNodeId: null,
      matchedNodeIds: [],
      matchRanges: [],
      stats,
      msg: `Matched character '${ch}' (${i + 1}/${pChars.length}) along the trie path.`,
      msgKey: 'suffix:steps.trieSearchChar',
      msgParams: { char: ch, step: i + 1, total: pChars.length },
    });
  }

  const positions = [];
  const matchedNodeIds = [];
  collectSubtree(current, positions, matchedNodeIds);
  positions.sort((a, b) => a - b);

  const matchRanges = positions.map((pos) => [pos, pos + pChars.length]);

  steps.push({
    type: 'search-found',
    root: treeRoot,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [...path],
    createdNodeId: null,
    matchedNodeIds,
    matchRanges,
    positions,
    stats,
    msg: `Found "${pattern}" at ${positions.length} position(s): ${positions.join(', ')}.`,
    msgKey: 'suffix:steps.searchFound',
    msgParams: {
      pattern,
      count: positions.length,
      positions: positions.join(', '),
    },
  });

  return {
    ok: true,
    errorKey: null,
    found: positions.length > 0,
    positions,
    steps,
  };
}
