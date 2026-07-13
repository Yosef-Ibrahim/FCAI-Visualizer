import { GraphAlgorithm } from './GraphAlgorithm';

export class Dijkstra extends GraphAlgorithm {
  constructor() {
    super('dijkstra');
  }

  getDefaultInput() {
    return {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        ['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1],
        ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2],
      ],
      start: 'A',
    };
  }

  generateSteps(input) {
    const { nodes, edges, start } = input;
    const adj = {};
    nodes.forEach(n => adj[n] = []);
    edges.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });

    const steps = [];
    const dist = {};
    const visited = new Set();
    const prev = {};
    nodes.forEach(n => { dist[n] = Infinity; prev[n] = null; });
    dist[start] = 0;

    steps.push({
      graph: { nodes, edges, distances: { ...dist }, visited: [...visited], current: start },
      msg: `Initialize distances: ${start} = 0, all others = ∞`,
      codeLine: 1,
      codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
    });

    while (visited.size < nodes.length) {
      let u = null;
      let minDist = Infinity;
      for (const n of nodes) {
        if (!visited.has(n) && dist[n] < minDist) {
          minDist = dist[n];
          u = n;
        }
      }
      if (!u || minDist === Infinity) break;

      visited.add(u);
      steps.push({
        graph: { nodes, edges, distances: { ...dist }, visited: [...visited], current: u },
        msg: `Select ${u} (dist = ${dist[u]}), mark visited`,
        codeLine: 2,
        codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      });

      for (const [v, w] of adj[u]) {
        if (!visited.has(v) && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          prev[v] = u;
          steps.push({
            graph: { nodes, edges, distances: { ...dist }, visited: [...visited], current: v },
            msg: `Update ${v}: dist = ${dist[u]} + ${w} = ${dist[v]}`,
            codeLine: 3,
            codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
          });
        }
      }
    }

    const path = [];
    let dest = nodes[nodes.length - 1];
    for (let at = dest; at; at = prev[at]) path.push(at);
    path.reverse();

    steps.push({
      graph: { nodes, edges, distances: { ...dist }, visited: [...visited] },
      msg: `✅ Shortest path from ${start} to ${dest}: ${path.join(' → ')} (cost: ${dist[dest]})`,
      codeLine: -1,
    });
    return steps;
  }
}
