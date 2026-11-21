import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
import '../../styles/SvgCameraViewport.css';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3.5;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

/**
 * Shared pan/zoom SVG viewport for multi-way trees (Suffix Trie, Suffix Tree, etc.).
 * Supports mouse drag, single-finger touch drag, wheel zoom, zoom buttons,
 * double-click reset, keyboard +/-/0, and automatic fit-on-resize via ResizeObserver.
 */
export default function SvgCameraViewport({
  contentWidth,
  contentHeight,
  ariaLabel,
  className = '',
  children,
}) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);

  const computeFit = useCallback(() => {
    const el = containerRef.current;
    if (!el || !contentWidth || !contentHeight) return { x: 0, y: 0, scale: 1 };
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0, scale: 1 };
    const pad = 28;
    const availW = Math.max(120, rect.width - pad * 2);
    const availH = Math.max(120, rect.height - pad * 2);
    const scale = clampZoom(Math.min(1.05, availW / contentWidth, availH / contentHeight));
    const x = (rect.width - contentWidth * scale) / 2;
    const y = Math.max(pad, (rect.height - contentHeight * scale) / 2);
    return { x, y, scale };
  }, [contentWidth, contentHeight]);

  const resetCamera = useCallback(() => {
    setCamera(computeFit());
  }, [computeFit]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const rafId = window.requestAnimationFrame(() => {
      setCamera(computeFit());
    });
    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(rafId);
    }
    const observer = new ResizeObserver(() => {
      setCamera(computeFit());
    });
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [computeFit]);

  const zoomAtCenter = useCallback((factor) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setCamera((prev) => {
      const nextScale = clampZoom(prev.scale * factor);
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        x: cx - (cx - prev.x) * ratio,
        y: cy - (cy - prev.y) * ratio,
      };
    });
  }, []);

  const handleWheel = useCallback((event) => {
    const el = containerRef.current;
    if (!el) return;
    event.preventDefault();
    const rect = el.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.12 : 0.89;
    setCamera((prev) => {
      const nextScale = clampZoom(prev.scale * factor);
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        x: px - (px - prev.x) * ratio,
        y: py - (py - prev.y) * ratio,
      };
    });
  }, []);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0 && event.button !== 1) return;
    if (event.target.closest('.svg-cam-controls')) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: camera.x,
      originY: camera.y,
    };
    setIsDragging(true);
  }, [camera.x, camera.y]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setCamera((prev) => ({
      ...prev,
      x: drag.originX + dx,
      y: drag.originY + dy,
    }));
  }, []);

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAtCenter(1.18);
    } else if (event.key === '-') {
      event.preventDefault();
      zoomAtCenter(0.84);
    } else if (event.key === '0') {
      event.preventDefault();
      resetCamera();
    }
  }, [resetCamera, zoomAtCenter]);

  return (
    <div
      ref={containerRef}
      className={`svg-cam-viewport ltr-keep${isDragging ? ' is-dragging' : ''}${className ? ` ${className}` : ''}`}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={resetCamera}
      onKeyDown={handleKeyDown}
    >
      <svg
        className="svg-cam-canvas"
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
          {children}
        </g>
      </svg>

      <div className="svg-cam-controls" aria-label="Viewport zoom controls">
        <button
          type="button"
          className="svg-cam-btn"
          onClick={() => zoomAtCenter(1.2)}
          title="Zoom in (+)"
          aria-label="Zoom in"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          className="svg-cam-btn"
          onClick={() => zoomAtCenter(0.82)}
          title="Zoom out (-)"
          aria-label="Zoom out"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          className="svg-cam-btn"
          onClick={resetCamera}
          title="Fit to view (0)"
          aria-label="Reset camera"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
