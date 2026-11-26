// ── Practice bank core ───────────────────────────────────────────────────────
// Pure, framework-free helpers shared by every topic generator. Question banks
// are built deterministically at load time, so the app stays offline and the
// tests can assert the exact schema. No React, no DOM, no network.

export const LETTERS = ['A', 'B', 'C', 'D'];

/** Small deterministic PRNG (mulberry32) so a topic always builds the same set. */
export function makeRng(seed = 1) {
  let state = seed >>> 0;
  return function next() {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}

export function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

export function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PADDING_DISTRACTORS = ['None of the above', 'Cannot be determined', 'Not applicable'];

/**
 * Build one four-option multiple-choice question.
 * `correct` and `distractors` are plain strings; the builder shuffles them,
 * prefixes A–D and records the matching answer letter.
 */
export function mcq(spec, rand = Math.random) {
  const correct = String(spec.correct);
  const seen = new Set([correct]);
  const distractors = [];

  for (const candidate of spec.distractors ?? []) {
    if (candidate === undefined || candidate === null) continue;
    const text = String(candidate);
    if (seen.has(text)) continue;
    seen.add(text);
    distractors.push(text);
    if (distractors.length === 3) break;
  }

  for (const fallback of PADDING_DISTRACTORS) {
    if (distractors.length === 3) break;
    if (seen.has(fallback)) continue;
    seen.add(fallback);
    distractors.push(fallback);
  }

  const options = shuffle([correct, ...distractors], rand);
  const answerIndex = options.indexOf(correct);

  return {
    id: spec.id,
    topic: spec.topic,
    difficulty: spec.difficulty ?? 'medium',
    question: spec.question,
    options: options.map((text, index) => `${LETTERS[index]}) ${text}`),
    correctAnswer: LETTERS[answerIndex],
    explanation: spec.explanation,
    algorithm: spec.algorithm ?? null,
    subtopic: spec.subtopic ?? null,
    tags: spec.tags ?? [],
    source: 'bank',
  };
}

/** Turn a compact concept list into questions, preserving author order. */
export function conceptBatch({ topic, prefix, concepts, rand, subtopic = null }) {
  return concepts.map((concept, index) => mcq(
    {
      id: `${prefix}-c${index + 1}`,
      topic,
      difficulty: concept.lvl ?? 'medium',
      question: concept.q,
      correct: concept.a,
      distractors: concept.d,
      explanation: concept.e,
      algorithm: concept.algo ?? null,
      subtopic: concept.subtopic ?? subtopic,
      tags: concept.tags ?? [],
    },
    rand,
  ));
}

/** Readable array literal, e.g. [4, 7, 2] — used in question prompts. */
export function list(values) {
  return `[${values.join(', ')}]`;
}

/** Shuffle once, then take a fixed number of distinct generated items. */
export function uniqueBy(items, keyOf) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
