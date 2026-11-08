import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Search, SkipBack, SkipForward, Sparkles, Trash2 } from 'lucide-react';
import { Trie } from '../../../algorithms/trees/Trie';
import { useT } from '../../../hooks/useT';
import '../../../styles/TrieVisualizer.css';

const STEP_DELAYS = [1800, 1000, 380];
const MAX_WORDS = 12;
const MAX_WORD_LENGTH = 24;
const EXAMPLE_WORDS = 'car\ncart\ncat\ncare';

function countLeaves(node, childrenByParent) {
  const children = childrenByParent.get(node.id) ?? [];
  if (!children.length) return 1;
  return children.reduce((total, child) => total + countLeaves(child, childrenByParent), 0);
}

function layoutTrie(snapshot) {
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map();
  for (const edge of snapshot.edges) {
    const children = childrenByParent.get(edge.fromId) ?? [];
    children.push(nodesById.get(edge.toId));
    childrenByParent.set(edge.fromId, children);
  }
  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.character.localeCompare(b.character));
  }

  const root = snapshot.nodes[0];
  if (!root) return { width: 760, height: 360, nodes: [], edges: [] };

  const leafCount = countLeaves(root, childrenByParent);
  const width = Math.max(760, 120 + leafCount * 96);
  const levelGap = 78;
  const slotWidth = (width - 120) / leafCount;
  const nodes = [];
  const edges = [];

  const place = (node, start, depth, parent = null) => {
    const children = childrenByParent.get(node.id) ?? [];
    const leaves = countLeaves(node, childrenByParent);
    const x = 60 + (start + leaves / 2) * slotWidth;
    const y = 52 + depth * levelGap;
    nodes.push({ ...node, x, y });
    if (parent) {
      edges.push({
        id: `${parent.id}:${node.id}`,
        fromX: parent.x,
        fromY: parent.y + 20,
        toX: x,
        toY: y - 20,
      });
    }

    let childStart = start;
    for (const child of children) {
      place(child, childStart, depth + 1, { id: node.id, x, y });
      childStart += countLeaves(child, childrenByParent);
    }
  };
  place(root, 0, 0);

  return {
    width,
    height: Math.max(360, 108 + (Math.max(...nodes.map((node) => node.depth)) + 1) * levelGap),
    nodes,
    edges,
  };
}

function AccessibleTrieNode({ node, childrenByParent, t }) {
  const children = childrenByParent.get(node.id) ?? [];
  const label = node.id === 'root'
    ? t('trie.rootTitle')
    : `${node.character} · ${t('trie.nodeTitle', { prefix: node.prefix })}`;

  return (
    <li>
      <span>
        {label}
        {node.terminal ? ` · ${t('trie.completeWord')}` : ''}
      </span>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <AccessibleTrieNode
              key={child.id}
              node={child}
              childrenByParent={childrenByParent}
              t={t}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TrieDrawing({ snapshot, activeStep, t }) {
  const layout = useMemo(() => layoutTrie(snapshot), [snapshot]);
  const focusPath = new Set(activeStep?.focusPath ?? []);
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map();
  for (const edge of snapshot.edges) {
    const children = childrenByParent.get(edge.fromId) ?? [];
    children.push(nodesById.get(edge.toId));
    childrenByParent.set(edge.fromId, children);
  }
  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.character.localeCompare(b.character));
  }
  const pathEdges = new Set(
    activeStep?.focusPath.slice(1).map((nodeId, index) => `${activeStep.focusPath[index]}:${nodeId}`) ?? [],
  );

  return (
    <div className="trie-drawing-scroll">
      <svg
        className="trie-drawing"
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={t('trie.visualizationLabel', {
          nodes: snapshot.nodes.length,
          words: snapshot.words.length,
          alphabetSize: snapshot.alphabetSize,
        })}
      >
        <g className="trie-edges" aria-hidden="true">
          {layout.edges.map((edge) => (
            <line
              key={edge.id}
              className={[
                'trie-edge',
                pathEdges.has(edge.id) ? 'is-path' : '',
                activeStep?.activeEdgeId === edge.id ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              x1={edge.fromX}
              y1={edge.fromY}
              x2={edge.toX}
              y2={edge.toY}
            />
          ))}
        </g>
        {layout.nodes.map((node) => {
          const isRoot = node.id === 'root';
          const isFocused = focusPath.has(node.id);
          const isCurrent = activeStep?.currentNodeId === node.id;
          return (
            <g
              key={node.id}
              className={[
                'trie-node',
                isFocused ? 'is-path' : '',
                isCurrent ? 'is-current' : '',
                node.terminal ? 'is-terminal' : '',
              ].filter(Boolean).join(' ')}
              transform={`translate(${node.x} ${node.y})`}
            >
              <title>
                {isRoot ? t('trie.rootTitle') : t('trie.nodeTitle', { prefix: node.prefix })}
                {node.terminal ? ` · ${t('trie.completeWord')}` : ''}
              </title>
              <circle r={isRoot ? 21 : 18} />
              <text y="1">{isRoot ? '∅' : node.character}</text>
              {node.terminal && (
                <g className="trie-terminal-marker" aria-hidden="true">
                  <circle cx="14" cy="-14" r="7" />
                  <text x="14" y="-13">✓</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <ul className="trie-sr-only" aria-label={t('trie.accessibleTree')}>
        {snapshot.nodes[0] && (
          <AccessibleTrieNode
            node={snapshot.nodes[0]}
            childrenByParent={childrenByParent}
            t={t}
          />
        )}
      </ul>
    </div>
  );
}

export default function TrieVisualizer() {
  const t = useT('dataStructures');
  const [input, setInput] = useState(EXAMPLE_WORDS);
  const [inputError, setInputError] = useState('');
  const [inputRevision, setInputRevision] = useState(0);
  const [operation, setOperation] = useState('insert');
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [snapshot, setSnapshot] = useState(() => new Trie().getSnapshot());
  const trieRef = useRef(new Trie());

  const activeStep = stepIndex >= 0 ? steps[stepIndex] : null;
  const currentDelay = STEP_DELAYS[speed];

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length - 1) return undefined;
    const timerId = window.setTimeout(() => {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setSnapshot(steps[nextIndex].snapshot);
      if (nextIndex >= steps.length - 1) setIsPlaying(false);
    }, currentDelay);
    return () => window.clearTimeout(timerId);
  }, [currentDelay, isPlaying, stepIndex, steps]);

  const showStep = (index) => {
    const step = steps[index];
    if (!step) return;
    setStepIndex(index);
    setSnapshot(step.snapshot);
  };

  const handleInsert = (event) => {
    event.preventDefault();
    const words = input.split(/\r?\n/u).map((word) => word.trim()).filter(Boolean);
    if (!words.length) {
      setInputError(t('trie.invalidEmpty'));
      setInputRevision((revision) => revision + 1);
      return;
    }
    if (operation === 'insert' && words.length > MAX_WORDS) {
      setInputError(t('trie.invalidCount', { count: MAX_WORDS }));
      setInputRevision((revision) => revision + 1);
      return;
    }
    if (operation !== 'insert' && words.length !== 1) {
      setInputError(t('trie.invalidSingleWord'));
      setInputRevision((revision) => revision + 1);
      return;
    }
    if (words.some((word) => /\s/u.test(word))) {
      setInputError(t('trie.invalidWhitespace'));
      setInputRevision((revision) => revision + 1);
      return;
    }
    if (words.some((word) => Array.from(word).length > MAX_WORD_LENGTH)) {
      setInputError(t('trie.invalidLength', { count: MAX_WORD_LENGTH }));
      setInputRevision((revision) => revision + 1);
      return;
    }

    const trie = trieRef.current;
    let nextSteps;
    if (operation === 'search') {
      nextSteps = trie.searchWithSteps(words[0]).steps;
    } else if (operation === 'delete') {
      nextSteps = trie.delete(words[0]).steps;
    } else {
      nextSteps = words.flatMap((word) => trie.insert(word).steps);
    }
    setInputError('');
    setSteps(nextSteps);
    setStepIndex(0);
    setSnapshot(nextSteps[0]?.snapshot ?? trie.getSnapshot());
    setIsPlaying(nextSteps.length > 1);
  };

  const reset = () => {
    trieRef.current = new Trie();
    setIsPlaying(false);
    setSteps([]);
    setStepIndex(-1);
    setSnapshot(new Trie().getSnapshot());
    setInputError('');
  };

  const togglePlayback = () => {
    if (stepIndex >= steps.length - 1) showStep(0);
    setIsPlaying((playing) => !playing);
  };

  return (
    <div className="trie-page">
      <aside className="trie-panel" aria-label={t('trie.controls')}>
        <div className="trie-panel-heading">
          <span>{t('trie.eyebrow')}</span>
          <h1>{t('trie.title')}</h1>
          <p>{t('trie.description')}</p>
        </div>

        <form className="trie-operation-form" onSubmit={handleInsert}>
          <div className="trie-section-label" id="trie-operation-label">{t('trie.operationLabel')}</div>
          <div className="trie-operation-mode" role="group" aria-labelledby="trie-operation-label">
            {['insert', 'search', 'delete'].map((mode) => (
              <button
                type="button"
                key={mode}
                className={`trie-mode-button${operation === mode ? ' is-active' : ''}`}
                onClick={() => {
                  setOperation(mode);
                  setInputError('');
                }}
                aria-pressed={operation === mode}
              >
                {mode === 'insert' && <Play size={14} />}
                {mode === 'search' && <Search size={14} />}
                {mode === 'delete' && <Trash2 size={14} />}
                {t(`trie.${mode}`)}
              </button>
            ))}
          </div>
          <label className="trie-section-label" htmlFor="trie-words">
            {t(operation === 'insert' ? 'trie.wordsLabel' : 'trie.wordLabel')}
          </label>
          <textarea
            id="trie-words"
            className={`trie-input${inputError ? ' has-error' : ''}`}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setInputError('');
            }}
            placeholder={t(operation === 'insert' ? 'trie.wordsPlaceholder' : 'trie.wordPlaceholder')}
            aria-invalid={Boolean(inputError)}
            aria-describedby={inputError ? 'trie-input-error' : 'trie-input-help'}
            rows={5}
          />
          {inputError
            ? <span className="trie-input-error" id="trie-input-error" role="alert" key={inputRevision}>{inputError}</span>
            : <span className="trie-input-help" id="trie-input-help">
              {t(operation === 'insert' ? 'trie.wordsHelp' : 'trie.wordHelp', {
                count: MAX_WORDS,
                length: MAX_WORD_LENGTH,
              })}
            </span>}
          <div className="trie-operation-buttons">
            <button type="submit" className="trie-action trie-action--insert">
              {operation === 'insert' && <Play size={15} />}
              {operation === 'search' && <Search size={15} />}
              {operation === 'delete' && <Trash2 size={15} />}
              {t(`trie.run${operation[0].toUpperCase()}${operation.slice(1)}`)}
            </button>
            <button
              type="button"
              className="trie-action"
              onClick={() => {
                setOperation('insert');
                setInput(EXAMPLE_WORDS);
                setInputError('');
              }}
            >
              <Sparkles size={15} /> {t('trie.example')}
            </button>
          </div>
        </form>

        <section className="trie-control-section" aria-label={t('trie.playback')}>
          <div className="trie-section-label">{t('trie.playback')}</div>
          <div className="trie-playback-controls">
            <button type="button" className="trie-icon-button" onClick={() => { setIsPlaying(false); showStep(stepIndex - 1); }} disabled={!steps.length || stepIndex <= 0} aria-label={t('trie.previous')} title={t('trie.previous')}>
              <SkipBack size={16} />
            </button>
            <button type="button" className="trie-icon-button trie-play-button" onClick={togglePlayback} disabled={!steps.length} aria-label={t(isPlaying ? 'trie.pause' : 'trie.play')} title={t(isPlaying ? 'trie.pause' : 'trie.play')}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" className="trie-icon-button" onClick={() => { setIsPlaying(false); showStep(stepIndex + 1); }} disabled={!steps.length || stepIndex >= steps.length - 1} aria-label={t('trie.next')} title={t('trie.next')}>
              <SkipForward size={16} />
            </button>
            <button type="button" className="trie-icon-button" onClick={reset} disabled={!steps.length && !snapshot.words.length} aria-label={t('trie.reset')} title={t('trie.reset')}>
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="trie-step-count" aria-live="polite">
            {steps.length ? t('trie.stepCount', { current: stepIndex + 1, total: steps.length }) : t('trie.noSteps')}
          </div>
          <div className="trie-speed-row" role="group" aria-label={t('trie.speed')}>
            {['slow', 'normal', 'fast'].map((option, index) => (
              <button
                type="button"
                key={option}
                className={`trie-speed-button${speed === index ? ' is-active' : ''}`}
                onClick={() => setSpeed(index)}
                aria-pressed={speed === index}
              >
                {t(`trie.${option}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="trie-step-message" aria-live="polite">
          <span className="trie-section-label">{t('trie.statusLabel')}</span>
          <p>{activeStep ? t(activeStep.msgKey, activeStep.msgParams) : t('trie.emptyState')}</p>
        </section>

        <section className="trie-complexity-card">
          <strong>{t('trie.complexityTitle')}</strong>
          <span>{t('trie.complexityBody')}</span>
        </section>
      </aside>

      <section className="trie-visualization" aria-label={t('trie.visualizationTitle')}>
        <header className="trie-visualization-header">
          <div>
            <span>{t('trie.visualizationEyebrow')}</span>
            <h2>{t('trie.visualizationTitle')}</h2>
          </div>
          <div className="trie-visualization-stats" aria-live="polite">
            <span><b>{snapshot.nodes.length}</b> {t('trie.nodes')}</span>
            <span><b>{snapshot.words.length}</b> {t('trie.wordsStored')}</span>
            <span className="trie-alphabet-stat" aria-label={t('trie.alphabetSize')}>
              <b><span aria-hidden="true">|Σ|</span> {snapshot.alphabetSize}</b> {t('trie.alphabetSize')}
            </span>
            <span><b>{Array.from(activeStep?.prefix ?? '').length}</b> {t('trie.prefixLength')}</span>
          </div>
        </header>

        <TrieDrawing snapshot={snapshot} activeStep={activeStep} t={t} />

        <footer className="trie-visualization-footer">
          <div className="trie-legend">
            <span><i className="trie-legend-dot is-path" />{t('trie.currentPath')}</span>
            <span><i className="trie-legend-dot is-terminal" />{t('trie.completeWord')}</span>
          </div>
          <div className="trie-word-list" aria-label={t('trie.storedWords')}>
            {snapshot.words.length
              ? snapshot.words.map((word) => <span className="trie-word-chip" key={word}>{word}</span>)
              : <span className="trie-empty-words">{t('trie.emptyState')}</span>}
          </div>
          <div className="trie-alphabet-list" aria-label={t('trie.alphabetSymbols')}>
            <span className="trie-alphabet-label">Σ</span>
            {snapshot.alphabet.length
              ? snapshot.alphabet.map((character) => (
                <span className="trie-alphabet-chip" key={character}>{character}</span>
              ))
              : <span className="trie-empty-words">{t('trie.alphabetEmpty')}</span>}
          </div>
        </footer>
      </section>
    </div>
  );
}
