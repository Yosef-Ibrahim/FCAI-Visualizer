// ── Shared utilities for the Suffix Suite (Trie, Tree, Array) ────────────────
// Framework-free pure JS. Deterministic code-point ordering where '$' < all.

export const SENTINEL = '$';

export const SUFFIX_PRESETS = ['banana', 'ababa', 'mississippi', 'gattaca'];

/**
 * Validate input text for suffix structure construction.
 * Trims surrounding whitespace; rejects empty, internal whitespace, sentinel '$',
 * and strings exceeding `maxLen` Unicode code points.
 */
export function validateSuffixText(raw, maxLen = 16) {
  const trimmed = raw == null ? '' : String(raw).trim();
  if (!trimmed) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.emptyText', maxLen };
  }
  if (/\s/u.test(trimmed)) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.whitespace', maxLen };
  }
  if (trimmed.includes(SENTINEL)) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.sentinelForbidden', maxLen };
  }
  const chars = Array.from(trimmed);
  if (chars.length > maxLen) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.tooLong', maxLen };
  }
  return { ok: true, value: trimmed, chars, errorKey: null, maxLen };
}

/**
 * Validate a substring search pattern.
 * Trims surrounding whitespace; rejects empty or strings containing '$'.
 */
export function validatePattern(raw) {
  const trimmed = raw == null ? '' : String(raw).trim();
  if (!trimmed) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.emptyPattern' };
  }
  if (trimmed.includes(SENTINEL)) {
    return { ok: false, value: '', chars: [], errorKey: 'suffix:errors.sentinelForbidden' };
  }
  return { ok: true, value: trimmed, chars: Array.from(trimmed), errorKey: null };
}

/**
 * Deterministic single-character comparator where SENTINEL ('$') is strictly
 * smaller than every other Unicode code point. Never uses localeCompare.
 */
export function compareChar(a, b) {
  if (a === b) return 0;
  if (a === SENTINEL) return -1;
  if (b === SENTINEL) return 1;
  return a.codePointAt(0) - b.codePointAt(0);
}

/**
 * Deterministic lexicographic comparator between two suffixes starting at code-point
 * indices `a` and `b` within `textWithSentinel` (string or pre-split char array).
 * Guarantees '$' is strictly smaller than every other character.
 */
export function compareSuffixes(textWithSentinel, a, b) {
  if (a === b) return 0;
  const chars = Array.isArray(textWithSentinel) ? textWithSentinel : Array.from(textWithSentinel);
  const len = chars.length;
  let offset = 0;
  while (a + offset < len && b + offset < len) {
    const diff = compareChar(chars[a + offset], chars[b + offset]);
    if (diff !== 0) return diff;
    offset += 1;
  }
  return (len - a) - (len - b);
}

/**
 * Compare a search pattern against the prefix of suffix `T[suffixStart..]` of length
 * `pattern.length`. Returns:
 *   < 0 if pattern < suffix prefix
 *     0 if suffix starts with pattern
 *   > 0 if pattern > suffix prefix
 */
export function comparePatternToSuffix(textWithSentinel, suffixStart, pattern) {
  const chars = Array.isArray(textWithSentinel) ? textWithSentinel : Array.from(textWithSentinel);
  const pChars = Array.isArray(pattern) ? pattern : Array.from(pattern);
  for (let i = 0; i < pChars.length; i += 1) {
    if (suffixStart + i >= chars.length) return 1;
    const diff = compareChar(pChars[i], chars[suffixStart + i]);
    if (diff !== 0) return diff;
  }
  return 0;
}
