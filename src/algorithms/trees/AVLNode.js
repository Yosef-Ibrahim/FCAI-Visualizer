// src/algorithms/trees/AVLNode.js
/**
 * Node class for AVL trees.
 * Stores data, links, height and rendering helpers.
 */
export class AVLNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    // Empty subtrees have height -1, so every leaf starts at height 0.
    this.height = 0;
    // Rendering state fields (used by visualizer)
    this.cur_x = 0;
    this.cur_y = 0;
    this.tgt_x = 0;
    this.tgt_y = 0;
    this.isNew = false;
    this.isRotating = false;
    this.alpha = 0;
    this.pulseTimer = 0;
    this.highlightVal = 0;
    this.prelim = 0;
    this.mod = 0;
    this.highlightColor = null;
    this.highlightDuration = 0;
  }

  get value() { return this.data; }
  set value(value) { this.data = value; }
}
