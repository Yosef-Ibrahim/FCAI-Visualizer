import { GraphAlgorithm } from './GraphAlgorithm';

export class DFS extends GraphAlgorithm {
  constructor() {
    super('dfs');
  }

  generateSteps(input) {
    const { nodes, edges, start } = input;
    const adj = {};
    nodes.forEach(n => adj[n] = []);
    edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

    const steps = [];
    const visited = new Set();
    const order = [];

    const dfsRec = (node) => {
      visited.add(node);
      order.push(node);
      steps.push({
        graph: { nodes, edges, visited: [...visited], current: node, order: [...order], stack: [...order] },
        msg: `Visit ${node}, visited: [${[...visited].join(', ')}]`,
        codeLine: 1,
        codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      });
      for (const nb of adj[node]) {
        if (!visited.has(nb)) {
          dfsRec(nb);
        }
      }
    };

    dfsRec(start);

    steps.push({
      graph: { nodes, edges, visited: [...visited], order: [...order] },
      msg: `✅ DFS complete: ${order.join(' → ')}`,
      codeLine: -1,
    });
    return steps;
  }
}
