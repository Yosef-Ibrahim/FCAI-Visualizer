import { SortingVisualizer } from '../../algorithms/sorting/sortingVisualizer';

export class CanvasRenderer {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.visualizer = SortingVisualizer;
    this.visualizer.init(canvasEl);
  }

  draw(steps, stepIdx, algo) {
    const arr = Array.isArray(steps) ? steps : [steps];
    this.visualizer.setState({ steps: arr, algo });
    this.visualizer.drawStep(stepIdx ?? 0);
  }

  drawStep(step) {
    this.draw([step], 0, 'custom');
  }

  animateStep(stepIdx, callback) {
    this.visualizer.animateStep(stepIdx, callback);
  }

  destroy() {
    this.visualizer.stopAnimation();
  }
}
