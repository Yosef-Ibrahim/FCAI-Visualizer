import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CornerUpLeft,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  FibonacciDP,
  Knapsack01,
  LCS,
  CoinChangeDP,
} from '../../../application/algorithms/dp';
import { useLang } from '../../../hooks/useLang';
import { useT } from '../../../hooks/useT';
import { stepText } from '../../../i18n/stepText';
import DPMatrixView from '../../../components/dp/DPMatrixView';
import CodePanel from '../../../components/shared/CodePanel';
import ComplexityPanel from '../../../components/sorting/ComplexityPanel';
import '../../../styles/DynamicProgramming.css';

const DP_ALGORITHMS = [
  new FibonacciDP(),
  new Knapsack01(),
  new LCS(),
  new CoinChangeDP(),
];

const DP_BY_ID = Object.fromEntries(DP_ALGORITHMS.map((a) => [a.id, a]));
const DP_ROUTE_PREFIX = '/courses/algorithms/dynamic-programming';

function formatItemsText(items) {
  return items.map((it) => `${it.name}:${it.weight}:${it.value}`).join(', ');
}

function parseItemsText(raw) {
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 6) return null;
  const parsed = [];
  for (const part of parts) {
    const segs = part.split(':').map((s) => s.trim());
    if (segs.length !== 3) return null;
    const [name, wtStr, valStr] = segs;
    const weight = Number(wtStr);
    const value = Number(valStr);
    if (!name || !Number.isInteger(weight) || weight <= 0 || !Number.isFinite(value) || value < 0) {
      return null;
    }
    parsed.push({ name, weight, value });
  }
  return parsed;
}

function parseCoinsText(raw) {
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 6) return null;
  const coins = [];
  for (const p of parts) {
    const num = Number(p);
    if (!Number.isInteger(num) || num <= 0) return null;
    if (!coins.includes(num)) coins.push(num);
  }
  return coins;
}

function defaultFormFor(algoId) {
  const def = DP_BY_ID[algoId].getDefaultInput();
  if (algoId === 'fibonacci-dp') return { n: String(def.n) };
  if (algoId === 'knapsack-01') return { capacity: String(def.capacity), itemsText: formatItemsText(def.items) };
  if (algoId === 'lcs') return { a: def.a, b: def.b };
  return { coinsText: def.coins.join(', '), amount: String(def.amount) };
}

export default function DynamicProgramming() {
  const { algo: urlAlgo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT('dp');
  const tCommon = useT();
  const [lang, setLang] = useLang('js');

  const resolvedUrlAlgo = urlAlgo && DP_BY_ID[urlAlgo] ? urlAlgo : null;
  const [selectedAlgo, setSelectedAlgo] = useState(resolvedUrlAlgo ?? 'knapsack-01');
  const activeAlgoId = resolvedUrlAlgo ?? selectedAlgo;
  const algorithm = DP_BY_ID[activeAlgoId];

  const [inputsByAlgo, setInputsByAlgo] = useState(() => ({
    'fibonacci-dp': DP_BY_ID['fibonacci-dp'].getDefaultInput(),
    'knapsack-01': DP_BY_ID['knapsack-01'].getDefaultInput(),
    lcs: DP_BY_ID.lcs.getDefaultInput(),
    'coin-change-dp': DP_BY_ID['coin-change-dp'].getDefaultInput(),
  }));

  const [formsByAlgo, setFormsByAlgo] = useState(() => ({
    'fibonacci-dp': defaultFormFor('fibonacci-dp'),
    'knapsack-01': defaultFormFor('knapsack-01'),
    lcs: defaultFormFor('lcs'),
    'coin-change-dp': defaultFormFor('coin-change-dp'),
  }));

  const [inputError, setInputError] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [showCode, setShowCode] = useState(false);
  const [inspectedCell, setInspectedCell] = useState(null);

  const activeInput = inputsByAlgo[activeAlgoId];
  const activeForm = formsByAlgo[activeAlgoId];

  const steps = useMemo(
    () => algorithm.generateSteps(activeInput),
    [algorithm, activeInput],
  );

  const safeIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIdx] ?? steps[0];
  const dpState = currentStep?.dp;

  const tracebackStartIdx = useMemo(
    () => steps.findIndex((s) => s.dp?.phase === 'traceback'),
    [steps],
  );

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return undefined;
    if (safeIdx >= steps.length - 1) {
      const stopId = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopId);
    }
    const delayMs = Math.max(120, 1050 - speed * 90);
    const id = setTimeout(() => {
      setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, delayMs);
    return () => clearTimeout(id);
  }, [isPlaying, safeIdx, steps.length, speed]);

  const handleSelectAlgo = useCallback((nextId) => {
    if (!DP_BY_ID[nextId]) return;
    setSelectedAlgo(nextId);
    setStepIdx(0);
    setIsPlaying(false);
    setInputError('');
    setInspectedCell(null);
    if (location.pathname.startsWith(DP_ROUTE_PREFIX)) {
      navigate(`${DP_ROUTE_PREFIX}/${nextId}`, { replace: true });
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
      if (activeAlgoId === 'fibonacci-dp') {
        const n = Number(activeForm.n);
        if (!Number.isInteger(n) || n < 1 || n > 12) {
          setInputError(t('errors.invalidInput'));
          return;
        }
        nextInput = { n };
      } else if (activeAlgoId === 'knapsack-01') {
        const capacity = Number(activeForm.capacity);
        const items = parseItemsText(activeForm.itemsText);
        if (!Number.isInteger(capacity) || capacity < 0 || capacity > 12 || !items) {
          setInputError(t('errors.invalidItems'));
          return;
        }
        nextInput = { capacity, items };
      } else if (activeAlgoId === 'lcs') {
        const a = String(activeForm.a ?? '').trim();
        const b = String(activeForm.b ?? '').trim();
        if (a.length > 10 || b.length > 10) {
          setInputError(t('errors.invalidInput'));
          return;
        }
        nextInput = { a, b };
      } else if (activeAlgoId === 'coin-change-dp') {
        const coins = parseCoinsText(activeForm.coinsText);
        const amount = Number(activeForm.amount);
        if (!coins || !Number.isInteger(amount) || amount < 0 || amount > 20) {
          setInputError(t('errors.invalidCoins'));
          return;
        }
        nextInput = { coins, amount };
      }

      // Validate by generating once before committing
      algorithm.generateSteps(nextInput);
      setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: nextInput }));
      setStepIdx(0);
      setIsPlaying(false);
      setInspectedCell(null);
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
    setInspectedCell(null);
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

  const phaseKey = dpState?.phase ?? 'init';

  return (
    <div className="dp-workbench animate-in">
      <aside className="dp-controls-pane" aria-label={t('controls.parameters')}>
        <header className="dp-pane-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        {/* Algorithm selector */}
        <section className="dp-control-section">
          <h2 className="dp-section-label">{t('controls.algorithm')}</h2>
          <div className="dp-algo-list" role="tablist" aria-label={t('controls.algorithm')}>
            {DP_ALGORITHMS.map((algo) => {
              const selected = algo.id === activeAlgoId;
              return (
                <button
                  key={algo.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`dp-algo-btn${selected ? ' is-active' : ''}`}
                  onClick={() => handleSelectAlgo(algo.id)}
                >
                  <span className="dp-algo-btn-title">{t(`algos.${algo.id}.name`)}</span>
                  <span className="dp-algo-btn-desc">{t(`algos.${algo.id}.shortDesc`)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Parameter form */}
        <section className="dp-control-section">
          <h2 className="dp-section-label">{t('controls.parameters')}</h2>
          <form className="dp-param-form" onSubmit={handleApplyInput}>
            {activeAlgoId === 'fibonacci-dp' && (
              <label className="dp-field">
                <span>{t('controls.fibN')}</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={1}
                  value={activeForm.n}
                  onChange={(e) => updateFormField('n', e.target.value)}
                />
              </label>
            )}

            {activeAlgoId === 'knapsack-01' && (
              <>
                <label className="dp-field">
                  <span>{t('controls.capacity')}</span>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    step={1}
                    value={activeForm.capacity}
                    onChange={(e) => updateFormField('capacity', e.target.value)}
                  />
                </label>
                <label className="dp-field">
                  <span>{t('controls.items')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    value={activeForm.itemsText}
                    onChange={(e) => updateFormField('itemsText', e.target.value)}
                  />
                  <small className="dp-field-hint">{t('controls.itemsHint')}</small>
                </label>
              </>
            )}

            {activeAlgoId === 'lcs' && (
              <>
                <label className="dp-field">
                  <span>{t('controls.stringA')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    maxLength={10}
                    value={activeForm.a}
                    onChange={(e) => updateFormField('a', e.target.value.toUpperCase())}
                  />
                </label>
                <label className="dp-field">
                  <span>{t('controls.stringB')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    maxLength={10}
                    value={activeForm.b}
                    onChange={(e) => updateFormField('b', e.target.value.toUpperCase())}
                  />
                </label>
              </>
            )}

            {activeAlgoId === 'coin-change-dp' && (
              <>
                <label className="dp-field">
                  <span>{t('controls.coins')}</span>
                  <input
                    type="text"
                    className="ltr-keep"
                    value={activeForm.coinsText}
                    onChange={(e) => updateFormField('coinsText', e.target.value)}
                  />
                  <small className="dp-field-hint">{t('controls.coinsHint')}</small>
                </label>
                <label className="dp-field">
                  <span>{t('controls.targetAmount')}</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    value={activeForm.amount}
                    onChange={(e) => updateFormField('amount', e.target.value)}
                  />
                </label>
              </>
            )}

            {inputError && (
              <p className="dp-error-msg" role="alert">{inputError}</p>
            )}

            <div className="dp-form-actions">
              <button type="submit" className="btn primary">{t('controls.apply')}</button>
              <button type="button" className="btn" onClick={handleResetDefaults}>
                <RotateCcw size={14} />
                {t('controls.resetDefaults')}
              </button>
            </div>
          </form>
        </section>

        {/* Playback section */}
        <section className="dp-control-section">
          <div className="dp-section-row">
            <h2 className="dp-section-label">{t('controls.playback')}</h2>
            <span className="dp-step-badge ltr-keep">
              {t('controls.stepCounter', { current: safeIdx + 1, total: steps.length })}
            </span>
          </div>

          <div className="dp-playback-bar">
            <button
              type="button"
              className="btn dp-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx(0); }}
              aria-label={tCommon('actions.reset')}
              title={tCommon('actions.reset')}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="btn dp-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.max(0, p - 1)); }}
              aria-label={tCommon('actions.stepBack')}
              aria-disabled={safeIdx <= 0}
            >
              <SkipBack size={15} />
            </button>
            <button
              type="button"
              className="btn primary dp-play-btn"
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
              className="btn dp-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.min(steps.length - 1, p + 1)); }}
              aria-label={tCommon('actions.stepForward')}
              aria-disabled={safeIdx >= steps.length - 1}
            >
              <SkipForward size={15} />
            </button>
          </div>

          <div className="dp-scrubber-wrap">
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

          <label className="dp-speed-row">
            <span>{t('controls.speed')}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="dp-speed-val ltr-keep">{speed}×</span>
          </label>

          {tracebackStartIdx >= 0 && (
            <button
              type="button"
              className="btn success dp-traceback-btn"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(tracebackStartIdx);
              }}
            >
              <CornerUpLeft size={14} />
              {t('controls.jumpToTraceback')}
            </button>
          )}
        </section>

        <ComplexityPanel complexity={complexityWithTranslatedNote} />
      </aside>

      <main className="dp-stage-pane">
        <div className="dp-stage-card">
          {/* Flush inline telemetry & recurrence bar attached to top of stage */}
          <div className="dp-telemetry-bar">
            <div className="dp-telemetry-item">
              <span className="dp-telemetry-key">{t('telemetry.phase')}</span>
              <span className={`dp-phase-pill dp-phase-pill--${phaseKey}`}>
                {t(`telemetry.phases.${phaseKey}`)}
              </span>
            </div>

            <div className="dp-telemetry-item dp-telemetry-item--recurrence">
              <span className="dp-telemetry-key">{t('telemetry.recurrence')}</span>
              <code className="dp-recurrence-code ltr-keep">
                {dpState?.recurrenceText || t('telemetry.pending')}
              </code>
            </div>

            <div className="dp-telemetry-item">
              <span className="dp-telemetry-key">{t('telemetry.result')}</span>
              <span className="dp-result-val ltr-keep">
                {dpState?.summary || t('telemetry.pending')}
              </span>
            </div>
          </div>

          {/* Live narration strip */}
          <div className="dp-narration" aria-live="polite">
            {stepText(currentStep)}
          </div>

          {/* Matrix visualization */}
          <DPMatrixView
            dp={dpState}
            inspectedCell={inspectedCell}
            onInspectCell={setInspectedCell}
          />
        </div>

        {/* Collapsible code walkthrough */}
        <div className="dp-code-drawer">
          <button
            type="button"
            className="dp-code-toggle"
            aria-expanded={showCode}
            onClick={() => setShowCode((v) => !v)}
          >
            <span className="dp-code-toggle-left">
              <Code2 size={16} />
              {showCode ? t('controls.hideCode') : t('controls.showCode')}
            </span>
            {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCode && (
            <div className="dp-code-panel-wrap">
              <CodePanel
                codeByLang={codeByLang}
                activeLine={activeCodeLine}
                lang={lang}
                setLang={setLang}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
