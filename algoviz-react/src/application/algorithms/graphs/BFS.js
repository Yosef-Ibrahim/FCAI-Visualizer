import { GraphAlgorithm } from './GraphAlgorithm';

export class BFS extends GraphAlgorithm {
  constructor() {
    super('bfs');
  }

  generateSteps(input) {
    const { nodes, edges, start } = input;
    const adj = {};
    nodes.forEach(n => adj[n] = []);
    edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

    const steps = [];
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    const order = [];

    steps.push({
      graph: { nodes, edges, visited: [...visited], queue: [...queue], current: start },
      msg: `Start BFS from node ${start}`,
      codeLine: 1,
      codeLines: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
    });

    while (queue.length) {
      const node = queue.shift();
      order.push(node);
      steps.push({
        graph: { nodes, edges, visited: [...visited], queue: [...queue], current: node, order: [...order] },
        msg: `Visit ${node}, queue: [${queue.join(', ')}]`,
        codeLine: 2,
        codeLines: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      });
      for (const nb of adj[node]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
          steps.push({
            graph: { nodes, edges, visited: [...visited], queue: [...queue], current: nb, order: [...order] },
            msg: `Discovered ${nb} from ${node}`,
            codeLine: 3,
            codeLines: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
          });
        }
      }
    }

    steps.push({
      graph: { nodes, edges, visited: [...visited], queue: [], order: [...order] },
      msg: `✅ BFS complete: ${order.join(' → ')}`,
      codeLine: -1,
    });
    return steps;
  }
}
