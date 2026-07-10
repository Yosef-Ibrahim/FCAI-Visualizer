export class DataStructureRenderer {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.cellW = 56;
    this.cellH = 56;
    this.gap = 6;
    this.colors = {
      bg: '#1e1e2e', cell: '#313244', border: '#585b70',
      highlight: '#f9e2af', text: '#cdd6f4', accent: '#cba6f7',
      arrow: '#585b70',
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

  draw(step) {
    const { ctx } = this;
    const d = step.data || step;
    const values = d.values || [];
    const highlighted = d.highlighted;
    const type = d.type || 'array';
    ctx.clearRect(0, 0, this.width, this.height);

    if (type === 'stack') {
      this._drawVertical(values, highlighted);
    } else if (type === 'queue') {
      this._drawHorizontal(values, highlighted);
    } else if (type.startsWith('linked-list') || type === 'singly' || type === 'doubly' || type === 'circular' || type === 'ordered') {
      this._drawLinkedList(values, highlighted, type);
    } else {
      this._drawHorizontal(values, highlighted);
    }
  }

  _drawHorizontal(values, highlighted) {
    const { ctx } = this;
    const totalW = values.length * (this.cellW + this.gap) - this.gap;
    const startX = (this.width - totalW) / 2 + this.cellW / 2;
    const y = this.height / 2;

    values.forEach((val, i) => {
      const x = startX + i * (this.cellW + this.gap);
      ctx.fillStyle = i === highlighted ? this.colors.highlight : this.colors.cell;
      ctx.beginPath();
      ctx.roundRect(x - this.cellW / 2, y - this.cellH / 2, this.cellW, this.cellH, 6);
      ctx.fill();
      ctx.strokeStyle = this.colors.border;
      ctx.lineWidth = i === highlighted ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), x, y - 4);

      ctx.fillStyle = this.colors.accent;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`[${i}]`, x, y + this.cellH / 2 - 8);
    });
  }

  _drawVertical(values, highlighted) {
    const { ctx } = this;
    const totalH = values.length * (this.cellH + this.gap) - this.gap;
    const startY = (this.height - totalH) / 2 + this.cellH / 2;
    const x = this.width / 2;

    values.forEach((val, i) => {
      const y = startY + i * (this.cellH + this.gap);
      ctx.fillStyle = i === highlighted ? this.colors.highlight : this.colors.cell;
      ctx.beginPath();
      ctx.roundRect(x - this.cellW / 2, y - this.cellH / 2, this.cellW, this.cellH, 6);
      ctx.fill();
      ctx.strokeStyle = this.colors.border;
      ctx.lineWidth = i === highlighted ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), x, y - 4);

      if (i === values.length - 1) {
        ctx.fillStyle = this.colors.accent;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText('← TOP', x + this.cellW / 2 + 10, y);
      }
    });
  }

  _drawLinkedList(values, highlighted, type) {
    const { ctx } = this;
    const totalW = values.length * (this.cellW + this.gap + 20) - this.gap;
    const startX = (this.width - totalW) / 2 + this.cellW / 2;
    const y = this.height / 2;

    values.forEach((val, i) => {
      const x = startX + i * (this.cellW + this.gap + 20);
      ctx.fillStyle = i === highlighted ? this.colors.highlight : this.colors.cell;
      ctx.beginPath();
      ctx.roundRect(x - this.cellW / 2, y - this.cellH / 2, this.cellW, this.cellH, 6);
      ctx.fill();
      ctx.strokeStyle = this.colors.border;
      ctx.lineWidth = i === highlighted ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 16px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), x, y);

      if (i < values.length - 1) {
        const arrowX = x + this.cellW / 2 + 4;
        ctx.beginPath();
        ctx.moveTo(arrowX, y);
        ctx.lineTo(arrowX + 12, y);
        ctx.strokeStyle = this.colors.arrow;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowX + 12, y);
        ctx.lineTo(arrowX + 6, y - 4);
        ctx.lineTo(arrowX + 6, y + 4);
        ctx.closePath();
        ctx.fillStyle = this.colors.arrow;
        ctx.fill();

        if (type === 'doubly') {
          ctx.beginPath();
          ctx.moveTo(arrowX, y + 12);
          ctx.lineTo(arrowX + 12, y + 12);
          ctx.strokeStyle = this.colors.arrow;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(arrowX, y + 12);
          ctx.lineTo(arrowX + 6, y + 8);
          ctx.lineTo(arrowX + 6, y + 16);
          ctx.closePath();
          ctx.fillStyle = this.colors.arrow;
          ctx.fill();
        }
      }

      if (type === 'circular' && i === values.length - 1) {
        const arrowX = x + this.cellW / 2 + 4;
        const firstX = startX;
        ctx.beginPath();
        ctx.moveTo(arrowX, y + 24);
        ctx.quadraticCurveTo((arrowX + firstX) / 2, y + 48, firstX - this.cellW / 2, y + 24);
        ctx.strokeStyle = this.colors.arrow;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  destroy() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
