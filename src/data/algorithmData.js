export const complexity = {
  // ── Sorting: best / avg / worst / space ──
  bubble:        {best:'O(n)',       avg:'O(n²)',       worst:'O(n²)',       space:'O(1)',     note:'Stable · In-place · Best case: already sorted'},
  selection:     {best:'O(n²)',      avg:'O(n²)',        worst:'O(n²)',       space:'O(1)',     note:'Unstable · In-place · Always O(n²) comparisons'},
  insertion:     {best:'O(n)',       avg:'O(n²)',        worst:'O(n²)',       space:'O(1)',     note:'Stable · In-place · Best for nearly sorted data'},
  merge:         {best:'O(n log n)', avg:'O(n log n)',   worst:'O(n log n)', space:'O(n)',     note:'Stable · Divide & conquer · Predictable performance'},
  quick:         {best:'O(n log n)', avg:'O(n log n)',   worst:'O(n²)',      space:'O(log n)', note:'Unstable · In-place · First element pivot used here'},
  heap:          {best:'O(n log n)', avg:'O(n log n)',   worst:'O(n log n)', space:'O(1)',     note:'Unstable · In-place · Uses max-heap structure'},
  counting:      {best:'O(n+k)',     avg:'O(n+k)',       worst:'O(n+k)',     space:'O(k)',     note:'Stable · Non-comparison · k = range of values'},
  radix:         {best:'O(nk)',      avg:'O(nk)',        worst:'O(nk)',      space:'O(n+k)',   note:'Stable · Non-comparison · k = number of digits'},
  // ── Searching: best / avg / worst / space ──
  'linear-search':{best:'O(1)',     avg:'O(n)',         worst:'O(n)',        space:'O(1)',     note:'Works on unsorted arrays'},
  'binary-search':{best:'O(1)',     avg:'O(log n)',     worst:'O(log n)',    space:'O(1)',     note:'Requires sorted array'},
  'jump-search':  {best:'O(1)',     avg:'O(√n)',        worst:'O(√n)',       space:'O(1)',     note:'Requires sorted array · Step = √n'},
  // ── Data Structures: access / search / insert / delete / space ──
  'array-ds':    {access:'O(1)',    search:'O(n)',      insert:'O(n)',       delete:'O(n)',    space:'O(n)',  note:'Random access O(1) · Shift cost on insert/delete'},
  'stack-ds':    {access:'O(n)',    search:'O(n)',      insert:'O(1)',       delete:'O(1)',    space:'O(n)',  note:'LIFO · Push O(1) · Pop O(1) · Peek O(1)'},
  'queue-ds':    {access:'O(n)',    search:'O(n)',      insert:'O(1)',       delete:'O(1)',    space:'O(n)',  note:'FIFO · Enqueue O(1) · Dequeue O(1)'},
  'singly-ll':   {access:'O(n)',    search:'O(n)',      insert:'O(1)',       delete:'O(n)',    space:'O(n)',  note:'Insert at head O(1) · Insert tail O(n) · No random access'},
  'doubly-ll':   {access:'O(n)',    search:'O(n)',      insert:'O(1)',       delete:'O(1)',    space:'O(n)',  note:'Delete at known node O(1) · Bidirectional traversal'},
  'circular-ll': {access:'O(n)',    search:'O(n)',      insert:'O(1)',       delete:'O(n)',    space:'O(n)',  note:'Last node points to head · Useful for round-robin'},
  'ordered-ll':  {access:'O(n)',    search:'O(n)',      insert:'O(n)',       delete:'O(n)',    space:'O(n)',  note:'Always sorted · Insert scans to find position'},
  // ── Trees: access / search / insert / delete / space ──
  bst:           {access:'O(log n)',search:'O(log n)',  insert:'O(log n)',   delete:'O(log n)',space:'O(n)', note:'Balanced: O(log n) · Skewed (worst): O(n)'},
  avl:           {access:'O(log n)',search:'O(log n)',  insert:'O(log n)',   delete:'O(log n)',space:'O(n)', note:'Self-balancing BST · Rotations keep height O(log n)'},
  'heap-tree':   {access:'O(1)',    search:'O(n)',      insert:'O(log n)',   delete:'O(log n)',space:'O(n)', note:'Max-Heap · Root = maximum · Parent ≥ Children'},
  'binary-tree': {access:'O(n)',    search:'O(n)',      insert:'O(n)',       delete:'O(n)',    space:'O(n)', note:'All traversals visit every node once'},
  // ── Graphs: access / search / insert / delete / space ──
  bfs:           {access:'O(V+E)',  search:'O(V+E)',    insert:'O(1)',       delete:'O(V+E)', space:'O(V)', note:'V = vertices, E = edges · Uses queue'},
  dfs:           {access:'O(V+E)',  search:'O(V+E)',    insert:'O(1)',       delete:'O(V+E)', space:'O(V)', note:'V = vertices, E = edges · Uses stack/recursion'},
  dijkstra:      {access:'O(V²)',   search:'O(V²)',     insert:'O(V²)',      delete:'O(V²)',  space:'O(V)', note:'Naive O(V²) · With min-heap: O((V+E) log V)'},
  prim:          {access:'O(V²)',   search:'O(V²)',     insert:'O(V²)',      delete:'O(V²)',  space:'O(V)', note:'MST · O(E log V) with priority queue'},
  kruskal:       {access:'O(E log E)',search:'O(E log E)',insert:'O(E log E)',delete:'O(E log E)',space:'O(V+E)',note:'MST · Union-Find with path compression'},
};

// =====================================================
// ALGORITHM EXPLANATIONS (shown in 💡 panel)
// =====================================================
export const explanations = {
  bubble:    { title:'Bubble Sort', body:`<p>Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Larger elements "bubble up" to the end with each pass.</p><ul><li>Simple but slow for large data</li><li>Stops early if no swaps occurred (best case O(n))</li><li>Stable: equal elements keep their original order</li></ul>` },
  selection: { title:'Selection Sort', body:`<p>Finds the minimum element in the unsorted portion and places it at the beginning, expanding the sorted region by one each pass.</p><ul><li>Always O(n²) comparisons regardless of input</li><li>Minimises swaps — only one per pass</li><li>Unstable: equal elements may be reordered</li></ul>` },
  insertion: { title:'Insertion Sort', body:`<p>Builds the sorted array one element at a time by taking each element and inserting it into its correct position among already-sorted elements.</p><ul><li>Excellent for nearly sorted data — approaches O(n)</li><li>Stable and in-place</li><li>Used in practice for small arrays (&lt;16 elements)</li></ul>` },
  merge:     { title:'Merge Sort', body:`<p>Divides the array in half recursively until single elements, then merges sorted halves back together — classic divide and conquer.</p><ul><li>Always O(n log n) — predictable performance</li><li>Stable sort</li><li>Requires O(n) extra space for the merge step</li></ul>` },
  quick:     { title:'Quick Sort', body:`<p>Picks a pivot element and partitions the array so all smaller elements are left of the pivot and larger elements are right, then recursively sorts each partition.</p><ul><li>First element used as pivot here</li><li>Average O(n log n) but O(n²) in worst case (sorted input + bad pivot)</li><li>In-place but unstable</li></ul>` },
  heap:      { title:'Heap Sort', body:`<p>Builds a max-heap from the array, then repeatedly extracts the maximum element to build the sorted result from the end.</p><ul><li>Always O(n log n) — no bad cases</li><li>In-place with O(1) extra space</li><li>Not stable — heap operations can reorder equal elements</li></ul>` },
  counting:  { title:'Counting Sort', body:`<p>Counts occurrences of each value in a separate array, then reconstructs the sorted output from those counts.</p><ul><li>O(n+k) time where k is the value range</li><li>Only works for non-negative integers</li><li>Stable and very fast when k is small relative to n</li></ul>` },
  radix:     { title:'Radix Sort', body:`<p>Sorts numbers digit by digit from least significant to most significant, using a stable sub-sort (like counting sort) at each digit position.</p><ul><li>O(nk) where k is the number of digits</li><li>Non-comparison based — can beat O(n log n) limits</li><li>Stable sort</li></ul>` },
  'linear-search':{ title:'Linear Search', body:`<p>Scans each element in sequence until the target is found or the end is reached.</p><ul><li>Works on any array — sorted or unsorted</li><li>O(n) in the worst case</li><li>Simple and reliable for small or unordered data</li></ul>` },
  'binary-search':{ title:'Binary Search', body:`<p>Repeatedly halves the search space by comparing the target with the middle element, discarding the half that cannot contain the target.</p><ul><li>Requires a sorted array</li><li>O(log n) — extremely fast for large arrays</li><li>32 comparisons can search among 4 billion elements</li></ul>` },
  'jump-search':  { title:'Jump Search', body:`<p>Jumps ahead by √n steps, then performs a linear search backward once the block containing the target is found.</p><ul><li>O(√n) — faster than linear, slower than binary</li><li>Requires sorted array</li><li>Useful when backward traversal is costly</li></ul>` },
  bst:       { title:'Binary Search Tree', body:`<p>A tree where every node's left subtree contains only smaller values and the right subtree contains only larger values.</p><ul><li>Search, insert, delete all O(log n) when balanced</li><li>Degrades to O(n) on sorted input (skewed tree)</li><li>In-order traversal yields sorted output</li></ul>` },
  bfs:       { title:'Breadth-First Search', body:`<p>Explores a graph level by level using a queue — visits all neighbours before going deeper.</p><ul><li>Guarantees shortest path in unweighted graphs</li><li>Uses O(V) memory for the queue</li><li>Great for finding closest nodes</li></ul>` },
  dfs:       { title:'Depth-First Search', body:`<p>Explores as far as possible along each branch before backtracking, using a stack (or recursion).</p><ul><li>Uses less memory than BFS in wide graphs</li><li>Used for cycle detection, topological sort, path finding</li><li>Does not guarantee shortest path</li></ul>` },
  dijkstra:  { title:"Dijkstra's Algorithm", body:`<p>Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative weights.</p><ul><li>Greedy approach: always processes the lowest-distance unvisited node</li><li>O(V²) naive; O((V+E) log V) with priority queue</li><li>Fails with negative edge weights</li></ul>` },
  prim:      { title:"Prim's MST", body:`<p>Builds a Minimum Spanning Tree by greedily adding the cheapest edge that connects the growing MST to an unvisited vertex.</p><ul><li>Starts from any vertex</li><li>Good for dense graphs</li><li>Output: tree that connects all vertices with minimum total weight</li></ul>` },
  kruskal:   { title:"Kruskal's MST", body:`<p>Builds a Minimum Spanning Tree by sorting all edges by weight and adding each one if it doesn't create a cycle, using Union-Find.</p><ul><li>Good for sparse graphs</li><li>O(E log E) dominated by edge sort</li><li>Processes edges globally rather than growing from a vertex</li></ul>` },
};
function openInfo() {
  const key = state.algo;
  let infoTitle = '';
  let infoBody = '';

  if (key === 'array-ds') {
    infoTitle = 'Array';
    infoBody = `
      <p><strong>Array</strong> is a linear data structure that stores a fixed-size collection of elements of the same type in contiguous memory locations.</p>
      <ul>
        <li><strong>Access:</strong> O(1) – direct access by index.</li>
        <li><strong>Search:</strong> O(n) – linear scan if unsorted.</li>
        <li><strong>Insertion/Deletion:</strong> O(n) – shifting elements.</li>
        <li><strong>Space Complexity:</strong> O(n).</li>
      </ul>
      <p><strong>Common Operations:</strong> Get/Set by index, push (if dynamic), pop, insert, delete, search, sort.</p>
      <p><strong>Advantages:</strong> Fast random access, cache-friendly.</p>
      <p><strong>Disadvantages:</strong> Fixed size (static), expensive insert/delete.</p>
    `;
  } else if (key === 'stack-ds') {
    infoTitle = 'Stack';
    infoBody = `
      <p><strong>Stack</strong> is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Elements are added and removed from the top only.</p>
      <ul>
        <li><strong>Push:</strong> O(1) – add element to the top.</li>
        <li><strong>Pop:</strong> O(1) – remove the top element.</li>
        <li><strong>Peek/Top:</strong> O(1) – view the top element without removing.</li>
        <li><strong>Space Complexity:</strong> O(n).</li>
      </ul>
      <p><strong>Common Operations:</strong> Push, Pop, Peek, isEmpty, isFull (for fixed-size).</p>
      <p><strong>Applications:</strong> Function call stack, Adding big integers, Evaluating postfix expressions, Bracket delimiters checking.</p>
      <p><strong>Advantages:</strong> Simple, fast O(1) operations.</p>
      <p><strong>Disadvantages:</strong> Limited access (only top element).</p>
    `;
  } else if (key === 'queue-ds') {
    infoTitle = 'Queue';
    infoBody = `
      <p><strong>Queue</strong> is a linear data structure that follows the First-In-First-Out (FIFO) principle. Elements are added at the rear (enqueue) and removed from the front (dequeue).</p>
      <ul>
        <li><strong>Enqueue:</strong> O(1) – add element to the rear.</li>
        <li><strong>Dequeue:</strong> O(1) – remove element from the front.</li>
        <li><strong>Peek/Front:</strong> O(1) – view the front element without removing.</li>
        <li><strong>Space Complexity:</strong> O(n).</li>
      </ul>
      <p><strong>Common Operations:</strong> Enqueue, Dequeue, Peek, isEmpty, isFull.</p>
      <p><strong>Applications:</strong> Task scheduling, BFS, print spooler, buffering.</p>
      <p><strong>Advantages:</strong> Fair ordering, simple operations.</p>
      <p><strong>Disadvantages:</strong> Limited access (only front and rear).</p>
    `;
  } else if (key === 'singly-ll') {
    infoTitle = 'Singly Linked List';
    infoBody = `
      <p><strong>Singly Linked List</strong> is a linear data structure where each node contains a value and a reference (pointer) to the next node. The list is traversed from the head to the tail.</p>
      <ul>
        <li><strong>Insert at Head:</strong> O(1) – add a new node at the beginning.</li>
        <li><strong>Insert at Tail:</strong> O(n) – traverse to the end and add.</li>
        <li><strong>Delete Head:</strong> O(1) – remove the first node.</li>
        <li><strong>Delete by Value:</strong> O(n) – search and remove.</li>
        <li><strong>Search:</strong> O(n) – linear search.</li>
        <li><strong>Space Complexity:</strong> O(n) – each node stores one pointer.</li>
      </ul>
      <p><strong>Applications:</strong> Dynamic memory allocation, stacks, queues, adjacency lists.</p>
      <p><strong>Advantages:</strong> Dynamic size, easy insertion/deletion at head.</p>
      <p><strong>Disadvantages:</strong> No random access, extra memory for pointers.</p>
    `;
  } else if (key === 'doubly-ll') {
    infoTitle = 'Doubly Linked List';
    infoBody = `
      <p><strong>Doubly Linked List</strong> is a linked list where each node has two pointers: one to the next node and one to the previous node. This allows traversal in both directions.</p>
      <ul>
        <li><strong>Insert at Head/Tail:</strong> O(1) – easy because of prev pointer.</li>
        <li><strong>Delete at Head/Tail:</strong> O(1) – immediate.</li>
        <li><strong>Insert/Delete in Middle:</strong> O(n) – need to find position, but deletion of a given node is O(1) if you have its pointer.</li>
        <li><strong>Search:</strong> O(n) – linear search.</li>
        <li><strong>Space Complexity:</strong> O(n) – each node stores two pointers.</li>
      </ul>
      <p><strong>Applications:</strong> Browser history, undo/redo, LRU cache.</p>
      <p><strong>Advantages:</strong> Bi-directional traversal, easier deletion of a given node.</p>
      <p><strong>Disadvantages:</strong> Extra memory for prev pointer.</p>
    `;
  } else if (key === 'circular-ll') {
    infoTitle = 'Circular Linked List';
    infoBody = `
      <p><strong>Circular Linked List</strong> is a linked list where the last node points back to the first node, forming a circle. It can be singly or doubly.</p>
      <ul>
        <li><strong>Insertion/Deletion:</strong> Similar to singly/doubly but with circular structure.</li>
        <li><strong>Traversal:</strong> Infinite loop if not handled, useful for round-robin scheduling.</li>
        <li><strong>Applications:</strong> Round-robin scheduling, multiplayer games, circular buffers.</li>
        <li><strong>Space Complexity:</strong> O(n).</li>
      </ul>
      <p><strong>Advantages:</strong> No null termination, useful for continuous cycles.</p>
      <p><strong>Disadvantages:</strong> Risk of infinite loops if not carefully managed.</p>
    `;
  } else if (key === 'ordered-ll') {
    infoTitle = 'Ordered Linked List';
    infoBody = `
      <p><strong>Ordered Linked List</strong> is a linked list where elements are maintained in sorted order. Insertion finds the correct position to keep the list sorted.</p>
      <ul>
        <li><strong>Insert:</strong> O(n) – find position and insert.</li>
        <li><strong>Delete:</strong> O(n) – find element and remove.</li>
        <li><strong>Search:</strong> O(n) – but can stop early if value not found.</li>
        <li><strong>Space Complexity:</strong> O(n).</li>
      </ul>
      <p><strong>Applications:</strong> Maintaining sorted data without a full array sort.</p>
      <p><strong>Advantages:</strong> Always sorted, efficient for sequential access.</p>
      <p><strong>Disadvantages:</strong> Insert and delete are O(n) due to search.</p>
    `;
  } else {
    // Fallback (should not appear because button hidden)
    infoTitle = 'Information';
    infoBody = `<p>General information not available for this structure.</p>`;
  }

  document.getElementById('explain-title').textContent = infoTitle;
  document.getElementById('explain-body').innerHTML = infoBody;
  document.getElementById('explain-panel').classList.add('open');
  document.getElementById('explain-overlay').classList.add('open');
}

function openExplain() {
  const key = state.algo;
  const info = algoExplanations[key];
  if (!info) { setStepMsg('No explanation available for this view.'); return; }
  document.getElementById('explain-title').textContent = info.title;
  document.getElementById('explain-body').innerHTML    = info.body;
  document.getElementById('explain-panel').classList.add('open');
  document.getElementById('explain-overlay').classList.add('open');
}

function closeExplain() {
  document.getElementById('explain-panel').classList.remove('open');
  document.getElementById('explain-overlay').classList.remove('open');
}

export const algoNames = {
  bubble:'Bubble Sort', selection:'Selection Sort', insertion:'Insertion Sort',
  merge:'Merge Sort', quick:'Quick Sort', heap:'Heap Sort',
  counting:'Counting Sort', radix:'Radix Sort',
  'linear-search':'Linear Search', 'binary-search':'Binary Search', 'jump-search':'Jump Search',
  'array-ds':'Array', 'stack-ds':'Stack', 'queue-ds':'Queue',
  'singly-ll':'Singly Linked List', 'doubly-ll':'Doubly Linked List',
  'circular-ll':'Circular Linked List', 'ordered-ll':'Ordered Linked List',
  bst:'Binary Search Tree', avl:'AVL Tree', 'heap-tree':'Heap Tree', 'binary-tree':'Binary Tree Traversal',
  bfs:'Breadth-First Search', dfs:'Depth-First Search', dijkstra:'Dijkstra Shortest Path',
  prim:'Prim — Minimum Spanning Tree', kruskal:'Kruskal — Minimum Spanning Tree',
  compare:'Algorithm Comparison',
};

// =====================================================
// CODE SNIPPETS (per-language, used in CodePanel tabs)
// =====================================================
export const codeSnippets = {
  bubble: {
    js: [
      'function bubbleSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    for (let j = 0; j < n - i - 1; j++) {',
      '      if (arr[j] > arr[j+1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '      }',
      '    }',
      '  }',
      '  return arr;',
      '}',
    ],
    python: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        for j in range(n - i - 1):',
      '            if arr[j] > arr[j+1]:',
      '                arr[j], arr[j+1] = arr[j+1], arr[j]',
      '    return arr',
    ],
    cpp: [
      'void bubbleSort(int arr[], int n) {',
      '    for(int i = 0; i < n-1; i++) {',
      '        for(int j = 0; j < n-i-1; j++) {',
      '            if(arr[j] > arr[j+1]) {',
      '                swap(arr[j], arr[j+1]);',
      '            }',
      '        }',
      '    }',
      '}',
    ],
  },
  selection: {
    js: [
      'function selectionSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i+1; j < n; j++) {',
      '      if (arr[j] < arr[minIdx]) {',
      '        minIdx = j;',
      '      }',
      '    }',
      '    if (minIdx !== i)',
      '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '  }',
      '  return arr;',
      '}',
    ],
    python: [
      'def selection_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n-1):',
      '        min_idx = i',
      '        for j in range(i+1, n):',
      '            if arr[j] < arr[min_idx]:',
      '                min_idx = j',
      '        arr[i], arr[min_idx] = arr[min_idx], arr[i]',
      '    return arr',
    ],
    cpp: [
      'void selectionSort(int arr[], int n) {',
      '    for(int i=0; i<n-1; i++) {',
      '        int minIdx = i;',
      '        for(int j=i+1; j<n; j++)',
      '            if(arr[j] < arr[minIdx]) minIdx = j;',
      '        swap(arr[i], arr[minIdx]);',
      '    }',
      '}',
    ],
  },
  insertion: {
    js: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j+1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j+1] = key;',
      '  }',
      '  return arr;',
      '}',
    ],
    python: [
      'def insertion_sort(arr):',
      '    for i in range(1, len(arr)):',
      '        key = arr[i]',
      '        j = i - 1',
      '        while j >= 0 and arr[j] > key:',
      '            arr[j+1] = arr[j]',
      '            j -= 1',
      '        arr[j+1] = key',
      '    return arr',
    ],
    cpp: [
      'void insertionSort(int arr[], int n) {',
      '    for(int i=1; i<n; i++) {',
      '        int key = arr[i], j = i-1;',
      '        while(j >= 0 && arr[j] > key) {',
      '            arr[j+1] = arr[j]; j--;',
      '        }',
      '        arr[j+1] = key;',
      '    }',
      '}',
    ],
  },
  merge: {
    js: [
      'function mergeSort(arr) {',
      '  if (arr.length <= 1) return arr;',
      '  const mid = Math.floor(arr.length / 2);',
      '  const left = mergeSort(arr.slice(0, mid));',
      '  const right = mergeSort(arr.slice(mid));',
      '  return merge(left, right);',
      '}',
      'function merge(L, R) {',
      '  let result = [], i = 0, j = 0;',
      '  while (i < L.length && j < R.length)',
      '    result.push(L[i] <= R[j] ? L[i++] : R[j++]);',
      '  return result.concat(L.slice(i)).concat(R.slice(j));',
      '}',
    ],
    python: [
      'def merge_sort(arr):',
      '    if len(arr) <= 1: return arr',
      '    mid = len(arr) // 2',
      '    L = merge_sort(arr[:mid])',
      '    R = merge_sort(arr[mid:])',
      '    return merge(L, R)',
      'def merge(L, R):',
      '    result, i, j = [], 0, 0',
      '    while i < len(L) and j < len(R):',
      '        if L[i] <= R[j]: result.append(L[i]); i+=1',
      '        else: result.append(R[j]); j+=1',
      '    return result + L[i:] + R[j:]',
    ],
    cpp: [
      'void merge(int a[], int l, int m, int r) {',
      '    vector<int> L(a+l,a+m+1), R(a+m+1,a+r+1);',
      '    int i=0,j=0,k=l;',
      '    while(i<L.size()&&j<R.size())',
      '        a[k++]=(L[i]<=R[j])?L[i++]:R[j++];',
      '    while(i<L.size()) a[k++]=L[i++];',
      '    while(j<R.size()) a[k++]=R[j++];',
      '}',
      'void mergeSort(int a[],int l,int r){',
      '    if(l<r){int m=(l+r)/2;',
      '    mergeSort(a,l,m);mergeSort(a,m+1,r);',
      '    merge(a,l,m,r);}',
      '}',
    ],
  },
  quick: {
    js: [
      'function quickSort(arr, lo=0, hi=arr.length-1) {',
      '  if (lo < hi) {',
      '    let p = partition(arr, lo, hi);',
      '    quickSort(arr, lo, p - 1);',
      '    quickSort(arr, p + 1, hi);',
      '  }',
      '}',
      'function partition(arr, lo, hi) {',
      '  // Select FIRST element as pivot',
      '  let pivot = arr[lo];',
      '  // Move pivot to end temporarily',
      '  [arr[lo], arr[hi]] = [arr[hi], arr[lo]];',
      '  let i = lo - 1;',
      '  for (let j = lo; j < hi; j++) {',
      '    if (arr[j] <= pivot) {',
      '      i++;',
      '      [arr[i], arr[j]] = [arr[j], arr[i]];',
      '    }',
      '  }',
      '  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];',
      '  return i + 1;',
      '}',
    ],
    python: [
      'def quick_sort(arr, lo, hi):',
      '    if lo < hi:',
      '        p = partition(arr, lo, hi)',
      '        quick_sort(arr, lo, p-1)',
      '        quick_sort(arr, p+1, hi)',
      'def partition(arr, lo, hi):',
      '    # Select FIRST element as pivot',
      '    pivot = arr[lo]',
      '    # Move pivot to end temporarily',
      '    arr[lo], arr[hi] = arr[hi], arr[lo]',
      '    i = lo - 1',
      '    for j in range(lo, hi):',
      '        if arr[j] <= pivot:',
      '            i += 1',
      '            arr[i], arr[j] = arr[j], arr[i]',
      '    arr[i+1], arr[hi] = arr[hi], arr[i+1]',
      '    return i + 1',
    ],
    cpp: [
      'int partition(int a[], int lo, int hi) {',
      '    // Select FIRST element as pivot',
      '    int pivot = a[lo];',
      '    // Move pivot to end temporarily',
      '    swap(a[lo], a[hi]);',
      '    int i = lo - 1;',
      '    for (int j = lo; j < hi; j++)',
      '        if (a[j] <= pivot) swap(a[++i], a[j]);',
      '    swap(a[i+1], a[hi]);',
      '    return i + 1;',
      '}',
      'void quickSort(int a[], int lo, int hi) {',
      '    if (lo < hi) {',
      '        int p = partition(a, lo, hi);',
      '        quickSort(a, lo, p-1);',
      '        quickSort(a, p+1, hi);',
      '    }',
      '}',
    ],
  },
  heap: {
    js: [
      'function heapSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = n/2-1|0; i >= 0; i--) heapify(arr,n,i);',
      '  for (let i = n-1; i > 0; i--) {',
      '    [arr[0],arr[i]] = [arr[i],arr[0]];',
      '    heapify(arr, i, 0);',
      '  }',
      '}',
      'function heapify(arr, n, i) {',
      '  let largest = i, l=2*i+1, r=2*i+2;',
      '  if (l<n && arr[l]>arr[largest]) largest=l;',
      '  if (r<n && arr[r]>arr[largest]) largest=r;',
      '  if (largest !== i) {',
      '    [arr[i],arr[largest]] = [arr[largest],arr[i]];',
      '    heapify(arr, n, largest);',
      '  }',
      '}',
    ],
    python: [
      'def heap_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n//2-1,-1,-1):',
      '        heapify(arr,n,i)',
      '    for i in range(n-1,0,-1):',
      '        arr[0],arr[i]=arr[i],arr[0]',
      '        heapify(arr,i,0)',
      'def heapify(arr,n,i):',
      '    largest,l,r=i,2*i+1,2*i+2',
      '    if l<n and arr[l]>arr[largest]: largest=l',
      '    if r<n and arr[r]>arr[largest]: largest=r',
      '    if largest!=i:',
      '        arr[i],arr[largest]=arr[largest],arr[i]',
      '        heapify(arr,n,largest)',
    ],
    cpp: [
      'void heapify(int a[],int n,int i){',
      '    int lg=i,l=2*i+1,r=2*i+2;',
      '    if(l<n&&a[l]>a[lg])lg=l;',
      '    if(r<n&&a[r]>a[lg])lg=r;',
      '    if(lg!=i){swap(a[i],a[lg]);heapify(a,n,lg);}',
      '}',
      'void heapSort(int a[],int n){',
      '    for(int i=n/2-1;i>=0;i--)heapify(a,n,i);',
      '    for(int i=n-1;i>0;i--){',
      '        swap(a[0],a[i]);heapify(a,i,0);',
      '    }',
      '}',
    ],
  },
  counting: {
    js: [
      'function countingSort(arr) {',
      '  const max = Math.max(...arr);',
      '  const count = new Array(max + 1).fill(0);',
      '  for (let x of arr) count[x]++;',
      '  let idx = 0;',
      '  for (let i = 0; i <= max; i++)',
      '    while (count[i]-- > 0) arr[idx++] = i;',
      '  return arr;',
      '}',
    ],
    python: [
      'def counting_sort(arr):',
      '    mx = max(arr)',
      '    count = [0] * (mx + 1)',
      '    for x in arr: count[x] += 1',
      '    result = []',
      '    for i, c in enumerate(count):',
      '        result.extend([i] * c)',
      '    return result',
    ],
    cpp: [
      'void countingSort(int a[],int n){',
      '    int mx=*max_element(a,a+n);',
      '    vector<int> cnt(mx+1,0);',
      '    for(int i=0;i<n;i++) cnt[a[i]]++;',
      '    int idx=0;',
      '    for(int i=0;i<=mx;i++)',
      '        while(cnt[i]-->0) a[idx++]=i;',
      '}',
    ],
  },
  radix: {
    js: [
      'function radixSort(arr) {',
      '  let max = Math.max(...arr);',
      '  for (let exp = 1; max/exp >= 1; exp *= 10)',
      '    countByDigit(arr, exp);',
      '  return arr;',
      '}',
      'function countByDigit(arr, exp) {',
      '  const output = new Array(arr.length);',
      '  const count = new Array(10).fill(0);',
      '  for (let x of arr) count[Math.floor(x/exp)%10]++;',
      '  for (let i = 1; i < 10; i++) count[i] += count[i-1];',
      '  for (let i=arr.length-1;i>=0;i--) {',
      '    output[--count[Math.floor(arr[i]/exp)%10]] = arr[i];',
      '  }',
      '  arr.splice(0, arr.length, ...output);',
      '}',
    ],
    python: [
      'def radix_sort(arr):',
      '    mx = max(arr)',
      '    exp = 1',
      '    while mx // exp > 0:',
      '        count_by_digit(arr, exp)',
      '        exp *= 10',
      'def count_by_digit(arr, exp):',
      '    n = len(arr)',
      '    output = [0]*n',
      '    count = [0]*10',
      '    for x in arr: count[(x//exp)%10] += 1',
      '    for i in range(1,10): count[i]+=count[i-1]',
      '    for i in range(n-1,-1,-1):',
      '        d=(arr[i]//exp)%10',
      '        count[d]-=1; output[count[d]]=arr[i]',
      '    arr[:] = output',
    ],
    cpp: [
      'void countDigit(int a[],int n,int e){',
      '    int out[n],cnt[10]={};',
      '    for(int i=0;i<n;i++) cnt[(a[i]/e)%10]++;',
      '    for(int i=1;i<10;i++) cnt[i]+=cnt[i-1];',
      '    for(int i=n-1;i>=0;i--)',
      '        out[--cnt[(a[i]/e)%10]]=a[i];',
      '    for(int i=0;i<n;i++) a[i]=out[i];',
      '}',
      'void radixSort(int a[],int n){',
      '    int mx=*max_element(a,a+n);',
      '    for(int e=1;mx/e>=1;e*=10)',
      '        countDigit(a,n,e);',
      '}',
    ],
  },
  'linear-search': {
    js: [
      'function linearSearch(arr, target) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    if (arr[i] === target) {',
      '      return i; // found',
      '    }',
      '  }',
      '  return -1; // not found',
      '}',
    ],
    python: ['def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1'],
    cpp: ['int linearSearch(int a[],int n,int t){\n    for(int i=0;i<n;i++)\n        if(a[i]==t) return i;\n    return -1;\n}'],
  },
  'binary-search': {
    js: [
      'function binarySearch(arr, target) {',
      '  let lo = 0, hi = arr.length - 1;',
      '  while (lo <= hi) {',
      '    let mid = (lo + hi) >> 1;',
      '    if (arr[mid] === target) return mid;',
      '    if (arr[mid] < target) lo = mid + 1;',
      '    else hi = mid - 1;',
      '  }',
      '  return -1;',
      '}',
    ],
    python: [
      'def binary_search(arr, target):',
      '    lo, hi = 0, len(arr) - 1',
      '    while lo <= hi:',
      '        mid = (lo + hi) // 2',
      '        if arr[mid] == target: return mid',
      '        elif arr[mid] < target: lo = mid + 1',
      '        else: hi = mid - 1',
      '    return -1',
    ],
    cpp: [
      'int binarySearch(int a[],int n,int t){',
      '    int lo=0,hi=n-1;',
      '    while(lo<=hi){',
      '        int mid=(lo+hi)/2;',
      '        if(a[mid]==t) return mid;',
      '        if(a[mid]<t) lo=mid+1;',
      '        else hi=mid-1;',
      '    }',
      '    return -1;',
      '}',
    ],
  },
  'jump-search': {
    js: [
      'function jumpSearch(arr, target) {',
      '  const n = arr.length;',
      '  const step = Math.floor(Math.sqrt(n));',
      '  let prev = 0, curr = step;',
      '  while (curr < n && arr[curr] <= target) {',
      '    prev = curr; curr += step;',
      '  }',
      '  for (let i = prev; i < Math.min(curr, n); i++) {',
      '    if (arr[i] === target) return i;',
      '  }',
      '  return -1;',
      '}',
    ],
    python: [
      'import math',
      'def jump_search(arr, target):',
      '    n = len(arr)',
      '    step = int(math.sqrt(n))',
      '    prev, curr = 0, step',
      '    while curr < n and arr[curr] <= target:',
      '        prev, curr = curr, curr + step',
      '    for i in range(prev, min(curr, n)):',
      '        if arr[i] == target: return i',
      '    return -1',
    ],
    cpp: [
      '#include<cmath>',
      'int jumpSearch(int a[],int n,int t){',
      '    int step=sqrt(n),prev=0,curr=step;',
      '    while(curr<n&&a[curr]<=t){prev=curr;curr+=step;}',
      '    for(int i=prev;i<min(curr,n);i++)',
      '        if(a[i]==t) return i;',
      '    return -1;',
      '}',
    ],
  },
  bfs: {
    js: [
      'function bfs(graph, start) {',
      '  const visited = new Set(), queue = [start];',
      '  visited.add(start);',
      '  while (queue.length) {',
      '    const node = queue.shift();',
      '    console.log("Visit:", node);',
      '    for (const neighbor of graph[node]) {',
      '      if (!visited.has(neighbor)) {',
      '        visited.add(neighbor);',
      '        queue.push(neighbor);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    python: [
      'from collections import deque',
      'def bfs(graph, start):',
      '    visited, queue = {start}, deque([start])',
      '    while queue:',
      '        node = queue.popleft()',
      '        print("Visit:", node)',
      '        for neighbor in graph[node]:',
      '            if neighbor not in visited:',
      '                visited.add(neighbor)',
      '                queue.append(neighbor)',
    ],
    cpp: [
      'void bfs(vector<vector<int>>& g, int s) {',
      '    vector<bool> vis(g.size(), false);',
      '    queue<int> q;',
      '    vis[s] = true; q.push(s);',
      '    while (!q.empty()) {',
      '        int v = q.front(); q.pop();',
      '        cout << v << " ";',
      '        for (int nb : g[v])',
      '            if (!vis[nb]) { vis[nb]=true; q.push(nb); }',
      '    }',
      '}',
    ],
  },
  dfs: {
    js: [
      'function dfs(graph, node, visited = new Set()) {',
      '  if (visited.has(node)) return;',
      '  visited.add(node);',
      '  console.log("Visit:", node);',
      '  for (const neighbor of graph[node]) {',
      '    dfs(graph, neighbor, visited);',
      '  }',
      '}',
    ],
    python: [
      'def dfs(graph, node, visited=None):',
      '    if visited is None: visited = set()',
      '    if node in visited: return',
      '    visited.add(node)',
      '    print("Visit:", node)',
      '    for neighbor in graph[node]:',
      '        dfs(graph, neighbor, visited)',
    ],
    cpp: [
      'void dfs(vector<vector<int>>& g, int v,',
      '         vector<bool>& vis) {',
      '    vis[v] = true;',
      '    cout << v << " ";',
      '    for (int nb : g[v])',
      '        if (!vis[nb]) dfs(g, nb, vis);',
      '}',
    ],
  },
  dijkstra: {
    js: [
      'function dijkstra(graph, src) {',
      '  const dist = {}, prev = {};',
      '  for (const v of Object.keys(graph))',
      '    dist[v] = Infinity;',
      '  dist[src] = 0;',
      '  const unvisited = new Set(Object.keys(graph));',
      '  while (unvisited.size) {',
      '    // Pick unvisited node with min dist',
      '    const u = [...unvisited].reduce((a,b) =>',
      '      dist[a] < dist[b] ? a : b);',
      '    unvisited.delete(u);',
      '    for (const [v, w] of graph[u]) {',
      '      if (dist[u] + w < dist[v]) {',
      '        dist[v] = dist[u] + w;',
      '        prev[v] = u;',
      '      }',
      '    }',
      '  }',
      '  return dist;',
      '}',
    ],
    python: [
      'import heapq',
      'def dijkstra(graph, src):',
      '    dist = {v: float("inf") for v in graph}',
      '    dist[src] = 0',
      '    pq = [(0, src)]',
      '    while pq:',
      '        d, u = heapq.heappop(pq)',
      '        if d > dist[u]: continue',
      '        for v, w in graph[u]:',
      '            if dist[u] + w < dist[v]:',
      '                dist[v] = dist[u] + w',
      '                heapq.heappush(pq, (dist[v], v))',
      '    return dist',
    ],
    cpp: [
      'vector<int> dijkstra(vector<vector<pair<int,int>>>& g,',
      '                     int src) {',
      '    int n = g.size();',
      '    vector<int> dist(n, INT_MAX);',
      '    dist[src] = 0;',
      '    priority_queue<pair<int,int>,',
      '      vector<pair<int,int>>, greater<>> pq;',
      '    pq.push({0, src});',
      '    while (!pq.empty()) {',
      '        auto [d, u] = pq.top(); pq.pop();',
      '        if (d > dist[u]) continue;',
      '        for (auto [v,w]: g[u])',
      '            if (dist[u]+w < dist[v])',
      '                { dist[v]=dist[u]+w; pq.push({dist[v],v}); }',
      '    }',
      '    return dist;',
      '}',
    ],
  },
  prim: {
    js: [
      '// Prim\'s MST — greedy edge selection',
      'function prim(graph, n) {',
      '  const key = Array(n).fill(Infinity);',
      '  const inMST = Array(n).fill(false);',
      '  key[0] = 0;',
      '  const mst = [];',
      '  for (let i = 0; i < n; i++) {',
      '    // Pick min-key vertex not in MST',
      '    let u = -1;',
      '    for (let v = 0; v < n; v++)',
      '      if (!inMST[v] && (u===-1 || key[v]<key[u])) u=v;',
      '    inMST[u] = true;',
      '    for (const [v, w] of graph[u]) {',
      '      if (!inMST[v] && w < key[v]) key[v] = w;',
      '    }',
      '  }',
      '}',
    ],
    python: [
      '# Prim\'s MST — greedy edge selection',
      'import heapq',
      'def prim(graph, n):',
      '    key = [float("inf")] * n',
      '    in_mst = [False] * n',
      '    key[0] = 0',
      '    pq = [(0, 0)]',
      '    while pq:',
      '        d, u = heapq.heappop(pq)',
      '        if in_mst[u]: continue',
      '        in_mst[u] = True',
      '        for v, w in graph[u]:',
      '            if not in_mst[v] and w < key[v]:',
      '                key[v] = w',
      '                heapq.heappush(pq, (w, v))',
    ],
    cpp: [
      '// Prim\'s MST',
      'vector<int> primMST(vector<vector<pair<int,int>>>& g,int n){',
      '    vector<int> key(n, INT_MAX), parent(n,-1);',
      '    vector<bool> inMST(n,false);',
      '    key[0]=0;',
      '    priority_queue<pair<int,int>,',
      '      vector<pair<int,int>>,greater<>> pq;',
      '    pq.push({0,0});',
      '    while(!pq.empty()){',
      '        auto [d,u]=pq.top(); pq.pop();',
      '        if(inMST[u]) continue;',
      '        inMST[u]=true;',
      '        for(auto [v,w]:g[u])',
      '            if(!inMST[v]&&w<key[v])',
      '               {key[v]=w; parent[v]=u; pq.push({w,v});}',
      '    }',
      '    return parent;',
      '}',
    ],
  },
  kruskal: {
    js: [
      '// Kruskal\'s MST — Union-Find',
      'function kruskal(edges, n) {',
      '  edges.sort((a,b) => a.w - b.w);',
      '  const parent = Array.from({length:n},(_,i)=>i);',
      '  function find(x) {',
      '    return parent[x]===x ? x : (parent[x]=find(parent[x]));',
      '  }',
      '  function union(x, y) {',
      '    parent[find(x)] = find(y);',
      '  }',
      '  const mst = [];',
      '  for (const e of edges) {',
      '    if (find(e.a) !== find(e.b)) {',
      '      union(e.a, e.b);',
      '      mst.push(e);',
      '    }',
      '  }',
      '  return mst;',
      '}',
    ],
    python: [
      '# Kruskal\'s MST — Union-Find',
      'def kruskal(edges, n):',
      '    edges.sort(key=lambda e: e[2])',
      '    parent = list(range(n))',
      '    def find(x):',
      '        while parent[x] != x:',
      '            parent[x] = parent[parent[x]]',
      '            x = parent[x]',
      '        return x',
      '    mst = []',
      '    for a, b, w in edges:',
      '        if find(a) != find(b):',
      '            parent[find(a)] = find(b)',
      '            mst.append((a, b, w))',
      '    return mst',
    ],
    cpp: [
      '// Kruskal\'s MST',
      'struct Edge{int a,b,w;};',
      'int parent[MAXN];',
      'int find(int x){return parent[x]==x?x:parent[x]=find(parent[x]);}',
      'vector<Edge> kruskal(vector<Edge>& edges, int n){',
      '    iota(parent,parent+n,0);',
      '    sort(edges.begin(),edges.end(),[](auto&a,auto&b){return a.w<b.w;});',
      '    vector<Edge> mst;',
      '    for(auto& e:edges){',
      '        int pa=find(e.a), pb=find(e.b);',
      '        if(pa!=pb){ parent[pa]=pb; mst.push_back(e); }',
      '    }',
      '    return mst;',
      '}',
    ],
  },
};
// ── Java & C# code snippets (supplement — keyed same as codeMap) ──
export const codeMap = {
  bubble: [
    'void bubbleSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n-1; i++) {',
    '        for (int j = 0; j < n-i-1; j++) {',
    '            if (arr[j] > arr[j+1]) {',
    '                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  selection: [
    'void selectionSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n-1; i++) {',
    '        int min = i;',
    '        for (int j = i+1; j < n; j++)',
    '            if (arr[j] < arr[min]) min = j;',
    '        int t = arr[i]; arr[i] = arr[min]; arr[min] = t;',
    '    }',
    '}',
  ],
  insertion: [
    'void insertionSort(int[] arr) {',
    '    for (int i = 1; i < arr.length; i++) {',
    '        int key = arr[i], j = i - 1;',
    '        while (j >= 0 && arr[j] > key)',
    '            arr[j+1] = arr[j--];',
    '        arr[j+1] = key;',
    '    }',
    '}',
  ],
  merge: [
    'void mergeSort(int[] a, int l, int r) {',
    '    if (l >= r) return;',
    '    int m = (l + r) / 2;',
    '    mergeSort(a, l, m);',
    '    mergeSort(a, m+1, r);',
    '    merge(a, l, m, r);',
    '}',
  ],
  quick: [
    '// Pivot = first element',
    'void quickSort(int[] a, int lo, int hi) {',
    '    if (lo >= hi) return;',
    '    int p = partition(a, lo, hi);',
    '    quickSort(a, lo, p-1);',
    '    quickSort(a, p+1, hi);',
    '}',
  ],
  heap: [
    'void heapSort(int[] a) {',
    '    int n = a.length;',
    '    for (int i = n/2-1; i >= 0; i--) heapify(a, n, i);',
    '    for (int i = n-1; i > 0; i--) {',
    '        int t = a[0]; a[0] = a[i]; a[i] = t;',
    '        heapify(a, i, 0);',
    '    }',
    '}',
  ],
  counting: [
    'void countingSort(int[] a) {',
    '    int max = Arrays.stream(a).max().getAsInt();',
    '    int[] cnt = new int[max+1];',
    '    for (int x : a) cnt[x]++;',
    '    int i = 0;',
    '    for (int v = 0; v <= max; v++)',
    '        while (cnt[v]-- > 0) a[i++] = v;',
    '}',
  ],
  radix: [
    'void radixSort(int[] a) {',
    '    int max = Arrays.stream(a).max().getAsInt();',
    '    for (int exp = 1; max/exp > 0; exp *= 10)',
    '        countByDigit(a, exp);',
    '}',
  ],
  'linear-search': [
    'int linearSearch(int[] a, int t) {',
    '    for (int i = 0; i < a.length; i++)',
    '        if (a[i] == t) return i;',
    '    return -1;',
    '}',
  ],
  'binary-search': [
    'int binarySearch(int[] a, int t) {',
    '    int lo = 0, hi = a.length - 1;',
    '    while (lo <= hi) {',
    '        int mid = (lo + hi) >>> 1;',
    '        if (a[mid] == t) return mid;',
    '        else if (a[mid] < t) lo = mid + 1;',
    '        else hi = mid - 1;',
    '    }',
    '    return -1;',
    '}',
  ],
  'jump-search': [
    'int jumpSearch(int[] a, int t) {',
    '    int n = a.length, step = (int)Math.sqrt(n);',
    '    int prev = 0;',
    '    while (a[Math.min(step,n)-1] < t) {',
    '        prev = step; step += (int)Math.sqrt(n);',
    '        if (prev >= n) return -1;',
    '    }',
    '    while (a[prev] < t) if (++prev == Math.min(step,n)) return -1;',
    '    return a[prev] == t ? prev : -1;',
    '}',
  ],
  bfs: [
    'void bfs(List<List<Integer>> g, int s) {',
    '    boolean[] vis = new boolean[g.size()];',
    '    Queue<Integer> q = new LinkedList<>();',
    '    vis[s] = true; q.add(s);',
    '    while (!q.isEmpty()) {',
    '        int v = q.poll();',
    '        System.out.print(v + " ");',
    '        for (int nb : g.get(v))',
    '            if (!vis[nb]) { vis[nb]=true; q.add(nb); }',
    '    }',
    '}',
  ],
  dfs: [
    'void dfs(List<List<Integer>> g, int v, boolean[] vis) {',
    '    vis[v] = true;',
    '    System.out.print(v + " ");',
    '    for (int nb : g.get(v))',
    '        if (!vis[nb]) dfs(g, nb, vis);',
    '}',
  ],
  dijkstra: [
    'int[] dijkstra(List<int[]>[] g, int src) {',
    '    int n = g.length;',
    '    int[] dist = new int[n];',
    '    Arrays.fill(dist, Integer.MAX_VALUE);',
    '    dist[src] = 0;',
    '    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a->a[0]));',
    '    pq.add(new int[]{0, src});',
    '    while (!pq.isEmpty()) {',
    '        int[] cur = pq.poll();',
    '        int d = cur[0], u = cur[1];',
    '        if (d > dist[u]) continue;',
    '        for (int[] e : g[u])',
    '            if (dist[u]+e[1] < dist[e[0]]) {',
    '                dist[e[0]] = dist[u]+e[1];',
    '                pq.add(new int[]{dist[e[0]], e[0]});',
    '            }',
    '    }',
    '    return dist;',
    '}',
  ],
  prim: [
    'void prim(int[][] w, int n) {',
    '    int[] key = new int[n]; Arrays.fill(key, Integer.MAX_VALUE);',
    '    boolean[] inMST = new boolean[n];',
    '    key[0] = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        int u = minKey(key, inMST, n);',
    '        inMST[u] = true;',
    '        for (int v = 0; v < n; v++)',
    '            if (w[u][v]!=0 && !inMST[v] && w[u][v] < key[v])',
    '                key[v] = w[u][v];',
    '    }',
    '}',
  ],
  kruskal: [
    'int[] parent;',
    'int find(int x) { return parent[x]==x?x:(parent[x]=find(parent[x])); }',
    'void kruskal(int[][] edges, int n) {',
    '    parent = new int[n];',
    '    for (int i=0;i<n;i++) parent[i]=i;',
    '    Arrays.sort(edges, (a,b)->a[2]-b[2]);',
    '    for (int[] e : edges) {',
    '        int pa=find(e[0]), pb=find(e[1]);',
    '        if (pa != pb) { parent[pa]=pb; /* add edge */ }',
    '    }',
    '}',
  ],
};

export const javaCodeMap = {
  bubble: [
    'void BubbleSort(int[] arr) {',
    '    int n = arr.Length;',
    '    for (int i = 0; i < n-1; i++)',
    '        for (int j = 0; j < n-i-1; j++)',
    '            if (arr[j] > arr[j+1])',
    '                (arr[j], arr[j+1]) = (arr[j+1], arr[j]);',
    '}',
  ],
  selection: [
    'void SelectionSort(int[] arr) {',
    '    int n = arr.Length;',
    '    for (int i = 0; i < n-1; i++) {',
    '        int min = i;',
    '        for (int j = i+1; j < n; j++)',
    '            if (arr[j] < arr[min]) min = j;',
    '        (arr[i], arr[min]) = (arr[min], arr[i]);',
    '    }',
    '}',
  ],
  insertion: [
    'void InsertionSort(int[] arr) {',
    '    for (int i = 1; i < arr.Length; i++) {',
    '        int key = arr[i], j = i - 1;',
    '        while (j >= 0 && arr[j] > key)',
    '            arr[j+1] = arr[j--];',
    '        arr[j+1] = key;',
    '    }',
    '}',
  ],
  merge: [
    'void MergeSort(int[] a, int l, int r) {',
    '    if (l >= r) return;',
    '    int m = (l + r) / 2;',
    '    MergeSort(a, l, m);',
    '    MergeSort(a, m+1, r);',
    '    Merge(a, l, m, r);',
    '}',
  ],
  quick: [
    '// Pivot = first element',
    'void QuickSort(int[] a, int lo, int hi) {',
    '    if (lo >= hi) return;',
    '    int p = Partition(a, lo, hi);',
    '    QuickSort(a, lo, p-1);',
    '    QuickSort(a, p+1, hi);',
    '}',
  ],
  heap: [
    'void HeapSort(int[] a) {',
    '    int n = a.Length;',
    '    for (int i = n/2-1; i >= 0; i--) Heapify(a, n, i);',
    '    for (int i = n-1; i > 0; i--) {',
    '        (a[0], a[i]) = (a[i], a[0]);',
    '        Heapify(a, i, 0);',
    '    }',
    '}',
  ],
  counting: [
    'void CountingSort(int[] a) {',
    '    int max = a.Max();',
    '    int[] cnt = new int[max+1];',
    '    foreach (var x in a) cnt[x]++;',
    '    int i = 0;',
    '    for (int v = 0; v <= max; v++)',
    '        while (cnt[v]-- > 0) a[i++] = v;',
    '}',
  ],
  radix: [
    'void RadixSort(int[] a) {',
    '    int max = a.Max();',
    '    for (int exp = 1; max/exp > 0; exp *= 10)',
    '        CountByDigit(a, exp);',
    '}',
  ],
  'linear-search': [
    'int LinearSearch(int[] a, int t) {',
    '    for (int i = 0; i < a.Length; i++)',
    '        if (a[i] == t) return i;',
    '    return -1;',
    '}',
  ],
  'binary-search': [
    'int BinarySearch(int[] a, int t) {',
    '    int lo = 0, hi = a.Length - 1;',
    '    while (lo <= hi) {',
    '        int mid = (lo + hi) / 2;',
    '        if (a[mid] == t) return mid;',
    '        else if (a[mid] < t) lo = mid + 1;',
    '        else hi = mid - 1;',
    '    }',
    '    return -1;',
    '}',
  ],
  'jump-search': [
    'int JumpSearch(int[] a, int t) {',
    '    int n = a.Length, step = (int)Math.Sqrt(n), prev = 0;',
    '    while (a[Math.Min(step,n)-1] < t) {',
    '        prev = step; step += (int)Math.Sqrt(n);',
    '        if (prev >= n) return -1;',
    '    }',
    '    while (a[prev] < t) if (++prev == Math.Min(step,n)) return -1;',
    '    return a[prev] == t ? prev : -1;',
    '}',
  ],
  bfs: [
    'void Bfs(List<List<int>> g, int s) {',
    '    var vis = new bool[g.Count];',
    '    var q = new Queue<int>();',
    '    vis[s] = true; q.Enqueue(s);',
    '    while (q.Count > 0) {',
    '        int v = q.Dequeue();',
    '        Console.Write(v + " ");',
    '        foreach (var nb in g[v])',
    '            if (!vis[nb]) { vis[nb]=true; q.Enqueue(nb); }',
    '    }',
    '}',
  ],
  dfs: [
    'void Dfs(List<List<int>> g, int v, bool[] vis) {',
    '    vis[v] = true;',
    '    Console.Write(v + " ");',
    '    foreach (var nb in g[v])',
    '        if (!vis[nb]) Dfs(g, nb, vis);',
    '}',
  ],
  dijkstra: [
    'int[] Dijkstra(List<(int,int)>[] g, int src) {',
    '    int n = g.Length;',
    '    var dist = new int[n];',
    '    Array.Fill(dist, int.MaxValue);',
    '    dist[src] = 0;',
    '    var pq = new PriorityQueue<int,int>();',
    '    pq.Enqueue(src, 0);',
    '    while (pq.Count > 0) {',
    '        int u = pq.Dequeue();',
    '        foreach (var (v,w) in g[u])',
    '            if (dist[u]+w < dist[v]) {',
    '                dist[v] = dist[u]+w;',
    '                pq.Enqueue(v, dist[v]);',
    '            }',
    '    }',
    '    return dist;',
    '}',
  ],
  prim: [
    'void Prim(int[,] w, int n) {',
    '    var key = new int[n]; Array.Fill(key, int.MaxValue);',
    '    var inMST = new bool[n];',
    '    key[0] = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        int u = MinKey(key, inMST, n);',
    '        inMST[u] = true;',
    '        for (int v = 0; v < n; v++)',
    '            if (w[u,v]!=0 && !inMST[v] && w[u,v] < key[v])',
    '                key[v] = w[u,v];',
    '    }',
    '}',
  ],
  kruskal: [
    'int[] parent;',
    'int Find(int x) => parent[x]==x ? x : (parent[x]=Find(parent[x]));',
    'void Kruskal(int[][] edges, int n) {',
    '    parent = Enumerable.Range(0,n).ToArray();',
    '    Array.Sort(edges, (a,b)=>a[2]-b[2]);',
    '    foreach (var e in edges) {',
    '        int pa=Find(e[0]), pb=Find(e[1]);',
    '        if (pa != pb) parent[pa] = pb;',
    '    }',
    '}',
  ],
};

export const algorithms = {};
for (const key of Object.keys(complexity)) {
  const snippets = codeSnippets[key];   // per-language { js:[], python:[], cpp:[], ... }
  const javaSnip = codeMap[key];        // Java  (array of lines)
  const csharpSnip = javaCodeMap[key];  // C#    (array of lines)
  const info = explanations[key];       // { title, body }

  if (info && (snippets || javaSnip)) {
    const jsLines    = snippets?.js     ?? javaSnip ?? [];
    const pyLines    = snippets?.python ?? [];
    const cppLines   = snippets?.cpp    ?? [];
    const javaLines  = javaSnip         ?? [];
    const csLines    = csharpSnip       ?? [];

    const join = (lines) =>
      Array.isArray(lines) ? lines.join('\n') : String(lines);

    algorithms[key] = {
      name:        info.title,
      description: info.body.replace(/<[^>]*>?/gm, ''),
      complexity:  complexity[key],
      // Legacy single-lang field (used by old CodePanel callers)
      code: { js: join(jsLines) },
      // New multi-lang map used by the upgraded CodePanel tabs
      codeByLang: {
        js:     join(jsLines),
        python: join(pyLines),
        cpp:    join(cppLines),
        java:   join(javaLines),
        csharp: join(csLines),
      },
    };
  }
}

