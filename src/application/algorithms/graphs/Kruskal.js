import { GraphAlgorithm } from './GraphAlgorithm';

class UnionFind {
  constructor(nodes) {
    this.parent = {};
    this.rank = {};
    nodes.forEach(n => { this.parent[n] = n; this.rank[n] = 0; });
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) { const t = ra; ra = rb; rb = t; }
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}

export class Kruskal extends GraphAlgorithm {
  constructor() {
    super('kruskal');
  }

  generateSteps(input) {
    const { nodes, edges } = input;
    const weightedEdges = edges.map(([a, b, w]) => ({ from: a, to: b, weight: w ?? 1 }))
      .sort((a, b) => a.weight - b.weight);

    const steps = [];
    const uf = new UnionFind(nodes);
    const mstEdges = [];

    steps.push({
      graph: { nodes, edges, visited: [], mstEdges: [], current: null, mstNodes: [] },
      msg: `Start Kruskal's MST — sorted ${weightedEdges.length} edges by weight`,
      codeLine: 0, codeLines: {},
    });

    for (const e of weightedEdges) {
      const cycle = !uf.union(e.from, e.to);
      if (!cycle) {
        mstEdges.push(e);
        steps.push({
          graph: { nodes, edges, visited: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))], mstEdges: [...mstEdges], current: e.to, mstNodes: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))] },
          msg: `Add edge ${e.from}—${e.to} (weight: ${e.weight})`,
          codeLine: 1, codeLines: {},
        });
      } else {
        steps.push({
          graph: { nodes, edges, visited: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))], mstEdges: [...mstEdges], current: null, mstNodes: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))] },
          msg: `Skip edge ${e.from}—${e.to} (would create cycle)`,
          codeLine: 2, codeLines: {},
        });
      }
    }

    steps.push({
      graph: { nodes, edges, visited: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))], mstEdges: [...mstEdges], mstNodes: [...new Set(mstEdges.flatMap(e => [e.from, e.to]))] },
      msg: `✅ MST complete: ${mstEdges.map(e => `${e.from}—${e.to}`).join(', ')}`,
      codeLine: -1,
    });

    return steps;
  }
}
