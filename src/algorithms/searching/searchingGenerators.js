// ─────────────────────────────────────────────────────────────────────────────
// Searching Step Generators
// Each function returns a `steps` array. Every step object contains:
//   arr         : snapshot of the array at that moment
//   target      : the value being searched
//   current     : [index] of the element being inspected
//   scanned     : [indices] already checked (greyed out)
//   found       : null | true | false
//   foundIdx    : index where target was found (-1 if not found yet)
//   msg         : human-readable explanation string
//   codeLine    : 0-based line index into the current language's code snippet
//   codeLines   : { js, python, cpp, java, csharp } — per-language line indices
//
// Binary/Jump Search also include pointer fields for the visualizer:
//   lo, hi, mid              : for binary search
//   blockStart, blockEnd,
//   scanIdx                  : for jump search
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Linear Search — O(n)
 * Scans every element from index 0 to n-1.
 */
export function genLinearSearchSteps(arr, target) {
  const a = [...arr];
  const n = a.length;
  const steps = [];
  const scanned = [];

  steps.push({
    arr: [...a], target,
    current: [], scanned: [...scanned],
    found: null, foundIdx: -1,
    msg: `Linear Search: looking for ${target} in [${a.join(', ')}]`,
    codeLine: 0,
    codeLines: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
  });

  for (let i = 0; i < n; i++) {
    // Inspect element at i
    steps.push({
      arr: [...a], target,
      current: [i], scanned: [...scanned],
      found: null, foundIdx: -1,
      msg: `Check a[${i}] = ${a[i]}  ${a[i] === target ? '→ Match! ✅' : `≠ ${target}`}`,
      codeLine: 2,
      codeLines: { js: 2, python: 2, cpp: 2, java: 1, csharp: 1 },
    });

    if (a[i] === target) {
      steps.push({
        arr: [...a], target,
        current: [i], scanned: [...scanned],
        found: true, foundIdx: i,
        msg: `✅ Found ${target} at index ${i}!`,
        codeLine: 3,
        codeLines: { js: 3, python: 3, cpp: 3, java: 2, csharp: 2 },
      });
      return steps;
    }

    scanned.push(i);
  }

  steps.push({
    arr: [...a], target,
    current: [], scanned: [...scanned],
    found: false, foundIdx: -1,
    msg: `❌ ${target} not found in array.`,
    codeLine: 6,
    codeLines: { js: 6, python: 5, cpp: 5, java: 3, csharp: 3 },
  });

  return steps;
}

/**
 * Binary Search — O(log n)
 * Array MUST be sorted. Halves the search space each iteration.
 */
export function genBinarySearchSteps(arr, target) {
  const a = [...arr].sort((x, y) => x - y); // ensure sorted
  const n = a.length;
  const steps = [];
  const scanned = [];

  steps.push({
    arr: [...a], target,
    current: [], scanned: [],
    lo: 0, hi: n - 1, mid: -1,
    found: null, foundIdx: -1,
    msg: `Binary Search: target = ${target}. Array is sorted: [${a.join(', ')}]`,
    codeLine: 0,
    codeLines: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
  });

  let lo = 0, hi = n - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;

    // Show the lo/hi window and computed mid
    steps.push({
      arr: [...a], target,
      current: [mid], scanned: [...scanned],
      lo, hi, mid,
      found: null, foundIdx: -1,
      msg: `lo=${lo}  hi=${hi}  mid=${mid}  a[mid]=${a[mid]}`,
      codeLine: 2,
      codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
    });

    if (a[mid] === target) {
      steps.push({
        arr: [...a], target,
        current: [mid], scanned: [...scanned],
        lo, hi, mid,
        found: true, foundIdx: mid,
        msg: `✅ a[${mid}] = ${a[mid]} = target. Found at index ${mid}!`,
        codeLine: 3,
        codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
      });
      return steps;
    }

    if (a[mid] < target) {
      // Discard left half
      for (let k = lo; k <= mid; k++) scanned.push(k);
      steps.push({
        arr: [...a], target,
        current: [], scanned: [...scanned],
        lo: mid + 1, hi, mid,
        found: null, foundIdx: -1,
        msg: `a[${mid}]=${a[mid]} < ${target} → search RIGHT half [${mid + 1}..${hi}]`,
        codeLine: 5,
        codeLines: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 },
      });
      lo = mid + 1;
    } else {
      // Discard right half
      for (let k = mid; k <= hi; k++) scanned.push(k);
      steps.push({
        arr: [...a], target,
        current: [], scanned: [...scanned],
        lo, hi: mid - 1, mid,
        found: null, foundIdx: -1,
        msg: `a[${mid}]=${a[mid]} > ${target} → search LEFT half [${lo}..${mid - 1}]`,
        codeLine: 6,
        codeLines: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
      });
      hi = mid - 1;
    }
  }

  steps.push({
    arr: [...a], target,
    current: [], scanned: Array.from({ length: n }, (_, k) => k),
    lo, hi, mid: -1,
    found: false, foundIdx: -1,
    msg: `❌ lo(${lo}) > hi(${hi}): search space exhausted. ${target} not found.`,
    codeLine: 8,
    codeLines: { js: 8, python: 7, cpp: 7, java: 7, csharp: 7 },
  });

  return steps;
}

/**
 * Jump Search — O(√n)
 * Array MUST be sorted. Jumps in blocks of √n, then linear-scans backward.
 */
export function genJumpSearchSteps(arr, target) {
  const a = [...arr].sort((x, y) => x - y); // ensure sorted
  const n = a.length;
  const step = Math.floor(Math.sqrt(n));
  const steps = [];
  const scanned = [];

  steps.push({
    arr: [...a], target,
    current: [], scanned: [],
    blockStart: 0, blockEnd: Math.min(step, n) - 1, scanIdx: -1,
    phase: 'jump',
    found: null, foundIdx: -1,
    msg: `Jump Search: target=${target}, n=${n}, step=√${n}≈${step}. Array: [${a.join(', ')}]`,
    codeLine: 0,
    codeLines: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
  });

  let prev = 0;
  let curr = step;

  // ── Phase 1: Jump forward ──
  while (curr < n && a[curr] <= target) {
    steps.push({
      arr: [...a], target,
      current: [curr], scanned: [...scanned],
      blockStart: prev, blockEnd: Math.min(curr, n - 1), scanIdx: -1,
      phase: 'jump',
      found: null, foundIdx: -1,
      msg: `Jump: a[${curr}]=${a[curr]} ≤ ${target} → jump forward. Block [${prev}..${curr}] cleared.`,
      codeLine: 4,
      codeLines: { js: 4, python: 4, cpp: 3, java: 4, csharp: 4 },
    });
    for (let k = prev; k <= curr; k++) scanned.push(k);
    prev = curr;
    curr = Math.min(curr + step, n);
  }

  const blockEnd = Math.min(curr, n) - 1;

  steps.push({
    arr: [...a], target,
    current: [], scanned: [...scanned],
    blockStart: prev, blockEnd, scanIdx: prev,
    phase: 'linear',
    found: null, foundIdx: -1,
    msg: `a[${Math.min(curr, n) - 1}]=${a[Math.min(curr, n) - 1]} > ${target} (or end). Linear scan in block [${prev}..${blockEnd}].`,
    codeLine: 6,
    codeLines: { js: 6, python: 6, cpp: 5, java: 6, csharp: 6 },
  });

  // ── Phase 2: Linear scan backward in the block ──
  for (let i = prev; i <= blockEnd; i++) {
    steps.push({
      arr: [...a], target,
      current: [i], scanned: [...scanned],
      blockStart: prev, blockEnd, scanIdx: i,
      phase: 'linear',
      found: null, foundIdx: -1,
      msg: `Linear scan: a[${i}]=${a[i]}  ${a[i] === target ? '→ Match! ✅' : `≠ ${target}`}`,
      codeLine: 7,
      codeLines: { js: 7, python: 7, cpp: 6, java: 7, csharp: 7 },
    });

    if (a[i] === target) {
      steps.push({
        arr: [...a], target,
        current: [i], scanned: [...scanned],
        blockStart: prev, blockEnd, scanIdx: i,
        phase: 'linear',
        found: true, foundIdx: i,
        msg: `✅ Found ${target} at index ${i}!`,
        codeLine: 8,
        codeLines: { js: 8, python: 8, cpp: 7, java: 8, csharp: 8 },
      });
      return steps;
    }
    scanned.push(i);
  }

  steps.push({
    arr: [...a], target,
    current: [], scanned: [...scanned],
    blockStart: prev, blockEnd, scanIdx: -1,
    phase: 'done',
    found: false, foundIdx: -1,
    msg: `❌ ${target} not found in block [${prev}..${blockEnd}]. Not in array.`,
    codeLine: 9,
    codeLines: { js: 9, python: 9, cpp: 8, java: 9, csharp: 9 },
  });

  return steps;
}
