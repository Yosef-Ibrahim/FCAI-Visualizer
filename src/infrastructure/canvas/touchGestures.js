// ══════════════════════════════════════════════════════════════════════════════
//  Canvas gesture helpers — touch pan / pinch zoom / double-tap reset.
//  Framework-free: the imperative canvas visualizers own a camera object
//  ({ zoom, offsetX, offsetY, x, y }) and we mutate it through these helpers.
//  Mouse behaviour (wheel zoom, drag pan, double-click reset) stays with each
//  visualizer, so pointer devices keep their existing feel.
// ══════════════════════════════════════════════════════════════════════════════

export const MIN_ZOOM = 0.08;
export const MAX_ZOOM = 6;
const TAP_DELAY_MS = 320;
const TAP_DISTANCE_PX = 28;
const MOVE_THRESHOLD_PX = 12;

/** True on phones/tablets (coarse pointer, no hover) — drives the hint copy. */
export function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

/** Hint strings for the canvas caption, chosen for the current input device. */
export function cameraHints() {
  const touch = isTouchDevice();
  return {
    touch,
    zoom: touch ? 'Pinch to zoom' : 'Scroll to zoom',
    pan: touch ? 'Drag to pan' : 'Right-click + drag to pan',
    reset: touch ? 'Double-tap to reset view' : 'Double-click to reset view',
  };
}

export function clampZoom(zoom, min = MIN_ZOOM, max = MAX_ZOOM) {
  return Math.min(max, Math.max(min, zoom));
}

/**
 * Zoom around a screen-space point (canvas-local coordinates) so the content
 * under the user's fingers stays put. Returns the next camera values.
 */
export function zoomAt(cam, screenX, screenY, factor, min = MIN_ZOOM, max = MAX_ZOOM) {
  const worldX = (screenX - cam.offsetX) / cam.zoom + cam.x;
  const worldY = (screenY - cam.offsetY) / cam.zoom + cam.y;
  const zoom = clampZoom(cam.zoom * factor, min, max);
  return {
    zoom,
    offsetX: screenX - (worldX - cam.x) * zoom,
    offsetY: screenY - (worldY - cam.y) * zoom,
  };
}

/** Two taps close together in time and space count as a double-tap. */
export function isDoubleTap(previous, next, maxDelay = TAP_DELAY_MS, maxDistance = TAP_DISTANCE_PX) {
  if (!previous || !next) return false;
  return (
    next.time - previous.time <= maxDelay &&
    Math.hypot(next.x - previous.x, next.y - previous.y) <= maxDistance
  );
}

/**
 * Attach touch gestures to a canvas.
 *
 * - one finger drags the camera (pan)
 * - two fingers pinch-zoom around their midpoint
 * - two quick taps reset the camera
 *
 * Pair this with `touch-action: none` on the canvas so the browser does not
 * scroll or zoom the page underneath the gesture. Taps are left unprevented on
 * purpose: mobile browsers still synthesise a click, which the graph
 * visualizers use to select nodes.
 *
 * @returns {() => void} detach function; call it from the visualizer's destroy().
 */
export function attachTouchGestures(canvas, cam, options = {}) {
  const { minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM, reset = null } = options;

  let mode = null; // 'pan' | 'pinch'
  let pinchDistance = 0;
  let panX = 0;
  let panY = 0;
  let tapStart = null;
  let lastTap = null;

  const distanceBetween = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const onTouchStart = (event) => {
    if (event.touches.length >= 2) {
      mode = 'pinch';
      tapStart = null;
      pinchDistance = distanceBetween(event.touches[0], event.touches[1]);
      return;
    }
    const touch = event.touches[0];
    if (!touch) return;
    mode = 'pan';
    panX = touch.clientX;
    panY = touch.clientY;
    tapStart = { x: touch.clientX, y: touch.clientY, time: Date.now(), moved: false };
  };

  const onTouchMove = (event) => {
    if (mode === 'pinch' && event.touches.length >= 2) {
      event.preventDefault();
      const first = event.touches[0];
      const second = event.touches[1];
      const distance = distanceBetween(first, second);
      if (pinchDistance > 0 && distance > 0) {
        const rect = canvas.getBoundingClientRect();
        const centreX = (first.clientX + second.clientX) / 2 - rect.left;
        const centreY = (first.clientY + second.clientY) / 2 - rect.top;
        const next = zoomAt(cam, centreX, centreY, distance / pinchDistance, minZoom, maxZoom);
        cam.zoom = next.zoom;
        cam.offsetX = next.offsetX;
        cam.offsetY = next.offsetY;
      }
      pinchDistance = distance;
      return;
    }

    if (mode !== 'pan' || event.touches.length !== 1) return;
    event.preventDefault();
    const touch = event.touches[0];
    cam.offsetX += touch.clientX - panX;
    cam.offsetY += touch.clientY - panY;
    panX = touch.clientX;
    panY = touch.clientY;
    if (
      tapStart &&
      Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > MOVE_THRESHOLD_PX
    ) {
      tapStart.moved = true;
    }
  };

  const onTouchEnd = (event) => {
    if (event.touches.length > 0) {
      // One finger left the pinch: continue as a one-finger pan.
      if (mode === 'pinch' && event.touches.length === 1) {
        mode = 'pan';
        panX = event.touches[0].clientX;
        panY = event.touches[0].clientY;
        pinchDistance = 0;
      }
      return;
    }

    const tapped =
      mode === 'pan' && tapStart && !tapStart.moved && Date.now() - tapStart.time < TAP_DELAY_MS;
    mode = null;
    pinchDistance = 0;

    if (tapped && reset) {
      const tap = { x: tapStart.x, y: tapStart.y, time: Date.now() };
      if (isDoubleTap(lastTap, tap)) {
        lastTap = null;
        reset();
      } else {
        lastTap = tap;
      }
    }
    tapStart = null;
  };

  const onTouchCancel = () => {
    mode = null;
    pinchDistance = 0;
    tapStart = null;
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: true });
  canvas.addEventListener('touchcancel', onTouchCancel, { passive: true });

  return function detachTouchGestures() {
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.removeEventListener('touchcancel', onTouchCancel);
  };
}
