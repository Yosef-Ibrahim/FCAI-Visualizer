import { describe, it, expect, beforeAll } from 'vitest';
import i18n from '../i18n/i18n';
import { getAllAlgorithms } from './AlgorithmRegistry';
import {
  compressHuffman,
  compressModifiedHuffman,
  compressAdaptiveHuffman,
} from '../algorithms/compression/huffman.js';
import { compressArithmetic } from '../algorithms/compression/arithmetic.js';
import { compressLZ77 } from '../algorithms/compression/lz77.js';
import { compressLZ78, compressLZW } from '../algorithms/compression/dictionary.js';
import { compressDPCM, compressLinearPrediction, compressDCT } from '../algorithms/compression/lossy.js';
import { HashTable } from '../algorithms/dataStructures/HashTable.js';
import { buildSuffixTrie, searchSuffixTrie } from '../algorithms/suffix/SuffixTrie.js';
import { buildSuffixArray, searchSuffixArray } from '../algorithms/suffix/SuffixArray.js';
import { buildSuffixTree, searchSuffixTree } from '../algorithms/suffix/SuffixTree.js';

// `npm run i18n:check` compares the locale bundles with each other. It does
// not check the other direction: that the keys the code actually emits exist
// in a bundle. That is what this file covers.
const SAMPLE_TEXT = 'banana bandana';
const SAMPLE_BLOCK = Array.from({ length: 8 }, (_, row) => (
  Array.from({ length: 8 }, (_, column) => 24 + (row * 13) + (column * 7))
));

const compressionSteps = () => [
  ...compressHuffman(SAMPLE_TEXT).steps,
  ...compressModifiedHuffman(SAMPLE_TEXT).steps,
  ...compressAdaptiveHuffman(SAMPLE_TEXT).steps,
  ...compressArithmetic(SAMPLE_TEXT).steps,
  ...compressLZ77(SAMPLE_TEXT).steps,
  ...compressLZ78(SAMPLE_TEXT).steps,
  ...compressLZW(SAMPLE_TEXT).steps,
  ...compressDPCM([10, 12, 9, 15], 2).steps,
  ...compressLinearPrediction([10, 12, 9, 15], { stepSize: 2, coefficients: [0.75, -0.25] }).steps,
  ...compressDCT(SAMPLE_BLOCK, 8).steps,
];

beforeAll(async () => {
  // The locale bundles are loaded lazily by i18next — wait for them, otherwise
  // every lookup would fall back to the raw key.
  await i18n.loadNamespaces(['steps', 'catalog', 'hashing', 'suffix', 'dp', 'greedy']);
});

describe('translation keys used by the algorithms', () => {
  it('resolves every key an algorithm step emits', () => {
    const missing = [];

    for (const algorithm of getAllAlgorithms()) {
      for (const step of algorithm.generateSteps(algorithm.getDefaultInput())) {
        if (!step.msgKey) continue;

        const resolved = i18n.t(step.msgKey, step.msgParams ?? {});
        if (resolved === step.msgKey) missing.push(`${algorithm.id}: ${step.msgKey}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('resolves every key a compression step emits', () => {
    const missing = [];

    for (const step of compressionSteps()) {
      if (!step.msgKey) continue;

      const resolved = i18n.t(step.msgKey, step.msgParams ?? {});
      if (resolved === step.msgKey) missing.push(step.msgKey);
    }

    expect(missing).toEqual([]);
  });

  it('resolves every key emitted by hashing and suffix engines', () => {
    const hashTable = new HashTable(7, 'linear');
    const hashSteps = [
      ...hashTable.insert(10).steps,
      ...hashTable.insert(17).steps,
      ...hashTable.search(17).steps,
      ...hashTable.delete(10).steps,
      ...hashTable.rehash().steps,
    ];
    const trieBuilt = buildSuffixTrie('banana');
    const trieSearch = searchSuffixTrie(trieBuilt.root, trieBuilt.textWithSentinel, 'ana');
    const arrBuilt = buildSuffixArray('banana');
    const arrSearch = searchSuffixArray(arrBuilt.textWithSentinel, arrBuilt.sa, 'ana');
    const treeBuilt = buildSuffixTree('banana');
    const treeSearch = searchSuffixTree(treeBuilt.root, treeBuilt.textWithSentinel, 'ana');

    const allSteps = [
      ...hashSteps,
      ...trieBuilt.steps,
      ...trieSearch.steps,
      ...arrBuilt.steps,
      ...arrSearch.steps,
      ...treeBuilt.steps,
      ...treeSearch.steps,
    ];
    const missing = [];

    for (const step of allSteps) {
      if (!step.msgKey) continue;
      const resolved = i18n.t(step.msgKey, step.msgParams ?? {});
      if (resolved === step.msgKey) missing.push(step.msgKey);
    }

    expect(missing).toEqual([]);
  });

  it('interpolates the parameters a step carries', () => {
    const algorithm = getAllAlgorithms().find((candidate) => candidate.id === 'bubble');
    const step = algorithm.generateSteps(algorithm.getDefaultInput())[0];

    const resolved = i18n.t(step.msgKey, step.msgParams ?? {});

    expect(resolved).not.toContain('{{');
  });
});
