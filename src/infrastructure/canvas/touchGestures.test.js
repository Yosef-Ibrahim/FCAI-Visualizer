import { describe, expect, it } from 'vitest';
import { clampZoom, isDoubleTap, zoomAt } from './touchGestures.js';

describe('clampZoom', () => {
  it('keeps the zoom inside the inclusive range', () => {
    expect(clampZoom(0.01, 0.1, 5)).toBe(0.1);
    expect(clampZoom(9, 0.1, 5)).toBe(5);
    expect(clampZoom(2, 0.1, 5)).toBe(2);
  });
});

describe('zoomAt', () => {
  it('keeps the world point under the screen point fixed', () => {
    const cam = { x: 0, y: 0, zoom: 1, offsetX: 10, offsetY: 20 };
    const screenX = 100;
    const screenY = 50;
    const worldX = (screenX - cam.offsetX) / cam.zoom + cam.x;
    const worldY = (screenY - cam.offsetY) / cam.zoom + cam.y;

    const next = zoomAt(cam, screenX, screenY, 2, 0.1, 5);

    expect(next.zoom).toBe(2);
    expect((screenX - next.offsetX) / next.zoom + cam.x).toBeCloseTo(worldX, 10);
    expect((screenY - next.offsetY) / next.zoom + cam.y).toBeCloseTo(worldY, 10);
  });

  it('respects the zoom clamps', () => {
    const cam = { x: 0, y: 0, zoom: 4, offsetX: 0, offsetY: 0 };
    expect(zoomAt(cam, 0, 0, 10, 0.1, 5).zoom).toBe(5);
    expect(zoomAt(cam, 0, 0, 0.0001, 0.1, 5).zoom).toBe(0.1);
  });
});

describe('isDoubleTap', () => {
  it('accepts two quick taps at nearly the same place', () => {
    expect(isDoubleTap({ x: 10, y: 10, time: 1000 }, { x: 14, y: 12, time: 1200 })).toBe(true);
  });

  it('rejects taps that are too far apart in time or space', () => {
    expect(isDoubleTap({ x: 10, y: 10, time: 1000 }, { x: 14, y: 12, time: 1600 })).toBe(false);
    expect(isDoubleTap({ x: 10, y: 10, time: 1000 }, { x: 90, y: 10, time: 1100 })).toBe(false);
  });

  it('needs a previous tap', () => {
    expect(isDoubleTap(null, { x: 10, y: 10, time: 1000 })).toBe(false);
  });
});
