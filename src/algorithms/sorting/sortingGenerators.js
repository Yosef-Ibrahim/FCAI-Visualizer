export function genBubbleSteps(arr) {
  const a = [...arr], steps = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // js:l4 py:l4 cpp:l3 — the "if (arr[j] > arr[j+1])" line
      steps.push({arr:[...a], compare:[j,j+1], swap:null, sorted:Array.from({length:i},(_,k)=>n-1-k),
        msg:`Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}`,
        codeLine:4, codeLines:{js:4,python:4,cpp:3,java:4,csharp:4}});
      if (a[j] > a[j+1]) {
        [a[j],a[j+1]] = [a[j+1],a[j]];
        // js:l5 py:l5 cpp:l4 — the swap line
        steps.push({arr:[...a], compare:null, swap:[j,j+1], sorted:Array.from({length:i},(_,k)=>n-1-k),
          msg:`Swapping ${a[j+1]} and ${a[j]} (left > right)`,
          codeLine:5, codeLines:{js:5,python:5,cpp:4,java:5,csharp:5}});
      }
    }
  }
  steps.push({arr:[...a], compare:null, swap:null, sorted:Array.from({length:n},(_,k)=>k), msg:'Array sorted!', codeLine:-1});
  return steps;
}

export function genSelectionSteps(arr) {
  const a = [...arr], steps = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i+1; j < n; j++) {
      // js:l5 py:l5 cpp:l4 — the "if (arr[j] < arr[minIdx])" line
      steps.push({arr:[...a], compare:[minIdx,j], current:[i], sorted:Array.from({length:i},(_,k)=>k),
        msg:`Comparing min(a[${minIdx}]=${a[minIdx]}) with a[${j}]=${a[j]}`,
        codeLine:4, codeLines:{js:5,python:5,cpp:4,java:5,csharp:5}});
      if (a[j] < a[minIdx]) { minIdx = j; }
    }
    if (minIdx !== i) {
      [a[i],a[minIdx]] = [a[minIdx],a[i]];
      // js:l10 py:l7 cpp:l5 — the swap line
      steps.push({arr:[...a], swap:[i,minIdx], sorted:Array.from({length:i},(_,k)=>k),
        msg:`Swapping a[${i}]=${a[i]} to position ${i}`,
        codeLine:9, codeLines:{js:10,python:7,cpp:5,java:8,csharp:8}});
    }
  }
  steps.push({arr:[...a], sorted:Array.from({length:n},(_,k)=>k), msg:'Array sorted!', codeLine:-1});
  return steps;
}

export function genInsertionSteps(arr) {
  const a = [...arr];
  const steps = [];
  const n = a.length;

  for (let i = 1; i < n; i++) {
    let j = i;
    // Show the key being picked (current element)
    steps.push({
      arr: [...a],
      current: [j],
      sorted: Array.from({ length: i }, (_, k) => k),
      msg: `Pick a[${j}] = ${a[j]} as the key`,
      codeLine: 2, // matches typical insertion sort line where key is taken
      codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }
    });

    // Bubble the key left by swapping
    while (j > 0 && a[j] < a[j - 1]) {
      // Compare step: show which two elements are being compared
      steps.push({
        arr: [...a],
        compare: [j, j - 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        msg: `Compare a[${j}] = ${a[j]} and a[${j-1}] = ${a[j-1]}`,
        codeLine: 3, // line where the comparison is made
        codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 }
      });

      // Swap the two elements
      [a[j], a[j - 1]] = [a[j - 1], a[j]];
      steps.push({
        arr: [...a],
        swap: [j, j - 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        msg: `Swap: move ${a[j]} left to index ${j-1}`,
        codeLine: 4, // line where the swap happens
        codeLines: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 }
      });
      j--;
    }
    // After bubbling, the left portion up to i is sorted
    steps.push({
      arr: [...a],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      msg: `Key ${a[j]} placed → first ${i+1} elements sorted`,
      codeLine: -1
    });
  }
  // Final step – fully sorted
  steps.push({
    arr: [...a],
    sorted: Array.from({ length: n }, (_, k) => k),
    msg: 'Array sorted!',
    codeLine: -1
  });
  return steps;
}

export function genMergeSteps(arr) {
  const steps = [];
  const orig  = [...arr];
  const n     = orig.length;
  const work  = [...orig];

  let nextId = 0;
  const allNodes = new Map();

  function makeNode(l, r, depth) {
    const id = nextId++;
    const nd = { id, l, r, depth, values: work.slice(l, r+1), state: 'idle' };
    allNodes.set(id, nd);
    return nd;
  }

  const visible = new Set();

  function snap(phase, msg, extra = {}) {
    const rows = [...visible].map(id => {
      const nd = allNodes.get(id);
      return { ...nd, values: [...nd.values] };
    });
    steps.push({
      mergeTree: true,
      phase,
      rows,
      compareL:        extra.compareL        ?? -1,
      compareR:        extra.compareR        ?? -1,
      placedParentIdx: extra.placedParentIdx ?? -1,
      placedSourceIdx: extra.placedSourceIdx ?? -1,
      activeId:        extra.activeId        ?? -1,
      msg,
      codeLine: extra.codeLine || 0,
      codeLines: extra.codeLines || null,
    });
  }

  const root = makeNode(0, n - 1, 0);
  visible.add(root.id);
  snap('split', `Merge Sort: array [${orig.join(', ')}]. Will split left-first.`,
    { activeId: root.id, codeLine: 10, codeLines: { cpp: 10, python: 10, java: 10, csharp: 10 } }); // line 11 (1‑based) -> index 10

  function recurse(nd) {
    const { l, r, id } = nd;
    if (l >= r) {
      nd.state = 'sorted';
      nd.values = [work[l]];
      snap('split', `[${work[l]}] — single element, already sorted.`,
        { activeId: id, codeLine: 10, codeLines: { cpp: 10, python: 10, java: 10, csharp: 10 } });
      return;
    }
    const m = (l + r) >> 1;
    const lnd = makeNode(l,   m,   nd.depth + 1);
    const rnd = makeNode(m+1, r,   nd.depth + 1);
    nd.state = 'idle';
    visible.add(lnd.id);
    snap('split',
      `Split [${work.slice(l,r+1).join(', ')}] → left [${work.slice(l,m+1).join(', ')}]`,
      { activeId: lnd.id, codeLine: 10, codeLines: { cpp: 10, python: 10, java: 10, csharp: 10 } });
    recurse(lnd);
    visible.add(rnd.id);
    snap('split',
      `Now split right half [${work.slice(m+1,r+1).join(', ')}]`,
      { activeId: rnd.id, codeLine: 10, codeLines: { cpp: 10, python: 10, java: 10, csharp: 10 } });
    recurse(rnd);

    nd.state = 'merging';
    nd.values = new Array(r - l + 1).fill(null);
    snap('merge',
      `Merging [${lnd.values.join(', ')}] + [${rnd.values.join(', ')}]`,
      { activeId: id, codeLine: 11, codeLines: { cpp: 11, python: 11, java: 11, csharp: 11 } }); // line 12 (1‑based) -> index 11

    const Lv = [...lnd.values];
    const Rv = [...rnd.values];
    let i = 0, j = 0, k = 0;
    while (i < Lv.length && j < Rv.length) {
      snap('merge',
        `Compare ${Lv[i]} vs ${Rv[j]}`,
        { activeId: id, compareL: l + i, compareR: m + 1 + j,
          codeLine: 3, codeLines: { cpp: 3, python: 3, java: 3, csharp: 3 } }); // line 4 (1‑based) -> index 3
      const fromLeft = Lv[i] <= Rv[j];
      const sourceIdx = fromLeft ? l + i : m + 1 + j;
      const winner = fromLeft ? Lv[i++] : Rv[j++];
      work[l + k] = winner;
      nd.values[k] = winner;
      snap('merge',
        `Place ${winner} → merged[${k}]`,
        { activeId: id, placedParentIdx: l + k, placedSourceIdx: sourceIdx,
          codeLine: 4, codeLines: { cpp: 4, python: 4, java: 4, csharp: 4 } }); // line 5 (1‑based) -> index 4
      k++;
    }
    while (i < Lv.length) {
      work[l + k] = Lv[i];
      nd.values[k] = Lv[i];
      snap('merge', `Copy left remainder: ${Lv[i]}`,
        { activeId: id, placedParentIdx: l + k, placedSourceIdx: l + i,
          codeLine: 5, codeLines: { cpp: 5, python: 5, java: 5, csharp: 5 } }); // line 6 (1‑based) -> index 5
      i++; k++;
    }
    while (j < Rv.length) {
      work[l + k] = Rv[j];
      nd.values[k] = Rv[j];
      snap('merge', `Copy right remainder: ${Rv[j]}`,
        { activeId: id, placedParentIdx: l + k, placedSourceIdx: m + 1 + j,
          codeLine: 6, codeLines: { cpp: 6, python: 6, java: 6, csharp: 6 } }); // line 7 (1‑based) -> index 6
      j++; k++;
    }
    nd.state = 'sorted';
    visible.delete(lnd.id);
    visible.delete(rnd.id);
    snap('merge',
      `Merged → [${nd.values.join(', ')}]`,
      { activeId: id, codeLine: 11, codeLines: { cpp: 11, python: 11, java: 11, csharp: 11 } });
  }

  recurse(root);

  root.state = 'sorted';
  snap('done', `✅ Array sorted! [${work.join(', ')}]`,
    { activeId: root.id, codeLine: -1 });
  const last = steps[steps.length - 1];
  last.arr    = [...work];
  last.sorted = Array.from({ length: n }, (_, k) => k);
  return steps;
}

export function genQuickSteps(arr) {
  const steps    = [];
  const a        = [...arr];
  const n        = a.length;
  const sortedSet = new Set();
  let rowList    = [];
  let rowId      = 0;

  function snap(lo, hi, pivotIdx, pivotVal, iPtr, jPtr, phase, msg) {
    let codeLine = 0;
    let codeLines = { cpp: 0, python: 0, java: 0, csharp: 0 };
    switch (phase) {
      case 'select': codeLine = 1; break;
      case 'scan':   codeLine = 4; break;
      case 'swap':   codeLine = 6; break;
      case 'place':  codeLine = 9; break;
      default: codeLine = 0;
    }
    codeLines = { cpp: codeLine, python: codeLine, java: codeLine, csharp: codeLine };
    steps.push({
      quickPartition: true,
      arr:      [...a],
      rows:     rowList.map(r => ({...r, values:[...r.values]})),
      lo, hi,
      pivotIdx,
      pivotVal,
      leftPtr:  iPtr,
      rightPtr: jPtr,
      phase,
      sorted:   [...sortedSet],
      msg,
      codeLine,
      codeLines,
    });
  }

  function partition(lo, hi, depth) {
    const pivotVal = a[lo];
    const rid = rowId++;
    rowList = [...rowList, {
      id: rid, lo, hi, depth,
      values: a.slice(lo, hi + 1),
      state: 'active',
    }];
    snap(lo, hi, lo, pivotVal, lo, lo + 1, 'select',
      `Pivot = a[${lo}] = ${pivotVal}  Subarray: [${a.slice(lo,hi+1).join(', ')}]`);

    let i = lo;
    let j = lo + 1;
    while (j <= hi) {
      snap(lo, hi, lo, pivotVal, i, j, 'scan',
        `j=${j}: a[${j}]=${a[j]} ${a[j] <= pivotVal ? '≤' : '>'} pivot ${pivotVal}`);
      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          rowList = rowList.map(r => r.id===rid ? {...r, values:a.slice(lo,hi+1)} : r);
          snap(lo, hi, lo, pivotVal, i, j, 'swap',
            `a[${j}]=${a[j]} ≤ ${pivotVal} → i=${i}, swap a[${i}] ↔ a[${j}]`);
        } else {
          snap(lo, hi, lo, pivotVal, i, j, 'scan',
            `a[${j}]=${a[j]} ≤ ${pivotVal} → i=${i}, already in place`);
        }
      }
      j++;
    }
    [a[lo], a[i]] = [a[i], a[lo]];
    sortedSet.add(i);
    rowList = rowList.map(r => r.id===rid
      ? {...r, values:a.slice(lo,hi+1), state:'partitioned'}
      : r);
    snap(lo, hi, i, pivotVal, i, hi, 'place',
      `Pivot ${pivotVal} → placed at [${i}]  Left < ${pivotVal}: [${a.slice(lo,i).join(',')}]  Right ≥ ${pivotVal}: [${a.slice(i+1,hi+1).join(',')}]`);
    return i;
  }

  function qs(lo, hi, depth) {
    if (lo >= hi) { if (lo === hi) sortedSet.add(lo); return; }
    const p = partition(lo, hi, depth);
    qs(lo, p - 1, depth + 1);
    qs(p + 1, hi, depth + 1);
  }
  qs(0, n - 1, 0);
  sortedSet.clear();
  for (let k = 0; k < n; k++) sortedSet.add(k);
  rowList = rowList.map(r => ({...r, state:'sorted', values:a.slice(r.lo,r.hi+1)}));
  steps.push({
    quickPartition: true,
    arr: [...a], rows: rowList.map(r=>({...r, values:[...r.values]})),
    lo: 0, hi: n-1,
    pivotIdx: -1, pivotVal: null,
    leftPtr: -1, rightPtr: -1,
    phase: 'done',
    sorted: [...sortedSet],
    msg: '✅ Array fully sorted!',
    codeLine: -1,
    codeLines: { cpp: -1, python: -1, java: -1, csharp: -1 }
  });
  steps[steps.length-1].sorted = Array.from({length:n},(_,k)=>k);
  return steps;
}





export function genHeapSteps(arr) {
  const steps = [];
  function heapify(a,n,i){
    let lg=i,l=2*i+1,r=2*i+2;
    steps.push({arr:[...a],current:[i],compare:[l<n?l:-1,r<n?r:-1].filter(x=>x>=0),msg:`Heapify at ${i}`,codeLine:8});
    if(l<n&&a[l]>a[lg]){lg=l;}
    if(r<n&&a[r]>a[lg]){lg=r;}
    if(lg!==i){
      [a[i],a[lg]]=[a[lg],a[i]];
      steps.push({arr:[...a],swap:[i,lg],msg:`Swap ${a[lg]} and ${a[i]}`,codeLine:13});
      heapify(a,n,lg);
    }
  }
  const a=[...arr],n=a.length;
  for(let i=n/2-1|0;i>=0;i--) heapify(a,n,i);
  for(let i=n-1;i>0;i--){
    [a[0],a[i]]=[a[i],a[0]];
    steps.push({arr:[...a],swap:[0,i],sorted:Array.from({length:n-i},(_,k)=>n-1-k),msg:`Move max ${a[i]} to position ${i}`,codeLine:4});
    heapify(a,i,0);
  }
  steps.push({arr:[...a],sorted:Array.from({length:n},(_,k)=>k),msg:'Array sorted!',codeLine:-1});
  return steps;
}

export function genCountingSteps(arr) {
  const steps = [];
  const orig  = [...arr];
  const n     = orig.length;
  const max   = Math.max(...orig);
  const count = new Array(max + 1).fill(0);
  const output = new Array(n).fill(null);

  function snap(msg, codeLine, activeOrig, activeCount, activeOutput) {
    steps.push({
      multiArray: true,
      origArr:    [...orig],
      countArr:   [...count],
      outputArr:  [...output],
      activeOrig:   activeOrig  !== undefined ? activeOrig  : -1,
      activeCount:  activeCount !== undefined ? activeCount : -1,
      activeOutput: activeOutput!== undefined ? activeOutput: -1,
      msg,
      codeLine: codeLine || 0,
      codeLines: { cpp: codeLine || 0, python: codeLine || 0, java: codeLine || 0, csharp: codeLine || 0 }
    });
  }

  snap(`Max value = ${max}. Create count array of size ${max + 1}, all zeros.`, 0); // line 1 -> index 0
  snap(`Initialize count array.`, 1);                                            // line 2 -> index 1
  for (let i = 0; i < n; i++) {
    const val = orig[i];
    snap(`Reading orig[${i}] = ${val}. About to increment count[${val}].`, 2, i, val, -1); // line 3 -> index 2
    count[val]++;
    snap(`count[${val}] is now ${count[val]}.`, 2, i, val, -1);
  }
  snap(`Counting done. Now build OUTPUT array from COUNT.`, 4); // line 5 -> index 4
  let outIdx = 0;
  for (let v = 0; v <= max; v++) {
    const freq = count[v];
    if (freq === 0) continue;
    snap(`count[${v}] = ${freq}. Will place ${freq}× the value ${v} into OUTPUT.`, 4, -1, v, outIdx);
    for (let k = 0; k < freq; k++) {
      output[outIdx] = v;
      snap(`Placed ${v} at output[${outIdx}].`, 5, -1, v, outIdx); // line 6 -> index 5
      outIdx++;
    }
  }
  snap(`OUTPUT complete — array is sorted! ✅`, -1);
  steps[steps.length - 1].sorted = Array.from({length: n}, (_, k) => k);
  return steps;
}

export function genRadixSteps(arr) {
  const steps = [];
  
  // EDIT 1: Force values to Numbers so Math.max doesn't return NaN on HTML strings!
  let a = arr.map(n => Number(n) || 0); 
  const max = a.length > 0 ? Math.max(...a) : 0;
  let exp = 1;

  function snap(label, compIndex = -1, swapIndex = -1, buckets = null) {
    steps.push({
      radixStep: true,
      arr: [...a],
      buckets: buckets ? JSON.parse(JSON.stringify(buckets)) : null,
      comp: compIndex !== -1 ? [compIndex] : [],
      swap: swapIndex !== -1 ? [swapIndex] : [],
      label: label || '',
    });
  }

  if (max > 0) {
    while (Math.floor(max / exp) > 0) {
      snap(`Pass for digit position ${exp} (${exp === 1 ? 'ones' : exp === 10 ? 'tens' : 'hundreds'})`);

      let buckets = Array.from({ length: 10 }, () => []);
      for (let i = 0; i < a.length; i++) {
        const val = a[i];
        if (val === null) continue;
        const digit = Math.floor(val / exp) % 10;
        snap(`Extracting digit ${digit} from ${val}`, i, -1, buckets);
        buckets[digit].push(val);
        a[i] = null;
        snap(`Placed ${val} into bucket [${digit}]`, -1, -1, buckets);
      }
      let idx = 0;
      for (let b = 0; b < 10; b++) {
        while (buckets[b].length) {
          const val = buckets[b].shift();
          a[idx] = val;
          snap(`Collecting ${val} back to array`, -1, idx, buckets);
          idx++;
        }
      }
      exp *= 10;
    }
  }
  snap('Array sorted!', -1, -1, null);
  return steps;
}
