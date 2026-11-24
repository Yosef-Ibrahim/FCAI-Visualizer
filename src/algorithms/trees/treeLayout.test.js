import { describe, expect, it } from 'vitest';
import { layoutTreeSnapshot, TREE_CAMERA_ORIGIN } from './treeLayout.js';

describe('tree snapshot layout', () => {
  it('keeps node spacing independent of available viewport dimensions', () => {
    const snapshot = {
      value: 8,
      left: { value: 4, left: { value: 2, left: null, right: null }, right: { value: 6, left: null, right: null } },
      right: { value: 12, left: { value: 10, left: null, right: null }, right: { value: 14, left: null, right: null } },
    };

    const layout = layoutTreeSnapshot(snapshot);
    const positions = [...layout.nodes.values()].map(({ value, x, y }) => ({ value, x, y }));

    expect(positions.map(({ x }) => x)).toEqual([-270, -180, -90, 0, 90, 180, 270]);
    expect(layout.nodes.get(8).y).toBe(0);
    expect(layout.nodes.get(4).y).toBe(78);
    expect(layout.nodes.get(2).y).toBe(156);
    expect(layout.radius).toBe(20);
  });

  it('uses a stable camera origin instead of centering the tree in the viewport', () => {
    expect(TREE_CAMERA_ORIGIN).toEqual({ x: 300, y: 180 });
  });
});
