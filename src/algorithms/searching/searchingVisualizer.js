// ─────────────────────────────────────────────────────────────────────────────
// SearchingVisualizer
// A stateful, class-based Canvas renderer for all three search algorithms.
// Mirrors the architecture of SortingVisualizer.
//
// Public API:
//   SearchingVisualizer.init(canvasEl)
//   SearchingVisualizer.setState({ arr, steps, algo, speed, target })
//   SearchingVisualizer.drawStep(idx)       — instant draw
//   SearchingVisualizer.animateStep(idx, cb) — animated draw + callback
//   SearchingVisualizer.stopAnimation()
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  default:  '#2a2a42',
  scanned:  '#44445a',
  current:  '#f7c59f',  // accent4 — yellow-orange (being inspected)
  found:    '#43d9ad',  // accent3 — green
  notFound: '#ff6584',  // accent2 — red
  lo:       '#6c63ff',  // accent  — purple
  hi:       '#ff6584',  // accent2 — red
  mid:      '#f7c59f',  // accent4 — yellow
  block:    'rgba(108,99,255,0.18)',
  scanPtr:  '#ffd166',  // yellow
  barText:  '#e8e8f0',
  pointer:  '#8888aa',
};

const FONTS = {
  value:   '10px JetBrains Mono, monospace',
  pointer: 'bold 11px Inter, sans-serif',
  msg:     '13px Inter, sans-serif',
};

class _SearchingVisualizer {
  constructor() {
    this._canvas  = null;
    this._ctx     = null;
    this._state   = {
      arr: [], steps: [], algo: 'linear-search',
      speed: 5, target: null,
    };
    this._animFrame = null;
    this._animTimeout = null;
  }

  // ── Initialisation ──────────────────────────────────────────────────────────
  init(canvasEl) {
    this._canvas = canvasEl;
    this._ctx    = canvasEl.getContext('2d');
    this._fitCanvas();
  }

  _fitCanvas() {
    if (!this._canvas) return;
    const { offsetWidth: w, offsetHeight: h } = this._canvas;
    if (this._canvas.width !== w || this._canvas.height !== h) {
      this._canvas.width  = w || 800;
      this._canvas.height = h || 400;
    }
  }

  // ── State ───────────────────────────────────────────────────────────────────
  setState(patch) {
    Object.assign(this._state, patch);
  }

  // ── Stop ────────────────────────────────────────────────────────────────────
  stopAnimation() {
    if (this._animFrame)   { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
    if (this._animTimeout) { clearTimeout(this._animTimeout);       this._animTimeout = null; }
  }

  // ── Delay based on speed (1–15) ─────────────────────────────────────────────
  _delay() {
    const s = this._state.speed;
    return Math.round(1200 / (s * s * 0.8 + 1));
  }

  // ── animateStep: draw then fire callback after delay ────────────────────────
  animateStep(idx, cb) {
    this.stopAnimation();
    this.drawStep(idx);
    this._animTimeout = setTimeout(() => {
      if (cb) cb();
    }, this._delay());
  }

  // ── drawStep: entry point ───────────────────────────────────────────────────
  drawStep(idx) {
    if (!this._canvas || !this._ctx) return;
    this._fitCanvas();

    const { steps, arr } = this._state;
    const ctx = this._ctx;
    const W = this._canvas.width;
    const H = this._canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Choose data source
    const step = (idx >= 0 && steps[idx]) ? steps[idx] : null;
    const drawArr = step ? step.arr : arr;

    if (!drawArr || drawArr.length === 0) {
      this._drawEmpty(ctx, W, H);
      return;
    }

    this._drawBars(ctx, W, H, step, drawArr);
  }

  // ── Draw helpers ────────────────────────────────────────────────────────────
  _drawEmpty(ctx, W, H) {
    ctx.fillStyle = '#2a2a42';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#8888aa';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generate an array to begin', W / 2, H / 2);
  }

  _drawBars(ctx, W, H, step, drawArr) {
    const n = drawArr.length;
    const PADDING_TOP    = 24;
    const PADDING_BOTTOM = 44;  // extra room for pointer labels
    const PADDING_SIDE   = 20;

    const barAreaH = H - PADDING_TOP - PADDING_BOTTOM;
    const barAreaW = W - PADDING_SIDE * 2;
    const maxVal   = Math.max(...drawArr, 1);

    const barW    = Math.max(2, barAreaW / n);
    const barGap  = Math.max(1, barW * 0.12);
    const innerW  = barW - barGap;

    // Build lookup sets
    const scannedSet  = new Set(step?.scanned  ?? []);
    const currentSet  = new Set(step?.current  ?? []);
    const foundIdx    = step?.foundIdx ?? -1;
    const found       = step?.found    ?? null;

    // Draw block highlight (Jump Search)
    if (step?.blockStart != null && step?.blockEnd != null) {
      const bx  = PADDING_SIDE + step.blockStart * barW;
      const bx2 = PADDING_SIDE + (step.blockEnd + 1) * barW;
      ctx.fillStyle = COLORS.block;
      ctx.fillRect(bx, PADDING_TOP, bx2 - bx, barAreaH);
    }

    // Draw bars
    for (let i = 0; i < n; i++) {
      const val    = drawArr[i];
      const barH   = Math.max(2, (val / maxVal) * barAreaH);
      const x      = PADDING_SIDE + i * barW + barGap / 2;
      const y      = PADDING_TOP + barAreaH - barH;

      // Determine colour
      let color = COLORS.default;
      if (found === false)            color = COLORS.scanned;
      else if (i === foundIdx)        color = COLORS.found;
      else if (currentSet.has(i))     color = COLORS.current;
      else if (scannedSet.has(i))     color = COLORS.scanned;

      // Bar body
      ctx.fillStyle = color;
      const radius = Math.min(3, innerW / 2);
      this._roundRect(ctx, x, y, innerW, barH, radius);
      ctx.fill();

      // Subtle top glow on active
      if (currentSet.has(i) && found !== false) {
        const grd = ctx.createLinearGradient(x, y, x, y + barH);
        grd.addColorStop(0, 'rgba(255,255,255,0.18)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        this._roundRect(ctx, x, y, innerW, barH, radius);
        ctx.fill();
      }

      // Value label (only when bars are wide enough)
      if (innerW >= 16) {
        ctx.fillStyle = COLORS.barText;
        ctx.font = FONTS.value;
        ctx.textAlign = 'center';
        ctx.fillText(val, x + innerW / 2, y - 3);
      }
    }

    // Draw pointer labels below bars
    if (step) this._drawPointers(ctx, step, n, barW, PADDING_SIDE, H, PADDING_BOTTOM);
  }

  _drawPointers(ctx, step, n, barW, padSide, H, padBottom) {
    const baseY  = H - padBottom + 8;
    const algo   = this._state.algo;

    const drawPtr = (idx, label, color, row = 0) => {
      if (idx < 0 || idx >= n) return;
      const cx = padSide + idx * barW + barW / 2;
      const y  = baseY + row * 16;

      // Triangle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - 5, y);
      ctx.lineTo(cx + 5, y);
      ctx.lineTo(cx, y - 6);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = FONTS.pointer;
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, y + 11);
    };

    if (algo === 'binary-search') {
      drawPtr(step.lo,  'lo',  COLORS.lo,  0);
      drawPtr(step.hi,  'hi',  COLORS.hi,  0);
      drawPtr(step.mid, 'mid', COLORS.mid, step.lo === step.mid || step.hi === step.mid ? 1 : 0);
    } else if (algo === 'jump-search') {
      // Block boundary markers
      if (step.blockStart != null) drawPtr(step.blockStart, 'blk', COLORS.lo,  0);
      if (step.blockEnd   != null) drawPtr(step.blockEnd,   'end', COLORS.hi,  0);
      if (step.scanIdx >= 0)       drawPtr(step.scanIdx,    'scan',COLORS.scanPtr, 1);
    }
    // Linear: no extra pointers needed
  }

  _roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }
}

export const SearchingVisualizer = new _SearchingVisualizer();
