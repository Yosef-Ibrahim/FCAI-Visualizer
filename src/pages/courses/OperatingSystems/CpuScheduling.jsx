import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronsRight,
  Plus,
  Trash2,
  Code2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  FCFS,
  SJF,
  SRTF,
  PriorityScheduling,
  RoundRobin,
  MultilevelQueue,
  MultilevelFeedbackQueue,
  SCHEDULING_PRESETS,
  compareSchedulersOnWorkload,
} from '../../../application/algorithms/scheduling';
import { useLang } from '../../../hooks/useLang';
import { useT } from '../../../hooks/useT';
import { stepText } from '../../../i18n/stepText';
import GanttChartView from '../../../components/scheduling/GanttChartView';
import ReadyQueueView from '../../../components/scheduling/ReadyQueueView';
import ProcessTraceTable from '../../../components/scheduling/ProcessTraceTable';
import DeterministicEvalPanel from '../../../components/scheduling/DeterministicEvalPanel';
import CodePanel from '../../../components/shared/CodePanel';
import ComplexityPanel from '../../../components/sorting/ComplexityPanel';
import '../../../styles/CpuScheduling.css';

const SCHED_ALGORITHMS = [
  new FCFS(),
  new SJF(),
  new SRTF(),
  new PriorityScheduling(),
  new RoundRobin(),
  new MultilevelQueue(),
  new MultilevelFeedbackQueue(),
];

const SCHED_BY_ID = Object.fromEntries(SCHED_ALGORITHMS.map((a) => [a.id, a]));
const SCHED_ROUTE_PREFIX = '/courses/operating-systems/cpu-scheduling';
const MAX_PROCESSES = 8;

function cloneInput(input) {
  return {
    processes: (input?.processes ?? []).map((p) => ({
      pid: p.pid,
      arrival: Number(p.arrival ?? 0),
      burst: Number(p.burst ?? 1),
      priority: Number(p.priority ?? 1),
      queue: Number(p.queue ?? 0),
    })),
    quantum: input?.quantum ?? 4,
    preemptive: Boolean(input?.preemptive),
    mlfqQuanta: Array.isArray(input?.mlfqQuanta)
      ? [Number(input.mlfqQuanta[0] ?? 8), Number(input.mlfqQuanta[1] ?? 16)]
      : [8, 16],
  };
}

function inputToDraft(input) {
  const safe = cloneInput(input);
  return {
    processes: safe.processes.map((p) => ({
      pid: p.pid,
      arrival: String(p.arrival),
      burst: String(p.burst),
      priority: String(p.priority),
      queue: String(p.queue),
    })),
    quantum: String(safe.quantum),
    preemptive: safe.preemptive,
    mlfqQ0: String(safe.mlfqQuanta[0]),
    mlfqQ1: String(safe.mlfqQuanta[1]),
  };
}

function parseStrictInt(raw) {
  const trimmed = String(raw ?? '').trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return null;
  return num;
}

function nextPidFor(processes) {
  const existing = new Set(processes.map((p) => p.pid));
  for (let i = 1; i <= 20; i += 1) {
    const candidate = `P${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `P${processes.length + 1}`;
}

function fmtMetric(val, suffix = '') {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const num = Number(val);
  const text = Number.isInteger(num) ? String(num) : Number(num.toFixed(2)).toString();
  return `${text}${suffix}`;
}

function resolvePresetKey(labelKey) {
  if (!labelKey) return '';
  return labelKey.startsWith('scheduling:')
    ? labelKey.slice('scheduling:'.length)
    : labelKey;
}

function validateAndParseDraft(draft, algoId, t) {
  if (!draft.processes || draft.processes.length === 0) {
    return { error: t('errors.minProcesses') };
  }
  if (draft.processes.length > MAX_PROCESSES) {
    return { error: t('errors.maxProcesses') };
  }

  const parsedProcs = [];
  for (const row of draft.processes) {
    const arrival = parseStrictInt(row.arrival);
    if (arrival === null || arrival < 0) {
      return { error: t('errors.invalidArrival', { pid: row.pid }) };
    }
    const burst = parseStrictInt(row.burst);
    if (burst === null || burst < 1 || burst > 100) {
      return { error: t('errors.invalidBurst', { pid: row.pid }) };
    }
    const priority = parseStrictInt(row.priority);
    if (priority === null || priority < 1) {
      return { error: t('errors.invalidPriority', { pid: row.pid }) };
    }
    const queue = parseStrictInt(row.queue);
    parsedProcs.push({
      pid: row.pid,
      arrival,
      burst,
      priority,
      queue: queue === 1 ? 1 : 0,
    });
  }

  let quantum;
  if (algoId === 'round-robin' || algoId === 'mlq') {
    const parsedQ = parseStrictInt(draft.quantum);
    if (parsedQ === null || parsedQ < 1 || parsedQ > 30) {
      return { error: t('errors.invalidQuantum') };
    }
    quantum = parsedQ;
  } else {
    const fallbackQ = parseStrictInt(draft.quantum);
    quantum = fallbackQ && fallbackQ >= 1 && fallbackQ <= 30 ? fallbackQ : 4;
  }

  let mlfqQuanta = [8, 16];
  if (algoId === 'mlfq') {
    const q0 = parseStrictInt(draft.mlfqQ0);
    const q1 = parseStrictInt(draft.mlfqQ1);
    if (q0 === null || q0 < 1 || q0 > 30 || q1 === null || q1 < 1 || q1 > 30) {
      return { error: t('errors.invalidMlfqQuanta') };
    }
    mlfqQuanta = [q0, q1];
  }

  return {
    input: {
      processes: parsedProcs,
      quantum,
      preemptive: Boolean(draft.preemptive),
      mlfqQuanta,
    },
  };
}

export default function CpuScheduling() {
  const { algo: urlAlgo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT('scheduling');
  const [lang, setLang] = useLang('js');

  const resolvedUrlAlgo = urlAlgo && SCHED_BY_ID[urlAlgo] ? urlAlgo : null;
  const [selectedAlgo, setSelectedAlgo] = useState(resolvedUrlAlgo ?? 'fcfs');
  const activeAlgoId = resolvedUrlAlgo ?? selectedAlgo;
  const algorithm = SCHED_BY_ID[activeAlgoId];

  const [lastAlgoId, setLastAlgoId] = useState(activeAlgoId);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [inputError, setInputError] = useState('');
  const [infoTab, setInfoTab] = useState('overview');
  const [showCode, setShowCode] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth >= 900 : true
  ));

  const [inputsByAlgo, setInputsByAlgo] = useState(() => (
    Object.fromEntries(
      SCHED_ALGORITHMS.map((a) => [a.id, cloneInput(a.getDefaultInput())]),
    )
  ));

  const [draftsByAlgo, setDraftsByAlgo] = useState(() => (
    Object.fromEntries(
      SCHED_ALGORITHMS.map((a) => [a.id, inputToDraft(a.getDefaultInput())]),
    )
  ));

  const [activePresetByAlgo, setActivePresetByAlgo] = useState(() => (
    Object.fromEntries(
      SCHED_ALGORITHMS.map((a) => [a.id, SCHEDULING_PRESETS?.[a.id]?.[0]?.id ?? null]),
    )
  ));

  if (activeAlgoId !== lastAlgoId) {
    setLastAlgoId(activeAlgoId);
    setStepIdx(0);
    setIsPlaying(false);
    setInputError('');
  }

  const activeInput = inputsByAlgo[activeAlgoId];
  const activeDraft = draftsByAlgo[activeAlgoId];
  const activePresets = SCHEDULING_PRESETS?.[activeAlgoId] ?? [];
  const activePresetId = activePresetByAlgo[activeAlgoId];

  const steps = useMemo(
    () => algorithm.generateSteps(activeInput),
    [algorithm, activeInput],
  );

  const safeIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIdx] ?? steps[0];
  const sched = currentStep?.sched;
  const metrics = sched?.metrics ?? {};
  const phaseKey = sched?.phase ?? 'init';

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return undefined;
    if (safeIdx >= steps.length - 1) {
      const stopId = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopId);
    }
    const delayMs = Math.max(130, 1150 - speed * 100);
    const id = setTimeout(() => {
      setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, delayMs);
    return () => clearTimeout(id);
  }, [isPlaying, safeIdx, steps.length, speed]);

  const handleSelectAlgo = useCallback((nextId) => {
    if (!SCHED_BY_ID[nextId]) return;
    setSelectedAlgo(nextId);
    setStepIdx(0);
    setIsPlaying(false);
    setInputError('');
    if (location.pathname.startsWith(SCHED_ROUTE_PREFIX)) {
      navigate(`${SCHED_ROUTE_PREFIX}/${nextId}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  const updateDraft = (updater) => {
    setDraftsByAlgo((prev) => ({
      ...prev,
      [activeAlgoId]: updater(prev[activeAlgoId]),
    }));
  };

  const handleProcessFieldChange = (rowIdx, field, value) => {
    setInputError('');
    updateDraft((draft) => ({
      ...draft,
      processes: draft.processes.map((row, idx) => (
        idx === rowIdx ? { ...row, [field]: value } : row
      )),
    }));
  };

  const handleAddProcess = () => {
    if (activeDraft.processes.length >= MAX_PROCESSES) return;
    setInputError('');
    updateDraft((draft) => ({
      ...draft,
      processes: [
        ...draft.processes,
        {
          pid: nextPidFor(draft.processes),
          arrival: '0',
          burst: '4',
          priority: String(draft.processes.length + 1),
          queue: '0',
        },
      ],
    }));
  };

  const handleRemoveProcess = (rowIdx) => {
    if (activeDraft.processes.length <= 1) return;
    setInputError('');
    updateDraft((draft) => ({
      ...draft,
      processes: draft.processes.filter((_, idx) => idx !== rowIdx),
    }));
  };

  const handleTogglePriorityMode = (nextPreemptive) => {
    const nextDraft = { ...activeDraft, preemptive: nextPreemptive };
    setDraftsByAlgo((prev) => ({ ...prev, [activeAlgoId]: nextDraft }));
    const result = validateAndParseDraft(nextDraft, activeAlgoId, t);
    if (!result.error) {
      setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: result.input }));
      setActivePresetByAlgo((prev) => ({ ...prev, [activeAlgoId]: null }));
      setStepIdx(0);
      setIsPlaying(false);
      setInputError('');
    }
  };

  const handleApplyWorkload = (event) => {
    event?.preventDefault();
    setInputError('');

    const parsed = validateAndParseDraft(activeDraft, activeAlgoId, t);
    if (parsed.error) {
      setInputError(parsed.error);
      return;
    }

    try {
      algorithm.generateSteps(parsed.input);
      setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: parsed.input }));
      setActivePresetByAlgo((prev) => ({ ...prev, [activeAlgoId]: null }));
      setStepIdx(0);
      setIsPlaying(false);
    } catch {
      setInputError(t('errors.applyFailed'));
    }
  };

  const handleLoadPreset = (preset) => {
    const cloned = cloneInput(preset.input);
    setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: cloned }));
    setDraftsByAlgo((prev) => ({ ...prev, [activeAlgoId]: inputToDraft(cloned) }));
    setActivePresetByAlgo((prev) => ({ ...prev, [activeAlgoId]: preset.id }));
    setInputError('');
    setStepIdx(0);
    setIsPlaying(false);
  };

  const handleResetDefault = () => {
    const def = cloneInput(algorithm.getDefaultInput());
    setInputsByAlgo((prev) => ({ ...prev, [activeAlgoId]: def }));
    setDraftsByAlgo((prev) => ({ ...prev, [activeAlgoId]: inputToDraft(def) }));
    setActivePresetByAlgo((prev) => ({
      ...prev,
      [activeAlgoId]: SCHEDULING_PRESETS?.[activeAlgoId]?.[0]?.id ?? null,
    }));
    setInputError('');
    setStepIdx(0);
    setIsPlaying(false);
  };

  const codeByLang = useMemo(() => {
    const raw = algorithm.codeSnippets ?? {};
    return Object.fromEntries(
      Object.entries(raw).map(([k, lines]) => [
        k,
        Array.isArray(lines) ? lines.join('\n') : String(lines),
      ]),
    );
  }, [algorithm]);

  const activeCodeLine = currentStep?.codeLines?.[lang] ?? currentStep?.codeLine ?? -1;
  const explanation = algorithm.explanation ?? {};
  const showPriorityCol = activeAlgoId === 'priority';
  const showQueueCol = activeAlgoId === 'mlq';

  const cpuDisplay = sched?.runningPid
    ? sched.runningPid
    : (phaseKey === 'idle' ? t('telemetry.idle') : t('telemetry.none'));

  return (
    <div className="sched-workbench animate-in">
      {/* ── Left Scrollable Control Rail ── */}
      <aside className="sched-controls-pane" aria-label={t('controls.workload')}>
        <header className="sched-pane-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        {/* 1. Algorithm Selector */}
        <section className="sched-control-section">
          <h2 className="sched-section-label">{t('controls.algorithm')}</h2>
          <div className="sched-algo-grid" role="tablist" aria-label={t('controls.algorithm')}>
            {SCHED_ALGORITHMS.map((algo) => {
              const isSelected = algo.id === activeAlgoId;
              return (
                <button
                  key={algo.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`sched-algo-btn${isSelected ? ' is-active' : ''}`}
                  onClick={() => handleSelectAlgo(algo.id)}
                  title={t(`algos.${algo.id}.fullName`)}
                >
                  <span className="sched-algo-btn-name">{t(`algos.${algo.id}.name`)}</span>
                  <span className="sched-algo-btn-sub">{t(`algos.${algo.id}.fullName`)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Lecture Presets */}
        {activePresets.length > 0 && (
          <section className="sched-control-section">
            <h2 className="sched-section-label">{t('controls.presets')}</h2>
            <div className="sched-preset-list">
              {activePresets.map((preset) => {
                const isSelected = activePresetId === preset.id;
                const key = resolvePresetKey(preset.labelKey);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`sched-preset-btn${isSelected ? ' is-active' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => handleLoadPreset(preset)}
                  >
                    {t(key, { defaultValue: preset.id })}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Algorithm-specific options + Process Table Form */}
        <section className="sched-control-section">
          <form className="sched-workload-form" onSubmit={handleApplyWorkload}>
            {(activeAlgoId === 'round-robin' || activeAlgoId === 'mlq') && (
              <div className="sched-option-block">
                <label className="sched-field">
                  <span>{t('controls.quantum')}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    className="ltr-keep"
                    value={activeDraft.quantum}
                    onChange={(e) => {
                      setInputError('');
                      updateDraft((d) => ({ ...d, quantum: e.target.value }));
                    }}
                  />
                  <small className="sched-field-hint">{t('controls.quantumHint')}</small>
                </label>
              </div>
            )}

            {activeAlgoId === 'mlfq' && (
              <div className="sched-option-block">
                <div className="sched-inline-fields">
                  <label className="sched-field">
                    <span>{t('controls.mlfqQ0')}</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      className="ltr-keep"
                      value={activeDraft.mlfqQ0}
                      onChange={(e) => {
                        setInputError('');
                        updateDraft((d) => ({ ...d, mlfqQ0: e.target.value }));
                      }}
                    />
                  </label>
                  <label className="sched-field">
                    <span>{t('controls.mlfqQ1')}</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      className="ltr-keep"
                      value={activeDraft.mlfqQ1}
                      onChange={(e) => {
                        setInputError('');
                        updateDraft((d) => ({ ...d, mlfqQ1: e.target.value }));
                      }}
                    />
                  </label>
                </div>
                <small className="sched-field-hint">{t('controls.mlfqQ2Note')}</small>
              </div>
            )}

            {activeAlgoId === 'priority' && (
              <div className="sched-option-block">
                <span className="sched-sub-label">{t('controls.priorityMode')}</span>
                <div className="sched-segmented" role="group" aria-label={t('controls.priorityMode')}>
                  <button
                    type="button"
                    aria-pressed={!activeDraft.preemptive}
                    className={`sched-seg-btn${!activeDraft.preemptive ? ' is-active' : ''}`}
                    onClick={() => handleTogglePriorityMode(false)}
                  >
                    {t('controls.nonPreemptive')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeDraft.preemptive}
                    className={`sched-seg-btn${activeDraft.preemptive ? ' is-active' : ''}`}
                    onClick={() => handleTogglePriorityMode(true)}
                  >
                    {t('controls.preemptive')}
                  </button>
                </div>
                <small className="sched-field-hint">{t('controls.priorityHint')}</small>
              </div>
            )}

            {/* Process Table Editor */}
            <div className="sched-section-row">
              <h2 className="sched-section-label">{t('controls.workload')}</h2>
              <span className="sched-step-badge ltr-keep">
                {t('controls.workloadCount', { count: activeDraft.processes.length })}
              </span>
            </div>

            <div className="sched-editor-table-wrap ltr-keep">
              <div
                className={`sched-editor-grid sched-editor-head${
                  showPriorityCol || showQueueCol ? ' has-extra' : ''
                }`}
              >
                <span>{t('controls.colPid')}</span>
                <span>{t('controls.colArrival')}</span>
                <span>{t('controls.colBurst')}</span>
                {showPriorityCol && <span>{t('controls.colPriority')}</span>}
                {showQueueCol && <span>{t('controls.colQueue')}</span>}
                <span aria-hidden="true" />
              </div>

              <div className="sched-editor-rows">
                {activeDraft.processes.map((row, idx) => (
                  <div
                    key={row.pid}
                    className={`sched-editor-grid sched-editor-row${
                      showPriorityCol || showQueueCol ? ' has-extra' : ''
                    }`}
                  >
                    <span className="sched-editor-pid">{row.pid}</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`${row.pid} ${t('table.arrival')}`}
                      value={row.arrival}
                      onChange={(e) => handleProcessFieldChange(idx, 'arrival', e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      aria-label={`${row.pid} ${t('table.burst')}`}
                      value={row.burst}
                      onChange={(e) => handleProcessFieldChange(idx, 'burst', e.target.value)}
                    />
                    {showPriorityCol && (
                      <input
                        type="number"
                        min={1}
                        step={1}
                        aria-label={`${row.pid} ${t('table.priority')}`}
                        value={row.priority}
                        onChange={(e) => handleProcessFieldChange(idx, 'priority', e.target.value)}
                      />
                    )}
                    {showQueueCol && (
                      <select
                        aria-label={`${row.pid} ${t('table.queue')}`}
                        value={row.queue}
                        onChange={(e) => handleProcessFieldChange(idx, 'queue', e.target.value)}
                      >
                        <option value="0">{t('controls.queueFg')}</option>
                        <option value="1">{t('controls.queueBg')}</option>
                      </select>
                    )}
                    <button
                      type="button"
                      className="sched-row-remove"
                      aria-label={t('controls.removeProcess', { pid: row.pid })}
                      aria-disabled={activeDraft.processes.length <= 1}
                      onClick={() => handleRemoveProcess(idx)}
                      title={t('controls.removeProcess', { pid: row.pid })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn sched-add-btn"
              aria-disabled={activeDraft.processes.length >= MAX_PROCESSES}
              onClick={handleAddProcess}
            >
              <Plus size={14} />
              {t('controls.addProcess')}
            </button>

            {inputError && (
              <p className="sched-error-msg" role="alert">{inputError}</p>
            )}

            <div className="sched-form-actions">
              <button type="submit" className="btn primary">
                {t('controls.applyWorkload')}
              </button>
              <button type="button" className="btn" onClick={handleResetDefault}>
                <RotateCcw size={14} />
                {t('controls.resetDefault')}
              </button>
            </div>
          </form>
        </section>

        {/* 4. Playback Controls */}
        <section className="sched-control-section">
          <div className="sched-section-row">
            <h2 className="sched-section-label">{t('controls.playback')}</h2>
            <span className="sched-step-badge ltr-keep">
              {t('controls.stepCounter', { current: safeIdx + 1, total: steps.length })}
            </span>
          </div>

          <div className="sched-playback-bar">
            <button
              type="button"
              className="btn sched-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx(0); }}
              aria-label={t('controls.restart')}
              title={t('controls.restart')}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="btn sched-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.max(0, p - 1)); }}
              aria-label={t('controls.stepBack')}
              aria-disabled={safeIdx <= 0}
              title={t('controls.stepBack')}
            >
              <SkipBack size={15} />
            </button>
            <button
              type="button"
              className="btn primary sched-play-btn"
              onClick={() => {
                if (safeIdx >= steps.length - 1) setStepIdx(0);
                setIsPlaying((p) => !p);
              }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? t('controls.pause') : t('controls.play')}
            </button>
            <button
              type="button"
              className="btn sched-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx((p) => Math.min(steps.length - 1, p + 1)); }}
              aria-label={t('controls.stepForward')}
              aria-disabled={safeIdx >= steps.length - 1}
              title={t('controls.stepForward')}
            >
              <SkipForward size={15} />
            </button>
            <button
              type="button"
              className="btn sched-icon-btn"
              onClick={() => { setIsPlaying(false); setStepIdx(Math.max(0, steps.length - 1)); }}
              aria-label={t('controls.jumpToEnd')}
              aria-disabled={safeIdx >= steps.length - 1}
              title={t('controls.jumpToEnd')}
            >
              <ChevronsRight size={15} />
            </button>
          </div>

          <div className="sched-scrubber-wrap">
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

          <label className="sched-speed-row">
            <span>{t('controls.speed')}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="sched-speed-val ltr-keep">{speed}×</span>
          </label>
        </section>
      </aside>

      {/* ── Right Workbench Stage ── */}
      <main className="sched-stage-pane">
        <div className="sched-stage-card">
          {/* 1. Flush Inline Telemetry Bar */}
          <div className="sched-telemetry-bar">
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.clock')}</span>
              <strong className="sched-telemetry-val sched-telemetry-val--accent ltr-keep">
                t = {sched?.time ?? 0}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.cpu')}</span>
              <strong className="sched-telemetry-val ltr-keep">{cpuDisplay}</strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.avgWaiting')}</span>
              <strong className="sched-telemetry-val sched-telemetry-val--emerald ltr-keep">
                {fmtMetric(metrics.avgWaiting)}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.avgTurnaround')}</span>
              <strong className="sched-telemetry-val ltr-keep">
                {fmtMetric(metrics.avgTurnaround)}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.avgResponse')}</span>
              <strong className="sched-telemetry-val ltr-keep">
                {fmtMetric(metrics.avgResponse)}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.cpuUtil')}</span>
              <strong className="sched-telemetry-val ltr-keep">
                {fmtMetric(metrics.cpuUtilization, '%')}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.throughput')}</span>
              <strong className="sched-telemetry-val ltr-keep">
                {fmtMetric(metrics.throughput)}
              </strong>
            </div>
            <div className="sched-telemetry-cell">
              <span className="sched-telemetry-key">{t('telemetry.contextSwitches')}</span>
              <strong className="sched-telemetry-val ltr-keep">
                {fmtMetric(metrics.contextSwitches)}
              </strong>
            </div>
          </div>

          {/* 2. Step Narration & Formula Bar */}
          <div className="sched-narration-bar">
            <div className="sched-narration-main">
              <span className={`sched-phase-pill sched-phase-pill--${phaseKey}`}>
                {t(`phases.${phaseKey}`, { defaultValue: phaseKey })}
              </span>
              <p className="sched-narration-text" aria-live="polite">
                {stepText(currentStep)}
              </p>
            </div>
            {sched?.formulaHint && (
              <code className="sched-formula-hint ltr-keep">{sched.formulaHint}</code>
            )}
          </div>

          {/* 3. Focal Element — Gantt Chart */}
          <GanttChartView
            gantt={sched?.gantt ?? []}
            runningPid={sched?.runningPid ?? null}
            currentTime={sched?.time ?? 0}
            algoId={activeAlgoId}
          />

          {/* 4. Live CPU & Ready Queue(s) */}
          <ReadyQueueView
            readyQueues={sched?.readyQueues ?? []}
            runningPid={sched?.runningPid ?? null}
            activeQueueLevel={sched?.activeQueueLevel ?? null}
            processes={sched?.processes ?? []}
            algoId={activeAlgoId}
            phase={phaseKey}
          />

          {/* 5. Per-Process Tracing Table */}
          <ProcessTraceTable
            processes={sched?.processes ?? []}
            highlightPid={sched?.highlightPid ?? null}
            runningPid={sched?.runningPid ?? null}
            metrics={metrics}
            algoId={activeAlgoId}
          />
        </div>

        {/* 6. Bottom Code Tracing + Explanation & Deterministic Evaluation Grid */}
        <div className="sched-bottom-grid">
          {/* Left: 5-Language Live Code Tracing (expanded by default on desktop) */}
          <div className="sched-code-column">
            <button
              type="button"
              className="sched-code-toggle"
              aria-expanded={showCode}
              onClick={() => setShowCode((v) => !v)}
            >
              <span className="sched-code-toggle-left">
                <Code2 size={16} />
                {showCode ? t('controls.hideCode') : t('controls.showCode')}
              </span>
              {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCode && (
              <div className="sched-code-pane">
                <CodePanel
                  codeByLang={codeByLang}
                  codeSnippet={codeByLang?.[lang] || ''}
                  activeLine={activeCodeLine}
                  lang={lang}
                  setLang={setLang}
                />
              </div>
            )}
          </div>

          {/* Right: Explanation + Complexity & Deterministic Evaluation */}
          <section className="sched-info-column" aria-label={t('panel.overviewTab')}>
            <div className="sched-info-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'overview'}
                className={`sched-info-tab${infoTab === 'overview' ? ' is-active' : ''}`}
                onClick={() => setInfoTab('overview')}
              >
                <BookOpen size={14} />
                {t('panel.overviewTab')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'compare'}
                className={`sched-info-tab${infoTab === 'compare' ? ' is-active' : ''}`}
                onClick={() => setInfoTab('compare')}
              >
                <BarChart3 size={14} />
                {t('panel.compareTab')}
              </button>
            </div>

            {infoTab === 'overview' ? (
              <div className="sched-overview-body">
                <div className="sched-explain-card">
                  <h3>{explanation.title || t(`algos.${activeAlgoId}.fullName`)}</h3>
                  <p className="sched-explain-summary">
                    {explanation.summary
                      || (explanation.body ? String(explanation.body).replace(/<[^>]*>/g, '') : t(`algos.${activeAlgoId}.shortDesc`))}
                  </p>

                  {Array.isArray(explanation.formulas) && explanation.formulas.length > 0 && (
                    <div className="sched-explain-block">
                      <h4>{t('panel.formulas')}</h4>
                      <div className="sched-formula-list ltr-keep">
                        {explanation.formulas.map((formula, idx) => (
                          <code key={idx} className="sched-formula-chip">{formula}</code>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(explanation.keyPoints) && explanation.keyPoints.length > 0 && (
                    <div className="sched-explain-block">
                      <h4>{t('panel.keyPoints')}</h4>
                      <ul className="sched-bullet-list">
                        {explanation.keyPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {((Array.isArray(explanation.pros) && explanation.pros.length > 0)
                    || (Array.isArray(explanation.cons) && explanation.cons.length > 0)) && (
                    <div className="sched-tradeoffs-grid">
                      {Array.isArray(explanation.pros) && explanation.pros.length > 0 && (
                        <div className="sched-tradeoff-col sched-tradeoff-col--pro">
                          <h4>
                            <CheckCircle2 size={13} aria-hidden="true" />
                            {t('panel.pros')}
                          </h4>
                          <ul>
                            {explanation.pros.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(explanation.cons) && explanation.cons.length > 0 && (
                        <div className="sched-tradeoff-col sched-tradeoff-col--con">
                          <h4>
                            <AlertTriangle size={13} aria-hidden="true" />
                            {t('panel.cons')}
                          </h4>
                          <ul>
                            {explanation.cons.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sched-complexity-wrap">
                  <ComplexityPanel complexity={algorithm.complexity} />
                </div>
              </div>
            ) : (
              <DeterministicEvalPanel
                processes={activeInput.processes}
                quantum={activeInput.quantum ?? 4}
                preemptive={Boolean(activeInput.preemptive)}
                activeAlgoId={activeAlgoId}
                onSelectAlgo={handleSelectAlgo}
                compareFn={compareSchedulersOnWorkload}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
