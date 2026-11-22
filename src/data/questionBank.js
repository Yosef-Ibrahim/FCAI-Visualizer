// Offline question pools. Keep existing entries in order; append new content only after review.
const RAW_QUESTION_BANK = {
  sorting: {
    general: {
      easy: [
        {
          q: "What is the time complexity of Quick Sort in average case?",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(log n)"],
          answer: "B",
          exp: "Quick Sort uses divide-and-conquer giving O(n log n)",
        },
        {
          q: "Which sort is stable?",
          options: [
            "A) Quick Sort",
            "B) Merge Sort",
            "C) Heap Sort",
            "D) Selection Sort",
          ],
          answer: "B",
          exp: "Merge Sort preserves order of equal elements",
        },
        {
          q: "Best case of Bubble Sort?",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(1)"],
          answer: "A",
          exp: "When already sorted, bubble sort makes one pass",
        },
        {
          q: "Which uses divide and conquer?",
          options: ["A) Bubble", "B) Insertion", "C) Merge", "D) Selection"],
          answer: "C",
          exp: "Merge Sort splits array and merges back",
        },
        {
          q: "Space complexity of Merge Sort?",
          options: ["A) O(1)", "B) O(n)", "C) O(log n)", "D) O(n²)"],
          answer: "B",
          exp: "Merge Sort needs auxiliary array",
        },
      ],
      medium: [
        {
          q: "When is Insertion Sort best?",
          options: [
            "A) Random",
            "B) Nearly sorted",
            "C) Reverse sorted",
            "D) Large array",
          ],
          answer: "B",
          exp: "Nearly sorted gives O(n)",
        },
        {
          q: "Quick Sort worst case?",
          options: [
            "A) Sorted input",
            "B) Random",
            "C) Unique",
            "D) Duplicates",
          ],
          answer: "A",
          exp: "Sorted input gives O(n²)",
        },
        {
          q: "Which in-place sort?",
          options: ["A) Merge", "B) Quick", "C) Three", "D) None"],
          answer: "B",
          exp: "Quick Sort is in-place",
        },
        {
          q: "Heap Sort time?",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(1)"],
          answer: "B",
          exp: "Always O(n log n) guaranteed",
        },
        {
          q: "Stable sort among these?",
          options: ["A) Quick", "B) Heap", "C) Insertion", "D) Selection"],
          answer: "C",
          exp: "Insertion Sort is stable; Quick Sort and Heap Sort are generally unstable.",
        },
      ],
      hard: [
        {
          q: "3-way partition quick sort for?",
          options: [
            "A) All unique",
            "B) Many duplicates",
            "C) Sorted",
            "D) Reverse",
          ],
          answer: "B",
          exp: "Dutch National Flag problem",
        },
        {
          q: "External sorting for?",
          options: ["A) Memory", "B) Disk data", "C) Small", "D) CPU"],
          answer: "B",
          exp: "For data too large for memory",
        },
        {
          q: "Tim Sort best for?",
          options: ["A) Random", "B) Real-world", "C) Sorted", "D) Reverse"],
          answer: "B",
          exp: "Real-world has runs",
        },
        {
          q: "Counting Sort for?",
          options: [
            "A) Any numbers",
            "B) Small range",
            "C) Large range",
            "D) Strings",
          ],
          answer: "B",
          exp: "When range is small",
        },
        {
          q: "Radix Sort uses?",
          options: ["A) Compare", "B) Count Sort", "C) Quick", "D) All"],
          answer: "B",
          exp: "Uses counting sort per digit",
        },
      ],
    },
    code: {
      easy: [
        {
          q: "What does this code do?\n```\nfor i in range(n):\n  for j in range(n-i-1):\n    if arr[j] > arr[j+1]:\n      swap(arr, j, j+1)\n```",
          options: [
            "A) Selection Sort",
            "B) Bubble Sort",
            "C) Insertion Sort",
            "D) Quick Sort",
          ],
          answer: "B",
          exp: "Nested loops with adjacent swaps = Bubble Sort",
        },
        {
          q: "What is the time complexity?\n```\nfor i in range(n):\n  min_idx = i\n  for j in range(i+1, n):\n    if arr[j] < arr[min_idx]:\n      min_idx = j\n  swap(arr, i, min_idx)\n```",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(1)"],
          answer: "C",
          exp: "Two nested loops = O(n²)",
        },
        {
          q: "Which algorithm uses this pattern?\n```\nkey = arr[i]\nwhile j >= 0 and arr[j] > key:\n  arr[j+1] = arr[j]\n  j -= 1\narr[j+1] = key\n```",
          options: ["A) Bubble", "B) Selection", "C) Insertion", "D) Merge"],
          answer: "C",
          exp: "Shifting elements right = Insertion Sort",
        },
        {
          q: "What does this code implement?\n```\nmid = (low + high) // 2\nif arr[mid] == target: return mid\nelif arr[mid] < target: low = mid + 1\nelse: high = mid - 1\n```",
          options: [
            "A) Linear Search",
            "B) Binary Search",
            "C) Jump Search",
            "D) Exponential Search",
          ],
          answer: "B",
          exp: "Binary search halves the search space each iteration",
        },
        {
          q: "What algorithm does this implement?\n```\nmin = arr[0]\nfor x in arr:\n  if x < min: min = x\nreturn min\n```",
          options: [
            "A) Find Max",
            "B) Find Min",
            "C) Linear Search",
            "D) Both A and B",
          ],
          answer: "B",
          exp: "The loop tracks and returns only the minimum value.",
        },
      ],
      medium: [
        {
          q: "What does partition() do in Quick Sort?",
          options: [
            "A) Splits array",
            "B) Finds pivot position",
            "C) Sorts completely",
            "D) Merges",
          ],
          answer: "B",
          exp: "Partitions around pivot",
        },
        {
          q: "This recurrence solves to what?\nT(n) = 2T(n/2) + n",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(log n)"],
          answer: "B",
          exp: "Master theorem gives n log n",
        },
      ],
      hard: [
        {
          q: "During Merge Sort, why do we choose the left element when two values are equal?\n```\nif arr[left] <= arr[right]:\n  take_left()\nelse:\n  take_right()\n```",
          options: [
            "A) Stability",
            "B) Pivot selection",
            "C) Base case",
            "D) Partition",
          ],
          answer: "A",
          exp: "Choosing the left element first preserves the original relative order of equal elements, making the merge stable.",
        },
      ],
    },
    complexity: {
      easy: [
        {
          q: "Quick Sort average case?",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(log n)"],
          answer: "B",
          exp: "Divide and conquer",
        },
        {
          q: "Bubble Sort worst case?",
          options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(1)"],
          answer: "C",
          exp: "Two nested loops",
        },
        {
          q: "Merge Sort space?",
          options: ["A) O(1)", "B) O(n)", "C) O(log n)", "D) O(n²)"],
          answer: "B",
          exp: "Needs auxiliary array",
        },
      ],
      medium: [
        {
          q: "Heap Sort is?",
          options: ["A) Stable", "B) Unstable", "C) Depends", "D) Sometimes"],
          answer: "B",
          exp: "Swaps can change order",
        },
        {
          q: "Best sort for nearly sorted?",
          options: ["A) Quick", "B) Merge", "C) Insertion", "D) Heap"],
          answer: "C",
          exp: "O(n) for nearly sorted",
        },
      ],
      hard: [
        {
          q: "Introsort combines?",
          options: [
            "A) Quick+Heap+Insertion",
            "B) Quick+Heap+Shell",
            "C) Quick+Merge+Insertion",
            "D) Bubble+Heap+Insertion",
          ],
          answer: "A",
          exp: "Introsort starts with Quick Sort, switches to Heap Sort when recursion gets too deep, and commonly uses Insertion Sort for small partitions.",
        },
      ],
    },
  },
  searching: {
    general: {
      easy: [
        {
          q: "Binary Search needs?",
          options: ["A) Unsorted", "B) Sorted", "C) Linked", "D) Tree"],
          answer: "B",
          exp: "Works only on sorted data",
        },
        {
          q: "Binary search complexity?",
          options: ["A) O(n)", "B) O(log n)", "C) O(n²)", "D) O(1)"],
          answer: "B",
          exp: "Halves search space each time",
        },
        {
          q: "Linear search worst?",
          options: ["A) O(1)", "B) O(n)", "C) O(log n)", "D) O(n²)"],
          answer: "B",
          exp: "May need to check all",
        },
      ],
      medium: [
        {
          q: "Binary search on array size 100?",
          options: ["A) 100", "B) 50", "C) 7", "D) 10"],
          answer: "C",
          exp: "log₂(100) ≈ 7",
        },
        {
          q: "Interpolation search performs best when sorted values are approximately?",
          options: ["A) Random", "B) Uniform", "C) Sorted", "D) Any"],
          answer: "B",
          exp: "Interpolation search requires sorted data and performs best when values are approximately uniformly distributed.",
        },
      ],
      hard: [
        {
          q: "A* search uses?",
          options: ["A) BFS", "B) DFS", "C) Heuristic", "D) All"],
          answer: "C",
          exp: "Uses f(n) = g(n) + h(n)",
        },
      ],
    },
    code: {
      easy: [
        {
          q: "```\nwhile left <= right:\n  mid = (left+right)//2\n  if arr[mid] == target:\n    return mid\n```",
          options: ["A) Linear", "B) Binary", "C) Jump", "D) Interpolation"],
          answer: "B",
          exp: "Uses mid calculation",
        },
      ],
      medium: [],
      hard: [],
    },
    complexity: {
      easy: [
        {
          q: "Linear search time?",
          options: ["A) O(1)", "B) O(n)", "C) O(log n)", "D) O(n²)"],
          answer: "B",
          exp: "May need to check all elements",
        },
        {
          q: "Binary search time?",
          options: ["A) O(n)", "B) O(log n)", "C) O(n²)", "D) O(1)"],
          answer: "B",
          exp: "Halves search space each iteration",
        },
        {
          q: "Linear search space?",
          options: ["A) O(n)", "B) O(1)", "C) O(log n)", "D) O(n²)"],
          answer: "B",
          exp: "Only needs constant extra space",
        },
      ],
      medium: [
        {
          q: "Jump search uses?",
          options: ["A) O(√n)", "B) O(log n)", "C) O(n)", "D) O(1)"],
          answer: "A",
          exp: "Jumps by √n then linear search",
        },
        {
          q: "Binary search requires?",
          options: [
            "A) Unsorted array",
            "B) Sorted array",
            "C) Linked list",
            "D) Hash table",
          ],
          answer: "B",
          exp: "Only works on sorted data",
        },
      ],
      hard: [
        {
          q: "What is the worst-case time complexity of Exponential Search?",
          options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n log n)"],
          answer: "B",
          exp: "It finds a search range by doubling the index, then performs Binary Search within that range, giving O(log n) time.",
        },
      ],
    },
  },
  trees: {
    general: {
      easy: [
        {
          q: "BST search time (balanced)?",
          options: ["A) O(n)", "B) O(log n)", "C) O(1)", "D) O(n²)"],
          answer: "B",
          exp: "Balanced BST gives O(log n)",
        },
        {
          q: "AVL tree property?",
          options: [
            "A) Any",
            "B) Height balanced",
            "C) Weight balanced",
            "D) None",
          ],
          answer: "B",
          exp: "Heights differ by ≤1",
        },
        {
          q: "Binary tree max nodes at level k?",
          options: ["A) k", "B) 2k", "C) 2^k", "D) k²"],
          answer: "C",
          exp: "Level 0 has 1, level 1 has 2, etc.",
        },
        {
          q: "Inorder traversal of BST gives?",
          options: [
            "A) Pre-order",
            "B) Post-order",
            "C) Sorted order",
            "D) Level order",
          ],
          answer: "C",
          exp: "Inorder gives ascending order",
        },
        {
          q: "What is a leaf node?",
          options: [
            "A) Root",
            "B) No children",
            "C) One child",
            "D) Two children",
          ],
          answer: "B",
          exp: "Leaf has no children",
        },
      ],
      medium: [
        {
          q: "Red-Black tree color rule?",
          options: ["A) Any", "B) Root red", "C) Root black", "D) None"],
          answer: "C",
          exp: "Root must be black",
        },
        {
          q: "AVL rotation types?",
          options: ["A) 1", "B) 2", "C) 4", "D) 6"],
          answer: "C",
          exp: "LL, RR, LR, RL rotations",
        },
        {
          q: "BST delete leaf node?",
          options: [
            "A) Replace",
            "B) Remove completely",
            "C) Mark as deleted",
            "D) Nothing",
          ],
          answer: "B",
          exp: "Simply remove the leaf",
        },
        {
          q: "Using the convention that a leaf has height 0, what is the height of an empty tree?",
          options: ["A) 0", "B) -1", "C) 1", "D) Null"],
          answer: "B",
          exp: "Conventionally -1 for empty",
        },
        {
          q: "Complete binary tree property?",
          options: [
            "A) All levels full",
            "B) All levels full except last",
            "C) Perfectly balanced",
            "D) Any",
          ],
          answer: "B",
          exp: "Last level filled left to right",
        },
      ],
      hard: [
        {
          q: "B-Tree minimum degree t?",
          options: ["A) 1", "B) 2", "C) 3", "D) Any"],
          answer: "B",
          exp: "t ≥ 2",
        },
        {
          q: "B-Tree max keys per node?",
          options: ["A) t", "B) t-1", "C) 2t", "D) 2t-1"],
          answer: "D",
          exp: "Can have up to 2t-1 keys",
        },
        {
          q: "Red-Black tree height max?",
          options: ["A) log n", "B) 2 log n", "C) n", "D) n/2"],
          answer: "B",
          exp: "Height ≤ 2 log₂(n+1)",
        },
        {
          q: "Trie is used for?",
          options: ["A) Sorting", "B) String search", "C) Graph", "D) Cache"],
          answer: "B",
          exp: "Prefix-based string operations",
        },
        {
          q: "Segment tree for?",
          options: [
            "A) Point query",
            "B) Range query",
            "C) Graph",
            "D) Sorting",
          ],
          answer: "B",
          exp: "Range queries and updates",
        },
      ],
    },
    code: {
      easy: [
        {
          q: "```\nclass Node:\n  def __init__(self, val):\n    self.val = val\n    self.left = None\n    self.right = None\n```\nWhat is this?",
          options: [
            "A) Tree node",
            "B) List node",
            "C) Graph node",
            "D) Stack",
          ],
          answer: "A",
          exp: "Binary tree node structure",
        },
        {
          q: "```\nif root is None: return False\nif root.val == target: return True\nreturn search(root.left) or search(root.right)\n```\nWhat traversal?",
          options: ["A) Inorder", "B) Preorder", "C) Postorder", "D) Level"],
          answer: "B",
          exp: "Checks root before children",
        },
      ],
      medium: [
        {
          q: "Inorder traversal uses?",
          options: ["A) Stack", "B) Queue", "C) Both", "D) None"],
          answer: "A",
          exp: "Uses stack explicitly or recursion",
        },
        {
          q: "Level order uses?",
          options: ["A) Stack", "B) Queue", "C) Both", "D) None"],
          answer: "B",
          exp: "BFS uses queue",
        },
      ],
      hard: [
        {
          q: "Morris traversal uses?",
          options: ["A) Stack", "B) Queue", "C) No extra space", "D) Heap"],
          answer: "C",
          exp: "Threaded binary tree technique",
        },
      ],
    },
    complexity: {
      easy: [
        {
          q: "BST search (worst case)?",
          options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n log n)"],
          answer: "C",
          exp: "Skewed tree becomes linked list",
        },
        {
          q: "Array-based tree index i children?",
          options: ["A) 2i, 2i+1", "B) i/2", "C) i+1", "D) None"],
          answer: "A",
          exp: "Left: 2i, Right: 2i+1",
        },
      ],
      medium: [
        {
          q: "AVL insert time?",
          options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n log n)"],
          answer: "B",
          exp: "Rebalancing takes log n",
        },
        {
          q: "BST delete time?",
          options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n log n)"],
          answer: "B",
          exp: "Search + potentially rebalance",
        },
      ],
      hard: [
        {
          q: "B-Tree search time?",
          options: ["A) O(log n)", "B) O(log_m n)", "C) O(n)", "D) O(1)"],
          answer: "B",
          exp: "Height is log_m n",
        },
        {
          q: "Trie space for n strings avg length L?",
          options: ["A) O(n)", "B) O(nL)", "C) O(L)", "D) O(n log L)"],
          answer: "B",
          exp: "Each character potentially new node",
        },
      ],
    },
  },
  graphs: {
    general: {
      easy: [
        {
          q: "BFS visits by?",
          options: ["A) Depth", "B) Level", "C) Edge", "D) Node"],
          answer: "B",
          exp: "Level by level",
        },
        {
          q: "DFS uses?",
          options: ["A) Queue", "B) Stack", "C) Both", "D) None"],
          answer: "B",
          exp: "Depth first uses stack",
        },
        {
          q: "Graph representation?",
          options: [
            "A) Only adjacency",
            "B) Only matrix",
            "C) Multiple ways",
            "D) None",
          ],
          answer: "C",
          exp: "Adjacency list, matrix, edge list",
        },
        {
          q: "Undirected edge count formula?",
          options: ["A) E = V", "B) E = V(V-1)/2", "C) E = V-1", "D) Any"],
          answer: "B",
          exp: "Complete graph formula",
        },
        {
          q: "Path vs Cycle?",
          options: [
            "A) Same",
            "B) Path ends, cycle loops",
            "C) Cycle shorter",
            "D) None",
          ],
          answer: "B",
          exp: "Path has distinct vertices (except start/end for cycle)",
        },
      ],
      medium: [
        {
          q: "Dijkstra for?",
          options: [
            "A) Unweighted",
            "B) Weighted positive",
            "C) Negative",
            "D) All",
          ],
          answer: "B",
          exp: "No negative edges",
        },
        {
          q: "BFS finds?",
          options: [
            "A) Longest path",
            "B) Shortest path",
            "C) Cycle",
            "D) MST",
          ],
          answer: "B",
          exp: "Shortest path in unweighted",
        },
        {
          q: "Topological sort for?",
          options: ["A) Cycles", "B) DAGs", "C) Trees", "D) All"],
          answer: "B",
          exp: "Only works on directed acyclic graphs",
        },
        {
          q: "Cycle detection in DAG?",
          options: [
            "A) DFS with visited",
            "B) BFS",
            "C) Dijkstra",
            "D) Kruskal",
          ],
          answer: "A",
          exp: "DFS with recursion stack",
        },
        {
          q: "Connected components use?",
          options: [
            "A) One BFS",
            "B) Multiple BFS/DFS",
            "C) Dijkstra",
            "D) None",
          ],
          answer: "B",
          exp: "Run BFS from unvisited vertices",
        },
      ],
      hard: [
        {
          q: "Floyd-Warshall is?",
          options: ["A) O(V³)", "B) O(V²)", "C) O(VE)", "D) O(E log V)"],
          answer: "A",
          exp: "All pairs shortest",
        },
        {
          q: "Prim's algorithm is?",
          options: [
            "A) Greedy",
            "B) DP",
            "C) Divide-conquer",
            "D) Backtracking",
          ],
          answer: "A",
          exp: "Greedy approach for MST",
        },
        {
          q: "Bellman-Ford can detect?",
          options: [
            "A) No cycles",
            "B) Negative cycles",
            "C) Positive cycles",
            "D) All",
          ],
          answer: "B",
          exp: "Can handle negative edges",
        },
        {
          q: "Articulation point removal causes?",
          options: [
            "A) No change",
            "B) Disconnects graph",
            "C) Creates cycle",
            "D) Nothing",
          ],
          answer: "B",
          exp: "Graph becomes disconnected",
        },
        {
          q: "Kruskal uses?",
          options: ["A) BFS", "B) DFS", "C) Union-Find", "D) Topo sort"],
          answer: "C",
          exp: "Union-Find for cycle detection",
        },
      ],
    },
    code: {
      easy: [
        {
          q: "```\nqueue = [start]\nwhile queue:\n  node = queue.pop(0)\n  visit(node)\n  for neighbor in adj[node]:\n    queue.append(neighbor)\n```\nWhat is this?",
          options: ["A) DFS", "B) BFS", "C) Dijkstra", "D) Prim"],
          answer: "B",
          exp: "Uses queue, visits level by level",
        },
        {
          q: "```\nstack = [start]\nwhile stack:\n  node = stack.pop()\n  visit(node)\n  for neighbor in adj[node]:\n    stack.append(neighbor)\n```\nWhat is this?",
          options: ["A) BFS", "B) DFS", "C) Dijkstra", "D) Prim"],
          answer: "B",
          exp: "Uses stack, goes deep first",
        },
        {
          q: "What data structure does BFS use?",
          options: ["A) Stack", "B) Queue", "C) Heap", "D) Tree"],
          answer: "B",
          exp: "BFS uses queue for level-order traversal",
        },
        {
          q: "What data structure does DFS use?",
          options: ["A) Queue", "B) Stack", "C) Heap", "D) Array"],
          answer: "B",
          exp: "DFS uses stack (or recursion) for depth-first traversal",
        },
      ],
      medium: [
        {
          q: "Dijkstra uses?",
          options: ["A) Stack", "B) Queue", "C) Priority queue", "D) Array"],
          answer: "C",
          exp: "Extract min repeatedly",
        },
        {
          q: "Prim's algorithm uses?",
          options: [
            "A) Stack",
            "B) Queue",
            "C) Priority queue",
            "D) Heap only",
          ],
          answer: "C",
          exp: "Greedy MST construction",
        },
      ],
      hard: [
        {
          q: "Kosaraju's algorithm finds?",
          options: [
            "A) Shortest path",
            "B) Strongly connected components",
            "C) MST",
            "D) Topo sort",
          ],
          answer: "B",
          exp: "Two DFS passes with transpose",
        },
      ],
    },
    complexity: {
      easy: [
        {
          q: "BFS time complexity?",
          options: ["A) O(V)", "B) O(E)", "C) O(V+E)", "D) O(VE)"],
          answer: "C",
          exp: "Visit all vertices and edges",
        },
        {
          q: "DFS time complexity?",
          options: ["A) O(V)", "B) O(E)", "C) O(V+E)", "D) O(VE)"],
          answer: "C",
          exp: "Visit all vertices and edges",
        },
        {
          q: "Adjacency matrix space?",
          options: ["A) O(V)", "B) O(E)", "C) O(V²)", "D) O(V+E)"],
          answer: "C",
          exp: "V×V matrix",
        },
      ],
      medium: [
        {
          q: "Dijkstra time with binary heap?",
          options: ["A) O(V²)", "B) O(E log V)", "C) O(V log E)", "D) O(VE)"],
          answer: "B",
          exp: "O((V+E) log V)",
        },
        {
          q: "Adjacency list space?",
          options: ["A) O(V)", "B) O(E)", "C) O(V²)", "D) O(V+E)"],
          answer: "D",
          exp: "Vertices + edges storage",
        },
      ],
      hard: [
        {
          q: "Floyd-Warshall time?",
          options: ["A) O(V²)", "B) O(V³)", "C) O(VE)", "D) O(E log V)"],
          answer: "B",
          exp: "Triple nested loop",
        },
        {
          q: "Bellman-Ford time?",
          options: ["A) O(V)", "B) O(E)", "C) O(VE)", "D) O(V²)"],
          answer: "C",
          exp: "V-1 relaxations over all edges",
        },
      ],
    },
  },
};

const APPENDED_QUESTIONS = {
  sorting: [
    {
      type: "complexity",
      difficulty: "hard",
      q: "For T(n) = T(n/4) + O(n), what is the asymptotic time complexity?",
      options: ["A) O(log n)", "B) O(n)", "C) O(n log n)", "D) O(n²)"],
      answer: "B",
      exp: "The work forms a geometric series n + n/4 + n/16 + … = O(n).",
    },
    {
      type: "complexity",
      difficulty: "hard",
      q: "Which statement best compares Merge Sort and in-place Quick Sort auxiliary space?",
      options: [
        "A) Both always use O(1) extra space",
        "B) Merge Sort usually needs O(n); Quick Sort typically uses O(log n) stack space on average",
        "C) Quick Sort always needs O(n); Merge Sort uses O(log n)",
        "D) Both always need O(n²) extra space",
      ],
      answer: "B",
      exp: "Array Merge Sort typically allocates an auxiliary array; in-place Quick Sort uses recursion stack space.",
    },
  ],
  searching: [
    {
      type: "general",
      difficulty: "hard",
      q: "Jump Search is most commonly used on which input?",
      options: [
        "A) An unsorted linked list",
        "B) A sorted array",
        "C) A graph with negative edges",
        "D) Any array without preprocessing",
      ],
      answer: "B",
      exp: "Jump Search relies on sorted order to skip blocks, then scans within a candidate block.",
    },
    {
      type: "general",
      difficulty: "hard",
      q: "You need to find a value in an unsorted array and cannot preprocess it. Which search is the simplest correct choice?",
      options: [
        "A) Binary Search",
        "B) Interpolation Search",
        "C) Linear Search",
        "D) Exponential Search",
      ],
      answer: "C",
      exp: "Linear Search does not require sorted input.",
    },
    {
      type: "general",
      difficulty: "hard",
      q: "What must be true before ordinary Binary Search is used on an array?",
      options: [
        "A) The array is sorted by the searched key",
        "B) The array contains unique values only",
        "C) The array length is a power of two",
        "D) The array is stored as a linked list",
      ],
      answer: "A",
      exp: "Binary Search depends on sorted order; duplicate values are allowed.",
    },
    {
      type: "complexity",
      difficulty: "hard",
      q: "What is Interpolation Search worst-case time complexity?",
      options: ["A) O(1)", "B) O(log log n)", "C) O(log n)", "D) O(n)"],
      answer: "D",
      exp: "With an unfavorable value distribution, probes can progress poorly and the worst case is linear.",
    },
    {
      type: "complexity",
      difficulty: "hard",
      q: "For a very large sorted array with no distribution guarantee, which search has a reliable O(log n) worst-case bound?",
      options: [
        "A) Linear Search",
        "B) Binary Search",
        "C) Interpolation Search",
        "D) A full scan after every probe",
      ],
      answer: "B",
      exp: "Binary Search has O(log n) worst-case time on sorted random-access arrays.",
    },
    {
      type: "complexity",
      difficulty: "hard",
      q: "What is the worst-case time complexity of Exponential Search on a sorted array?",
      options: ["A) O(log n)", "B) O(√n)", "C) O(n)", "D) O(n log n)"],
      answer: "A",
      exp: "Doubling finds a range in O(log n) probes, followed by Binary Search in that range.",
    },
    {
      type: "general",
      difficulty: "hard",
      q: "Which pairing is correct for a sorted array with random access?",
      options: [
        "A) Binary Search: O(log n) worst case; Linear Search: O(n) worst case",
        "B) Binary Search: O(n²); Linear Search: O(1)",
        "C) Both always take O(1)",
        "D) Binary Search works only on linked lists",
      ],
      answer: "A",
      exp: "Binary Search repeatedly halves the range; Linear Search may inspect every element.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "In Binary Search, why is high = mid - 1 used when arr[mid] > target?",
      options: [
        "A) To keep the midpoint for the next iteration",
        "B) To exclude the midpoint and the larger sorted region",
        "C) To sort the left half",
        "D) To move to the next array element only",
      ],
      answer: "B",
      exp: "The midpoint is already known to be too large, so the remaining candidate range ends at mid - 1.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "A loop advances while arr[i] < target in a sorted array. What does the returned index usually represent?",
      options: [
        "A) The last array index",
        "B) The insertion position before the first value not less than target",
        "C) The maximum element index",
        "D) The index after every equal value without checking",
      ],
      answer: "B",
      exp: "This lower-bound pattern finds the first position whose value is at least the target.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "What are the two main steps of Jump Search?",
      options: [
        "A) Sort the array, then run DFS",
        "B) Jump by fixed-size blocks, then linearly scan the candidate block",
        "C) Repeatedly halve the array, then use a stack",
        "D) Hash every value, then traverse a tree",
      ],
      answer: "B",
      exp: "Jump Search skips through sorted blocks and linearly checks the block where the target may lie.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "Why can adding low and high overflow in fixed-width integer languages before computing their midpoint?",
      options: [
        "A) Division always rounds up",
        "B) The sum can exceed the integer range before division",
        "C) It changes the array order",
        "D) It forces a linear scan",
      ],
      answer: "B",
      exp: "A safer midpoint is low + (high - low) / 2, assuming the difference is representable.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "For array [2, 4, 7, 9, 12], what index does a standard Binary Search return for target 9?",
      options: ["A) 1", "B) 2", "C) 3", "D) 4"],
      answer: "C",
      exp: "The array is zero-indexed and 9 is at index 3.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "For sorted array [1, 3, 5, 7, 9, 11, 13, 15], Jump Search with block size 3 checks indices 0, 3, and 6. Which block should be scanned for target 8?",
      options: [
        "A) Indices 0–2",
        "B) Indices 3–5",
        "C) Indices 6–7",
        "D) No block; 8 is found at index 3",
      ],
      answer: "B",
      exp: "The value at index 3 is 7 and at index 6 is 13, so the target belongs in the block from index 3 through 5.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "Binary Search examines a midpoint and finds the target is smaller. Which update preserves the remaining candidates?",
      options: [
        "A) low = mid + 1",
        "B) high = mid - 1",
        "C) high = mid + 1",
        "D) low = high + 1",
      ],
      answer: "B",
      exp: "When the target is smaller, discard the midpoint and right side by setting high to mid - 1.",
    },
  ],
  trees: [
    {
      type: "general",
      difficulty: "hard",
      q: "Which condition defines a min-heap?",
      options: [
        "A) Every node is greater than both children",
        "B) Every parent is less than or equal to its children",
        "C) An inorder traversal must be sorted",
        "D) Every node has exactly two children",
      ],
      answer: "B",
      exp: "A min-heap maintains the parent-child order property; it is not necessarily a binary search tree.",
    },
    {
      type: "code",
      difficulty: "hard",
      q: "In a max-heap stored in a zero-indexed array, what should happen after inserting a value larger than its parent?",
      options: [
        "A) Sift the new value upward by swapping with its parent",
        "B) Run an inorder traversal",
        "C) Move it to the final array index permanently",
        "D) Rotate the entire tree left",
      ],
      answer: "A",
      exp: "Heap insertion restores the heap property by sifting the inserted value upward.",
    },
  ],
  graphs: [
    {
      type: "code",
      difficulty: "hard",
      q: "Dijkstra starts with distances A=0, B=∞, C=∞. Edges are A→B (4), A→C (2), and C→B (1). After processing A and then C, what is dist(B)?",
      options: ["A) 1", "B) 2", "C) 3", "D) 4"],
      answer: "C",
      exp: "A→C costs 2 and C→B costs 1, giving a better distance of 3 than the direct cost 4.",
    },
  ],
};
const DUPLICATES = {
  sorting: new Set([
    "Quick Sort average case?",
    "Merge Sort space?",
    "Best sort for nearly sorted?",
  ]),
  searching: new Set(["Binary search time?", "Linear search time?"]),
  trees: new Set(["Level order uses?"]),
  graphs: new Set(["What data structure does DFS use?"]),
};
const DIFFICULTIES = ["easy", "medium", "hard"];
const TYPES = ["general", "code", "complexity"];
const PREFIX = {
  sorting: "sort",
  searching: "search",
  trees: "tree",
  graphs: "graph",
};

function flattenTopic(topic) {
  const questions = [];
  for (const difficulty of DIFFICULTIES) {
    for (const type of TYPES) {
      const items = RAW_QUESTION_BANK[topic]?.[type]?.[difficulty] ?? [];
      for (const item of items) {
        if (DUPLICATES[topic]?.has(item.q)) continue;
        if (
          topic === "sorting" &&
          item.q.startsWith(
            "What does this code implement?\n```\nmid = (low + high)",
          )
        ) {
          RAW_QUESTION_BANK.searching.code.easy.push({ ...item });
          continue;
        }
        questions.push({ topic, type, difficulty, ...item });
      }
    }
  }
  for (const item of APPENDED_QUESTIONS[topic] ?? [])
    questions.push({ topic, ...item });
  return questions.map((item, index) => {
    const oldCorrectIndex = item.answer.charCodeAt(0) - 65;
    const desiredIndex = index % 4;
    const shift = (desiredIndex - oldCorrectIndex + 4) % 4;
    const options = ["A", "B", "C", "D"].map((letter, optionIndex) => {
      const oldIndex = (optionIndex - shift + 4) % 4;
      const optionText = item.options[oldIndex].replace(/^[A-D]\)\s*/, "");
      return `${letter}) ${optionText}`;
    });
    return {
      id: `${PREFIX[topic]}-${String(index + 1).padStart(3, "0")}`,
      topic,
      type: item.type,
      difficulty: item.difficulty,
      q: item.q,
      options,
      answer: String.fromCharCode(65 + desiredIndex),
      exp: item.exp,
    };
  });
}

export const questionBank = Object.fromEntries(
  Object.keys(RAW_QUESTION_BANK).map((topic) => [topic, flattenTopic(topic)]),
);

export const questionBankByTopic = Object.fromEntries(
  Object.entries(questionBank).map(([topic, questions]) => [
    topic,
    Object.fromEntries(
      TYPES.map((type) => [
        type,
        Object.fromEntries(
          DIFFICULTIES.map((difficulty) => [
            difficulty,
            questions
              .filter(
                (question) =>
                  question.type === type && question.difficulty === difficulty,
              )
              .map(
                ({ id, q, options, answer, exp, topic, type, difficulty }) => ({
                  id,
                  q,
                  options,
                  answer,
                  exp,
                  topic,
                  type,
                  difficulty,
                }),
              ),
          ]),
        ),
      ]),
    ),
  ]),
);
