// ── Suffix Tree (Compressed Suffix Trie MVP) engine (pure JS) ───────────────
import {
  SENTINEL,
  compareChar,
  validatePattern,
  validateSuffixText,
} from './suffixUtils.js';

export const MAX_SUFFIX_TREE_LEN = 16;

function createTreeNode(id, start = -1, end = -1, label = '', suffixIndex = null) {
  return {
    id,
    edge: start >= 0 ? { start, end, label } : null,
    suffixIndex,
    children: new Map(), // keyed by first character of child edge
  };
}

function snapshotNode(node, depth = 0) {
  const children = Array.from(node.children.entries())
    .sort(([charA], [charB]) => compareChar(charA, charB))
    .map(([, child]) => snapshotNode(child, depth + 1));

  return {
    id: node.id,
    depth,
    suffixIndex: node.suffixIndex,
    edge: node.edge ? { ...node.edge } : null,
    children,
  };
}

function countSnapshotStats(root) {
  if (!root) return { nodes: 0, edges: 0, leaves: 0, internal: 0 };
  let nodes = 0;
  let leaves = 0;
  let internal = 0;
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    nodes += 1;
    if (cur.suffixIndex !== null) {
      leaves += 1;
    } else if (cur.id !== root.id) {
      internal += 1;
    }
    for (const child of cur.children) stack.push(child);
  }
  return { nodes, edges: Math.max(0, nodes - 1), leaves, internal };
}

function collectSubtreeLeaves(node, positions, nodeIds) {
  nodeIds.push(node.id);
  if (node.suffixIndex !== null) {
    positions.push(node.suffixIndex);
  }
  for (const child of node.children) {
    collectSubtreeLeaves(child, positions, nodeIds);
  }
}

/**
 * Build a compressed Suffix Tree (Compressed Suffix Trie MVP) for `rawText` + '$'.
 * Guarantees:
 *   - Every non-root internal node has >= 2 children
 *   - Sibling edges start with distinct characters
 *   - Leaf count === n + 1 (storing suffixIndex 0..n)
 *   - Total nodes <= 2 * (n + 1)
 *   - Each edge stores { start, end, label } with inclusive [start, end] indices
 */
export function buildSuffixTree(rawText) {
  const validation = validateSuffixText(rawText, MAX_SUFFIX_TREE_LEN);
  if (!validation.ok) {
    return {
      ok: false,
      errorKey: validation.errorKey,
      maxLen: MAX_SUFFIX_TREE_LEN,
      text: '',
      textWithSentinel: '',
      root: null,
      stats: { nodes: 0, edges: 0, leaves: 0, internal: 0 },
      steps: [],
    };
  }

  const text = validation.value;
  const chars = [...validation.chars, SENTINEL];
  const textWithSentinel = chars.join('');
  const n = validation.chars.length;
  const endAll = chars.length - 1;

  let nextId = 0;
  const root = createTreeNode(`t${nextId++}`);
  let nodeCount = 1;
  let leafCount = 0;
  let internalCount = 0;
  const steps = [];

  const makeStats = () => ({
    nodes: nodeCount,
    edges: nodeCount - 1,
    leaves: leafCount,
    internal: internalCount,
  });

  steps.push({
    type: 'init',
    root: snapshotNode(root),
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [root.id],
    createdNodeId: root.id,
    splitNodeId: null,
    matchedNodeIds: [],
    matchRanges: [],
    stats: makeStats(),
    msg: `Initialized compressed Suffix Tree root for "${textWithSentinel}" (${n + 1} suffixes).`,
    msgKey: 'suffix:steps.treeInit',
    msgParams: { text: textWithSentinel, count: n + 1 },
  });

  for (let suffixIndex = 0; suffixIndex <= n; suffixIndex += 1) {
    let current = root;
    let cursor = suffixIndex;
    const path = [root.id];
    const suffixText = chars.slice(suffixIndex).join('');

    while (cursor <= endAll) {
      const firstChar = chars[cursor];
      const child = current.children.get(firstChar);

      if (!child) {
        const label = chars.slice(cursor, endAll + 1).join('');
        const leaf = createTreeNode(`t${nextId++}`, cursor, endAll, label, suffixIndex);
        current.children.set(firstChar, leaf);
        nodeCount += 1;
        leafCount += 1;
        path.push(leaf.id);

        steps.push({
          type: 'attach-leaf',
          root: snapshotNode(root),
          activeSuffixIndex: suffixIndex,
          activeSuffixEnd: endAll,
          cursorIndex: cursor,
          activePathNodeIds: [...path],
          createdNodeId: leaf.id,
          splitNodeId: null,
          matchedNodeIds: [],
          matchRanges: [],
          stats: makeStats(),
          msg: `Suffix #${suffixIndex} ("${suffixText}"): attached compressed leaf edge "${label}" [${cursor}, ${endAll}].`,
          msgKey: 'suffix:steps.treeAttachLeaf',
          msgParams: {
            suffixIndex,
            suffix: suffixText,
            label,
            start: cursor,
            end: endAll,
          },
        });
        break;
      }

      // Match as many characters as possible along `child.edge`
      const edgeStart = child.edge.start;
      const edgeEnd = child.edge.end;
      const edgeLen = edgeEnd - edgeStart + 1;
      let matched = 0;
      while (
        matched < edgeLen
        && cursor + matched <= endAll
        && chars[edgeStart + matched] === chars[cursor + matched]
      ) {
        matched += 1;
      }

      if (matched === edgeLen) {
        // Consumed full edge — continue from `child`
        current = child;
        cursor += matched;
        path.push(child.id);

        steps.push({
          type: 'traverse-edge',
          root: snapshotNode(root),
          activeSuffixIndex: suffixIndex,
          activeSuffixEnd: endAll,
          cursorIndex: Math.min(endAll, cursor),
          activePathNodeIds: [...path],
          createdNodeId: null,
          splitNodeId: null,
          matchedNodeIds: [],
          matchRanges: [],
          stats: makeStats(),
          msg: `Suffix #${suffixIndex} ("${suffixText}"): matched full edge "${child.edge.label}" [${edgeStart}, ${edgeEnd}].`,
          msgKey: 'suffix:steps.treeTraverseEdge',
          msgParams: {
            suffixIndex,
            suffix: suffixText,
            label: child.edge.label,
            start: edgeStart,
            end: edgeEnd,
          },
        });
      } else {
        // Diverged inside edge — split `child.edge` at `matched`
        const splitPrefixEnd = edgeStart + matched - 1;
        const prefixLabel = chars.slice(edgeStart, splitPrefixEnd + 1).join('');
        const splitNode = createTreeNode(`t${nextId++}`, edgeStart, splitPrefixEnd, prefixLabel, null);

        const remainderStart = edgeStart + matched;
        const remainderLabel = chars.slice(remainderStart, edgeEnd + 1).join('');
        child.edge = { start: remainderStart, end: edgeEnd, label: remainderLabel };
        splitNode.children.set(chars[remainderStart], child);

        const newLeafStart = cursor + matched;
        const newLeafLabel = chars.slice(newLeafStart, endAll + 1).join('');
        const newLeaf = createTreeNode(`t${nextId++}`, newLeafStart, endAll, newLeafLabel, suffixIndex);
        splitNode.children.set(chars[newLeafStart], newLeaf);

        current.children.set(firstChar, splitNode);
        nodeCount += 2;
        internalCount += 1;
        leafCount += 1;
        path.push(splitNode.id, newLeaf.id);

        steps.push({
          type: 'split-edge',
          root: snapshotNode(root),
          activeSuffixIndex: suffixIndex,
          activeSuffixEnd: endAll,
          cursorIndex: newLeafStart,
          activePathNodeIds: [...path],
          createdNodeId: newLeaf.id,
          splitNodeId: splitNode.id,
          matchedNodeIds: [],
          matchRanges: [],
          stats: makeStats(),
          msg: `Suffix #${suffixIndex} ("${suffixText}"): split edge at "${prefixLabel}", branching "${remainderLabel}" and new leaf "${newLeafLabel}".`,
          msgKey: 'suffix:steps.treeSplitEdge',
          msgParams: {
            suffixIndex,
            suffix: suffixText,
            prefix: prefixLabel,
            oldBranch: remainderLabel,
            newBranch: newLeafLabel,
          },
        });
        break;
      }
    }
  }

  const finalRoot = snapshotNode(root);
  const finalStats = makeStats();

  steps.push({
    type: 'complete',
    root: finalRoot,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [],
    createdNodeId: null,
    splitNodeId: null,
    matchedNodeIds: [],
    matchRanges: [],
    stats: finalStats,
    msg: `Suffix Tree complete: ${finalStats.nodes} nodes (${finalStats.internal} internal, ${finalStats.leaves} leaves).`,
    msgKey: 'suffix:steps.treeComplete',
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

/**
 * Search a compressed Suffix Tree for `rawPattern` by matching along multi-character
 * edge labels and collecting all descendant leaf `suffixIndex` values sorted ascending.
 */
export function searchSuffixTree(root, textWithSentinel, rawPattern) {
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
  if (!root) {
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
  const stats = countSnapshotStats(root);
  const steps = [];
  const path = [root.id];
  let current = root;
  let pIdx = 0;

  steps.push({
    type: 'search-start',
    root,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    activePathNodeIds: [...path],
    createdNodeId: null,
    splitNodeId: null,
    matchedNodeIds: [],
    matchRanges: [],
    stats,
    msg: `Starting substring search for "${pattern}" at the Suffix Tree root.`,
    msgKey: 'suffix:steps.searchStart',
    msgParams: { pattern },
  });

  while (pIdx < pChars.length) {
    const targetChar = pChars[pIdx];
    const child = current.children.find((node) => {
      const first = node.edge ? Array.from(node.edge.label)[0] : '';
      return first === targetChar;
    });

    if (!child) {
      steps.push({
        type: 'search-miss',
        root,
        activeSuffixIndex: -1,
        activeSuffixEnd: -1,
        cursorIndex: -1,
        activePathNodeIds: [...path],
        createdNodeId: null,
        splitNodeId: null,
        matchedNodeIds: [],
        matchRanges: [],
        stats,
        msg: `No edge starts with '${targetChar}'. "${pattern}" is not in the text.`,
        msgKey: 'suffix:steps.treeSearchNoEdge',
        msgParams: { char: targetChar, pattern },
      });
      return { ok: true, errorKey: null, found: false, positions: [], steps };
    }

    const edgeChars = Array.from(child.edge.label);
    let k = 0;
    while (k < edgeChars.length && pIdx + k < pChars.length && edgeChars[k] === pChars[pIdx + k]) {
      k += 1;
    }

    path.push(child.id);

    if (pIdx + k === pChars.length) {
      const positions = [];
      const matchedNodeIds = [];
      collectSubtreeLeaves(child, positions, matchedNodeIds);
      positions.sort((a, b) => a - b);
      const matchRanges = positions.map((pos) => [pos, pos + pChars.length]);

      steps.push({
        type: 'search-found',
        root,
        activeSuffixIndex: -1,
        activeSuffixEnd: -1,
        cursorIndex: -1,
        activePathNodeIds: [...path],
        createdNodeId: null,
        splitNodeId: null,
        matchedNodeIds,
        matchRanges,
        positions,
        stats,
        msg: `Matched "${pattern}" on edge "${child.edge.label}" → ${positions.length} occurrence(s): ${positions.join(', ')}.`,
        msgKey: 'suffix:steps.searchFound',
        msgParams: {
          pattern,
          count: positions.length,
          positions: positions.join(', '),
        },
      });

      return { ok: true, errorKey: null, found: true, positions, steps };
    }

    if (k < edgeChars.length) {
      steps.push({
        type: 'search-miss',
        root,
        activeSuffixIndex: -1,
        activeSuffixEnd: -1,
        cursorIndex: -1,
        activePathNodeIds: [...path],
        createdNodeId: null,
        splitNodeId: null,
        matchedNodeIds: [],
        matchRanges: [],
        stats,
        msg: `Mismatch inside edge "${child.edge.label}": expected '${pChars[pIdx + k]}', saw '${edgeChars[k]}'.`,
        msgKey: 'suffix:steps.treeSearchMismatch',
        msgParams: {
          label: child.edge.label,
          expected: pChars[pIdx + k],
          actual: edgeChars[k],
        },
      });
      return { ok: true, errorKey: null, found: false, positions: [], steps };
    }

    pIdx += k;
    current = child;
    steps.push({
      type: 'search-edge',
      root,
      activeSuffixIndex: -1,
      activeSuffixEnd: -1,
      cursorIndex: -1,
      activePathNodeIds: [...path],
      createdNodeId: null,
      splitNodeId: null,
      matchedNodeIds: [],
      matchRanges: [],
      stats,
      msg: `Matched full edge "${child.edge.label}" (${pIdx}/${pChars.length} chars matched).`,
      msgKey: 'suffix:steps.treeSearchEdge',
      msgParams: { label: child.edge.label, matched: pIdx, total: pChars.length },
    });
  }

  return { ok: true, errorKey: null, found: false, positions: [], steps };
}

/**
 * Compute exact space comparison counts across all three suffix structures
 * for any valid string (up to 64 chars) without generating playback snapshots.
 * Returns `{ ok, trieNodes, treeNodes, saLength }`.
 */
export function computeSuffixSpaceStats(rawText) {
  const validation = validateSuffixText(rawText, 64);
  if (!validation.ok) {
    return { ok: false, trieNodes: 0, treeNodes: 0, saLength: 0 };
  }

  const chars = [...validation.chars, SENTINEL];
  const m = chars.length;
  const endAll = m - 1;

  // Lightweight Suffix Trie node count
  const trieRoot = new Map();
  let trieNodes = 1;
  for (let s = 0; s < m; s += 1) {
    let cur = trieRoot;
    for (let i = s; i < m; i += 1) {
      const ch = chars[i];
      let next = cur.get(ch);
      if (!next) {
        next = new Map();
        cur.set(ch, next);
        trieNodes += 1;
      }
      cur = next;
    }
  }

  // Lightweight Suffix Tree node count
  const treeRoot = { children: new Map() };
  let treeNodes = 1;
  for (let s = 0; s < m; s += 1) {
    let cur = treeRoot;
    let cursor = s;
    while (cursor <= endAll) {
      const ch = chars[cursor];
      const child = cur.children.get(ch);
      if (!child) {
        cur.children.set(ch, { start: cursor, end: endAll, children: new Map() });
        treeNodes += 1;
        break;
      }
      const edgeLen = child.end - child.start + 1;
      let k = 0;
      while (k < edgeLen && cursor + k <= endAll && chars[child.start + k] === chars[cursor + k]) {
        k += 1;
      }
      if (k === edgeLen) {
        cur = child;
        cursor += k;
      } else {
        const split = { start: child.start, end: child.start + k - 1, children: new Map() };
        child.start += k;
        split.children.set(chars[child.start], child);
        split.children.set(chars[cursor + k], { start: cursor + k, end: endAll, children: new Map() });
        cur.children.set(ch, split);
        treeNodes += 2;
        break;
      }
    }
  }

  return {
    ok: true,
    trieNodes,
    treeNodes,
    saLength: m,
  };
}
