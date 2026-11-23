import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ActivitySelection,
  FractionalKnapsack,
  GreedyCoinChange,
} from '../../../application/algorithms/greedy';
import { useLang } from '../../../hooks/useLang';
import { useT } from '../../../hooks/useT';
import { stepText } from '../../../i18n/stepText';
import IntervalTimelineView from '../../../components/greedy/IntervalTimelineView';
import KnapsackFillView from '../../../components/greedy/KnapsackFillView';
import CoinChangeView from '../../../components/greedy/CoinChangeView';
import CodePanel from '../../../components/shared/CodePanel';
import ComplexityPanel from '../../../components/sorting/ComplexityPanel';
import '../../../styles/GreedyAlgorithms.css';

const GREEDY_ALGORITHMS = [
  new ActivitySelection(),
  new FractionalKnapsack(),
  new GreedyCoinChange(),
];

const GREEDY_BY_ID = Object.fromEntries(GREEDY_ALGORITHMS.map((a) => [a.id, a]));
const GREEDY_ROUTE_PREFIX = '/courses/algorithms/greedy';

const FAILING_COIN_PRESET = { coins: [1, 3, 4], amount: 6 };

function formatActivitiesText(list) {
  return list.map((a) => `${a.name}:${a.start}:${a.end}`).join(', ');
}

function parseActivitiesText(raw) {
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 12) return null;
  const parsed = [];
  for (const part of parts) {
    const segs = part.split(':').map((s) => s.trim());
    if (segs.length !== 3) return null;
    const [name, sStr, eStr] = segs;
    const start = Number(sStr);
    const end = Number(eStr);
    if (!name || !Number.isFinite(start) || !Number.isFinite(end) || start >= end) return null;
    parsed.push({ name, start, end });
  }
  return parsed;
}

function formatItemsText(list) {
  return list.map((it) => `${it.name}:${it.weight}:${it.value}`).join(', ');
}

function parseItemsText(raw) {
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 10) return null;
  const parsed = [];
  for (const part of parts) {
    const segs = part.split(':').map((s) => s.trim());
    if (segs.length !== 3) return null;
    const [name, wtStr, valStr] = segs;
    const weight = Number(wtStr);
    const value = Number(valStr);
    if (!name || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(value) || value < 0) {
      return null;
    }
    parsed.push({ name, weight, value });
  }
  return parsed;
}

function parseCoinsText(raw) {
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 8) return null;
  const coins = [];
  for (const p of parts) {
    const num = Number(p);
    if (!Number.isInteger(num) || num <= 0) return null;
    if (!coins.includes(num)) coins.push(num);
  }
  return coins;
}

function defaultFormFor(algoId) {
  const def = GREEDY_BY_ID[algoId].getDefaultInput();
  if (algoId === 'activity-selection') {
    return { activitiesText: formatActivitiesText(def.activities) };
  }
  if (algoId === 'fractional-knapsack') {
    return { capacity: String(def.capacity), itemsText: formatItemsText(def.items) };
  }
  return { coinsText: def.coins.join(', '), amount: String(def.amount) };
}

export default function GreedyAlgorithms() {
  const { algo: urlAlgo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT('greedy');
  const tCommon = useT();
  const [lang, setLang] = useLang('js');

  const resolvedUrlAlgo = urlAlgo && GREEDY_BY_ID[urlAlgo] ? urlAlgo : null;
  const [selectedAlgo, setSelectedAlgo] = useState(resolvedUrlAlgo ?? 'activity-selection');
  const activeAlgoId = resolvedUrlAlgo ?? selectedAlgo;
  const algorithm = GREEDY_BY_ID[activeAlgoId];

  const [inputsByAlgo, setInputsByAlgo] = useState(() => ({
    'activity-selection': GREEDY_BY_ID['activity-selection'].getDefaultInput(),
    'fractional-knapsack': GREEDY_BY_ID['fractional-knapsack'].getDefaultInput(),
    'greedy-coin-change': GREEDY_BY_ID['greedy-coin-change'].getDefaultInput(),
  }));

  const [formsByAlgo, setFormsByAlgo] = useState(() => ({
    'activity-selection': defaultFormFor('activity-selection'),
    'fractional-knapsack': defaultFormFor('fractional-knapsack'),
    'greedy-coin-change': defaultFormFor('greedy-coin-change'),
  }));

  const [inputError, setInputError] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [showCode, setShowCode] = useState(false);

  const activeInput = inputsByAlgo[activeAlgoId];
  const activeForm = formsByAlgo[activeAlgoId];

  const steps = useMemo(
    () => algorithm.generateSteps(activeInput),
    [algorithm, activeInput],
  );

  const safeIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIdx] ?? steps[0];
  const greedyState = currentStep?.greedy;

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (safeIdx >= steps.length - 1) {
      const stopId = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopId);
    }
    const delayMs = Math.max(140, 1100 - speed * 95);
    const id = setTimeout(() => {
      setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, delayMs);
    return () => clearTimeout(id);
  }, [isPlaying, safeIdx, steps.length, speed]);

  const handleSelectAlgo = useCallback((nextId) => {
    if (!GREEDY_BY_ID[nextId]) return;
    setSelectedAlgo(nextId);
    setStepIdx(0);
    setIsPlaying(false);
    setInputError('');
    if (location.pathname.startsWith(GREEDY_ROUTE_PREFIX)) {
      navigate(`${GREEDY_ROUTE_PREFIX}/${nextId}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  const updateFormField = (field, value) => {
    setFormsByAlgo((prev) => ({
      ...prev,
      [activeAlgoId]: { ...prev[activeAlgoId], [field]: value },
    }));
  };

  const handleApplyInput = (event) => {
    event?.preventDefault();
    setInputError('');

    try {
      let nextInput = null;
      if (activeAlgoId === 'activity-selection') {
        const activities = parseActivitiesText(activeForm.activitiesText);
        if (!activities) {
          setInputError(t('errors.invalidActivities'));
          return;
        }
        nextInput = { activities };
      } else if (activeAlgoId === 'fractional-knapsack') {
        const capacity = Number(activeForm.capacity);
        const items = parseItemsText(activeForm.itemsText);
        if (!Number.isFinite(capacity) || capacity <= 0 || !items) {
          setInputError(t('errors.invalidItems'));
          return;
        }
        nextInput = { capacity, items };
      } else if (activeAlgoId === 'greedy-coin-change') {
        const coins = parseCoinsText(activeForm.coinsText);
        const amount = Number(activeForm.amount);
        if (!coins || !Number.isInteger(amount) || amount < 0 || amount > 200) {
          setInputError(t('errors.invalidCoins'));
          return;
        }
        nextInput = { coins, amount };
      }

      algorithm.generateSteps(nextInput);
      setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: nextInput }));
      setStepIdx(0);
      setIsPlaying(false);
    } catch {
      setInputError(t('errors.invalidInput'));
    }
  };

  const handleResetDefaults = () => {
    const def = algorithm.getDefaultInput();
    setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: def }));
    setFormsByAlgo((prev) => ({ ...prev, [activeAlgoId]: defaultFormFor(activeAlgoId) }));
    setInputError('');
    setStepIdx(0);
    setIsPlaying(false);
  };

  const handleLoadCoinPreset = (preset) => {
    setInputsByAlgo((prev) => ({ ...prev, 'greedy-coin-change': preset }));
    setFormsByAlgo((prev) => ({
      ...prev,
      'greedy-coin-change': {
        coinsText: preset.coins.join(', '),
        amount: String(preset.amount),
      },
    }));
    setInputError('');
    setStepIdx(0);
    setIsPlaying(false);
  };

  const codeByLang = useMemo(() => {
    const raw = algorithm.codeSnippets ?? {};
    return Object.fromEntries(
      Object.entries(raw).map(([k, lines]) => [k, Array.isArray(lines) ? lines.join('\n') : String(lines)]),
    );
  }, [algorithm]);

  const activeCodeLine = currentStep?.codeLines?.[lang] ?? currentStep?.codeLine ?? -1;

  const complexityWithTranslatedNote = useMemo(() => ({
    ...algorithm.complexity,
    note: t(`algos.${activeAlgoId}.complexityNote`, { defaultValue: algorithm.complexity?.note ?? '' }),
  }), [algorithm, activeAlgoId, t]);

  const telemetrySummary = useMemo(() => {
    if (!greedyState) return [];
    const m = greedyState.metrics ?? {};
    if (greedyState.kind === 'activity') {
      return [
        { label: t('views.activity.selectedCount'), value: `${m.selectedCount ?? 0} / ${m.totalCount ?? 0}` },
        { label: t('views.activity.lastFinish'), value: m.lastEnd !== null && m.lastEnd !== undefined ? String(m.lastEnd) : t('views.activity.noneYet') },
      ];
    }
    if (greedyState.kind === 'fractional-knapsack') {
      return [
        { label: t('views.knapsack.capacityUsed'), value: `${m.usedWeight ?? 0} / ${m.capacity ?? 0}` },
        { label: t('views.knapsack.totalValue'), value: String(m.totalValue ?? 0) },
      ];
    }
    return [
      { label: t('views.coin.remaining'), value: `${m.remaining ?? 0} / ${m.target ?? 0}` },
      { label: t('views.coin.coinsUsed'), value: String(m.coinCount ?? 0) },
    ];
  }, [greedyState, t]);

  return (
    <div className="greedy-workbench animate-in">
      <aside className="greedy-controls-pane" aria-label={t('controls.parameters')}>
        <header className="greedy-pane-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        {/* Algorithm selector */}
        <section className="greedy-control-section">
          <h2 className="greedy-section-label">{t('controls.algorithm')}</h2>
          <div className="greedy-algo-list" role="tablist" aria-label={t('controls.algorithm')}>
            {GREEDY_ALGORITHMS.map((algo) => {
              const selected = algo.id === activeAlgoId;
              return (
                <button
                  key={algo.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`greedy-algo-btn${selected ? ' is-active' : ''}`}
                  onClick={() => handleSelectAlgo(algo.id)}
                >
                  <span className="greedy-algo-btn-title">{t(`algos.${algo.id}.name`)}</span>
                  <span className="greedy-algo-btn-desc">{t(`algos.${algo.id}.shortDesc`)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Parameters */}
        <section className="greedy-control-section">
          <h2 className="greedy-section-label">{t('controls.parameters')}</h2>
          <form className="greedy-param-form" onSubmit={handleApplyInput}>
            {activeAlgoId === 'activity-selection' && (
              <label className="greedy-field">
                <span>{t('controls.activitiesLabel')}</span>
                <input
                  type="text"
                  className="ltr-keep"
                  value={activeForm.activitiesText}
                  onChange={(e) => updateFormField('activitiesText', e.target.value)}
                />
                <small className="greedy-field-hint">{t('controls.activitiesHint')}</small>
              </label>
            )}

            {activeAlgoId === 'fractional-knapsack' && (
              <>
                <label className="greedy-field">
                  <span>{t('controls.capacity')}</span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={activeForm.capacity}
                    onChange={(e) => updateFormField('capacity', e.target.value)}
                  />
                </label>
                <label className="greedy-field">
                  <span>{t('controls.itemsLabel')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    value={activeForm.itemsText}
                    onChange={(e) => updateFormField('itemsText', e.target.value)}
                  />
                  <small className="greedy-field-hint">{t('controls.itemsHint')}</small>
                </label>
              </>
            )}

            {activeAlgoId === 'greedy-coin-change' && (
              <>
                <label className="greedy-field">
                  <span>{t('controls.coinsLabel')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    value={activeForm.coinsText}
                    onChange={(e) => updateFormField('coinsText', e.target.value)}
                  />
                  <small className="greedy-field-hint">{t('controls.coinsHint')}</small>
                </label>
                <label className="greedy-field">
                  <span>{t('controls.amountLabel')}</span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    step={1}
                    value={activeForm.amount}
                    onChange={(e) => updateFormField('amount', e.target.value)}
                  />
                </label>

                <div className="greedy-preset-stack">
                  <button
                    type="button"
                    className="btn danger greedy-preset-btn"
                    onClick={() => handleLoadCoinPreset(FAILING_COIN_PRESET)}
                  >
                    <AlertTriangle size={14} />
                    {t('controls.loadFailingCase')}
                  </button>
                  <button
                    type="button"
                    className="btn greedy-preset-btn"
                    onClick={() => handleLoadCoinPreset(GREEDY_BY_ID['greedy-coin-change'].getDefaultInput())}
                  >
                    {t('controls.loadCanonicalCase')}
                  </button>
                </div>
              </>
            )}

            {inputError && (
              <p className="greedy-error-msg" role="alert">{inputError}</p>
            )}

            <div className="greedy-form-actions">
              <button type="submit" className="btn primary">{t('controls.apply')}</button>
              <button type="button" className="btn" onClick={handleResetDefaults}>
                <RotateCcw size={14} />
                {t('controls.resetDefaults')}
              </button>
            </div>
          </form>
        </section>

        {/* Playback */}
        <section className="greedy-control-section">
          <div className="greedy-section-row">
            <h2 className="greedy-section-label">{t('controls.playback')}</h2>
            <span className="greedy-step-badge ltr-keep">
              {t('controls.stepCounter', { current: safeIdx + 1, total: steps.length })}
            </span>
          </div>

          <div className="greedy-playback-bar">
            <button
              type="button"
              className="btn greedy-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx(0); }}
              aria-label={tCommon('actions.reset')}
              title={tCommon('actions.reset')}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="btn greedy-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.max(0, p - 1)); }}
              aria-label={tCommon('actions.stepBack')}
              aria-disabled={safeIdx <= 0}
            >
              <SkipBack size={15} />
            </button>
            <button
              type="button"
              className="btn primary greedy-play-btn"
              onClick={() => {
                if (safeIdx >= steps.length - 1) setStepIdx(0);
                setIsPlaying((p) => !p);
              }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? tCommon('actions.pause') : tCommon('actions.play')}
            </button>
            <button
              type="button"
              className="btn greedy-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.min(steps.length - 1, p + 1)); }}
              aria-label={tCommon('actions.stepForward')}
              aria-disabled={safeIdx >= steps.length - 1}
            >
              <SkipForward size={15} />
            </button>
          </div>

          <div className="greedy-scrubber-wrap">
            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={safeIdx}
              aria-label={t('controls.playback')}
              onChange={(e) => {
                setIsPlaying(false);
                setStepIdx(Number(e.target.value));
              }}
            />
          </div>

          <label className="greedy-speed-row">
            <span>{t('controls.speed')}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="greedy-speed-val ltr-keep">{speed}×</span>
          </label>
        </section>

        <ComplexityPanel complexity={complexityWithTranslatedNote} />
      </aside>

      <main className="greedy-stage-pane">
        <div className="greedy-stage-card">
          {/* Flush inline telemetry strip attached to top of stage */}
          <div className="greedy-telemetry-bar">
            <span className="greedy-telemetry-algo">{t(`algos.${activeAlgoId}.name`)}</span>
            <div className="greedy-telemetry-metrics">
              {telemetrySummary.map((item) => (
                <span key={item.label} className="greedy-telemetry-pair">
                  <span className="greedy-telemetry-key">{item.label}:</span>
                  <strong className="greedy-telemetry-val ltr-keep">{item.value}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Live narration strip */}
          <div className="greedy-narration" aria-live="polite">
            {stepText(currentStep)}
          </div>

          {/* Active stage view */}
          {activeAlgoId === 'activity-selection' && (
            <IntervalTimelineView greedy={greedyState} />
          )}
          {activeAlgoId === 'fractional-knapsack' && (
            <KnapsackFillView greedy={greedyState} />
          )}
          {activeAlgoId === 'greedy-coin-change' && (
            <CoinChangeView greedy={greedyState} />
          )}
        </div>

        {/* Collapsible CodePanel */}
        <div className="greedy-code-drawer">
          <button
            type="button"
            className="greedy-code-toggle"
            aria-expanded={showCode}
            onClick={() => setShowCode((v) => !v)}
          >
            <span className="greedy-code-toggle-left">
              <Code2 size={16} />
              {showCode ? t('controls.hideCode') : t('controls.showCode')}
            </span>
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCode && (
            <div className="greedy-code-panel-wrap">
              <CodePanel
                codeByLang={codeByLang}
                activeLine={activeCodeLine}
                lang={lang}
                setLang={setLang}
              />
            </div>
          )}
        </div>

        {/* Quiet Related Greedy Algorithms cross-link strip */}
        <section className="greedy-related-strip" aria-label={t('related.title')}>
          <h2 className="greedy-related-title">{t('related.title')}</h2>
          <div className="greedy-related-links">
            <Link className="greedy-related-link" to="/courses/data-structure/graphs/dijkstra">
              <div>
                <strong>{t('related.dijkstra')}</strong>
                <span>{t('related.dijkstraDesc')}</span>
              </div>
              <ArrowUpRight size={15} className="rtl-flip" />
            </Link>
            <Link className="greedy-related-link" to="/compare">
              <div>
                <strong>{t('related.mstCompare')}</strong>
                <span>{t('related.mstCompareDesc')}</span>
              </div>
              <ArrowUpRight size={15} className="rtl-flip" />
            </Link>
            <Link className="greedy-related-link" to="/courses/information-theory-compression/lossless">
              <div>
                <strong>{t('related.huffman')}</strong>
                <span>{t('related.huffmanDesc')}</span>
              </div>
              <ArrowUpRight size={15} className="rtl-flip" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
