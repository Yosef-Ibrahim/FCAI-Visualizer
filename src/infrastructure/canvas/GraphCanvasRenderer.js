export class GraphCanvasRenderer {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.nodePositions = {};
    this.radius = 24;
    this.colors = {
      bg: '#1e1e2e', node: '#313244', nodeBorder: '#585b70',
      visited: '#a6e3a1', current: '#f9e2af', edge: '#585b70',
      mstEdge: '#a6e3a1', text: '#cdd6f4', queue: '#89b4fa',
    };
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  _layoutNodes(nodes) {
    const cx = this.width / 2, cy = this.height / 2;
    const radius = Math.min(cx, cy) * 0.6;
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      this.nodePositions[n] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }

  draw(step) {
    const { ctx } = this;
    const g = step.graph || step;
    ctx.clearRect(0, 0, this.width, this.height);

    const nodes = g.nodes || [];
    const edges = g.edges || [];
    const visited = new Set(g.visited || []);
    const mstSet = new Set((g.mstEdges || []).map(e => `${e.from}-${e.to}`));
    const current = g.current;

    this._layoutNodes(nodes);

    edges.forEach(([a, b]) => {
      const from = this.nodePositions[a], to = this.nodePositions[b];
      if (!from || !to) return;
      const isMst = mstSet.has(`${a}-${b}`) || mstSet.has(`${b}-${a}`);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = isMst ? this.colors.mstEdge : this.colors.edge;
      ctx.lineWidth = isMst ? 3 : 1.5;
      ctx.stroke();
    });

    nodes.forEach(n => {
      const pos = this.nodePositions[n];
      if (!pos) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
      if (n === current) {
        ctx.fillStyle = this.colors.current;
      } else if (visited.has(n)) {
        ctx.fillStyle = this.colors.visited;
      } else {
        ctx.fillStyle = this.colors.node;
      }
      ctx.fill();
      ctx.strokeStyle = this.colors.nodeBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n, pos.x, pos.y);
    });

    if (g.queue && g.queue.length > 0) {
      ctx.fillStyle = this.colors.queue;
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Queue: [${g.queue.join(', ')}]`, 16, this.height - 24);
    }
    if (g.order && g.order.length > 0) {
      ctx.fillStyle = this.colors.text;
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Visit order: ${g.order.join(' → ')}`, 16, this.height - 8);
    }
  }

  destroy() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
