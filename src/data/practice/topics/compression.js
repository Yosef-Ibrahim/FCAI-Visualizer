// ── Practice bank: information theory & compression ────────────────────────
// Huffman code lengths, entropy and LZ77 token counts are computed from the
// input, matching the lossless/lossy course pages.

import { conceptBatch, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'compression';

const COMPRESSION_CONCEPTS = [
  { lvl: 'easy', q: 'What distinguishes lossless from lossy compression?', a: 'Lossless restores the exact original data', d: ['Lossless is always smaller', 'Lossy is always reversible', 'They are the same'], e: 'Lossy compression discards some information permanently.' },
  { lvl: 'medium', q: 'Which technique assigns shorter codes to more frequent symbols?', a: 'Huffman coding', d: ['Run-length encoding', 'Fixed-length coding', 'LZ77'], e: 'Frequency-based codes reduce average length.' },
  { lvl: 'medium', q: 'What property must a Huffman code have to be decodable?', a: 'Prefix-free (no codeword is a prefix of another)', d: ['All codes have equal length', 'Codes are sorted alphabetically', 'Codes contain no zeros'], e: 'A prefix-free code parses uniquely without separators.' },
  { lvl: 'medium', q: 'What does entropy measure in information theory?', a: 'The average information per symbol', d: ['The file size in bytes', 'The number of symbols', 'The compression speed'], e: 'Entropy gives the theoretical minimum average code length.' },
  { lvl: 'easy', q: 'Which data does run-length encoding compress best?', a: 'Long runs of identical symbols', d: ['Random data', 'Alternating symbols', 'Sorted numbers only'], e: 'Each run becomes a count plus the symbol.' },
  { lvl: 'medium', q: 'What is the minimum average code length for a source with entropy H?', a: 'H bits per symbol', d: ['8 bits per symbol', 'H² bits per symbol', '1 bit per symbol'], e: 'Shannon’s source coding theorem sets H as the lower bound.' },
  { lvl: 'medium', q: 'Which coding method represents a message as a narrowing interval?', a: 'Arithmetic coding', d: ['Huffman coding', 'LZ77', 'DPCM'], e: 'The message maps to a fraction inside cumulative probability intervals.' },
  { lvl: 'medium', q: 'What is the main advantage of arithmetic coding over Huffman coding?', a: 'It can approach the entropy bound more closely', d: ['It is always faster', 'It needs no probabilities', 'It is lossy'], e: 'Fractional bits per symbol avoid Huffman’s integer-length inefficiency.' },
  { lvl: 'medium', q: 'What does LZ77 encode?', a: 'A backward offset, a match length and the next symbol', d: ['A frequency table', 'A DCT matrix', 'A quantization step'], e: 'Repeated sequences become references into the search buffer.' },
  { lvl: 'medium', q: 'What is the search buffer in LZ77?', a: 'The already-processed symbols available for matching', d: ['The unread future symbols', 'The output codes', 'A frequency table'], e: 'Matches point backward into this window.' },
  { lvl: 'medium', q: 'What does LZ78 build while encoding?', a: 'A dictionary of phrases', d: ['A Huffman tree', 'A DCT block', 'A quantization table'], e: 'New phrases are added to the dictionary with integer indexes.' },
  { lvl: 'medium', q: 'What does LZW emit?', a: 'Codes for dictionary phrases while growing the dictionary', d: ['Offsets and lengths only', 'Quantized coefficients', 'Raw bytes only'], e: 'It starts with single-symbol entries and adds longer phrases.' },
  { lvl: 'medium', q: 'Which lossy method predicts each sample from previous reconstructed samples?', a: 'DPCM', d: ['Huffman coding', 'LZ77', 'Run-length encoding'], e: 'Differential pulse-code modulation encodes prediction errors.' },
  { lvl: 'medium', q: 'What does DCT stand for?', a: 'Discrete Cosine Transform', d: ['Digital Compression Table', 'Discrete Coefficient Tree', 'Data Coding Transform'], e: 'It converts a block of samples into frequency coefficients.' },
  { lvl: 'medium', q: 'Why does JPEG quantize DCT coefficients?', a: 'High-frequency detail can be discarded with little visible loss', d: ['To make the image larger', 'To remove color entirely', 'To sort the pixels'], e: 'Quantization zeroes small high-frequency coefficients.' },
  { lvl: 'medium', q: 'What does a larger quantization step do?', a: 'Discards more detail and reduces quality', d: ['Improves quality and increases size', 'Has no effect', 'Makes the transform lossless'], e: 'Coarser steps zero more coefficients.' },
  { lvl: 'medium', q: 'How is MSE computed between an original and reconstructed signal?', a: 'The mean of squared differences', d: ['The sum of absolute differences', 'The maximum difference', 'The ratio of lengths'], e: 'MSE averages the squared error per sample.' },
  { lvl: 'medium', q: 'What does a higher PSNR indicate?', a: 'Better reconstruction quality', d: ['Worse quality', 'A smaller file always', 'A lossless codec'], e: 'PSNR grows as MSE shrinks.' },
  { lvl: 'medium', q: 'Which compression type is JPEG typically?', a: 'Lossy', d: ['Lossless', 'Reversible', 'Dictionary-only'], e: 'Standard JPEG discards quantized high-frequency information.' },
  { lvl: 'medium', q: 'Which compression type is ZIP typically?', a: 'Lossless', d: ['Lossy', 'Irreversible', 'Transform-only'], e: 'ZIP restores the exact original bytes.' },
  { lvl: 'medium', q: 'What is the compression ratio?', a: 'Original size ÷ compressed size', d: ['Compressed size ÷ original size', 'Original − compressed', 'Bits per symbol'], e: 'A ratio above 1 means the data shrank.' },
  { lvl: 'medium', q: 'What does a fixed-length code use for every symbol?', a: 'The same number of bits', d: ['A frequency-dependent number of bits', 'Zero bits', 'Only one bit'], e: 'Fixed-length codes ignore symbol frequencies.' },
  { lvl: 'medium', q: 'Why is a fixed-length code inefficient for skewed frequencies?', a: 'Frequent symbols use more bits than necessary', d: ['It cannot encode rare symbols', 'It is lossy', 'It requires a dictionary'], e: 'Variable-length codes exploit the frequency imbalance.' },
  { lvl: 'hard', q: 'What does the Kraft inequality constrain?', a: 'The lengths of prefix-free codewords', d: ['The number of symbols', 'The entropy value', 'The file size'], e: 'Σ 2^(−length) ≤ 1 for a prefix-free code.' },
  { lvl: 'medium', q: 'In a Huffman tree, where are the most frequent symbols?', a: 'Closest to the root', d: ['Furthest from the root', 'Always on the left', 'At the root itself'], e: 'Shorter root paths mean shorter codes.' },
  { lvl: 'medium', q: 'What is a codebook in Huffman decompression?', a: 'The mapping from codewords to symbols', d: ['A list of file names', 'The original text', 'A quantization table'], e: 'The decoder needs the code lengths or the tree to parse bits.' },
  { lvl: 'medium', q: 'What happens to the Huffman code when symbol frequencies are all equal?', a: 'Code lengths become nearly equal', d: ['One symbol gets 0 bits', 'The code becomes lossy', 'The tree becomes a single node'], e: 'Balanced weights give a balanced tree.' },
  { lvl: 'medium', q: 'What is the adaptive Huffman advantage?', a: 'No frequency table needs to be transmitted first', d: ['It always compresses better', 'It is lossy', 'It needs no tree updates'], e: 'The model updates as symbols arrive.' },
  { lvl: 'medium', q: 'Which compression is best for a fax of black-and-white text lines?', a: 'Run-length encoding', d: ['DCT quantization', 'Arithmetic coding of pixels', 'LZ78 without runs'], e: 'Long runs of white pixels dominate the image.' },
  { lvl: 'medium', q: 'What is the main cost of dictionary-based compression?', a: 'Memory for the dictionary', d: ['Loss of exact recovery', 'Transform computation', 'Color conversion'], e: 'The encoder and decoder must maintain the phrase table.' },
  { lvl: 'medium', q: 'Which of these is NOT a lossless technique?', a: 'DCT quantization', d: ['Huffman coding', 'LZ77', 'Run-length encoding'], e: 'Quantization discards information.' },
  { lvl: 'medium', q: 'What does a match length of 0 mean in an LZ77 token?', a: 'No match was found; the next symbol is emitted literally', d: ['The input ended', 'The dictionary is full', 'The offset is invalid'], e: 'A zero-length match encodes a single literal symbol.' },
  { lvl: 'medium', q: 'How many bits does a fixed 8-bit code use for 100 symbols?', a: '800', d: ['100', '8', '108'], e: '8 bits × 100 symbols = 800 bits.' },
  { lvl: 'medium', q: 'If a file shrinks from 1000 bytes to 250 bytes, what is the compression ratio?', a: '4:1', d: ['1:4', '2:1', '250:1'], e: 'Original ÷ compressed = 1000 ÷ 250 = 4.' },
  { lvl: 'medium', q: 'Which transform is used in JPEG to move from pixels to frequencies?', a: 'DCT', d: ['Huffman transform', 'LZ transform', 'Run-length transform'], e: 'The DCT concentrates energy in low-frequency coefficients.' },
  { lvl: 'medium', q: 'Why is the DC coefficient in a DCT block often large?', a: 'It represents the average brightness of the block', d: ['It stores the highest frequency', 'It is always zero', 'It encodes the file header'], e: 'The DC term is proportional to the block mean.' },
  { lvl: 'medium', q: 'What is quantization in lossy compression?', a: 'Rounding coefficients to a coarser grid', d: ['Reordering bytes', 'Building a dictionary', 'Computing entropy'], e: 'Coarse rounding discards small details.' },
  { lvl: 'medium', q: 'What does PSNR stand for?', a: 'Peak Signal-to-Noise Ratio', d: ['Pixel Sampling Noise Ratio', 'Predicted Signal Normalization Rate', 'Peak Sample Number Ratio'], e: 'It compares peak signal power with reconstruction noise.' },
  { lvl: 'medium', q: 'Which sequence gives the smallest compressed size?', a: 'AAAAAAAABBBB', d: ['ABCDEFGHIJKL', 'ABABABABABAB', 'A1B2C3D4'], e: 'Long runs compress extremely well with run-length encoding.' },
  { lvl: 'medium', q: 'Which sequence is worst for run-length encoding?', a: 'ABABABABAB', d: ['AAAAAAAABB', 'AAAAAAAAAA', 'BBBBBBBBBB'], e: 'No run is longer than one symbol.' },
  { lvl: 'medium', q: 'What is the entropy of a fair coin toss in bits?', a: '1', d: ['0', '2', '0.5'], e: 'Two equally likely outcomes carry one bit each.' },
  { lvl: 'medium', q: 'What is the entropy of a symbol that always appears?', a: '0', d: ['1', '8', 'Undefined'], e: 'A certain event carries no information.' },
  { lvl: 'medium', q: 'Which lossy technique predicts a sample from a linear combination of previous samples?', a: 'Linear predictive coding', d: ['Huffman coding', 'LZW', 'Run-length encoding'], e: 'The predictor coefficients weight past reconstructed values.' },
  { lvl: 'medium', q: 'What does decompression of lossy data produce?', a: 'An approximation of the original', d: ['The exact original', 'A larger file than the original always', 'A compressed file'], e: 'Discarded information cannot be recovered.' },
];

function huffman(frequencies) {
  let nodes = Object.entries(frequencies).map(([symbol, weight]) => ({ symbol, weight, left: null, right: null }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight || String(a.symbol).localeCompare(String(b.symbol)));
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({ symbol: null, weight: left.weight + right.weight, left, right });
  }
  const lengths = {};
  const walk = (node, depth) => {
    if (!node) return;
    if (node.symbol !== null) {
      lengths[node.symbol] = depth;
      return;
    }
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  };
  walk(nodes[0], 0);
  return lengths;
}

function entropy(frequencies, total) {
  return Number(
    Object.values(frequencies).reduce((sum, weight) => {
      const probability = weight / total;
      return sum - probability * Math.log2(probability);
    }, 0).toFixed(2),
  );
}

function rleLength(text) {
  let runs = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (i === 0 || text[i] !== text[i - 1]) runs += 1;
  }
  return runs;
}

function lz77TokenCount(text, searchSize = 8, lookaheadSize = 5) {
  let position = 0;
  let tokens = 0;
  while (position < text.length) {
    const searchStart = Math.max(0, position - searchSize);
    const search = text.slice(searchStart, position);
    const lookahead = text.slice(position, position + lookaheadSize);
    let best = 0;
    for (let i = 0; i < search.length; i += 1) {
      let length = 0;
      while (
        length < lookahead.length
        && i + length < search.length
        && search[i + length] === lookahead[length]
      ) length += 1;
      if (length > best) best = length;
    }
    tokens += 1;
    position += best + 1;
  }
  return tokens;
}

const SAMPLE_TEXTS = [
  'ABABABABAB', 'AAAAABBBBB', 'ABCABCABCABC', 'ABRACADABRA', 'TOBEORNOTTOBE',
  'MISSISSIPPI', 'BANANA', 'COMPRESSIONCOMPRESSION', 'LZ77LZ78LZW', 'ABABABABCDCDCDCD',
  'HELLOHELLOHELLO', 'XYXYXYXYXYZ', 'RUNLENGTHRUNLENGTH', 'AABBAABBAABB', 'CATCATCATDOGDOG',
];

export function buildCompressionQuestions() {
  const rand = makeRng(0x2f81);
  const qs = [];

  // Huffman code lengths and total cost.
  for (let i = 0; i < 32; i += 1) {
    const symbols = ['A', 'B', 'C', 'D'].slice(0, randInt(rand, 3, 4));
    const frequencies = {};
    for (const symbol of symbols) frequencies[symbol] = randInt(rand, 1, 12);
    const lengths = huffman(frequencies);
    const target = symbols[randInt(rand, 0, symbols.length - 1)];
    const total = Object.entries(frequencies).reduce((sum, [symbol, weight]) => sum + weight * lengths[symbol], 0);
    const description = Object.entries(frequencies).map(([symbol, weight]) => `${symbol}:${weight}`).join(', ');
    qs.push(mcq({
      id: `comp-huffman-length-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A Huffman tree is built for frequencies ${description}. How many bits does the code for ${target} use?`,
      correct: `${lengths[target]}`,
      distractors: [`${lengths[target] + 1}`, `${Math.max(1, lengths[target] - 1)}`, `${symbols.length}`],
      explanation: `The Huffman merge order places ${target} at depth ${lengths[target]}, giving a ${lengths[target]}-bit code.`,
    }, rand));
    qs.push(mcq({
      id: `comp-huffman-total-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Frequencies ${description} are Huffman-coded. What is the total number of bits for all symbols?`,
      correct: `${total}`,
      distractors: [`${total + 2}`, `${Math.max(0, total - 2)}`, `${Object.values(frequencies).reduce((sum, weight) => sum + weight, 0) * 2}`],
      explanation: `Σ frequency × code length = ${total} bits.`,
    }, rand));
  }

  // Fixed-length comparison.
  for (let i = 0; i < 12; i += 1) {
    const symbols = randInt(rand, 4, 16);
    const length = Math.ceil(Math.log2(symbols || 2));
    qs.push(mcq({
      id: `comp-fixed-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A fixed-length binary code must represent ${symbols} distinct symbols. How many bits are needed per symbol?`,
      correct: `${length}`,
      distractors: [`${Math.max(1, length - 1)}`, `${length + 1}`, `${symbols}`],
      explanation: `⌈log₂ ${symbols}⌉ = ${length}.`,
    }, rand));
  }

  // Entropy.
  for (let i = 0; i < 18; i += 1) {
    const symbols = ['A', 'B', 'C', 'D'].slice(0, randInt(rand, 2, 4));
    const frequencies = {};
    for (const symbol of symbols) frequencies[symbol] = randInt(rand, 1, 10);
    const total = Object.values(frequencies).reduce((sum, weight) => sum + weight, 0);
    const value = entropy(frequencies, total);
    qs.push(mcq({
      id: `comp-entropy-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `A source emits frequencies ${Object.entries(frequencies).map(([symbol, weight]) => `${symbol}:${weight}`).join(', ')}. What is its entropy in bits per symbol (2 decimals)?`,
      correct: `${value}`,
      distractors: [`${Number((value + 0.5).toFixed(2))}`, `${Number(Math.max(0, value - 0.5).toFixed(2))}`, `${Number(Math.log2(total).toFixed(2))}`],
      explanation: `H = −Σ p log₂ p = ${value} bits per symbol.`,
    }, rand));
  }

  // Compression ratios.
  for (let i = 0; i < 18; i += 1) {
    const original = randInt(rand, 400, 4000);
    const compressed = randInt(rand, Math.floor(original / 5), Math.floor(original / 2));
    const ratio = Number((original / compressed).toFixed(2));
    qs.push(mcq({
      id: `comp-ratio-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A file of ${original} bytes compresses to ${compressed} bytes. What is the compression ratio (original ÷ compressed)?`,
      correct: `${ratio}:1`,
      distractors: [`1:${ratio}`, `${Number((compressed / original).toFixed(2))}:1`, `${original - compressed}:1`],
      explanation: `${original} ÷ ${compressed} = ${ratio}.`,
    }, rand));
  }

  // Run-length encoding.
  SAMPLE_TEXTS.forEach((text, i) => {
    const runs = rleLength(text);
    qs.push(mcq({
      id: `comp-rle-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `How many runs does run-length encoding produce for "${text}"?`,
      correct: `${runs}`,
      distractors: [`${runs + 1}`, `${Math.max(1, runs - 1)}`, `${text.length}`],
      explanation: `A new run starts whenever the symbol changes, giving ${runs} runs.`,
    }, rand));
    qs.push(mcq({
      id: `comp-lz-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Using a greedy LZ77 parse with a search buffer of 8 and look-ahead of 5, how many tokens are emitted for "${text}"?`,
      correct: `${lz77TokenCount(text)}`,
      distractors: [`${lz77TokenCount(text) + 1}`, `${Math.max(1, lz77TokenCount(text) - 1)}`, `${text.length}`],
      explanation: `Following each longest match and its next literal gives ${lz77TokenCount(text)} tokens.`,
    }, rand));
  });

  // Quantization error.
  for (let i = 0; i < 20; i += 1) {
    const step = randInt(rand, 2, 10);
    const value = randInt(rand, -40, 60);
    const quantized = Math.round(value / step) * step;
    qs.push(mcq({
      id: `comp-quantize-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A coefficient ${value} is quantized with step ${step} as round(value / step) × step. What is the quantized value?`,
      correct: `${quantized}`,
      distractors: [`${Math.floor(value / step) * step}`, `${quantized + step}`, `${value}`],
      explanation: `round(${value} / ${step}) × ${step} = ${quantized}.`,
    }, rand));
  }

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'compression', concepts: COMPRESSION_CONCEPTS, rand })],
    (question) => question.id,
  );
}
