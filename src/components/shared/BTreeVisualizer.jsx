import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CornerDownLeft,
  Maximize2,
  Minus,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { BTree, BTREE_MAX_ORDER, BTREE_MIN_ORDER, BTREE_ORDER } from '../../algorithms/trees/BTree';
import { stepText } from '../../i18n/stepText';
import { useT } from '../../hooks/useT';
import '../../styles/BTreeVisualizer.css';
import '../../styles/TreeVisualizer.css';

const LEVEL_GAP = 118;
const HORIZONTAL_PADDING = 84;
const NODE_HEIGHT = 42;
const KEY_WIDTH = 42;
const STEP_DELAYS = [1050, 760, 500];
const MOTION_DURATIONS = [700, 470, 280];
const DEPTH_COLORS = ['#5aa0ff', '#37be73', '#ff913c', '#b450f0', '#f54b82', '#2dc3c8', '#e1c828', '#8cd23c'];
const EMPHASIZED_STEPS = new Set(['split', 'root-split', 'promote', 'borrow', 'merge', 'root-shrink']);

function countLeaves(node) {
  if (!node.children.length) return 1;
  return node.children.reduce((total, child) => total + countLeaves(child), 0);
}

function getDividerPositions(keyCount) {
  return Array.from(
    { length: Math.max(0, keyCount - 1) },
    (_, index) => (index - (keyCount - 2) / 2) * KEY_WIDTH,
  );
}

function layoutTree(root, maxKeys) {
  if (!root) return { width: 820, height: 320, nodes: [], edges: [], keys: [] };

  const leafSlot = Math.max(206, maxKeys * KEY_WIDTH + 80);
  const leafCount = countLeaves(root);
  const width = Math.max(820, HORIZONTAL_PADDING * 2 + leafCount * leafSlot);
  const nodes = [];
  const edges = [];
  const place = (node, start, depth, parentId = null) => {
    const x = width / 2 + (start + countLeaves(node) / 2 - leafCount / 2) * leafSlot;
    const y = 70 + depth * LEVEL_GAP;
    nodes.push({
      ...node,
      x,
      y,
      depth,
      parentId,
      width: Math.max(62, node.keys.length * KEY_WIDTH + 16),
      dividerPositions: getDividerPositions(node.keys.length).map((x) => ({ x, opacity: 1 })),
    });

    let childStart = start;
    node.children.forEach((child) => {
      const childLeaves = countLeaves(child);
      const childX = width / 2 + (childStart + childLeaves / 2 - leafCount / 2) * leafSlot;
      const childY = 70 + (depth + 1) * LEVEL_GAP;
      edges.push({ fromId: node.id, toId: child.id, fromX: x, fromY: y, toX: childX, toY: childY });
      place(child, childStart, depth + 1, node.id);
      childStart += childLeaves;
    });
  };
  place(root, 0, 0);

  const maxDepth = Math.max(...nodes.map((node) => node.depth));
  return {
    width,
    height: 140 + maxDepth * LEVEL_GAP,
    nodes,
    edges,
    keys: nodes.flatMap((node) => node.keys.map((key, index) => ({
      key,
      nodeId: node.id,
      x: node.x + (index - (node.keys.length - 1) / 2) * KEY_WIDTH,
      y: node.y,
      opacity: 1,
    }))),
  };
}

function interpolateLayout(from, to, progress) {
  const eased = progress * progress * (3 - 2 * progress);
  const fromNodes = new Map(from.nodes.map((node) => [node.id, node]));
  const toNodes = new Map(to.nodes.map((node) => [node.id, node]));
  const allNodeIds = new Set([...fromNodes.keys(), ...toNodes.keys()]);
  const nodes = [...allNodeIds].map((id) => {
    const oldNode = fromNodes.get(id);
    const newNode = toNodes.get(id);
    if (oldNode && newNode) {
      const oldDividers = oldNode.dividerPositions
        ?? getDividerPositions(oldNode.keys.length).map((x) => ({ x, opacity: 1 }));
      const newDividers = newNode.dividerPositions
        ?? getDividerPositions(newNode.keys.length).map((x) => ({ x, opacity: 1 }));
      const dividerPositions = Array.from(
        { length: Math.max(oldDividers.length, newDividers.length) },
        (_, index) => {
          const oldDivider = oldDividers[index];
          const newDivider = newDividers[index];
          if (oldDivider && newDivider) {
            return { x: oldDivider.x + (newDivider.x - oldDivider.x) * eased, opacity: 1 };
          }
          return {
            x: newDivider?.x ?? oldDivider.x,
            opacity: newDivider ? eased : 1 - eased,
          };
        },
      );
      return {
        ...newNode,
        x: oldNode.x + (newNode.x - oldNode.x) * eased,
        y: oldNode.y + (newNode.y - oldNode.y) * eased,
        width: oldNode.width + (newNode.width - oldNode.width) * eased,
        opacity: 1,
        scale: 1,
        dividerPositions,
      };
    }

    const node = newNode ?? oldNode;
    const otherNodes = newNode ? fromNodes : toNodes;
    const parent = otherNodes.get(node.parentId) ?? otherNodes.get((newNode ? to : from).nodes[0]?.id);
    const anchor = parent
      ? { x: parent.x, y: parent.y }
      : { x: node.x, y: node.y + (newNode ? 52 : -52) };
    return newNode
      ? {
        ...newNode,
        x: anchor.x + (newNode.x - anchor.x) * eased,
        y: anchor.y + (newNode.y - anchor.y) * eased,
        opacity: eased,
        scale: 0.84 + eased * 0.16,
        dividerPositions: (newNode.dividerPositions
          ?? getDividerPositions(newNode.keys.length).map((x) => ({ x, opacity: 1 })))
          .map((divider) => ({ ...divider, opacity: eased })),
      }
      : {
        ...oldNode,
        x: oldNode.x + (anchor.x - oldNode.x) * eased,
        y: oldNode.y + (anchor.y - oldNode.y) * eased,
        opacity: 1 - eased,
        scale: 1 - eased * 0.16,
        dividerPositions: (oldNode.dividerPositions
          ?? getDividerPositions(oldNode.keys.length).map((x) => ({ x, opacity: 1 })))
          .map((divider) => ({ ...divider, opacity: 1 - eased })),
      };
  });
  const currentNodes = new Map(nodes.map((node) => [node.id, node]));

  const fromEdges = new Map(from.edges.map((edge) => [`${edge.fromId}-${edge.toId}`, edge]));
  const toEdges = new Map(to.edges.map((edge) => [`${edge.fromId}-${edge.toId}`, edge]));
  const allEdges = new Set([...fromEdges.keys(), ...toEdges.keys()]);
  const edges = [...allEdges].flatMap((key) => {
    const oldEdge = fromEdges.get(key);
    const newEdge = toEdges.get(key);
    const edge = newEdge ?? oldEdge;
    const parent = currentNodes.get(edge.fromId);
    const child = currentNodes.get(edge.toId);
    if (!parent || !child) return [];
    return [{
      fromId: edge.fromId,
      toId: edge.toId,
      fromX: parent.x,
      fromY: parent.y,
      toX: child.x,
      toY: child.y,
      opacity: oldEdge && newEdge ? 1 : newEdge ? eased : 1 - eased,
    }];
  });

  const oldKeys = new Map(from.nodes.flatMap((node) => node.keys.map((key, index) => [
    key,
    { node, x: node.x + (index - (node.keys.length - 1) / 2) * KEY_WIDTH, y: node.y },
  ])));
  const newKeys = new Map(to.nodes.flatMap((node) => node.keys.map((key, index) => [
    key,
    { node, x: node.x + (index - (node.keys.length - 1) / 2) * KEY_WIDTH, y: node.y },
  ])));
  const keys = [...new Set([...oldKeys.keys(), ...newKeys.keys()])].map((key) => {
    const oldKey = oldKeys.get(key);
    const newKey = newKeys.get(key);
    if (oldKey && newKey) {
      return {
        key,
        nodeId: newKey.node.id,
        x: oldKey.x + (newKey.x - oldKey.x) * eased,
        y: oldKey.y + (newKey.y - oldKey.y) * eased,
        opacity: 1,
      };
    }
    const current = newKey ?? oldKey;
    const otherNodes = newKey ? fromNodes : toNodes;
    const parent = otherNodes.get(current.node.parentId);
    const anchor = parent ? { x: parent.x, y: parent.y } : { x: current.x, y: current.y };
    return newKey
      ? {
        key,
        nodeId: newKey.node.id,
        x: anchor.x + (newKey.x - anchor.x) * eased,
        y: anchor.y + (newKey.y - anchor.y) * eased,
        opacity: eased,
      }
      : {
        key,
        nodeId: oldKey.node.id,
        x: oldKey.x,
        y: oldKey.y,
        opacity: 1 - eased,
      };
  });

  return {
    width: from.width + (to.width - from.width) * eased,
    height: from.height + (to.height - from.height) * eased,
    nodes,
    edges,
    keys,
  };
}

function TreeDrawing({
  root,
  activeStep,
  t,
  maxKeys,
  camera,
  setCamera,
  speed,
  order,
  stats,
  viewportRef,
  panRef,
}) {
  const targetLayout = useMemo(() => layoutTree(root, maxKeys), [root, maxKeys]);
  const [motion, setMotion] = useState(null);
  const displayedLayoutRef = useRef(null);
  const durationRef = useRef(MOTION_DURATIONS[speed]);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layout = motion
    ? (reduceMotion ? targetLayout : interpolateLayout(motion.from, motion.to, motion.progress))
    : targetLayout;
  const focusIds = new Set(activeStep?.focusIds ?? []);
  const promotionNode = activeStep?.kind === 'split'
    ? layout.nodes.find((node) => focusIds.has(node.id))
    : null;

  useLayoutEffect(() => {
    durationRef.current = MOTION_DURATIONS[speed]
      * (EMPHASIZED_STEPS.has(activeStep?.kind) ? 1.18 : 1);
  }, [activeStep?.kind, speed]);

  useLayoutEffect(() => {
    const from = displayedLayoutRef.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayedLayoutRef.current = targetLayout;
      const frameId = requestAnimationFrame(() => setMotion(null));
      return () => cancelAnimationFrame(frameId);
    }
    if (!from) {
      displayedLayoutRef.current = targetLayout;
      return undefined;
    }

    let frameId;
    const startTime = performance.now();
    const duration = durationRef.current;
    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      setMotion({ from, to: targetLayout, progress });
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        displayedLayoutRef.current = targetLayout;
        setMotion(null);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [targetLayout]);

  useLayoutEffect(() => {
    displayedLayoutRef.current = layout;
  }, [layout]);

  return (
    <div
      className="btree-drawing-scroll"
      ref={viewportRef}
      onPointerDown={(event) => {
        if (event.button !== 2) return;
        event.preventDefault();
        event.currentTarget.classList.add('is-panning');
        panRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const pan = panRef.current;
        if (!pan || pan.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - pan.x;
        const deltaY = event.clientY - pan.y;
        pan.x = event.clientX;
        pan.y = event.clientY;
        setCamera((current) => ({
          ...current,
          panX: current.panX + deltaX,
          panY: current.panY + deltaY,
        }));
      }}
      onPointerUp={(event) => {
        if (panRef.current?.pointerId === event.pointerId) {
          panRef.current = null;
          event.currentTarget.classList.remove('is-panning');
        }
      }}
      onPointerCancel={(event) => {
        panRef.current = null;
        event.currentTarget.classList.remove('is-panning');
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <svg
        className="btree-drawing"
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={t('btree.treeAria', {
          keys: layout.nodes.map((node) => node.keys.join(', ')).join('; '),
        })}
      >
        <g transform={`translate(${layout.width / 2 + camera.panX} ${layout.height / 2 + camera.panY}) scale(${camera.zoom}) translate(${-layout.width / 2} ${-layout.height / 2})`}>
          {activeStep?.kind === 'split' && activeStep.promotedKey !== undefined && (
            <g
              className="btree-promotion-marker"
              transform={`translate(${promotionNode?.x ?? 0} ${promotionNode ? promotionNode.y - 39 : 0})`}
            >
              <rect x="-22" y="-14" width="44" height="28" rx="7" />
              <text y="1">{activeStep.promotedKey}</text>
            </g>
          )}
          <g className="btree-edges" aria-hidden="true">
            {layout.edges.map((edge, index) => (
              <line
                key={`${edge.fromId}-${edge.toId}-${index}`}
                className={activeStep?.childId === edge.toId ? 'is-selected' : ''}
                x1={edge.fromX}
                y1={edge.fromY + NODE_HEIGHT / 2}
                x2={edge.toX}
                y2={edge.toY - NODE_HEIGHT / 2}
                opacity={edge.opacity ?? 1}
              />
            ))}
          </g>
          {layout.nodes.map((node) => {
            const isFocused = focusIds.has(node.id);
            const stateClass = isFocused ? ` is-${activeStep?.kind ?? 'visit'}` : '';
            return (
              <g
                key={node.id}
                className={`btree-node${stateClass}`}
                transform={`translate(${node.x} ${node.y}) scale(${node.scale ?? 1})`}
                opacity={node.opacity ?? 1}
                style={{ '--depth-color': DEPTH_COLORS[node.depth % DEPTH_COLORS.length] }}
              >
                <title>{t('btree.nodeTitle', { keys: node.keys.join(', ') })}</title>
                <rect
                  x={-node.width / 2}
                  y={-NODE_HEIGHT / 2}
                  width={node.width}
                  height={NODE_HEIGHT}
                  rx="10"
                />
                {node.dividerPositions.map((divider, index) => (
                  <line
                    key={`${node.id}-divider-${index}`}
                    className="btree-key-divider"
                    x1={divider.x}
                    y1={-NODE_HEIGHT / 2 + 7}
                    x2={divider.x}
                    y2={NODE_HEIGHT / 2 - 7}
                    opacity={divider.opacity}
                  />
                ))}
              </g>
            );
          })}
          {layout.keys.map((item) => {
            const isFocused = focusIds.has(item.nodeId) && activeStep?.key === item.key;
            return (
              <g
                key={`key-${item.key}`}
                className={`btree-key${isFocused ? ' is-focused' : ''}`}
                transform={`translate(${item.x} ${item.y})`}
                opacity={item.opacity}
                aria-hidden="true"
              >
                {isFocused && (
                  <rect x={-KEY_WIDTH / 2 + 2} y={-NODE_HEIGHT / 2 + 5} width={KEY_WIDTH - 4} height={NODE_HEIGHT - 10} rx="5" />
                )}
                <text y="1">{item.key}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="tree-depth-legend" aria-label={t('btree.depthLegend')}>
        <span className="tree-legend-label">{t('btree.depth')}:</span>
        {DEPTH_COLORS.map((color, index) => (
          <span
            key={color}
            className="tree-legend-dot"
            style={{ background: color }}
            title={t('btree.depthLevel', { level: index + 1 })}
          />
        ))}
      </div>
      <div className="tree-live-stats" aria-live="polite" aria-label={t('btree.liveStats')}>
        <div className="tree-ls-label">{t('btree.liveStats')}</div>
      <div className="btree-live-stat">{t('btree.nodes')}: <b>{stats.nodes}</b></div>
      <div className="btree-live-stat" title={t('btree.heightExplanation')}>
        {t('btree.height')}: <b>{Math.max(0, stats.levels - 1)}</b>
      </div>
      <div className="btree-live-stat">{t('btree.levels')}: <b>{stats.levels}</b></div>
      <div className="btree-live-stat">{t('btree.keys')}: <b>{stats.keys}</b></div>
        <div className="btree-live-stat">{t('btree.orderLabel', { order })}</div>
        <div className="btree-live-stat">{t('btree.maxKeys')}: <b>{maxKeys}</b></div>
      </div>
      <div className="tree-hints" aria-label={t('btree.canvasInstructions')}>
        <span className="tree-hint"><span className="tree-hint-icon"><ZoomIn size={13} /></span><span>{t('btree.hintZoom')}</span></span>
        <span className="tree-hint"><span className="tree-hint-icon"><MousePointer2 size={13} /></span><span>{t('btree.hintPan')}</span></span>
        <span className="tree-hint"><span className="tree-hint-icon"><RotateCcw size={13} /></span><span>{t('btree.hintReset')}</span></span>
        <span className="tree-hint"><span className="tree-hint-icon"><CornerDownLeft size={13} /></span><span><kbd>Enter</kbd> {t('btree.hintInsert')}</span></span>
      </div>
    </div>
  );
}

export default function BTreeVisualizer() {
  const t = useT('catalog');
  const treeRef = useRef(new BTree());
  const timerRef = useRef(null);
  const viewportRef = useRef(null);
  const panRef = useRef(null);
  const [camera, setCamera] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [root, setRoot] = useState(null);
  const [order, setOrder] = useState(BTREE_ORDER);
  const [value, setValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const activeStep = stepIndex >= 0 ? steps[stepIndex] : null;
  const isBusy = steps.length > 0 && stepIndex < steps.length - 1;
  const stats = useMemo(() => getTreeStats(root), [root]);
  const minKeys = Math.floor((order - 1) / 2);
  const currentDelay = STEP_DELAYS[speed] * (EMPHASIZED_STEPS.has(activeStep?.kind) ? 1.2 : 1);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (stepIndex >= steps.length - 1) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timerRef.current = window.setTimeout(() => {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setRoot(steps[nextIndex].snapshot);
      if (nextIndex >= steps.length - 1) setIsPlaying(false);
    }, reducedMotion ? 0 : currentDelay);

    return () => window.clearTimeout(timerRef.current);
  }, [currentDelay, isPlaying, speed, stepIndex, steps]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      const bounds = viewport.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left - bounds.width / 2;
      const pointerY = event.clientY - bounds.top - bounds.height / 2;
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;

      setCamera((current) => {
        const zoom = Math.min(6, Math.max(0.08, current.zoom * factor));
        const ratio = zoom / current.zoom;
        return {
          zoom,
          panX: pointerX - (pointerX - current.panX) * ratio,
          panY: pointerY - (pointerY - current.panY) * ratio,
        };
      });
    };
    const handleDoubleClick = (event) => {
      event.preventDefault();
      setCamera({ zoom: 1, panX: 0, panY: 0 });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('dblclick', handleDoubleClick);
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  const runOperation = (operation) => {
    const raw = value.trim();
    if (!/^-?\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
      setInputError(true);
      return;
    }

    window.clearTimeout(timerRef.current);
    const result = treeRef.current[operation](Number(raw));
    setInputError(false);
    setSteps(result.steps);
    setStepIndex(0);
    setRoot(result.steps[0]?.snapshot ?? treeRef.current.snapshot());
    setIsPlaying(result.steps.length > 1);
  };

  const resetTree = () => {
    window.clearTimeout(timerRef.current);
    treeRef.current = new BTree(order);
    setRoot(null);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setInputError(false);
    setValue('');
  };

  const changeOrder = (event) => {
    const nextOrder = Number(event.target.value);
    if (nextOrder === order) return;
    if (treeRef.current.root && !window.confirm(t('btree.orderChangeConfirm', { order, nextOrder }))) {
      event.target.value = String(order);
      return;
    }
    window.clearTimeout(timerRef.current);
    treeRef.current = new BTree(nextOrder);
    setOrder(nextOrder);
    setRoot(null);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setInputError(false);
  };

  const changeZoom = (factor) => {
    setCamera((current) => {
      const zoom = Math.min(6, Math.max(0.08, current.zoom * factor));
      const ratio = zoom / current.zoom;
      return { zoom, panX: current.panX * ratio, panY: current.panY * ratio };
    });
  };

  const showStep = (nextIndex) => {
    if (!steps[nextIndex]) return;
    setStepIndex(nextIndex);
    setRoot(steps[nextIndex].snapshot);
  };

  const playOrPause = () => {
    if (stepIndex >= steps.length - 1) showStep(0);
    setIsPlaying((playing) => !playing);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runOperation('insert');
  };

  return (
    <div className="btree-page">
      <aside className="btree-panel" aria-label={t('btree.controls')}>
        <div className="btree-panel-heading">
          <span>{t('btree.eyebrow')}</span>
          <h1>{t('btree.title')}</h1>
          <p>{t('btree.description')}</p>
        </div>

        <div className="btree-limit-card">
          <label className="btree-section-label" htmlFor="btree-order">{t('btree.orderInput')}</label>
          <select
            id="btree-order"
            className="btree-input btree-order-select"
            value={order}
            onChange={changeOrder}
            disabled={isBusy}
          >
            {Array.from({ length: BTREE_MAX_ORDER - BTREE_MIN_ORDER + 1 }, (_, index) => BTREE_MIN_ORDER + index)
              .map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <span>{t('btree.orderDescription')}</span>
          <div className="btree-stat-row">
            <span>{t('btree.maxKeys')}</span><b>{order - 1}</b>
            <span>{t('btree.minKeys')}</span><b>{minKeys}</b>
          </div>
        </div>

        <form className="btree-operation-form" onSubmit={handleSubmit}>
          <label className="btree-section-label" htmlFor="btree-value">{t('btree.operationInput')}</label>
          <input
            id="btree-value"
            className={`btree-input${inputError ? ' has-error' : ''}`}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setInputError(false);
            }}
            placeholder={t('btree.inputPlaceholder')}
            aria-invalid={inputError}
            aria-describedby={inputError ? 'btree-input-error' : undefined}
          />
          {inputError && <span className="btree-input-error" id="btree-input-error">{t('btree.invalidKey')}</span>}
          <div className="btree-operation-buttons">
            <button type="submit" className="btree-action btree-action--insert" disabled={isBusy}>
              {t('btree.insert')}
            </button>
            <button type="button" className="btree-action btree-action--search" onClick={() => runOperation('search')} disabled={isBusy}>
              {t('btree.search')}
            </button>
            <button type="button" className="btree-action btree-action--delete" onClick={() => runOperation('delete')} disabled={isBusy}>
              {t('btree.delete')}
            </button>
          </div>
        </form>

        <section className="btree-control-section" aria-label={t('btree.playback')}>
          <div className="btree-section-label">{t('btree.playback')}</div>
          <div className="btree-playback-controls">
            <button type="button" className="btree-icon-button" onClick={() => { setIsPlaying(false); showStep(Math.max(0, stepIndex - 1)); }} disabled={!steps.length || stepIndex <= 0} aria-label={t('btree.previous')} title={t('btree.previous')}>
              <SkipBack size={16} />
            </button>
            <button type="button" className="btree-icon-button btree-play-button" onClick={playOrPause} disabled={!steps.length} aria-label={t(isPlaying ? 'btree.pause' : 'btree.play')} title={t(isPlaying ? 'btree.pause' : 'btree.play')}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" className="btree-icon-button" onClick={() => { setIsPlaying(false); showStep(Math.min(steps.length - 1, stepIndex + 1)); }} disabled={!steps.length || stepIndex >= steps.length - 1} aria-label={t('btree.next')} title={t('btree.next')}>
              <SkipForward size={16} />
            </button>
            <button type="button" className="btree-icon-button" onClick={() => { setIsPlaying(false); showStep(0); }} disabled={!steps.length || stepIndex <= 0} aria-label={t('btree.restart')} title={t('btree.restart')}>
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="btree-step-count">
            {steps.length
              ? t('btree.stepCount', { current: stepIndex + 1, total: steps.length })
              : t('btree.ready')}
          </div>
          <div className="btree-speed-row" role="group" aria-label={t('btree.animationSpeed')}>
            {['slow', 'normal', 'fast'].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`btree-speed-button${speed === index ? ' is-active' : ''}`}
                onClick={() => setSpeed(index)}
                aria-pressed={speed === index}
              >
                {t(`btree.${label}`)}
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="btree-reset-button" onClick={resetTree} disabled={isBusy}>
          <Trash2 size={15} /> {t('btree.reset')}
        </button>

        <div className={`btree-step-message${activeStep ? ` is-${activeStep.kind}` : ''}`} aria-live="polite" aria-atomic="true">
          <span className="btree-section-label">{t('btree.operationStatus')}</span>
          <p>{activeStep ? stepText(activeStep) : t('btree.idleMessage')}</p>
        </div>
      </aside>

      <section className="btree-visualization" aria-label={t('btree.visualization')}>
        <div className="btree-visualization-header">
          <div>
            <span>{t('btree.visualizationEyebrow')}</span>
            <h2>{t('btree.title')}</h2>
          </div>
          <div className="btree-visualization-stats">
            <div className="btree-zoom-controls" role="group" aria-label={t('btree.zoomControls')}>
              <button type="button" onClick={() => changeZoom(1 / 1.12)} aria-label={t('btree.zoomOut')} title={t('btree.zoomOut')}><Minus size={14} /></button>
              <button type="button" onClick={() => setCamera({ zoom: 1, panX: 0, panY: 0 })} aria-label={t('btree.resetZoom')} title={t('btree.resetZoom')}><Maximize2 size={14} /></button>
              <button type="button" onClick={() => changeZoom(1.12)} aria-label={t('btree.zoomIn')} title={t('btree.zoomIn')}><Plus size={14} /></button>
            </div>
          </div>
        </div>
        <TreeDrawing
          root={root}
          activeStep={activeStep}
          t={t}
          maxKeys={order - 1}
          camera={camera}
          setCamera={setCamera}
          viewportRef={viewportRef}
          panRef={panRef}
          speed={speed}
          order={order}
          stats={stats}
        />
      </section>
    </div>
  );
}

function getTreeStats(root) {
  if (!root) return { keys: 0, nodes: 0, levels: 0 };
  return root.children.reduce((stats, child) => {
    const childStats = getTreeStats(child);
    return {
      keys: stats.keys + childStats.keys,
      nodes: stats.nodes + childStats.nodes,
      levels: Math.max(stats.levels, childStats.levels + 1),
    };
  }, {
    keys: root.keys.length,
    nodes: 1,
    levels: 1,
  });
}
