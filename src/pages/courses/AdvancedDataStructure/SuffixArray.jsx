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
  MAX_SUFFIX_ARRAY_LEN,
  buildSuffixArray,
  searchSuffixArray,
} from '../../../algorithms/suffix/SuffixArray';
import { computeSuffixSpaceStats } from '../../../algorithms/suffix/SuffixTree';
import { SUFFIX_PRESETS } from '../../../algorithms/suffix/suffixUtils';
import IndexedTextStrip from '../../../components/shared/IndexedTextStrip';
import { useT } from '../../../hooks/useT';
import { stepText } from '../../../i18n/stepText';
import DataStructureCodePanel from '../../../components/shared/DataStructureCodePanel';
import '../../../styles/SuffixVisualizer.css';

const STEP_DELAYS = [1400, 750, 280];
const DEFAULT_TEXT = 'banana';

function createInitialState(paramText) {
  if (paramText) {
    const attempt = buildSuffixArray(paramText);
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
      buildResult: buildSuffixArray(DEFAULT_TEXT),
    };
  }
  return {
    inputValue: DEFAULT_TEXT,
    inputError: null,
    buildResult: buildSuffixArray(DEFAULT_TEXT),
  };
}

function renderSuffixText(suffixStr, highlightLen, highlightKind) {
  const chars = Array.from(suffixStr);
  const head = highlightLen > 0 ? chars.slice(0, highlightLen) : [];
  const tail = highlightLen > 0 ? chars.slice(highlightLen) : chars;
  const hasSentinelAtTailEnd = tail.length > 0 && tail[tail.length - 1] === '$';
  const body = hasSentinelAtTailEnd ? tail.slice(0, -1).join('') : tail.join('');

  return (
    <span className="suffix-text-cell">
      {head.length > 0 && (
        <span className={highlightKind === 'match' ? 'suffix-prefix-match' : 'suffix-prefix-lcp'}>
          {head.join('')}
        </span>
      )}
      {body}
      {hasSentinelAtTailEnd && <span className="suffix-sentinel-char">$</span>}
    </span>
  );
}

function phaseLabelKey(phase) {
  if (phase === 'list') return 'array.phaseList';
  if (phase === 'sort') return 'array.phaseSort';
  if (phase === 'lcp-init' || phase === 'lcp') return 'array.phaseLcp';
  if (phase?.startsWith('search')) return 'array.phaseSearch';
  return 'array.phaseDone';
}

export default function SuffixArrayPage() {
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

  const [mode, setMode] = useState('build');
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

  const spaceStats = useMemo(() => computeSuffixSpaceStats(buildResult.text), [buildResult.text]);
  const chars = useMemo(() => Array.from(buildResult.textWithSentinel), [buildResult.textWithSentinel]);

  const runBuild = (rawText) => {
    const built = buildSuffixArray(rawText);
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
    const res = searchSuffixArray(
      buildResult.textWithSentinel,
      buildResult.sa,
      patternValue,
      buildResult.lcp,
    );
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

  const order = activeStep?.order ?? buildResult.sa;
  const lcp = activeStep?.lcp ?? buildResult.lcp;
  const activeRows = new Set(activeStep?.activeRows ?? []);
  const matchedRows = new Set(activeStep?.matchedRows ?? []);
  const searchInfo = activeStep?.search ?? null;
  const kasaiInfo = activeStep?.kasai ?? null;
  const currentLrs = activeStep?.lrs ?? buildResult.lrs;
  const maxLcp = useMemo(() => {
    let best = 0;
    for (const val of lcp) {
      if (typeof val === 'number' && val > best) best = val;
    }
    return best;
  }, [lcp]);

  const querySuffix = `?text=${encodeURIComponent(buildResult.text)}`;

  return (
    <div className="suffix-page">
      <aside className="suffix-panel" aria-label={t('common.controlsRegion')}>
        <div className="suffix-heading">
          <h1>{t('array.title')}</h1>
          <p>{t('array.description')}</p>
        </div>

        <form className="suffix-section" onSubmit={handleBuildSubmit}>
          <label className="suffix-label" htmlFor="suffix-array-text">
            {t('common.inputLabel')}
          </label>
          <div className="suffix-input-row">
            <input
              id="suffix-array-text"
              type="text"
              className={`suffix-input${inputError ? ' has-error' : ''}`}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setInputError(null);
              }}
              placeholder={t('common.inputPlaceholder')}
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? 'suffix-array-err' : 'suffix-array-help'}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="suffix-btn suffix-btn-primary">
              {t('common.buildButton')}
            </button>
          </div>
          {inputError ? (
            <span className="suffix-error" id="suffix-array-err" role="alert">
              {t(inputError.key.replace(/^suffix:/, ''), { maxLen: inputError.maxLen ?? MAX_SUFFIX_ARRAY_LEN })}
            </span>
          ) : (
            <span className="suffix-help" id="suffix-array-help">
              {t('common.inputHelp', { maxLen: MAX_SUFFIX_ARRAY_LEN })}
            </span>
          )}

          <div className="suffix-presets" role="group" aria-label={t('common.presetsLabel')}>
            {SUFFIX_PRESETS.map((preset) => (
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
          <label className="suffix-label" htmlFor="suffix-array-pattern">
            {t('common.searchLabel')}
          </label>
          <div className="suffix-input-row">
            <input
              id="suffix-array-pattern"
              type="text"
              className={`suffix-input${patternError ? ' has-error' : ''}`}
              value={patternValue}
              onChange={(event) => {
                setPatternValue(event.target.value);
                setPatternError(null);
              }}
              placeholder={t('common.searchPlaceholder')}
              aria-invalid={Boolean(patternError)}
              aria-describedby={patternError ? 'suffix-array-pat-err' : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="suffix-btn">
              <Search size={14} aria-hidden="true" />
              {t('common.searchButton')}
            </button>
          </div>
          {patternError && (
            <span className="suffix-error" id="suffix-array-pat-err" role="alert">
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

        <div className="suffix-complexity">{t('array.complexity')}</div>
      </aside>

      <section className="suffix-stage">
        <div className="suffix-ribbon">
          <div className="suffix-telemetry" aria-live="polite">
            <span className="suffix-stat">
              <strong>{order.length}</strong> {t('array.statSuffixes')}
            </span>
            <span className="suffix-stat">
              <strong>{maxLcp}</strong> {t('array.statMaxLcp')}
            </span>
            <span className={`suffix-stat${currentLrs?.length > 0 ? ' is-highlight' : ''}`}>
              <strong>{currentLrs?.length > 0 ? `"${currentLrs.substring}"` : t('array.noRepeat')}</strong>
              {t('array.statLrs')}
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
                className="suffix-switch-link"
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
                className="suffix-switch-link is-current"
                aria-current="page"
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

        <div className="suffix-sa-status">
          <span className="suffix-phase-pill">{t(phaseLabelKey(activeStep?.phase))}</span>
          {kasaiInfo && kasaiInfo.i >= 0 && (
            <span className="suffix-kasai-pill ltr-keep">
              {t('array.kasaiState', {
                i: kasaiInfo.i,
                rank: kasaiInfo.r,
                j: kasaiInfo.j >= 0 ? kasaiInfo.j : '—',
                h: kasaiInfo.h,
              })}
            </span>
          )}
          {searchInfo && (
            <span className="suffix-kasai-pill ltr-keep">
              {t('array.searchRange', { left: searchInfo.lo, right: searchInfo.hi })}
            </span>
          )}
        </div>

        <div className="suffix-table-wrap ltr-keep">
          <table className="suffix-sa-table" aria-label={t('array.tableLabel')}>
            <thead>
              <tr>
                <th scope="col">{t('array.colRank')}</th>
                <th scope="col">{t('array.colSa')}</th>
                <th scope="col">{t('array.colLcp')}</th>
                <th scope="col">{t('array.colSuffix')}</th>
              </tr>
            </thead>
            <tbody>
              {order.map((suffixStart, r) => {
                const suffixStr = chars.slice(suffixStart).join('');
                const lcpVal = lcp[r];
                const isMatched = matchedRows.has(r);
                const isActive = activeRows.has(r);
                const isLcpPair = (activeStep?.phase === 'lcp' || activeStep?.phase === 'complete')
                  && activeStep.lcpHighlightRow > 0
                  && (r === activeStep.lcpHighlightRow || r === activeStep.lcpHighlightRow - 1);

                const isOutOfSearchWindow = searchInfo
                  && searchInfo.bound !== 'done'
                  && (r < searchInfo.lo || r >= searchInfo.hi);

                const rowClasses = [
                  isMatched ? 'is-matched' : isLcpPair ? 'is-lcp-pair' : isActive ? 'is-active' : '',
                  isOutOfSearchWindow ? 'is-out-of-window' : '',
                ].filter(Boolean).join(' ');

                const isLo = searchInfo && searchInfo.bound !== 'done' && r === searchInfo.lo;
                const isMid = searchInfo && searchInfo.bound !== 'done' && r === searchInfo.mid;
                const isHi = searchInfo
                  && searchInfo.bound !== 'done'
                  && (r === searchInfo.hi || (searchInfo.hi === order.length && r === order.length - 1));

                let highlightLen = 0;
                let highlightKind = 'lcp';
                if (isMatched && searchInfo) {
                  highlightLen = searchInfo.patternLen;
                  highlightKind = 'match';
                } else if (isLcpPair && activeStep?.lcpHighlightLen > 0) {
                  highlightLen = activeStep.lcpHighlightLen;
                  highlightKind = 'lcp';
                } else if (typeof lcpVal === 'number' && lcpVal > 0 && mode === 'build' && activeStep?.phase === 'complete') {
                  highlightLen = lcpVal;
                  highlightKind = 'lcp';
                }

                return (
                  <tr key={`${r}-${suffixStart}`} className={rowClasses}>
                    <td>
                      <span className="suffix-rank-cell">
                        <span>{r}</span>
                        {isLo && <span className="suffix-ptr-pill is-lo">lo</span>}
                        {isMid && <span className="suffix-ptr-pill is-mid">mid</span>}
                        {isHi && (
                          <span className="suffix-ptr-pill is-hi">
                            {searchInfo.hi === order.length ? 'hi→' : 'hi'}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="suffix-sa-val">{suffixStart}</td>
                    <td className={`suffix-lcp-val${typeof lcpVal === 'number' && lcpVal > 0 && lcpVal === maxLcp ? ' is-max' : ''}`}>
                      {lcpVal === null || lcpVal === undefined ? '—' : lcpVal}
                    </td>
                    <td>{renderSuffixText(suffixStr, highlightLen, highlightKind)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <DataStructureCodePanel structure="suffix-array" />
    </div>
  );
}
