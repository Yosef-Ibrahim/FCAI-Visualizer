import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  MAX_SUFFIX_TRIE_LEN,
  buildSuffixTrie,
  searchSuffixTrie,
} from '../../../algorithms/suffix/SuffixTrie';
import { computeSuffixSpaceStats } from '../../../algorithms/suffix/SuffixTree';
import { SUFFIX_PRESETS } from '../../../algorithms/suffix/suffixUtils';
import IndexedTextStrip from '../../../components/shared/IndexedTextStrip';
import SvgCameraViewport from '../../../components/shared/SvgCameraViewport';
import { useT } from '../../../hooks/useT';
import { stepText } from '../../../i18n/stepText';
import '../../../styles/SuffixVisualizer.css';

const STEP_DELAYS = [1400, 750, 280];
const DEFAULT_TEXT = 'banana';
const TRIE_PRESETS = SUFFIX_PRESETS.filter((p) => Array.from(p).length <= MAX_SUFFIX_TRIE_LEN);

function countLeaves(node) {
  if (!node.children.length) return 1;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

function layoutSuffixTrie(root) {
  if (!root) {
    return { width: 640, height: 320, nodes: [], edges: [] };
  }

  const leafCount = countLeaves(root);
  const slotWidth = 56;
  const padX = 48;
  const padY = 44;
  const levelGap = 66;
  const width = Math.max(560, padX * 2 + leafCount * slotWidth);
  const usableWidth = width - padX * 2;
  const unit = usableWidth / leafCount;

  const nodes = [];
  const edges = [];
  let maxDepth = 0;

  function place(node, startSlot, depth, parent) {
    const leaves = countLeaves(node);
    const x = padX + (startSlot + leaves / 2) * unit;
    const y = padY + depth * levelGap;
    if (depth > maxDepth) maxDepth = depth;

    nodes.push({
      id: node.id,
      char: node.char,
      depth,
      suffixIndex: node.suffixIndex,
      x,
      y,
      isRoot: parent === null,
      isLeaf: node.suffixIndex !== null,
    });

    if (parent) {
      edges.push({
        id: `${parent.id}:${node.id}`,
        fromId: parent.id,
        toId: node.id,
        fromX: parent.x,
        fromY: parent.y + (parent.isRoot ? 19 : 17),
        toX: x,
        toY: y - 17,
      });
    }

    let cursor = startSlot;
    for (const child of node.children) {
      place(child, cursor, depth + 1, { id: node.id, x, y, isRoot: parent === null });
      cursor += countLeaves(child);
    }
  }

  place(root, 0, 0, null);

  return {
    width,
    height: Math.max(320, padY * 2 + maxDepth * levelGap + 52),
    nodes,
    edges,
  };
}

function AccessibleTrieOutline({ node, t }) {
  const label = node.char === ''
    ? t('common.rootLabel')
    : node.suffixIndex !== null
      ? `${node.char} (${t('common.leafTitle', { index: node.suffixIndex })})`
      : node.char;

  return (
    <li>
      <span>{label}</span>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <AccessibleTrieOutline key={child.id} node={child} t={t} />
          ))}
        </ul>
      )}
    </li>
  );
}

function createInitialState(paramText) {
  if (paramText) {
    const attempt = buildSuffixTrie(paramText);
    if (attempt.ok) {
      return {
        inputValue: attempt.text,
        inputError: null,
        buildResult: attempt,
      };
    }
    return {
      inputValue: paramText,
      inputError: { key: attempt.errorKey, maxLen: attempt.maxLen },
      buildResult: buildSuffixTrie(DEFAULT_TEXT),
    };
  }
  return {
    inputValue: DEFAULT_TEXT,
    inputError: null,
    buildResult: buildSuffixTrie(DEFAULT_TEXT),
  };
}

export default function SuffixTriePage() {
  const t = useT('suffix');
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(
    () => createInitialState(searchParams.get('text')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [inputValue, setInputValue] = useState(initial.inputValue);
  const [inputError, setInputError] = useState(initial.inputError);
  const [buildResult, setBuildResult] = useState(initial.buildResult);

  const [patternValue, setPatternValue] = useState('ana');
  const [patternError, setPatternError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  const [mode, setMode] = useState('build'); // 'build' | 'search'
  const [stepIndex, setStepIndex] = useState(() => Math.max(0, initial.buildResult.steps.length - 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const activeSteps = mode === 'search' && searchResult ? searchResult.steps : buildResult.steps;
  const clampedIndex = Math.min(Math.max(0, stepIndex), Math.max(0, activeSteps.length - 1));
  const activeStep = activeSteps[clampedIndex] ?? null;

  const currentDelay = STEP_DELAYS[speed];

  useEffect(() => {
    if (!isPlaying || clampedIndex >= activeSteps.length - 1) return undefined;
    const timer = window.setTimeout(() => {
      const next = clampedIndex + 1;
      setStepIndex(next);
      if (next >= activeSteps.length - 1) setIsPlaying(false);
    }, currentDelay);
    return () => window.clearTimeout(timer);
  }, [activeSteps.length, clampedIndex, currentDelay, isPlaying]);

  const layout = useMemo(() => layoutSuffixTrie(activeStep?.root ?? buildResult.root), [activeStep, buildResult.root]);
  const spaceStats = useMemo(() => computeSuffixSpaceStats(buildResult.text), [buildResult.text]);

  const activePathSet = useMemo(() => new Set(activeStep?.activePathNodeIds ?? []), [activeStep]);
  const matchedSet = useMemo(() => new Set(activeStep?.matchedNodeIds ?? []), [activeStep]);
  const activeEdgeSet = useMemo(() => {
    const ids = activeStep?.activePathNodeIds ?? [];
    const set = new Set();
    for (let i = 1; i < ids.length; i += 1) {
      set.add(`${ids[i - 1]}:${ids[i]}`);
    }
    return set;
  }, [activeStep]);

  const runBuild = (rawText) => {
    const built = buildSuffixTrie(rawText);
    if (!built.ok) {
      setInputError({ key: built.errorKey, maxLen: built.maxLen });
      return;
    }
    setInputValue(built.text);
    setInputError(null);
    setPatternError(null);
    setSearchResult(null);
    setBuildResult(built);
    setMode('build');
    setStepIndex(0);
    setIsPlaying(built.steps.length > 1);
    setSearchParams({ text: built.text }, { replace: true });
  };

  const handleBuildSubmit = (event) => {
    event.preventDefault();
    runBuild(inputValue);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const res = searchSuffixTrie(buildResult.root, buildResult.textWithSentinel, patternValue);
    if (!res.ok) {
      setPatternError(res.errorKey);
      return;
    }
    setPatternError(null);
    setSearchResult(res);
    setMode('search');
    setStepIndex(0);
    setIsPlaying(res.steps.length > 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleTogglePlay = () => {
    if (!activeSteps.length) return;
    if (clampedIndex >= activeSteps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const querySuffix = `?text=${encodeURIComponent(buildResult.text)}`;
  const stats = activeStep?.stats ?? buildResult.stats;

  return (
    <div className="suffix-page">
      <aside className="suffix-panel" aria-label={t('common.controlsRegion')}>
        <div className="suffix-heading">
          <h1>{t('trie.title')}</h1>
          <p>{t('trie.description')}</p>
        </div>

        <form className="suffix-section" onSubmit={handleBuildSubmit}>
          <label className="suffix-label" htmlFor="suffix-trie-text">
            {t('common.inputLabel')}
          </label>
          <div className="suffix-input-row">
            <input
              id="suffix-trie-text"
              type="text"
              className={`suffix-input${inputError ? ' has-error' : ''}`}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setInputError(null);
              }}
              placeholder={t('common.inputPlaceholder')}
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? 'suffix-trie-err' : 'suffix-trie-help'}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="suffix-btn suffix-btn-primary">
              {t('common.buildButton')}
            </button>
          </div>
          {inputError ? (
            <span className="suffix-error" id="suffix-trie-err" role="alert">
              {t(inputError.key.replace(/^suffix:/, ''), { maxLen: inputError.maxLen ?? MAX_SUFFIX_TRIE_LEN })}
            </span>
          ) : (
            <span className="suffix-help" id="suffix-trie-help">
              {t('common.inputHelp', { maxLen: MAX_SUFFIX_TRIE_LEN })}
            </span>
          )}

          <div className="suffix-presets" role="group" aria-label={t('common.presetsLabel')}>
            {TRIE_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                className={`suffix-chip${buildResult.text === preset ? ' is-active' : ''}`}
                onClick={() => runBuild(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </form>

        <form className="suffix-section" onSubmit={handleSearchSubmit}>
          <label className="suffix-label" htmlFor="suffix-trie-pattern">
            {t('common.searchLabel')}
          </label>
          <div className="suffix-input-row">
            <input
              id="suffix-trie-pattern"
              type="text"
              className={`suffix-input${patternError ? ' has-error' : ''}`}
              value={patternValue}
              onChange={(event) => {
                setPatternValue(event.target.value);
                setPatternError(null);
              }}
              placeholder={t('common.searchPlaceholder')}
              aria-invalid={Boolean(patternError)}
              aria-describedby={patternError ? 'suffix-trie-pat-err' : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="suffix-btn">
              <Search size={14} aria-hidden="true" />
              {t('common.searchButton')}
            </button>
          </div>
          {patternError && (
            <span className="suffix-error" id="suffix-trie-pat-err" role="alert">
              {t(patternError.replace(/^suffix:/, ''))}
            </span>
          )}
          {mode === 'search' && searchResult && (
            <>
              <div className={`suffix-search-badge ${searchResult.found ? 'is-found' : 'is-miss'}`}>
                {searchResult.found
                  ? t('common.matchFoundBadge', { positions: searchResult.positions.join(', ') })
                  : t('common.matchMissBadge')}
              </div>
              <button
                type="button"
                className="suffix-btn suffix-btn-subtle"
                onClick={() => {
                  setIsPlaying(false);
                  setMode('build');
                  setStepIndex(Math.max(0, buildResult.steps.length - 1));
                }}
              >
                {t('common.backToBuild')}
              </button>
            </>
          )}
        </form>

        <section className="suffix-section" aria-label={t('common.playbackLabel')}>
          <span className="suffix-label">{t('common.playbackLabel')}</span>
          <div className="suffix-playback-row">
            <button
              type="button"
              className="suffix-icon-btn"
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(Math.max(0, clampedIndex - 1));
              }}
              disabled={clampedIndex <= 0}
              aria-label={t('common.previous')}
              title={t('common.previous')}
            >
              <SkipBack size={15} />
            </button>
            <button
              type="button"
              className="suffix-icon-btn is-play"
              onClick={handleTogglePlay}
              disabled={!activeSteps.length}
              aria-label={t(isPlaying ? 'common.pause' : 'common.play')}
              title={t(isPlaying ? 'common.pause' : 'common.play')}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              type="button"
              className="suffix-icon-btn"
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(Math.min(activeSteps.length - 1, clampedIndex + 1));
              }}
              disabled={clampedIndex >= activeSteps.length - 1}
              aria-label={t('common.next')}
              title={t('common.next')}
            >
              <SkipForward size={15} />
            </button>
            <button
              type="button"
              className="suffix-icon-btn"
              onClick={handleReset}
              disabled={!activeSteps.length}
              aria-label={t('common.reset')}
              title={t('common.reset')}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div className="suffix-scrubber-row">
            <input
              type="range"
              className="suffix-scrubber"
              min={0}
              max={Math.max(0, activeSteps.length - 1)}
              value={clampedIndex}
              onChange={(event) => {
                setIsPlaying(false);
                setStepIndex(Number(event.target.value));
              }}
              aria-label={t('common.stepScrubber')}
            />
            <span className="suffix-step-counter">
              {t('common.stepCounter', { current: clampedIndex + 1, total: activeSteps.length })}
            </span>
          </div>

          <div className="suffix-speed-row" role="group" aria-label={t('common.speedLabel')}>
            {['slow', 'normal', 'fast'].map((label, idx) => (
              <button
                type="button"
                key={label}
                className="suffix-speed-btn"
                aria-pressed={speed === idx}
                onClick={() => setSpeed(idx)}
              >
                {t(`common.${label}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="suffix-narration" aria-live="polite">
          <span className="suffix-label">{t('common.narrationLabel')}</span>
          <p>{stepText(activeStep)}</p>
        </section>

        <div className="suffix-complexity">{t('trie.complexity')}</div>
      </aside>

      <section className="suffix-stage">
        <div className="suffix-ribbon">
          <div className="suffix-telemetry" aria-live="polite">
            <span className="suffix-stat">
              <strong>{stats.nodes}</strong> {t('trie.statNodes')}
            </span>
            <span className="suffix-stat">
              <strong>{stats.edges}</strong> {t('trie.statEdges')}
            </span>
            <span className="suffix-stat">
              <strong>{stats.leaves}</strong> {t('trie.statLeaves')}
            </span>
          </div>

          <div className="suffix-switcher-group">
            {spaceStats.ok && (
              <span className="suffix-space-pill">
                {t('common.spaceComparison', {
                  trie: spaceStats.trieNodes,
                  tree: spaceStats.treeNodes,
                  sa: spaceStats.saLength,
                })}
              </span>
            )}
            <nav className="suffix-switcher" aria-label={t('common.switcherLabel')}>
              <Link
                to={`/courses/advanced-data-structure/suffix-trie${querySuffix}`}
                className="suffix-switch-link is-current"
                aria-current="page"
              >
                {t('common.linkTrie')}
              </Link>
              <Link
                to={`/courses/advanced-data-structure/suffix-tree${querySuffix}`}
                className="suffix-switch-link"
              >
                {t('common.linkTree')}
              </Link>
              <Link
                to={`/courses/advanced-data-structure/suffix-array${querySuffix}`}
                className="suffix-switch-link"
              >
                {t('common.linkArray')}
              </Link>
            </nav>
          </div>
        </div>

        <IndexedTextStrip
          text={buildResult.textWithSentinel}
          activeStart={activeStep?.activeSuffixIndex ?? -1}
          activeEnd={activeStep?.activeSuffixEnd ?? -1}
          cursorIndex={activeStep?.cursorIndex ?? -1}
          matchRanges={activeStep?.matchRanges ?? []}
          ariaLabel={t('common.textStripLabel')}
        />

        <div className="suffix-viewport-shell">
          <SvgCameraViewport
            contentWidth={layout.width}
            contentHeight={layout.height}
            ariaLabel={t('trie.viewportLabel', { nodes: stats.nodes, leaves: stats.leaves })}
          >
            <g aria-hidden="true">
              {layout.edges.map((edge) => {
                const isMatchEdge = matchedSet.has(edge.fromId) && matchedSet.has(edge.toId);
                const isCreatedEdge = activeStep?.createdNodeId === edge.toId;
                const isActiveEdge = activeEdgeSet.has(edge.id);
                const cls = [
                  'suffix-svg-edge',
                  isMatchEdge ? 'is-match' : isCreatedEdge ? 'is-created' : isActiveEdge ? 'is-active' : '',
                ].filter(Boolean).join(' ');
                return (
                  <line
                    key={edge.id}
                    className={cls}
                    x1={edge.fromX}
                    y1={edge.fromY}
                    x2={edge.toX}
                    y2={edge.toY}
                  />
                );
              })}

              {layout.nodes.map((node) => {
                const isMatch = matchedSet.has(node.id);
                const isCreated = activeStep?.createdNodeId === node.id;
                const isActive = activePathSet.has(node.id);
                const cls = [
                  'suffix-trie-node',
                  node.isRoot ? 'is-root' : '',
                  node.isLeaf ? 'is-leaf' : '',
                  isMatch ? 'is-match' : isCreated ? 'is-created' : isActive ? 'is-active' : '',
                ].filter(Boolean).join(' ');

                return (
                  <g key={node.id} className={cls} transform={`translate(${node.x}, ${node.y})`}>
                    <title>
                      {node.isRoot
                        ? t('common.rootLabel')
                        : node.isLeaf
                          ? `${node.char} · ${t('common.leafTitle', { index: node.suffixIndex })}`
                          : node.char}
                    </title>
                    <circle r={node.isRoot ? 19 : 17} />
                    <text y={0.5}>{node.isRoot ? '∅' : node.char}</text>
                    {node.isLeaf && (
                      <g
                        className={`suffix-leaf-badge${isMatch ? ' is-match' : ''}`}
                        transform="translate(0, 27)"
                      >
                        <rect x={-13} y={-9} width={26} height={18} rx={6} />
                        <text y={0.5}>{node.suffixIndex}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </SvgCameraViewport>

          <ul className="suffix-sr-only" aria-label={t('common.accessibleTree')}>
            {activeStep?.root && <AccessibleTrieOutline node={activeStep.root} t={t} />}
          </ul>
        </div>

        <div className="suffix-legend">
          <span className="suffix-legend-item">
            <i className="suffix-dot is-active" />
            {t('common.legendActive')}
          </span>
          <span className="suffix-legend-item">
            <i className="suffix-dot is-created" />
            {t('common.legendCreated')}
          </span>
          <span className="suffix-legend-item">
            <i className="suffix-dot is-match" />
            {t('common.legendMatch')}
          </span>
          <span className="suffix-legend-item">
            <i className="suffix-dot is-leaf" />
            {t('common.legendLeaf')}
          </span>
        </div>
      </section>
    </div>
  );
}
