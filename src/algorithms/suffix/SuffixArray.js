// ── Suffix Array + Kasai O(n) LCP + Binary Search engine (pure JS) ──────────
import {
  SENTINEL,
  comparePatternToSuffix,
  compareSuffixes,
  validatePattern,
  validateSuffixText,
} from './suffixUtils.js';

export const MAX_SUFFIX_ARRAY_LEN = 24;

/**
 * Build the Suffix Array (`sa`) and Kasai's O(n) LCP array (`lcp`) for `rawText`
 * (with appended sentinel '$'), emitting educational step snapshots across:
 *   1. Listing all unsorted suffixes
 *   2. Lexicographically sorting suffixes into SA
 *   3. Computing Kasai's O(n) LCP array (tracking rank[], h, and Longest Repeated Substring)
 */
export function buildSuffixArray(rawText) {
  const validation = validateSuffixText(rawText, MAX_SUFFIX_ARRAY_LEN);
  if (!validation.ok) {
    return {
      ok: false,
      errorKey: validation.errorKey,
      maxLen: MAX_SUFFIX_ARRAY_LEN,
      text: '',
      textWithSentinel: '',
      sa: [],
      lcp: [],
      rank: [],
      lrs: { length: 0, substring: '', positions: [], rank: -1 },
      steps: [],
    };
  }

  const text = validation.value;
  const chars = [...validation.chars, SENTINEL];
  const textWithSentinel = chars.join('');
  const m = chars.length;

  const unsorted = Array.from({ length: m }, (_, i) => i);
  const steps = [];

  // Phase 1: list all suffixes (0..n)
  steps.push({
    phase: 'list',
    order: [...unsorted],
    lcp: Array(m).fill(null),
    rank: [],
    sortedCount: 0,
    activeRows: [],
    matchedRows: [],
    lcpHighlightRow: -1,
    lcpHighlightLen: 0,
    kasai: null,
    search: null,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    matchRanges: [],
    lrs: { length: 0, substring: '', positions: [], rank: -1 },
    msg: `Listed all ${m} suffixes of "${textWithSentinel}" in original index order.`,
    msgKey: 'suffix:steps.saList',
    msgParams: { count: m, text: textWithSentinel },
  });

  // Phase 2: sort suffixes lexicographically (deterministic code-point comparator)
  const working = [...unsorted];
  for (let r = 0; r < m; r += 1) {
    let minIdx = r;
    for (let k = r + 1; k < m; k += 1) {
      if (compareSuffixes(chars, working[k], working[minIdx]) < 0) {
        minIdx = k;
      }
    }
    if (minIdx !== r) {
      const tmp = working[r];
      working[r] = working[minIdx];
      working[minIdx] = tmp;
    }
    const chosenStart = working[r];
    const suffixText = chars.slice(chosenStart).join('');
    steps.push({
      phase: 'sort',
      order: [...working],
      lcp: Array(m).fill(null),
      rank: [],
      sortedCount: r + 1,
      activeRows: [r],
      matchedRows: [],
      lcpHighlightRow: -1,
      lcpHighlightLen: 0,
      kasai: null,
      search: null,
      activeSuffixIndex: chosenStart,
      activeSuffixEnd: m - 1,
      cursorIndex: chosenStart,
      matchRanges: [],
      lrs: { length: 0, substring: '', positions: [], rank: -1 },
      msg: `Placed suffix #${chosenStart} ("${suffixText}") at sorted rank SA[${r}].`,
      msgKey: 'suffix:steps.saPlaceRank',
      msgParams: { rank: r, index: chosenStart, suffix: suffixText },
    });
  }

  const sa = [...working];
  const rank = Array(m).fill(0);
  for (let r = 0; r < m; r += 1) {
    rank[sa[r]] = r;
  }

  // Phase 3: Kasai's O(n) LCP construction
  const lcp = Array(m).fill(null);
  lcp[0] = 0;

  steps.push({
    phase: 'lcp-init',
    order: [...sa],
    lcp: [...lcp],
    rank: [...rank],
    sortedCount: m,
    activeRows: [0],
    matchedRows: [],
    lcpHighlightRow: 0,
    lcpHighlightLen: 0,
    kasai: { i: -1, j: -1, r: 0, hStart: 0, h: 0 },
    search: null,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    matchRanges: [],
    lrs: { length: 0, substring: '', positions: [], rank: -1 },
    msg: `Sorting complete. Built inverse rank[] array and initialized LCP[0] = 0 for Kasai's O(n) pass.`,
    msgKey: 'suffix:steps.saKasaiInit',
    msgParams: { count: m },
  });

  let h = 0;
  let bestLen = 0;
  let bestRank = -1;

  for (let i = 0; i < m; i += 1) {
    const r = rank[i];
    if (r === 0) {
      h = 0;
      steps.push({
        phase: 'lcp',
        order: [...sa],
        lcp: [...lcp],
        rank: [...rank],
        sortedCount: m,
        activeRows: [0],
        matchedRows: [],
        lcpHighlightRow: 0,
        lcpHighlightLen: 0,
        kasai: { i, j: -1, r: 0, hStart: 0, h: 0 },
        search: null,
        activeSuffixIndex: i,
        activeSuffixEnd: m - 1,
        cursorIndex: i,
        matchRanges: [],
        lrs: bestLen > 0
          ? {
            length: bestLen,
            substring: chars.slice(sa[bestRank], sa[bestRank] + bestLen).join(''),
            positions: [sa[bestRank - 1], sa[bestRank]].sort((a, b) => a - b),
            rank: bestRank,
          }
          : { length: 0, substring: '', positions: [], rank: -1 },
        msg: `Kasai i=${i}: rank[${i}] = 0 has no predecessor in SA, so LCP[0] = 0 and h resets to 0.`,
        msgKey: 'suffix:steps.saKasaiFirst',
        msgParams: { i },
      });
      continue;
    }

    const j = sa[r - 1];
    const hStart = h;
    while (i + h < m && j + h < m && chars[i + h] === chars[j + h]) {
      h += 1;
    }
    lcp[r] = h;
    if (h > bestLen) {
      bestLen = h;
      bestRank = r;
    }

    const sharedPrefix = chars.slice(i, i + h).join('');
    steps.push({
      phase: 'lcp',
      order: [...sa],
      lcp: [...lcp],
      rank: [...rank],
      sortedCount: m,
      activeRows: [r - 1, r],
      matchedRows: [],
      lcpHighlightRow: r,
      lcpHighlightLen: h,
      kasai: { i, j, r, hStart, h },
      search: null,
      activeSuffixIndex: i,
      activeSuffixEnd: m - 1,
      cursorIndex: Math.min(m - 1, i + h),
      matchRanges: h > 0 ? [[i, i + h], [j, j + h]] : [],
      lrs: bestLen > 0
        ? {
          length: bestLen,
          substring: chars.slice(sa[bestRank], sa[bestRank] + bestLen).join(''),
          positions: [sa[bestRank - 1], sa[bestRank]].sort((a, b) => a - b),
          rank: bestRank,
        }
        : { length: 0, substring: '', positions: [], rank: -1 },
      msg: `Kasai i=${i} (rank ${r}): compared with SA[${r - 1}]=${j} starting at h=${hStart} → LCP[${r}] = ${h}${h > 0 ? ` ("${sharedPrefix}")` : ''}.`,
      msgKey: h > 0 ? 'suffix:steps.saKasaiMatch' : 'suffix:steps.saKasaiZero',
      msgParams: { i, j, rank: r, prevRank: r - 1, hStart, lcp: h, prefix: sharedPrefix },
    });

    if (h > 0) h -= 1;
  }

  // Final Longest Repeated Substring (LRS)
  let lrs = { length: 0, substring: '', positions: [], rank: -1 };
  if (bestLen > 0 && bestRank > 0) {
    const substring = chars.slice(sa[bestRank], sa[bestRank] + bestLen).join('');
    // Collect all adjacent suffixes in SA sharing this exact longest repeated substring
    const posSet = new Set([sa[bestRank - 1], sa[bestRank]]);
    let k = bestRank + 1;
    while (k < m && lcp[k] >= bestLen) {
      posSet.add(sa[k]);
      k += 1;
    }
    const positions = Array.from(posSet).sort((a, b) => a - b);
    lrs = { length: bestLen, substring, positions, rank: bestRank };
  }

  steps.push({
    phase: 'complete',
    order: [...sa],
    lcp: [...lcp],
    rank: [...rank],
    sortedCount: m,
    activeRows: lrs.rank > 0 ? [lrs.rank - 1, lrs.rank] : [],
    matchedRows: [],
    lcpHighlightRow: lrs.rank,
    lcpHighlightLen: lrs.length,
    kasai: null,
    search: null,
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    matchRanges: lrs.length > 0 ? lrs.positions.map((pos) => [pos, pos + lrs.length]) : [],
    lrs,
    msg: lrs.length > 0
      ? `Suffix Array & LCP complete. Longest repeated substring: "${lrs.substring}" (length ${lrs.length}).`
      : `Suffix Array & LCP complete. No repeated substring found (max LCP = 0).`,
    msgKey: lrs.length > 0 ? 'suffix:steps.saCompleteLrs' : 'suffix:steps.saCompleteNoLrs',
    msgParams: { substring: lrs.substring, length: lrs.length },
  });

  return {
    ok: true,
    errorKey: null,
    text,
    textWithSentinel,
    sa,
    lcp,
    rank,
    lrs,
    steps,
  };
}

/**
 * Perform lower-bound and upper-bound binary search over the Suffix Array `sa`
 * for `rawPattern`, emitting every probe step and returning sorted match indices.
 */
export function searchSuffixArray(textWithSentinel, sa, rawPattern, lcp = []) {
  const validation = validatePattern(rawPattern);
  if (!validation.ok) {
    return {
      ok: false,
      errorKey: validation.errorKey,
      found: false,
      positions: [],
      leftBound: 0,
      rightBound: 0,
      steps: [],
    };
  }
  if (!textWithSentinel || !Array.isArray(sa) || sa.length === 0) {
    return {
      ok: false,
      errorKey: 'suffix:errors.emptyText',
      found: false,
      positions: [],
      leftBound: 0,
      rightBound: 0,
      steps: [],
    };
  }

  const pattern = validation.value;
  const pChars = validation.chars;
  const pLen = pChars.length;
  const chars = Array.from(textWithSentinel);
  const m = sa.length;
  const lcpCopy = lcp.length === m ? [...lcp] : Array(m).fill(null);
  const steps = [];

  // Phase 1: lower bound — first index in SA where suffix >= pattern
  let lo = 0;
  let hi = m;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const suffixStart = sa[mid];
    const suffixPreview = chars.slice(suffixStart).join('');
    const cmp = comparePatternToSuffix(chars, suffixStart, pChars);

    steps.push({
      phase: 'search-lower',
      order: [...sa],
      lcp: lcpCopy,
      rank: [],
      sortedCount: m,
      activeRows: [mid],
      matchedRows: [],
      lcpHighlightRow: -1,
      lcpHighlightLen: 0,
      kasai: null,
      search: {
        bound: 'lower',
        lo,
        mid,
        hi,
        leftBound: null,
        rightBound: null,
        cmp,
        pattern,
        patternLen: pLen,
        comparedSuffix: suffixPreview,
      },
      activeSuffixIndex: suffixStart,
      activeSuffixEnd: m - 1,
      cursorIndex: suffixStart,
      matchRanges: [],
      lrs: null,
      msg: `Lower bound [lo=${lo}, hi=${hi}): probe mid=${mid} ("${suffixPreview}") vs "${pattern}".`,
      msgKey: cmp > 0 ? 'suffix:steps.saLowerRight' : 'suffix:steps.saLowerLeft',
      msgParams: { lo, mid, hi, suffix: suffixPreview, pattern },
    });

    if (cmp > 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  const leftBound = lo;

  // Phase 2: upper bound — first index >= leftBound where suffix does not start with pattern
  lo = leftBound;
  hi = m;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const suffixStart = sa[mid];
    const suffixPreview = chars.slice(suffixStart).join('');
    const cmp = comparePatternToSuffix(chars, suffixStart, pChars);

    steps.push({
      phase: 'search-upper',
      order: [...sa],
      lcp: lcpCopy,
      rank: [],
      sortedCount: m,
      activeRows: [mid],
      matchedRows: [],
      lcpHighlightRow: -1,
      lcpHighlightLen: 0,
      kasai: null,
      search: {
        bound: 'upper',
        lo,
        mid,
        hi,
        leftBound,
        rightBound: null,
        cmp,
        pattern,
        patternLen: pLen,
        comparedSuffix: suffixPreview,
      },
      activeSuffixIndex: suffixStart,
      activeSuffixEnd: m - 1,
      cursorIndex: suffixStart,
      matchRanges: [],
      lrs: null,
      msg: `Upper bound [lo=${lo}, hi=${hi}): probe mid=${mid} ("${suffixPreview}") vs "${pattern}".`,
      msgKey: cmp >= 0 ? 'suffix:steps.saUpperRight' : 'suffix:steps.saUpperLeft',
      msgParams: { lo, mid, hi, suffix: suffixPreview, pattern },
    });

    if (cmp >= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  const rightBound = lo;

  const matchedRows = [];
  const positions = [];
  for (let r = leftBound; r < rightBound; r += 1) {
    matchedRows.push(r);
    positions.push(sa[r]);
  }
  positions.sort((a, b) => a - b);

  const found = positions.length > 0;
  const matchRanges = positions.map((pos) => [pos, pos + pLen]);

  steps.push({
    phase: found ? 'search-found' : 'search-miss',
    order: [...sa],
    lcp: lcpCopy,
    rank: [],
    sortedCount: m,
    activeRows: [],
    matchedRows,
    lcpHighlightRow: -1,
    lcpHighlightLen: 0,
    kasai: null,
    search: {
      bound: 'done',
      lo: leftBound,
      mid: -1,
      hi: rightBound,
      leftBound,
      rightBound,
      cmp: 0,
      pattern,
      patternLen: pLen,
      comparedSuffix: '',
    },
    activeSuffixIndex: -1,
    activeSuffixEnd: -1,
    cursorIndex: -1,
    matchRanges,
    positions,
    lrs: null,
    msg: found
      ? `Found "${pattern}" in SA[${leftBound}..${rightBound}) → text positions: ${positions.join(', ')}.`
      : `Range [${leftBound}, ${rightBound}) is empty — "${pattern}" was not found.`,
    msgKey: found ? 'suffix:steps.saSearchFound' : 'suffix:steps.searchNotFound',
    msgParams: {
      pattern,
      left: leftBound,
      right: rightBound,
      count: positions.length,
      positions: positions.join(', '),
    },
  });

  return {
    ok: true,
    errorKey: null,
    found,
    positions,
    leftBound,
    rightBound,
    steps,
  };
}
