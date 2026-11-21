import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Code2,
  FastForward,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_TABLE_SIZE,
  HASH_OPS,
  HASH_STRATEGIES,
  HASH_TABLE_SIZES,
  HashTable,
  SLOT_STATE,
  formatHashFormula,
  getHashCodeByLang,
} from '../../algorithms/dataStructures/HashTable';
import { useLang } from '../../hooks/useLang';
import { useT } from '../../hooks/useT';
import { stepText } from '../../i18n/stepText';
import CodePanel from './CodePanel';
import '../../styles/HashTableVisualizer.css';

const SPEED_DELAYS = [1050, 680, 360];
const SUPPORTED_CODE_LANGS = ['js', 'python', 'cpp'];

function computeBezierArc(from, to, hopIndex) {
  const sameRow = Math.abs(from.y - to.y) < 16;
  const startX = from.x;
  const startY = from.top;
  const endX = to.x;
  const endY = to.top;

  if (sameRow) {
    const dx = endX - startX;
    const dist = Math.abs(dx);
    const isWrapBack = dx < 0;
    const baseLift = Math.min(54, Math.max(24, dist * 0.24));
    const lift = isWrapBack ? baseLift + 16 + (hopIndex % 2) * 8 : baseLift + (hopIndex % 2) * 7;
    const ctrlX = (startX + endX) / 2;
    const ctrlY = Math.min(startY, endY) - lift;
    // Quadratic Bezier midpoint at t = 0.5
    const midX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
    const midY = 0.25 * startY + 0.5 * ctrlY + 0.25 * endY;
    return {
      d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      midX,
      midY,
      isWrapBack,
    };
  }

  // Multi-row jump: connect smoothly from bottom/top edges depending on direction
  const goingDown = to.y > from.y;
  const sY = goingDown ? from.bottom : from.top;
  const eY = goingDown ? to.top : to.bottom;
  const midXRaw = (startX + endX) / 2;
  const offset = (goingDown ? 1 : -1) * Math.min(34, 18 + (hopIndex % 3) * 6);
  const ctrlX = midXRaw + offset;
  const ctrlY = (sY + eY) / 2;
  const midX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
  const midY = 0.25 * sY + 0.5 * ctrlY + 0.25 * eY;
  return {
    d: `M ${startX.toFixed(1)} ${sY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${eY.toFixed(1)}`,
    midX,
    midY,
    isWrapBack: !goingDown,
  };
}

function OpenAddressingStage({ buckets, activeStep, t }) {
  const stageRef = useRef(null);
  const slotRefs = useRef(new Map());
  const [overlay, setOverlay] = useState({ width: 0, height: 0, arcs: [] });

  const probePath = useMemo(() => activeStep?.probePath ?? [], [activeStep]);
  const visitedOrder = useMemo(() => {
    const map = new Map();
    probePath.forEach((slotIdx, order) => {
      if (!map.has(slotIdx)) map.set(slotIdx, order + 1);
    });
    return map;
  }, [probePath]);

  const measureArcs = useCallback(() => {
    const container = stageRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const width = container.scrollWidth;
    const height = container.scrollHeight;

    if (probePath.length < 2) {
      setOverlay({ width, height, arcs: [] });
      return;
    }

    const arcs = [];
    for (let i = 0; i < probePath.length - 1; i += 1) {
      const fromEl = slotRefs.current.get(probePath[i]);
      const toEl = slotRefs.current.get(probePath[i + 1]);
      if (!fromEl || !toEl) continue;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();
      const from = {
        x: fRect.left - containerRect.left + fRect.width / 2,
        y: fRect.top - containerRect.top + fRect.height / 2,
        top: fRect.top - containerRect.top + 2,
        bottom: fRect.bottom - containerRect.top - 2,
      };
      const to = {
        x: tRect.left - containerRect.left + tRect.width / 2,
        y: tRect.top - containerRect.top + tRect.height / 2,
        top: tRect.top - containerRect.top + 2,
        bottom: tRect.bottom - containerRect.top - 2,
      };

      const geom = computeBezierArc(from, to, i);
      arcs.push({
        id: `${i}-${probePath[i]}-${probePath[i + 1]}`,
        hop: i + 1,
        isLatest: i === probePath.length - 2,
        ...geom,
      });
    }

    setOverlay({ width, height, arcs });
  }, [probePath]);

  useLayoutEffect(() => {
    measureArcs();
  }, [measureArcs, buckets.length]);

  useEffect(() => {
    const container = stageRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      measureArcs();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureArcs]);

  const activeIndex = activeStep?.bucketIndex ?? null;
  const targetIndex = activeStep?.targetIndex ?? null;
  const stepKind = activeStep?.kind ?? null;

  return (
    <div className="ht-open-wrap">
      {probePath.length > 0 && (
        <div className="ht-probe-strip" aria-label={t('stage.probePathLabel')}>
          <span className="ht-probe-strip-label">{t('stage.probePathLabel')}:</span>
          <div className="ht-probe-chips">
            {probePath.map((idx, pos) => (
              <span key={`${pos}-${idx}`} className="ht-probe-chip-group">
                {pos > 0 && <span className="ht-probe-arrow" aria-hidden="true">→</span>}
                <span className={`ht-probe-chip${pos === probePath.length - 1 ? ' is-current' : ''}`}>
                  <span className="ht-probe-chip-step">#{pos + 1}</span>
                  <span>[{idx}]</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="ht-open-stage" ref={stageRef}>
        {overlay.arcs.length > 0 && (
          <svg
            className="ht-arc-overlay"
            width={overlay.width}
            height={overlay.height}
            viewBox={`0 0 ${Math.max(1, overlay.width)} ${Math.max(1, overlay.height)}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="ht-arrow-muted"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" className="ht-arc-marker-muted" />
              </marker>
              <marker
                id="ht-arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" className="ht-arc-marker-active" />
              </marker>
            </defs>

            {overlay.arcs.map((arc) => (
              <g key={arc.id} className={`ht-arc-group${arc.isLatest ? ' is-latest' : ''}`}>
                <path
                  d={arc.d}
                  className="ht-arc-path"
                  markerEnd={arc.isLatest ? 'url(#ht-arrow-active)' : 'url(#ht-arrow-muted)'}
                />
                <g transform={`translate(${arc.midX.toFixed(1)} ${arc.midY.toFixed(1)})`}>
                  <rect x="-13" y="-9" width="26" height="18" rx="9" className="ht-arc-pill" />
                  <text y="0.5" className="ht-arc-pill-text">#{arc.hop}</text>
                </g>
              </g>
            ))}
          </svg>
        )}

        <div className="ht-slot-grid" role="list" aria-label={t('stageAria')}>
          {buckets.map((bucket) => {
            const isCurrent = activeIndex === bucket.index;
            const isTarget = targetIndex === bucket.index;
            const order = visitedOrder.get(bucket.index);

            let statusClass = '';
            if (isCurrent && (stepKind === 'collision' || stepKind === 'cycle' || stepKind === 'full')) {
              statusClass = ' is-collision';
            } else if (isCurrent && stepKind === 'delete') {
              statusClass = ' is-deleted-action';
            } else if (isCurrent && (stepKind === 'insert' || stepKind === 'found' || stepKind === 'rehash-move')) {
              statusClass = ' is-success';
            } else if (isCurrent && stepKind === 'tombstone') {
              statusClass = ' is-tombstone-hit';
            } else if (isCurrent) {
              statusClass = ' is-active';
            } else if (isTarget && bucket.state === SLOT_STATE.DELETED) {
              statusClass = ' is-remembered';
            } else if (order !== undefined) {
              statusClass = ' is-visited';
            }

            const ariaLabel = bucket.state === SLOT_STATE.EMPTY
              ? t('stage.slotAriaEmpty', { index: bucket.index })
              : bucket.state === SLOT_STATE.DELETED
                ? t('stage.slotAriaDeleted', { index: bucket.index })
                : t('stage.slotAriaOccupied', { index: bucket.index, key: bucket.key });

            return (
              <div
                key={bucket.index}
                role="listitem"
                aria-label={ariaLabel}
                ref={(el) => {
                  if (el) slotRefs.current.set(bucket.index, el);
                  else slotRefs.current.delete(bucket.index);
                }}
                className={`ht-slot ht-slot--${bucket.state.toLowerCase()}${statusClass}`}
              >
                <div className="ht-slot-head">
                  <span className="ht-slot-index">[{bucket.index}]</span>
                  {order !== undefined && (
                    <span className="ht-slot-order">#{order}</span>
                  )}
                </div>

                <div className="ht-slot-body">
                  {bucket.state === SLOT_STATE.OCCUPIED && (
                    <span className="ht-slot-key">{bucket.key}</span>
                  )}
                  {bucket.state === SLOT_STATE.EMPTY && (
                    <span className="ht-slot-empty-label">
                      <span aria-hidden="true">∅</span> {t('stage.slotEmpty')}
                    </span>
                  )}
                  {bucket.state === SLOT_STATE.DELETED && (
                    <span className="ht-del-badge" title={t('stage.slotDeletedTitle')}>
                      {t('stage.slotDeleted')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeparateChainingStage({ buckets, activeStep, t }) {
  const activeBucket = activeStep?.bucketIndex ?? null;
  const activeChainIndex = activeStep?.activeChainIndex ?? null;
  const stepKind = activeStep?.kind ?? null;

  return (
    <div className="ht-chain-scroll" role="list" aria-label={t('stageAria')}>
      {buckets.map((bucket) => {
        const isBucketActive = activeBucket === bucket.index;
        return (
          <div
            key={bucket.index}
            role="listitem"
            aria-label={t('stage.bucketAria', { index: bucket.index })}
            className={`ht-chain-row${isBucketActive ? ' is-active-bucket' : ''}`}
          >
            <div className={`ht-chain-bucket${isBucketActive ? ' is-active' : ''}`}>
              <span className="ht-chain-bucket-idx">[{bucket.index}]</span>
              <span className="ht-chain-bucket-count">{bucket.chain.length}</span>
            </div>

            <div className="ht-chain-nodes">
              {bucket.chain.length === 0 ? (
                <>
                  <svg className="ht-chain-arrow" width="28" height="16" viewBox="0 0 28 16" aria-hidden="true">
                    <line x1="2" y1="8" x2="21" y2="8" />
                    <path d="M 18 4 L 25 8 L 18 12" />
                  </svg>
                  <span className="ht-chain-null">{t('stage.chainNull')}</span>
                </>
              ) : (
                <>
                  {bucket.chain.map((val, nodeIdx) => {
                    const isNodeActive = isBucketActive && activeChainIndex === nodeIdx;
                    let nodeClass = '';
                    if (isNodeActive && (stepKind === 'insert' || stepKind === 'found' || stepKind === 'rehash-move')) {
                      nodeClass = ' is-success';
                    } else if (isNodeActive && stepKind === 'duplicate') {
                      nodeClass = ' is-warning';
                    } else if (isNodeActive) {
                      nodeClass = ' is-active';
                    }

                    return (
                      <div key={`${bucket.index}-${nodeIdx}-${val}`} className="ht-chain-link">
                        <svg
                          className={`ht-chain-arrow${isNodeActive ? ' is-active' : ''}`}
                          width="28"
                          height="16"
                          viewBox="0 0 28 16"
                          aria-hidden="true"
                        >
                          <line x1="2" y1="8" x2="21" y2="8" />
                          <path d="M 18 4 L 25 8 L 18 12" />
                        </svg>
                        <div className={`ht-chain-node${nodeClass}`}>
                          <span className="ht-chain-node-val">{val}</span>
                          <span className="ht-chain-node-ptr" aria-hidden="true">•</span>
                        </div>
                      </div>
                    );
                  })}
                  <svg className="ht-chain-arrow" width="24" height="16" viewBox="0 0 24 16" aria-hidden="true">
                    <line x1="2" y1="8" x2="17" y2="8" />
                    <path d="M 14 4 L 21 8 L 14 12" />
                  </svg>
                  <span className="ht-chain-null">{t('stage.chainNull')}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HashTableVisualizer() {
  const t = useT('hashing');
  const [lang, setLang] = useLang('js');

  const engineRef = useRef(
    new HashTable({ strategy: 'linear', capacity: DEFAULT_TABLE_SIZE }),
  );
  const timerRef = useRef(null);

  const [strategy, setStrategy] = useState('linear');
  const [capacity, setCapacity] = useState(DEFAULT_TABLE_SIZE);
  const [tableState, setTableState] = useState(() => (
    new HashTable({ strategy: 'linear', capacity: DEFAULT_TABLE_SIZE }).getState()
  ));
  const [keyInput, setKeyInput] = useState('');
  const [inputErrorKey, setInputErrorKey] = useState('');

  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [codeOp, setCodeOp] = useState('insert');
  const [codeOpen, setCodeOpen] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  ));

  const activeStep = stepIndex >= 0 ? steps[stepIndex] : null;
  const displayedBuckets = activeStep ? activeStep.buckets : tableState.buckets;
  const displayedMetrics = activeStep ? activeStep.metrics : tableState.metrics;
  const displayedCapacity = displayedMetrics.capacity;
  const displayedFormula = activeStep?.formula ?? formatHashFormula(strategy, null, displayedCapacity, 0);
  const isHighLoad = displayedMetrics.loadFactor >= 0.7 || displayedMetrics.effectiveLoad >= 0.7;

  const effectiveLang = SUPPORTED_CODE_LANGS.includes(lang) ? lang : 'js';
  const codeByLang = useMemo(
    () => getHashCodeByLang(strategy, codeOp),
    [strategy, codeOp],
  );
  const activeCodeLine = activeStep?.codeLines?.[effectiveLang] ?? -1;

  // Auto-play timer with reduced-motion respect and clean teardown.
  useEffect(() => {
    if (!isPlaying) return undefined;
    if (stepIndex >= steps.length - 1) return undefined;

    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const delay = reducedMotion ? 0 : SPEED_DELAYS[speed];

    timerRef.current = window.setTimeout(() => {
      const next = stepIndex + 1;
      setStepIndex(next);
      if (next >= steps.length - 1) {
        setIsPlaying(false);
      }
    }, delay);

    return () => window.clearTimeout(timerRef.current);
  }, [isPlaying, speed, stepIndex, steps]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const commitResult = useCallback((result, opName, { clearInput = false } = {}) => {
    window.clearTimeout(timerRef.current);
    setTableState(result.state);
    setCapacity(result.state.capacity);

    if (result.steps.length === 0) {
      setIsPlaying(false);
      if (result.errorKey) setInputErrorKey(result.errorKey);
      return;
    }

    setInputErrorKey('');
    if (clearInput) setKeyInput('');
    if (HASH_OPS.includes(opName)) setCodeOp(opName);
    setSteps(result.steps);
    setStepIndex(0);
    setIsPlaying(result.steps.length > 1);
  }, []);

  const runKeyOperation = useCallback((op) => {
    const result = engineRef.current[op](keyInput);
    if (!result.ok && result.steps.length === 0) {
      setInputErrorKey(result.errorKey || 'hashing:errors.invalidKey');
      return;
    }
    commitResult(result, op, { clearInput: true });
  }, [commitResult, keyInput]);

  const handleInsertSubmit = (event) => {
    event.preventDefault();
    runKeyOperation('insert');
  };

  const handleStrategyChange = (nextStrategy) => {
    if (nextStrategy === strategy) return;
    window.clearTimeout(timerRef.current);
    const nextState = engineRef.current.setConfig({ strategy: nextStrategy, capacity });
    setStrategy(nextStrategy);
    setTableState(nextState);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setInputErrorKey('');
  };

  const handleSizeChange = (nextSize) => {
    if (nextSize === capacity && displayedCapacity === nextSize) return;
    window.clearTimeout(timerRef.current);
    const nextState = engineRef.current.setConfig({ strategy, capacity: nextSize });
    setCapacity(nextSize);
    setTableState(nextState);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setInputErrorKey('');
  };

  const handleRehash = () => {
    const result = engineRef.current.rehash();
    commitResult(result, 'rehash');
  };

  const handleLoadSample = () => {
    const result = engineRef.current.loadSample();
    commitResult(result, 'insert');
  };

  const handleClear = () => {
    const result = engineRef.current.clear();
    commitResult(result, 'insert', { clearInput: true });
  };

  const jumpToStep = (nextIndex) => {
    if (!steps.length) return;
    window.clearTimeout(timerRef.current);
    setIsPlaying(false);
    setStepIndex(Math.max(0, Math.min(steps.length - 1, nextIndex)));
  };

  const togglePlay = () => {
    if (!steps.length) return;
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((playing) => !playing);
  };

  const narrationClass = activeStep
    ? ` is-${activeStep.kind}`
    : '';

  return (
    <div className="ht-workbench">
      {/* ── Left Controls Panel ──────────────────────────────────────────── */}
      <aside className="ht-panel" aria-label={t('controlsAria')}>
        <header className="ht-panel-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        <section className="ht-section">
          <span className="ht-label">{t('strategies.label')}</span>
          <div className="ht-strategy-grid" role="group" aria-label={t('strategies.label')}>
            {HASH_STRATEGIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`ht-choice-btn${strategy === item ? ' is-active' : ''}`}
                aria-pressed={strategy === item}
                onClick={() => handleStrategyChange(item)}
              >
                {t(`strategies.${item}`)}
              </button>
            ))}
          </div>
          <p className="ht-hint">{t(`strategies.hint.${strategy}`)}</p>
        </section>

        <section className="ht-section">
          <div className="ht-label-row">
            <span className="ht-label">{t('tableSize.label')}</span>
            {!HASH_TABLE_SIZES.includes(capacity) && (
              <span className="ht-size-badge">
                {t('tableSize.rehashedBadge', { m: capacity })}
              </span>
            )}
          </div>
          <div className="ht-size-row" role="group" aria-label={t('tableSize.label')}>
            {HASH_TABLE_SIZES.map((sizeOpt) => (
              <button
                key={sizeOpt}
                type="button"
                className={`ht-size-btn${capacity === sizeOpt ? ' is-active' : ''}`}
                aria-pressed={capacity === sizeOpt}
                onClick={() => handleSizeChange(sizeOpt)}
              >
                {sizeOpt}
              </button>
            ))}
          </div>
        </section>

        <form className="ht-section ht-op-form" onSubmit={handleInsertSubmit} noValidate>
          <label className="ht-label" htmlFor="ht-key-input">
            {t('operations.label')}
          </label>
          <input
            id="ht-key-input"
            type="text"
            inputMode="numeric"
            className={`ht-input${inputErrorKey ? ' has-error' : ''}`}
            value={keyInput}
            onChange={(event) => {
              setKeyInput(event.target.value);
              if (inputErrorKey) setInputErrorKey('');
            }}
            placeholder={t('operations.placeholder')}
            aria-invalid={Boolean(inputErrorKey)}
            aria-describedby={inputErrorKey ? 'ht-key-error' : undefined}
          />
          {inputErrorKey && (
            <span id="ht-key-error" className="ht-error-text" role="alert">
              {t(inputErrorKey.replace(/^hashing:/, ''))}
            </span>
          )}

          <div className="ht-op-buttons">
            <button type="submit" className="ht-action-btn ht-action-btn--insert">
              {t('operations.insert')}
            </button>
            <button
              type="button"
              className="ht-action-btn ht-action-btn--search"
              onClick={() => runKeyOperation('search')}
            >
              {t('operations.search')}
            </button>
            <button
              type="button"
              className="ht-action-btn ht-action-btn--delete"
              onClick={() => runKeyOperation('delete')}
            >
              {t('operations.delete')}
            </button>
          </div>
        </form>

        <section className="ht-section">
          <div className="ht-utility-buttons">
            <button
              type="button"
              className={`ht-util-btn${isHighLoad ? ' is-recommended' : ''}`}
              onClick={handleRehash}
              title={t('operations.rehashTitle')}
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>{t('operations.rehash')}</span>
            </button>
            <button type="button" className="ht-util-btn" onClick={handleLoadSample}>
              <Sparkles size={14} aria-hidden="true" />
              <span>{t('operations.sample')}</span>
            </button>
            <button type="button" className="ht-util-btn ht-util-btn--danger" onClick={handleClear}>
              <Trash2 size={14} aria-hidden="true" />
              <span>{t('operations.clear')}</span>
            </button>
          </div>
        </section>

        <section className="ht-section" aria-label={t('playback.label')}>
          <div className="ht-label-row">
            <span className="ht-label">{t('playback.label')}</span>
            <span className="ht-step-counter">
              {steps.length > 0
                ? t('playback.stepCounter', { current: stepIndex + 1, total: steps.length })
                : t('playback.ready')}
            </span>
          </div>

          <div className="ht-playback-row">
            <button
              type="button"
              className="ht-icon-btn"
              onClick={() => jumpToStep(0)}
              disabled={!steps.length || stepIndex <= 0}
              aria-label={t('playback.start')}
              title={t('playback.start')}
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ht-icon-btn"
              onClick={() => jumpToStep(stepIndex - 1)}
              disabled={!steps.length || stepIndex <= 0}
              aria-label={t('playback.previous')}
              title={t('playback.previous')}
            >
              <SkipBack size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ht-icon-btn ht-icon-btn--play"
              onClick={togglePlay}
              disabled={!steps.length}
              aria-label={t(isPlaying ? 'playback.pause' : 'playback.play')}
              title={t(isPlaying ? 'playback.pause' : 'playback.play')}
            >
              {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="ht-icon-btn"
              onClick={() => jumpToStep(stepIndex + 1)}
              disabled={!steps.length || stepIndex >= steps.length - 1}
              aria-label={t('playback.next')}
              title={t('playback.next')}
            >
              <SkipForward size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ht-icon-btn"
              onClick={() => jumpToStep(steps.length - 1)}
              disabled={!steps.length || stepIndex >= steps.length - 1}
              aria-label={t('playback.end')}
              title={t('playback.end')}
            >
              <FastForward size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="ht-speed-row" role="group" aria-label={t('playback.speed')}>
            {['slow', 'normal', 'fast'].map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`ht-speed-btn${speed === idx ? ' is-active' : ''}`}
                aria-pressed={speed === idx}
                onClick={() => setSpeed(idx)}
              >
                {t(`playback.${label}`)}
              </button>
            ))}
          </div>
        </section>

        <div className={`ht-narration${narrationClass}`} aria-live="polite" aria-atomic="true">
          <span className="ht-label">{t('playback.narrationLabel')}</span>
          <p>{activeStep ? stepText(activeStep) : t('playback.idleMessage')}</p>
        </div>
      </aside>

      {/* ── Right Visualization Stage ────────────────────────────────────── */}
      <main className="ht-stage-wrap">
        {/* Flush inline telemetry bar */}
        <section className="ht-telemetry-bar" aria-label={t('telemetry.ariaLabel')}>
          <div className="ht-telemetry-formula">
            <span className="ht-telemetry-key">{t('telemetry.formula')}</span>
            <code className="ht-telemetry-eq ltr-keep">{displayedFormula}</code>
          </div>

          <div className="ht-telemetry-metrics">
            <div className="ht-metric">
              <span className="ht-telemetry-key">{t('telemetry.occupancy')}</span>
              <strong className="ht-metric-val ltr-keep">
                {displayedMetrics.size} / {displayedMetrics.capacity}
              </strong>
            </div>

            <div
              className={`ht-metric${isHighLoad ? ' is-warn' : ''}`}
              title={isHighLoad ? t('telemetry.loadWarning') : undefined}
            >
              <span className="ht-telemetry-key">{t('telemetry.loadFactor')}</span>
              <strong className="ht-metric-val ltr-keep">
                {displayedMetrics.loadFactor.toFixed(2)}
              </strong>
            </div>

            <div className="ht-metric">
              <span className="ht-telemetry-key">{t('telemetry.tombstones')}</span>
              <strong className="ht-metric-val ltr-keep">{displayedMetrics.tombstones}</strong>
            </div>

            <div className="ht-metric">
              <span className="ht-telemetry-key">{t('telemetry.collisions')}</span>
              <strong className="ht-metric-val ltr-keep">{displayedMetrics.collisions}</strong>
            </div>

            <div className="ht-metric">
              <span className="ht-telemetry-key">{t('telemetry.probes')}</span>
              <strong className="ht-metric-val ltr-keep">{displayedMetrics.probes}</strong>
            </div>
          </div>
        </section>

        {/* Focal visual stage (LTR-isolated so bucket indices and arcs stay natural in RTL) */}
        <div className="ht-stage-body">
          <div className="ht-stage-canvas ltr-keep">
            {strategy === 'chaining' ? (
              <SeparateChainingStage buckets={displayedBuckets} activeStep={activeStep} t={t} />
            ) : (
              <OpenAddressingStage buckets={displayedBuckets} activeStep={activeStep} t={t} />
            )}
          </div>

          {/* Compact state legend */}
          <div className="ht-legend" aria-label={t('stage.legendAria')}>
            {strategy === 'chaining' ? (
              <>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--occupied" aria-hidden="true" />
                  <span>{t('stage.legendChain')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--active" aria-hidden="true" />
                  <span>{t('stage.legendActive')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--target" aria-hidden="true" />
                  <span>{t('stage.legendTarget')}</span>
                </span>
              </>
            ) : (
              <>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--empty" aria-hidden="true" />
                  <span>{t('stage.legendEmpty')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--occupied" aria-hidden="true" />
                  <span>{t('stage.legendOccupied')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--deleted" aria-hidden="true" />
                  <span>{t('stage.legendDeleted')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--collision" aria-hidden="true" />
                  <span>{t('stage.legendCollision')}</span>
                </span>
                <span className="ht-legend-item">
                  <span className="ht-swatch ht-swatch--target" aria-hidden="true" />
                  <span>{t('stage.legendTarget')}</span>
                </span>
              </>
            )}
          </div>

          {/* Collapsible code walkthrough */}
          <section className="ht-code-drawer">
            <button
              type="button"
              className="ht-code-toggle"
              aria-expanded={codeOpen}
              aria-controls="ht-code-content"
              onClick={() => setCodeOpen((open) => !open)}
            >
              <span className="ht-code-toggle-left">
                <Code2 size={15} aria-hidden="true" />
                <span>{t(codeOpen ? 'code.toggleOpen' : 'code.toggleClosed')}</span>
                <span className="ht-code-op-pill">
                  {t('code.opLabel', {
                    strategy: t(`strategies.${strategy}`),
                    op: t(`code.ops.${codeOp}`),
                  })}
                </span>
              </span>
              {codeOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
            </button>

            {codeOpen && (
              <div id="ht-code-content" className="ht-code-content">
                <CodePanel
                  codeByLang={codeByLang}
                  activeLine={activeCodeLine}
                  lang={effectiveLang}
                  setLang={setLang}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
