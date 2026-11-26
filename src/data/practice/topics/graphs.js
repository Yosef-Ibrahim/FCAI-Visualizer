// ── Practice bank: graphs ───────────────────────────────────────────────────
// Traversals, shortest paths and MST weights are computed on small graphs, so
// every "what is the order/distance/weight" answer is derived, not guessed.

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const TOPIC = 'graphs';
const VERTICES = ['A', 'B', 'C', 'D', 'E', 'F'];

const GRAPH_CONCEPTS = [
  { lvl: 'easy', q: 'Which data structure does breadth-first search use?', a: 'A queue', d: ['A stack', 'A hash table', 'A heap'], e: 'BFS explores in FIFO order, one level at a time.' },
  { lvl: 'easy', q: 'Which data structure does iterative depth-first search use?', a: 'A stack', d: ['A queue', 'A heap', 'A trie'], e: 'DFS dives as deep as possible and backtracks, which is LIFO.' },
  { lvl: 'medium', q: 'What is the time complexity of BFS with an adjacency list?', a: 'O(V + E)', d: ['O(V²)', 'O(E log V)', 'O(V × E)'], e: 'Each vertex and each adjacency entry is examined once.' },
  { lvl: 'medium', q: 'What is the time complexity of DFS with an adjacency list?', a: 'O(V + E)', d: ['O(V²)', 'O(log V)', 'O(E²)'], e: 'Every vertex and edge is visited once.' },
  { lvl: 'medium', q: 'What is the space complexity of BFS in the worst case?', a: 'O(V)', d: ['O(1)', 'O(E²)', 'O(V + E²)'], e: 'The queue may hold most vertices in a wide graph.' },
  { lvl: 'medium', q: 'Which algorithm finds shortest paths in an unweighted graph?', a: 'BFS', d: ['DFS', 'Kruskal', 'Heap sort'], e: 'BFS reaches each vertex with the fewest edges first.' },
  { lvl: 'medium', q: 'Which algorithm handles non-negative weighted shortest paths?', a: 'Dijkstra', d: ['BFS', 'DFS', 'Kruskal'], e: 'Dijkstra repeatedly settles the closest unsettled vertex.' },
  { lvl: 'hard', q: 'What is the complexity of Dijkstra with a binary min-heap and adjacency list?', a: 'O((V + E) log V)', d: ['O(V²)', 'O(V + E)', 'O(E × V)'], e: 'Heap operations add a log factor over edge relaxations.' },
  { lvl: 'medium', q: 'What does Dijkstra fail to handle correctly?', a: 'Negative edge weights', d: ['Positive edge weights', 'Directed edges', 'Disconnected graphs'], e: 'Negative edges break the greedy settled-distance assumption.' },
  { lvl: 'hard', q: 'Which algorithm computes shortest paths with negative edges but no negative cycles?', a: 'Bellman-Ford', d: ['Dijkstra', 'BFS', 'Prim'], e: 'Bellman-Ford relaxes every edge V − 1 times.' },
  { lvl: 'medium', q: 'Which two algorithms compute a minimum spanning tree?', a: 'Prim and Kruskal', d: ['Dijkstra and BFS', 'DFS and BFS', 'Bellman-Ford and Floyd-Warshall'], e: 'Both build an MST with greedy edge choices.' },
  { lvl: 'medium', q: 'Which data structure does Kruskal’s algorithm use to detect cycles?', a: 'Union-Find (disjoint sets)', d: ['A stack', 'A queue', 'A hash table'], e: 'Union-Find checks whether an edge joins two different components.' },
  { lvl: 'medium', q: 'Kruskal’s algorithm processes edges in which order?', a: 'Ascending weight', d: ['Descending weight', 'Random order', 'Vertex index order'], e: 'Cheapest edges are considered first.' },
  { lvl: 'medium', q: 'What is the complexity of Kruskal’s algorithm dominated by?', a: 'Sorting the edges, O(E log E)', d: ['Finding vertices, O(V)', 'Union operations, O(1) each', 'The adjacency matrix scan'], e: 'Sorting dominates; the disjoint-set operations are nearly constant.' },
  { lvl: 'medium', q: 'How many edges does a spanning tree of a connected graph with V vertices have?', a: 'V − 1', d: ['V', 'V + 1', 'E − 1'], e: 'A tree on V vertices always has V − 1 edges.' },
  { lvl: 'easy', q: 'In an undirected graph, the sum of all vertex degrees equals what?', a: '2E', d: ['E', 'V', 'V + E'], e: 'Each edge contributes one to the degree of both endpoints.' },
  { lvl: 'medium', q: 'How many edges does a complete undirected graph with n vertices have?', a: 'n(n − 1) / 2', d: ['n(n − 1)', 'n²', 'n − 1'], e: 'Every unordered pair of vertices is connected.' },
  { lvl: 'medium', q: 'What is the size of an adjacency matrix for a graph with V vertices?', a: 'V²', d: ['V + E', '2E', 'V log V'], e: 'It stores one entry for every vertex pair.' },
  { lvl: 'medium', q: 'Which representation is better for sparse graphs?', a: 'Adjacency list', d: ['Adjacency matrix', 'Incidence matrix', 'Distance matrix'], e: 'An adjacency list stores only existing edges.' },
  { lvl: 'medium', q: 'What is the space complexity of an adjacency matrix?', a: 'O(V²)', d: ['O(V + E)', 'O(E)', 'O(log V)'], e: 'The matrix has V² cells regardless of edge count.' },
  { lvl: 'medium', q: 'What is a topological ordering defined on?', a: 'A directed acyclic graph', d: ['Any undirected graph', 'A graph with cycles', 'A complete graph'], e: 'Dependencies must form no directed cycle.' },
  { lvl: 'hard', q: 'Which algorithm produces a topological order?', a: 'Kahn’s algorithm with in-degrees', d: ['Dijkstra', 'Prim', 'Floyd-Warshall'], e: 'Vertices with in-degree 0 are repeatedly removed.' },
  { lvl: 'medium', q: 'What is the complexity of Kahn’s topological sort?', a: 'O(V + E)', d: ['O(V²)', 'O(E log V)', 'O(V × E)'], e: 'Each vertex and edge is processed once.' },
  { lvl: 'medium', q: 'What does a cycle in a dependency graph indicate?', a: 'No topological order exists', d: ['The graph is a tree', 'The graph is bipartite', 'All weights are negative'], e: 'Cyclic dependencies cannot be linearized.' },
  { lvl: 'medium', q: 'A graph is bipartite when which condition holds?', a: 'Its vertices can be split into two independent sets', d: ['It is connected', 'It has no weights', 'It has more edges than vertices'], e: 'Each edge must cross between the two sets.' },
  { lvl: 'medium', q: 'Which algorithm tests whether a graph is bipartite?', a: 'BFS/DFS two-colouring', d: ['Dijkstra', 'Kruskal', 'Heap sort'], e: 'Neighbours must receive the opposite colour; a conflict means odd cycles.' },
  { lvl: 'medium', q: 'An odd cycle makes a graph which of the following?', a: 'Not bipartite', d: ['A tree', 'A DAG', 'Complete'], e: 'Two colours cannot alternate consistently around an odd cycle.' },
  { lvl: 'medium', q: 'A connected graph with V vertices and V − 1 edges is what?', a: 'A tree', d: ['A cycle', 'A complete graph', 'Disconnected'], e: 'Connection plus exactly V − 1 edges implies no cycle.' },
  { lvl: 'medium', q: 'Which algorithm finds connected components efficiently?', a: 'DFS/BFS from each unvisited vertex', d: ['Kruskal only', 'Binary search', 'Hashing'], e: 'One traversal marks all vertices of a component.' },
  { lvl: 'medium', q: 'What is the complexity of counting connected components with adjacency lists?', a: 'O(V + E)', d: ['O(V²) always', 'O(log V)', 'O(E × V)'], e: 'Each vertex and edge is visited once across all traversals.' },
  { lvl: 'hard', q: 'Floyd-Warshall computes what?', a: 'All-pairs shortest paths', d: ['A single shortest path', 'A minimum spanning tree', 'A topological order'], e: 'Its DP recurrence considers every possible intermediate vertex.' },
  { lvl: 'hard', q: 'What is the complexity of Floyd-Warshall?', a: 'O(V³)', d: ['O(V + E)', 'O(E log V)', 'O(V × E)'], e: 'Three nested loops over vertices.' },
  { lvl: 'medium', q: 'What does the A* algorithm add to Dijkstra?', a: 'A heuristic estimate of the remaining distance', d: ['Negative edge support', 'A random walk', 'A spanning tree'], e: 'The heuristic guides the search toward the goal.' },
  { lvl: 'medium', q: 'For A* to remain optimal, its heuristic must be which?', a: 'Admissible (never overestimating)', d: ['Always zero', 'Random', 'Larger than the true cost'], e: 'An admissible heuristic never overestimates the remaining cost.' },
  { lvl: 'medium', q: 'Which graph traversal is used to detect a cycle in a directed graph?', a: 'DFS with a recursion stack', d: ['BFS from one vertex only', 'Kruskal', 'Binary search'], e: 'A back edge to an active vertex reveals a cycle.' },
  { lvl: 'medium', q: 'In a weighted graph, a minimum spanning tree minimizes what?', a: 'The total edge weight connecting all vertices', d: ['The number of vertices', 'The longest path', 'The average degree'], e: 'An MST connects every vertex with minimum total weight.' },
  { lvl: 'medium', q: 'Prim’s algorithm grows the MST from what?', a: 'A starting vertex, adding the cheapest crossing edge', d: ['The cheapest edge overall', 'A random cycle', 'The last vertex'], e: 'Prim grows one connected component outward.' },
  { lvl: 'medium', q: 'Which queue improves Prim’s algorithm on sparse graphs?', a: 'A priority queue', d: ['A stack', 'A circular queue', 'A deque of vertices'], e: 'A min-heap quickly finds the cheapest crossing edge.' },
  { lvl: 'medium', q: 'In BFS, what is the distance of a vertex in terms of the traversal?', a: 'The number of edges on the shortest unweighted path', d: ['The sum of edge weights', 'Its degree', 'Its index in the adjacency list'], e: 'BFS discovers vertices in nondecreasing edge distance.' },
  { lvl: 'medium', q: 'What does a depth-first traversal of a tree produce?', a: 'A pre-order-like visit sequence', d: ['A level-order sequence', 'An ascending order always', 'A sorted order always'], e: 'DFS visits a node then explores its children deeply.' },
];

function buildAdjacency(vertices, edges) {
  const map = new Map(vertices.map((vertex) => [vertex, []]));
  for (const [a, b] of edges) {
    map.get(a).push(b);
    map.get(b).push(a);
  }
  for (const list_ of map.values()) list_.sort();
  return map;
}

function bfs(adj, start) {
  const order = [];
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const vertex = queue.shift();
    order.push(vertex);
    for (const next of adj.get(vertex) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }
  return order;
}

function bfsDistances(adj, start) {
  const distances = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const vertex = queue.shift();
    for (const next of adj.get(vertex) ?? []) {
      if (distances.has(next)) continue;
      distances.set(next, distances.get(vertex) + 1);
      queue.push(next);
    }
  }
  return distances;
}

function dfs(adj, start) {
  const order = [];
  const visited = new Set();
  const visit = (vertex) => {
    if (visited.has(vertex)) return;
    visited.add(vertex);
    order.push(vertex);
    for (const next of adj.get(vertex) ?? []) visit(next);
  };
  visit(start);
  return order;
}

function dijkstra(vertices, edges, start) {
  const adjacency = new Map(vertices.map((vertex) => [vertex, []]));
  for (const [a, b, weight] of edges) {
    adjacency.get(a).push([b, weight]);
    adjacency.get(b).push([a, weight]);
  }
  const dist = new Map(vertices.map((vertex) => [vertex, Infinity]));
  const settled = new Set();
  dist.set(start, 0);
  while (settled.size < vertices.length) {
    let current = null;
    for (const vertex of vertices) {
      if (settled.has(vertex)) continue;
      if (current === null || dist.get(vertex) < dist.get(current)) current = vertex;
    }
    if (current === null || dist.get(current) === Infinity) break;
    settled.add(current);
    for (const [next, weight] of adjacency.get(current)) {
      if (dist.get(current) + weight < dist.get(next)) dist.set(next, dist.get(current) + weight);
    }
  }
  return dist;
}

function mstWeight(vertices, edges) {
  const parent = new Map(vertices.map((vertex) => [vertex, vertex]));
  const find = (vertex) => {
    while (parent.get(vertex) !== vertex) {
      parent.set(vertex, parent.get(parent.get(vertex)));
      vertex = parent.get(vertex);
    }
    return vertex;
  };
  let total = 0;
  let used = 0;
  for (const [a, b, weight] of [...edges].sort((x, y) => x[2] - y[2])) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) continue;
    parent.set(rootA, rootB);
    total += weight;
    used += 1;
  }
  return used === vertices.length - 1 ? total : null;
}

function isTree(vertices, edges) {
  if (edges.length !== vertices.length - 1) return false;
  const adj = buildAdjacency(vertices, edges);
  const order = bfs(adj, vertices[0]);
  return order.length === vertices.length;
}

function isBipartite(vertices, edges) {
  const adj = buildAdjacency(vertices, edges);
  const color = new Map();
  for (const start of vertices) {
    if (color.has(start)) continue;
    color.set(start, 0);
    const queue = [start];
    while (queue.length) {
      const vertex = queue.shift();
      for (const next of adj.get(vertex) ?? []) {
        if (!color.has(next)) {
          color.set(next, 1 - color.get(vertex));
          queue.push(next);
        } else if (color.get(next) === color.get(vertex)) {
          return false;
        }
      }
    }
  }
  return true;
}

function hasCycleUndirected(vertices, edges) {
  const adj = buildAdjacency(vertices, edges);
  const visited = new Set();
  const walk = (vertex, parent) => {
    visited.add(vertex);
    for (const next of adj.get(vertex) ?? []) {
      if (next === parent) continue;
      if (visited.has(next)) return true;
      if (walk(next, vertex)) return true;
    }
    return false;
  };
  for (const vertex of vertices) {
    if (!visited.has(vertex) && walk(vertex, null)) return true;
  }
  return false;
}

function randomGraph(rand, size, extra) {
  const vertices = VERTICES.slice(0, size);
  const edges = [];
  const key = (a, b) => [a, b].sort().join('');
  const seen = new Set();
  for (let i = 1; i < vertices.length; i += 1) {
    const parent = vertices[randInt(rand, 0, i - 1)];
    const child = vertices[i];
    edges.push([parent, child]);
    seen.add(key(parent, child));
  }
  let guard = 0;
  while (edges.length < vertices.length - 1 + extra && guard < 60) {
    guard += 1;
    const a = vertices[randInt(rand, 0, vertices.length - 1)];
    const b = vertices[randInt(rand, 0, vertices.length - 1)];
    if (a === b) continue;
    if (seen.has(key(a, b))) continue;
    seen.add(key(a, b));
    edges.push([a, b]);
  }
  return { vertices, edges };
}

const WEIGHTED = [
  { vertices: ['A', 'B', 'C', 'D', 'E'], edges: [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2]] },
  { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B', 1], ['B', 'C', 2], ['C', 'D', 3], ['A', 'D', 10], ['A', 'C', 5]] },
  { vertices: ['A', 'B', 'C', 'D', 'E', 'F'], edges: [['A', 'B', 7], ['A', 'C', 9], ['B', 'C', 10], ['B', 'D', 15], ['C', 'E', 11], ['D', 'E', 6], ['D', 'F', 9], ['E', 'F', 14]] },
  { vertices: ['A', 'B', 'C', 'D', 'E'], edges: [['A', 'B', 2], ['A', 'C', 3], ['B', 'D', 4], ['C', 'D', 1], ['D', 'E', 5], ['B', 'E', 12]] },
  { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B', 5], ['B', 'C', 2], ['C', 'D', 4], ['A', 'D', 9], ['A', 'C', 12]] },
  { vertices: ['A', 'B', 'C', 'D', 'E', 'F'], edges: [['A', 'B', 3], ['B', 'C', 1], ['C', 'D', 4], ['D', 'E', 2], ['E', 'F', 6], ['A', 'F', 18], ['B', 'E', 9]] },
];

export function buildGraphsQuestions() {
  const rand = makeRng(0x6b21);
  const qs = [];

  const graphs = Array.from({ length: 30 }, (_, index) => randomGraph(rand, randInt(rand, 4, 6), index % 4));
  graphs.forEach((graph, i) => {
    const adj = buildAdjacency(graph.vertices, graph.edges);
    qs.push(mcq({
      id: `graphs-bfs-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A graph has edges ${graph.edges.map(([a, b]) => `${a}–${b}`).join(', ')}. Starting at A and visiting neighbours alphabetically, what is the BFS order?`,
      correct: list(bfs(adj, 'A')),
      distractors: [list(dfs(adj, 'A')), list([...graph.vertices].reverse()), list(['A', ...graph.vertices.slice(1).sort((a, b) => b.localeCompare(a))])],
      explanation: 'BFS uses a queue and visits neighbours level by level in alphabetical order.',
      algorithm: 'bfs',
    }, rand));
    qs.push(mcq({
      id: `graphs-dfs-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `A graph has edges ${graph.edges.map(([a, b]) => `${a}–${b}`).join(', ')}. Starting at A with recursive DFS and alphabetical neighbours, what is the visit order?`,
      correct: list(dfs(adj, 'A')),
      distractors: [list(bfs(adj, 'A')), list(graph.vertices), list([...graph.vertices].reverse())],
      explanation: 'Recursive DFS follows the first neighbour all the way down before backtracking.',
      algorithm: 'dfs',
    }, rand));
    qs.push(mcq({
      id: `graphs-edges-${i}`,
      topic: TOPIC,
      difficulty: 'easy',
      question: `How many undirected edges are in the graph with edges ${graph.edges.map(([a, b]) => `${a}–${b}`).join(', ')}?`,
      correct: `${graph.edges.length}`,
      distractors: [graph.edges.length + 1, Math.max(0, graph.edges.length - 1), graph.vertices.length],
      explanation: 'Each listed pair is one undirected edge.',
    }, rand));
    if (i < 10) {
      const distances = bfsDistances(adj, 'A');
      const target = graph.vertices[graph.vertices.length - 1];
      const distance = distances.get(target);
      qs.push(mcq({
        id: `graphs-distance-${i}`,
        topic: TOPIC,
        difficulty: 'hard',
        question: `In the unweighted graph with edges ${graph.edges.map(([a, b]) => `${a}–${b}`).join(', ')}, how many edges are on the shortest path from A to ${target}?`,
        correct: `${distance}`,
        distractors: [distance + 1, Math.max(0, distance - 1), graph.vertices.length - 1],
        explanation: `BFS layers give distance ${distance} from A to ${target}.`,
        algorithm: 'bfs',
      }, rand));
    }
  });

  WEIGHTED.forEach((weighted, i) => {
    const distances = dijkstra(weighted.vertices, weighted.edges, 'A');
    const target = weighted.vertices[weighted.vertices.length - 1];
    qs.push(mcq({
      id: `graphs-dijkstra-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Weighted edges: ${weighted.edges.map(([a, b, w]) => `${a}–${b} (${w})`).join(', ')}. What is the shortest distance from A to ${target}?`,
      correct: `${distances.get(target)}`,
      distractors: [distances.get(target) + 1, Math.max(1, distances.get(target) - 1), distances.get(target) + 3],
      explanation: `Dijkstra settles vertices by increasing distance; A to ${target} is ${distances.get(target)}.`,
      algorithm: 'dijkstra',
    }, rand));
    const mst = mstWeight(weighted.vertices, weighted.edges);
    if (mst !== null) {
      qs.push(mcq({
        id: `graphs-mst-${i}`,
        topic: TOPIC,
        difficulty: 'hard',
        question: `Weighted edges: ${weighted.edges.map(([a, b, w]) => `${a}–${b} (${w})`).join(', ')}. What is the total weight of a minimum spanning tree?`,
        correct: `${mst}`,
        distractors: [mst + 1, mst + 2, mst + 4],
        explanation: `Kruskal takes the cheapest non-cycling edges, giving total weight ${mst}.`,
        algorithm: 'kruskal',
      }, rand));
    }
  });

  // Degree sums (handshaking lemma).
  for (let edges = 4; edges <= 15; edges += 1) {
    qs.push(mcq({
      id: `graphs-degree-sum-${edges}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `An undirected graph has ${edges} edges. What is the sum of all vertex degrees?`,
      correct: `${edges * 2}`,
      distractors: [`${edges}`, `${edges + 2}`, `${edges * edges}`],
      explanation: 'Each edge contributes 1 to two degrees, so the sum is 2E.',
    }, rand));
  }
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25].forEach((size) => {
    const edgeCount = (size * (size - 1)) / 2;
    qs.push(mcq({
      id: `graphs-complete-${size}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `How many edges does a complete undirected graph on ${size} vertices have?`,
      correct: `${edgeCount}`,
      distractors: [`${size * (size - 1)}`, `${size * size}`, `${size - 1}`],
      explanation: `n(n − 1) / 2 = ${size}(${size} − 1) / 2 = ${edgeCount}.`,
    }, rand));
    qs.push(mcq({
      id: `graphs-matrix-${size}`,
      topic: TOPIC,
      difficulty: 'easy',
      question: `How many entries does an adjacency matrix hold for a graph with ${size} vertices?`,
      correct: `${size * size}`,
      distractors: [`${size}`, `${size + size - 1}`, `${size * 2}`],
      explanation: 'An adjacency matrix is V × V.',
    }, rand));
  });

  const sampleGraphs = [
    { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B'], ['B', 'C'], ['C', 'D']] },
    { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']] },
    { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C']] },
    { vertices: ['A', 'B', 'C', 'D', 'E'], edges: [['A', 'B'], ['B', 'C'], ['D', 'E'], ['C', 'D']] },
    { vertices: ['A', 'B', 'C'], edges: [] },
    { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B'], ['B', 'A'], ['C', 'D']] },
    { vertices: ['A', 'B', 'C', 'D', 'E'], edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D'], ['D', 'E']] },
    { vertices: ['A', 'B', 'C', 'D'], edges: [['A', 'B'], ['A', 'C'], ['A', 'D']] },
  ];
  sampleGraphs.forEach((graph, i) => {
    const tree = isTree(graph.vertices, graph.edges);
    qs.push(mcq({
      id: `graphs-tree-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `Edges ${graph.edges.length ? graph.edges.map(([a, b]) => `${a}–${b}`).join(', ') : '(none)'} form which structure on ${graph.vertices.join(', ')}?`,
      correct: tree ? 'A tree' : 'Not a tree',
      distractors: [tree ? 'Not a tree' : 'A tree', 'A complete graph', 'A directed acyclic graph'],
      explanation: tree
        ? 'It is connected and has exactly V − 1 edges, so it contains no cycle.'
        : 'It is either disconnected or has a different number of edges than V − 1.',
    }, rand));
    const bipartite = isBipartite(graph.vertices, graph.edges);
    qs.push(mcq({
      id: `graphs-bipartite-${i}`,
      topic: TOPIC,
      difficulty: 'hard',
      question: `Is the undirected graph with edges ${graph.edges.length ? graph.edges.map(([a, b]) => `${a}–${b}`).join(', ') : '(none)'} bipartite?`,
      correct: bipartite ? 'Yes' : 'No',
      distractors: [bipartite ? 'No' : 'Yes', 'Only if it is connected', 'Only if it is a tree'],
      explanation: bipartite
        ? 'A two-colouring of the vertices exists, so every edge joins different colours.'
        : 'An odd cycle prevents a consistent two-colouring.',
    }, rand));
    const cycle = hasCycleUndirected(graph.vertices, graph.edges);
    qs.push(mcq({
      id: `graphs-cycle-${i}`,
      topic: TOPIC,
      difficulty: 'medium',
      question: `Does the undirected graph with edges ${graph.edges.length ? graph.edges.map(([a, b]) => `${a}–${b}`).join(', ') : '(none)'} contain a cycle?`,
      correct: cycle ? 'Yes' : 'No',
      distractors: [cycle ? 'No' : 'Yes', 'Only if it is weighted', 'Only if it is directed'],
      explanation: cycle ? 'A DFS back edge reaches an already visited vertex.' : 'The edges form a forest with no back edge.',
    }, rand));
  });

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: TOPIC, prefix: 'graphs', concepts: GRAPH_CONCEPTS, rand })],
    (question) => question.id,
  );
}
