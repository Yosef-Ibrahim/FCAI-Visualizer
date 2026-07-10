import { GraphAlgorithm } from './GraphAlgorithm';

export class Prim extends GraphAlgorithm {
  constructor() {
    super('prim');
  }

  generateSteps(input) {
    const { nodes, edges } = input;
    const start = input.start || nodes[0];
    const adj = {};
    nodes.forEach(n => adj[n] = []);
    edges.forEach(([a, b, w]) => { adj[a].push({ to: b, weight: w ?? 1 }); adj[b].push({ to: a, weight: w ?? 1 }); });

    const steps = [];
    const visited = new Set();
    const mstEdges = [];
    const unvisited = new Set(nodes);

    steps.push({
      graph: { nodes, edges, visited: [...visited], mstEdges: [], current: null, mstNodes: [] },
      msg: `Start Prim's MST from node ${start}`, codeLine: 0, codeLines: {},
    });

    visited.add(start);
    unvisited.delete(start);

    while (unvisited.size > 0) {
      let minEdge = null;
      let minWeight = Infinity;

      for (const v of visited) {
        for (const nb of adj[v]) {
          if (unvisited.has(nb.to) && nb.weight < minWeight) {
            minWeight = nb.weight;
            minEdge = { from: v, to: nb.to, weight: nb.weight };
          }
        }
      }

      if (!minEdge) break;

      mstEdges.push(minEdge);
      visited.add(minEdge.to);
      unvisited.delete(minEdge.to);

      steps.push({
        graph: { nodes, edges, visited: [...visited], mstEdges: [...mstEdges], current: minEdge.to, mstNodes: [...visited] },
        msg: `Add edge ${minEdge.from}—${minEdge.to} (weight: ${minEdge.weight})`,
        codeLine: 1, codeLines: {},
      });
    }

    steps.push({
      graph: { nodes, edges, visited: [...visited], mstEdges: [...mstEdges], mstNodes: [...visited] },
      msg: `✅ MST complete: ${mstEdges.map(e => `${e.from}—${e.to}`).join(', ')}`,
      codeLine: -1,
    });

    return steps;
  }
}
