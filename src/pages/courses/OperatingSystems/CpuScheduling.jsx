import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Shuffle,
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import {
  FCFS,
  SJF,
  SRTF,
  PriorityScheduling,
  RoundRobin,
  MultilevelQueue,
  MultilevelFeedbackQueue,
  generateRandomWorkload,
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

const SCHEDULER_INSTANCES = [
  new FCFS(),
  new SJF(),
  new SRTF(),
  new PriorityScheduling(),
  new RoundRobin(),
  new MultilevelQueue(),
  new MultilevelFeedbackQueue(),
];

const SCHEDULER_BY_ID = Object.fromEntries(SCHEDULER_INSTANCES.map((s) => [s.id, s]));
const SCHEDULER_IDS = SCHEDULER_INSTANCES.map((s) => s.id);
const ROUTE_PREFIX = '/courses/operating-systems/cpu-scheduling';
const MAX_PROCESSES = 8;
const PROCESS_COUNTS = [3, 4, 5, 6, 7];

function cloneInput(input) {
  return {
    processes: (input.processes || []).map((p) => ({
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority ?? 1,
      queue: p.queue ?? 0,
    })),
    quantum: input.quantum ?? 4,
    preemptive: Boolean(input.preemptive),
    mlfqQuanta: Array.isArray(input.mlfqQuanta) ? [...input.mlfqQuanta] : [8, 16],
  };
}

function inputToDraft(input) {
  return {
    rows: (input.processes || []).map((p) => ({
      pid: p.pid,
      arrival: String(p.arrival ?? 0),
      burst: String(p.burst ?? 1),
      priority: String(p.priority ?? 1),
      queue: p.queue === 1 ? 1 : 0,
    })),
    quantum: String(input.quantum ?? 4),
    preemptive: Boolean(input.preemptive),
    mlfqQ0: String(input.mlfqQuanta?.[0] ?? 8),
    mlfqQ1: String(input.mlfqQuanta?.[1] ?? 16),
  };
}

function nextPid(rows) {
  let maxNum = 0;
  for (const row of rows) {
    const match = String(row.pid || '').match(/\d+/);
    if (match) {
      const n = Number(match[0]);
      if (Number.isFinite(n) && n > maxNum) maxNum = n;
    }
  }
  return `P${maxNum + 1}`;
}

function parseStrictInt(raw) {
  const trimmed = String(raw ?? '').trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return null;
  return num;
}

function formatMetric(value, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  const rounded = Number.isInteger(num) ? String(num) : num.toFixed(2);
  return `${rounded}${suffix}`;
}

function buildInitialInputs() {
  return Object.fromEntries(
    SCHEDULER_INSTANCES.map((s) => [s.id, cloneInput(s.getDefaultInput())]),
  );
}

function buildInitialDrafts(inputs) {
  return Object.fromEntries(
    SCHEDULER_IDS.map((id) => [id, inputToDraft(inputs[id])]),
  );
}

export default function CpuScheduling() {
  const { algo: urlAlgo } = useParams();
  const navigate = useNavigate();
  const t = useT('scheduling');
  const [lang, setLang] = useLang('js');

  const resolvedUrlAlgo = urlAlgo && SCHEDULER_BY_ID[urlAlgo] ? urlAlgo : null;
  const [selectedAlgo, setSelectedAlgo] = useState(resolvedUrlAlgo ?? 'fcfs');
  const activeAlgoId = resolvedUrlAlgo ?? selectedAlgo;
  const scheduler = SCHEDULER_BY_ID[activeAlgoId];

  const [inputsByAlgo, setInputsByAlgo] = useState(buildInitialInputs);
  const [draftsByAlgo, setDraftsByAlgo] = useState(() => buildInitialDrafts(buildInitialInputs()));
  const [processCount, setProcessCount] = useState(4);
  const [showEditor, setShowEditor] = useState(false);
  const [inputError, setInputError] = useState('');

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [infoTab, setInfoTab] = useState('overview');

  const activeInput = inputsByAlgo[activeAlgoId];
  const activeDraft = draftsByAlgo[activeAlgoId];

  const steps = useMemo(
    () => scheduler.generateSteps(activeInput),
    [scheduler, activeInput],
  );

  const safeStepIdx = Math.min(Math.max(0, stepIdx), Math.max(0, steps.length - 1));
  const activeStep = steps[safeStepIdx] ?? steps[0] ?? null;
  const finalStep = steps[steps.length - 1] ?? activeStep;
  const sched = activeStep?.sched ?? null;
  const fullGantt = finalStep?.sched?.gantt ?? [];

  const prevAlgoRef = useRef(activeAlgoId);
  useEffect(() => {
    if (prevAlgoRef.current !== activeAlgoId) {
      prevAlgoRef.current = activeAlgoId;
      setStepIdx(0);
      setIsPlaying(false);
      setInputError('');
    }
  }, [activeAlgoId]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (safeStepIdx >= steps.length - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- stop playback when trace ends
      setIsPlaying(false);
      return undefined;
    }
    const delayMs = Math.max(120, Math.round(1350 - speed * 115));
    const timer = setTimeout(() => {
      setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isPlaying, safeStepIdx, steps.length, speed]);

  const handleSelectAlgo = useCallback((nextId) => {
    if (!SCHEDULER_BY_ID[nextId]) return;
    setIsPlaying(false);
    setStepIdx(0);
    setInputError('');
    setSelectedAlgo(nextId);
    navigate(`${ROUTE_PREFIX}/${nextId}`);
  }, [navigate]);

  const commitInput = useCallback((algoId, nextInput) => {
    const clean = cloneInput(nextInput);
    setInputsByAlgo((prev) => ({ ...prev, [algoId]: clean }));
    setDraftsByAlgo((prev) => ({ ...prev, [algoId]: inputToDraft(clean) }));
    setStepIdx(0);
    setIsPlaying(false);
    setInputError('');
  }, []);

  const handleGenerateRandom = useCallback((countOverride) => {
    const targetCount = countOverride ?? processCount;
    const generated = generateRandomWorkload(activeAlgoId, targetCount, {
      quantum: activeInput.quantum,
      preemptive: activeInput.preemptive,
      mlfqQuanta: activeInput.mlfqQuanta,
    });
    commitInput(activeAlgoId, generated);
  }, [activeAlgoId, activeInput.mlfqQuanta, activeInput.preemptive, activeInput.quantum, commitInput, processCount]);

  const handleProcessCountChange = (nextCount) => {
    setProcessCount(nextCount);
    handleGenerateRandom(nextCount);
  };

  const handleInlineQuantumChange = (raw) => {
    updateDraft((d) => ({ ...d, quantum: raw }));
    const parsed = parseStrictInt(raw);
    if (parsed !== null && parsed >= 1 && parsed <= 30) {
      setInputsByAlgo((prev) => ({
        ...prev,
        [activeAlgoId]: { ...prev[activeAlgoId], quantum: parsed },
      }));
      setStepIdx(0);
      setIsPlaying(false);
      setInputError('');
    }
  };

  const handleInlineMlfqChange = (which, raw) => {
    updateDraft((d) => ({ ...d, [which]: raw }));
    const q0 = parseStrictInt(which === 'mlfqQ0' ? raw : activeDraft.mlfqQ0);
    const q1 = parseStrictInt(which === 'mlfqQ1' ? raw : activeDraft.mlfqQ1);
    if (q0 !== null && q1 !== null && q0 >= 1 && q0 <= 30 && q1 >= 1 && q1 <= 30) {
      setInputsByAlgo((prev) => ({
        ...prev,
        [activeAlgoId]: { ...prev[activeAlgoId], mlfqQuanta: [q0, q1] },
      }));
      setStepIdx(0);
      setIsPlaying(false);
      setInputError('');
    }
  };

  const handleTogglePreemptive = (isPreemptive) => {
    const next = { ...activeInput, preemptive: isPreemptive };
    commitInput(activeAlgoId, next);
  };

  const updateDraft = (updater) => {
    setDraftsByAlgo((prev) => ({
      ...prev,
      [activeAlgoId]: updater(prev[activeAlgoId]),
    }));
    setInputError('');
  };

  const handleRowFieldChange = (rowIdx, field, value) => {
    updateDraft((draft) => ({
      ...draft,
      rows: draft.rows.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r)),
    }));
  };

  const handleAddProcess = () => {
    if (activeDraft.rows.length >= MAX_PROCESSES) {
      setInputError(t('errors.maxProcesses'));
      return;
    }
    const lastArrival = parseStrictInt(activeDraft.rows[activeDraft.rows.length - 1]?.arrival) ?? 0;
    const newRow = {
      pid: nextPid(activeDraft.rows),
      arrival: String(lastArrival + 1),
      burst: '4',
      priority: String(Math.min(5, activeDraft.rows.length + 1)),
      queue: activeDraft.rows.length % 2,
    };
    updateDraft((draft) => ({
      ...draft,
      rows: [...draft.rows, newRow],
    }));
  };

  const handleRemoveProcess = (rowIdx) => {
    if (activeDraft.rows.length <= 1) {
      setInputError(t('errors.minProcesses'));
      return;
    }
    updateDraft((draft) => ({
      ...draft,
      rows: draft.rows.filter((_, i) => i !== rowIdx),
    }));
  };

  const handleApplyWorkload = (event) => {
    event?.preventDefault();
    const { rows, quantum: qRaw, preemptive, mlfqQ0, mlfqQ1 } = activeDraft;
    if (!rows || rows.length < 1) {
      setInputError(t('errors.minProcesses'));
      return;
    }
    if (rows.length > MAX_PROCESSES) {
      setInputError(t('errors.maxProcesses'));
      return;
    }

    const parsedProcesses = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const pid = (row.pid || `P${i + 1}`).trim() || `P${i + 1}`;
      const arrival = parseStrictInt(row.arrival);
      if (arrival === null || arrival < 0) {
        setInputError(t('errors.invalidArrival', { pid }));
        return;
      }
      const burst = parseStrictInt(row.burst);
      if (burst === null || burst < 1 || burst > 100) {
        setInputError(t('errors.invalidBurst', { pid }));
        return;
      }
      const priority = activeAlgoId === 'priority' ? parseStrictInt(row.priority) : (parseStrictInt(row.priority) ?? 1);
      if (priority === null || priority < 1) {
        setInputError(t('errors.invalidPriority', { pid }));
        return;
      }
      const queue = row.queue === 1 ? 1 : 0;
      parsedProcesses.push({ pid, arrival, burst, priority, queue });
    }

    let quantum = activeInput.quantum ?? 4;
    if (activeAlgoId === 'round-robin' || activeAlgoId === 'mlq') {
      const q = parseStrictInt(qRaw);
      if (q === null || q < 1 || q > 30) {
        setInputError(t('errors.invalidQuantum'));
        return;
      }
      quantum = q;
    }

    let mlfqQuanta = activeInput.mlfqQuanta ?? [8, 16];
    if (activeAlgoId === 'mlfq') {
      const q0 = parseStrictInt(mlfqQ0);
      const q1 = parseStrictInt(mlfqQ1);
      if (q0 === null || q1 === null || q0 < 1 || q0 > 30 || q1 < 1 || q1 > 30) {
        setInputError(t('errors.invalidMlfqQuanta'));
        return;
      }
      mlfqQuanta = [q0, q1];
    }

    commitInput(activeAlgoId, {
      processes: parsedProcesses,
      quantum,
      preemptive: activeAlgoId === 'priority' ? Boolean(preemptive) : false,
      mlfqQuanta,
    });
  };

  const handlePlayPause = () => {
    if (safeStepIdx >= steps.length - 1) {
      setStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setStepIdx(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setStepIdx(Math.max(0, steps.length - 1));
  };

  const handleScrub = (idx) => {
    setIsPlaying(false);
    setStepIdx(idx);
  };

  const codeByLang = useMemo(() => {
    if (!scheduler.codeSnippets) return null;
    return Object.fromEntries(
      Object.entries(scheduler.codeSnippets).map(([key, lines]) => [key, lines.join('\n')]),
    );
  }, [scheduler]);

  const activeLine = activeStep?.codeLines?.[lang] ?? activeStep?.codeLine ?? -1;
  const metrics = sched?.metrics ?? {
    avgWaiting: 0,
    avgTurnaround: 0,
    avgResponse: 0,
    cpuUtilization: 0,
    throughput: 0,
    contextSwitches: 0,
    totalTime: 0,
    busyTime: 0,
  };
  const explanation = scheduler.explanation;
  const narration = activeStep ? stepText(activeStep) : '';
  const phaseKey = sched?.phase ?? 'init';

  const showPriorityCol = activeAlgoId === 'priority';
  const showQueueCol = activeAlgoId === 'mlq';

  return (
    <div className="sched-page">
      {/* Header matching Sorting page rhythm */}
      <header className="sched-header">
        <div className="sched-header-title">
          <h2>{t(`algos.${activeAlgoId}.fullName`)}</h2>
          <span className="sched-header-desc">{t(`algos.${activeAlgoId}.shortDesc`)}</span>
        </div>

        <div className="sched-header-narration" aria-live="polite" aria-atomic="true">
          <span className={`sched-phase-pill sched-phase-pill--${phaseKey}`}>
            {t(`phases.${phaseKey}`)}
          </span>
          <span className="sched-narration-text">{narration}</span>
          {sched?.formulaHint && (
            <code className="sched-formula-chip ltr-keep">{sched.formulaHint}</code>
          )}
        </div>
      </header>

      {/* Single Clean Horizontal Control Bar (no second sidebar!) */}
      <section className="sched-toolbar" aria-label={t('controls.algorithm')}>
        {/* Row 1: 7 Scheduler Tabs */}
        <div className="sched-algo-tabs" role="tablist" aria-label={t('controls.algorithm')}>
          {SCHEDULER_IDS.map((id) => {
            const isActive = id === activeAlgoId;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`sched-algo-tab${isActive ? ' is-active' : ''}`}
                onClick={() => handleSelectAlgo(id)}
              >
                {t(`algos.${id}.name`)}
              </button>
            );
          })}
        </div>

        {/* Row 2: Playback + Random + Inline Options + Edit Processes */}
        <div className="sched-toolbar-controls">
          <div className="sched-ctrl-cluster">
            <button
              type="button"
              className="sched-icon-btn"
              onClick={handleRestart}
              aria-label={t('controls.restart')}
              title={t('controls.restart')}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="sched-icon-btn"
              onClick={handleStepBack}
              aria-disabled={safeStepIdx <= 0}
              aria-label={t('controls.stepBack')}
              title={t('controls.stepBack')}
            >
              <SkipBack size={15} />
            </button>
            <button
              type="button"
              className="sched-btn sched-btn--primary"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? t('controls.pause') : t('controls.play')}</span>
            </button>
            <button
              type="button"
              className="sched-icon-btn"
              onClick={handleStepForward}
              aria-disabled={safeStepIdx >= steps.length - 1}
              aria-label={t('controls.stepForward')}
              title={t('controls.stepForward')}
            >
              <SkipForward size={15} />
            </button>
            <button
              type="button"
              className="sched-icon-btn"
              onClick={handleJumpToEnd}
              aria-disabled={safeStepIdx >= steps.length - 1}
              aria-label={t('controls.jumpToEnd')}
              title={t('controls.jumpToEnd')}
            >
              <FastForward size={15} />
            </button>

            <label className="sched-speed-inline">
              <span>{t('controls.speed')}</span>
              <input
                type="range"
                min={1}
                max={10}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span className="ltr-keep">{speed}x</span>
            </label>
          </div>

          <div className="sched-ctrl-divider" aria-hidden="true" />

          <div className="sched-ctrl-cluster">
            <button
              type="button"
              className="sched-btn sched-btn--accent"
              onClick={() => handleGenerateRandom()}
            >
              <Shuffle size={15} />
              <span>{t('controls.generateRandom')}</span>
            </button>

            <label className="sched-inline-field">
              <span>{t('controls.processCount')}</span>
              <select
                className="sched-select"
                value={processCount}
                onChange={(e) => handleProcessCountChange(Number(e.target.value))}
              >
                {PROCESS_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt}>{cnt}</option>
                ))}
              </select>
            </label>

            {(activeAlgoId === 'round-robin' || activeAlgoId === 'mlq') && (
              <label className="sched-inline-field">
                <span>{t('controls.quantum')}</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  className="sched-num-input ltr-keep"
                  value={activeDraft.quantum}
                  onChange={(e) => handleInlineQuantumChange(e.target.value)}
                />
              </label>
            )}

            {activeAlgoId === 'mlfq' && (
              <>
                <label className="sched-inline-field">
                  <span>{t('controls.mlfqQ0')}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    className="sched-num-input ltr-keep"
                    value={activeDraft.mlfqQ0}
                    onChange={(e) => handleInlineMlfqChange('mlfqQ0', e.target.value)}
                  />
                </label>
                <label className="sched-inline-field">
                  <span>{t('controls.mlfqQ1')}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    className="sched-num-input ltr-keep"
                    value={activeDraft.mlfqQ1}
                    onChange={(e) => handleInlineMlfqChange('mlfqQ1', e.target.value)}
                  />
                </label>
              </>
            )}

            {activeAlgoId === 'priority' && (
              <div className="sched-seg-inline" role="group" aria-label={t('controls.priorityMode')}>
                <button
                  type="button"
                  className={`sched-seg-btn${!activeInput.preemptive ? ' is-active' : ''}`}
                  aria-pressed={!activeInput.preemptive}
                  onClick={() => handleTogglePreemptive(false)}
                >
                  {t('controls.nonPreemptive')}
                </button>
                <button
                  type="button"
                  className={`sched-seg-btn${activeInput.preemptive ? ' is-active' : ''}`}
                  aria-pressed={Boolean(activeInput.preemptive)}
                  onClick={() => handleTogglePreemptive(true)}
                >
                  {t('controls.preemptive')}
                </button>
              </div>
            )}

            <button
              type="button"
              className={`sched-btn${showEditor ? ' is-active' : ''}`}
              aria-expanded={showEditor}
              onClick={() => setShowEditor((prev) => !prev)}
            >
              {showEditor ? <X size={15} /> : <SlidersHorizontal size={15} />}
              <span>{showEditor ? t('controls.closeEditor') : t('controls.editWorkload')}</span>
            </button>
          </div>
        </div>

        {/* Optional Collapsible Custom Process Editor */}
        {showEditor && (
          <form className="sched-editor-drawer" onSubmit={handleApplyWorkload} noValidate>
            <div className="sched-editor-head">
              <strong>{t('controls.workload')}</strong>
              <span className="sched-editor-count ltr-keep">
                {t('controls.workloadCount', { count: activeDraft.rows.length })}
              </span>
              {activeAlgoId === 'priority' && (
                <span className="sched-editor-note">{t('controls.priorityHint')}</span>
              )}
              {activeAlgoId === 'mlfq' && (
                <span className="sched-editor-note">{t('controls.mlfqQ2Note')}</span>
              )}
            </div>

            <div className="sched-editor-chips ltr-keep">
              {activeDraft.rows.map((row, idx) => (
                <div key={`${row.pid}-${idx}`} className="sched-editor-card">
                  <div className="sched-editor-card-top">
                    <span className="sched-editor-pid">{row.pid}</span>
                    <button
                      type="button"
                      className="sched-row-remove"
                      onClick={() => handleRemoveProcess(idx)}
                      aria-label={t('controls.removeProcess', { pid: row.pid })}
                      aria-disabled={activeDraft.rows.length <= 1}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="sched-editor-fields">
                    <label>
                      <span>{t('controls.colArrival')}</span>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        step={1}
                        className="sched-cell-input"
                        value={row.arrival}
                        onChange={(e) => handleRowFieldChange(idx, 'arrival', e.target.value)}
                      />
                    </label>
                    <label>
                      <span>{t('controls.colBurst')}</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        className="sched-cell-input"
                        value={row.burst}
                        onChange={(e) => handleRowFieldChange(idx, 'burst', e.target.value)}
                      />
                    </label>
                    {showPriorityCol && (
                      <label>
                        <span>{t('controls.colPriority')}</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          step={1}
                          className="sched-cell-input"
                          value={row.priority}
                          onChange={(e) => handleRowFieldChange(idx, 'priority', e.target.value)}
                        />
                      </label>
                    )}
                    {showQueueCol && (
                      <label>
                        <span>{t('controls.colQueue')}</span>
                        <select
                          className="sched-cell-input"
                          value={row.queue}
                          onChange={(e) => handleRowFieldChange(idx, 'queue', Number(e.target.value))}
                        >
                          <option value={0}>{t('controls.queueFg')}</option>
                          <option value={1}>{t('controls.queueBg')}</option>
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {inputError && (
              <p className="sched-error-msg" role="alert">{inputError}</p>
            )}

            <div className="sched-editor-footer">
              <button
                type="button"
                className="sched-btn"
                onClick={handleAddProcess}
                aria-disabled={activeDraft.rows.length >= MAX_PROCESSES}
              >
                <Plus size={14} />
                <span>{t('controls.addProcess')}</span>
              </button>
              <button type="submit" className="sched-btn sched-btn--primary">
                {t('controls.applyWorkload')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Main Two-Column Split — Left Hero Visualizations, Right Independent Side Panel */}
      <div className="sched-workspace">
        {/* LEFT COLUMN: Telemetry + Gantt Chart + Ready Queues + Process Trace Table */}
        <main className="sched-viz-col">
          {/* Compact Inline Telemetry Strip */}
          <div className="sched-telemetry-bar" aria-label={t('title')}>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.clock')}</span>
              <strong className="sched-metric-value ltr-keep">t = {sched?.time ?? 0}</strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.cpu')}</span>
              <strong className={`sched-metric-value ltr-keep${sched?.runningPid ? ' is-accent' : ''}`}>
                {sched?.runningPid ?? (phaseKey === 'idle' ? t('telemetry.idle') : t('telemetry.none'))}
              </strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.avgWaiting')}</span>
              <strong className="sched-metric-value is-good ltr-keep">
                {formatMetric(metrics.avgWaiting)}
              </strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.avgTurnaround')}</span>
              <strong className="sched-metric-value ltr-keep">
                {formatMetric(metrics.avgTurnaround)}
              </strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.avgResponse')}</span>
              <strong className="sched-metric-value ltr-keep">
                {formatMetric(metrics.avgResponse)}
              </strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.cpuUtil')}</span>
              <strong className="sched-metric-value ltr-keep">
                {formatMetric(metrics.cpuUtilization, '%')}
              </strong>
            </div>
            <div className="sched-metric">
              <span className="sched-metric-label">{t('telemetry.contextSwitches')}</span>
              <strong className="sched-metric-value ltr-keep">
                {metrics.contextSwitches}
              </strong>
            </div>
          </div>

          {/* Hero Gantt Chart — Always Visible From t = 0 */}
          <GanttChartView
            gantt={sched?.gantt ?? []}
            fullGantt={fullGantt}
            runningPid={sched?.runningPid ?? null}
            currentTime={sched?.time ?? 0}
            algoId={activeAlgoId}
            stepIdx={safeStepIdx}
            totalSteps={steps.length}
            onScrub={handleScrub}
          />

          {/* Active CPU & Ready Queue(s) */}
          <ReadyQueueView
            runningPid={sched?.runningPid ?? null}
            activeQueueLevel={sched?.activeQueueLevel ?? null}
            readyQueues={sched?.readyQueues ?? []}
            processes={sched?.processes ?? []}
            phase={phaseKey}
            algoId={activeAlgoId}
          />

          {/* Per-Process Trace Table */}
          <ProcessTraceTable
            processes={sched?.processes ?? []}
            highlightPid={sched?.highlightPid ?? null}
            runningPid={sched?.runningPid ?? null}
            metrics={metrics}
            algoId={activeAlgoId}
          />
        </main>

        {/* RIGHT COLUMN: Code Tracing + Independent Overview/Compare Tabs */}
        <aside className="sched-side-col">
          <div className="sched-code-card">
            <CodePanel
              codeByLang={codeByLang}
              codeSnippet={codeByLang?.[lang] || ''}
              activeLine={activeLine}
              lang={lang}
              setLang={setLang}
            />
          </div>

          <section className="sched-card sched-info-card">
            <div className="sched-info-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'overview'}
                className={`sched-info-tab${infoTab === 'overview' ? ' is-active' : ''}`}
                onClick={() => setInfoTab('overview')}
              >
                <BookOpen size={14} />
                <span>{t('panel.overviewTab')}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'compare'}
                className={`sched-info-tab${infoTab === 'compare' ? ' is-active' : ''}`}
                onClick={() => setInfoTab('compare')}
              >
                <BarChart3 size={14} />
                <span>{t('panel.compareTab')}</span>
              </button>
            </div>

            {infoTab === 'overview' ? (
              <div className="sched-overview-body">
                {explanation && (
                  <>
                    <p className="sched-overview-summary">{explanation.summary}</p>

                    {explanation.formulas?.length > 0 && (
                      <div className="sched-overview-block">
                        <h4>{t('panel.formulas')}</h4>
                        <div className="sched-formula-list ltr-keep">
                          {explanation.formulas.map((f) => (
                            <code key={f} className="sched-formula-item">{f}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    {explanation.keyPoints?.length > 0 && (
                      <div className="sched-overview-block">
                        <h4>{t('panel.keyPoints')}</h4>
                        <ul className="sched-overview-list">
                          {explanation.keyPoints.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(explanation.pros?.length > 0 || explanation.cons?.length > 0) && (
                      <div className="sched-procon-grid">
                        {explanation.pros?.length > 0 && (
                          <div className="sched-procon-col sched-procon-col--pro">
                            <h4>{t('panel.pros')}</h4>
                            <ul>
                              {explanation.pros.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {explanation.cons?.length > 0 && (
                          <div className="sched-procon-col sched-procon-col--con">
                            <h4>{t('panel.cons')}</h4>
                            <ul>
                              {explanation.cons.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="sched-complexity-wrap">
                  <ComplexityPanel complexity={scheduler.complexity} algoId={activeAlgoId} />
                </div>
              </div>
            ) : (
              <DeterministicEvalPanel
                processes={activeInput.processes}
                quantum={activeInput.quantum ?? 4}
                preemptive={Boolean(activeInput.preemptive)}
                activeAlgoId={activeAlgoId}
                onSelectAlgo={handleSelectAlgo}
              />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
