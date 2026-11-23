import { useT } from '../../hooks/useT';

function getProcColorIndex(pid) {
  if (!pid) return 1;
  const match = String(pid).match(/\d+/);
  if (match) {
    const num = Number(match[0]);
    if (Number.isInteger(num) && num >= 1) {
      return ((num - 1) % 8) + 1;
    }
  }
  let hash = 0;
  for (let i = 0; i < String(pid).length; i += 1) {
    hash = (hash * 31 + String(pid).charCodeAt(i)) % 8;
  }
  return hash + 1;
}

export default function GanttChartView({
  gantt = [],
  fullGantt = [],
  runningPid = null,
  currentTime = 0,
  algoId = 'fcfs',
  stepIdx = 0,
  totalSteps = 1,
  onScrub,
}) {
  const t = useT('scheduling');
  const showQueueBadge = algoId === 'mlq' || algoId === 'mlfq';

  const sourceGantt = fullGantt.length > 0 ? fullGantt : gantt;
  const fullEnd = sourceGantt.length > 0 ? sourceGantt[sourceGantt.length - 1].end : currentTime;
  const executedEnd = gantt.length > 0 ? gantt[gantt.length - 1].end : 0;

  return (
    <section className="sched-card sched-gantt-card" aria-label={t('gantt.ariaLabel')}>
      <div className="sched-card-head">
        <div>
          <h3 className="sched-card-title">{t('gantt.title')}</h3>
          <p className="sched-card-sub">{t('gantt.subtitle')}</p>
        </div>
        <div className="sched-gantt-badges ltr-keep">
          <span className="sched-span-badge">
            {t('gantt.progress', { current: Math.min(currentTime, fullEnd), total: fullEnd })}
          </span>
        </div>
      </div>

      {sourceGantt.length === 0 ? (
        <div className="sched-gantt-empty ltr-keep">
          <span className="sched-gantt-origin">t = 0</span>
          <p>{t('gantt.empty')}</p>
        </div>
      ) : (
        <div className="sched-gantt-scroll ltr-keep">
          <div className="sched-gantt-track" role="list" aria-label={t('gantt.ariaLabel')}>
            {sourceGantt.map((seg, idx) => {
              const duration = Math.max(1, seg.end - seg.start);
              const isIdle = !seg.pid || String(seg.pid).toUpperCase() === 'IDLE';
              const colorIdx = isIdle ? 0 : getProcColorIndex(seg.pid);

              // Compare against executed progress so the full chart stays visible from t = 0
              // while executed slices illuminate vividly and upcoming slices stay softly outlined.
              const isExecuted = seg.end <= executedEnd && gantt.length > 0;
              const isPartial = !isExecuted && seg.start < executedEnd && executedEnd < seg.end;
              const isUpcoming = !isExecuted && !isPartial;
              const isLatestRunning = (
                !isIdle
                && !isUpcoming
                && runningPid === seg.pid
                && seg.end === currentTime
              );

              const prevEnd = idx > 0 ? sourceGantt[idx - 1].end : null;
              const showStartTick = idx === 0 || (prevEnd !== null && prevEnd !== seg.start);
              const isLast = idx === sourceGantt.length - 1;
              const minPx = Math.max(48, Math.min(130, duration * 15));
              const label = isIdle ? t('gantt.idleLabel') : seg.pid;
              const fillPct = isPartial
                ? Math.round(((executedEnd - seg.start) / duration) * 100)
                : 100;

              return (
                <div
                  key={`${seg.pid}-${seg.start}-${seg.end}-${idx}`}
                  role="listitem"
                  className="sched-gantt-col"
                  style={{ flexGrow: duration, flexShrink: 0, flexBasis: `${minPx}px` }}
                >
                  <div
                    className={[
                      'sched-gantt-block',
                      isIdle ? 'is-idle' : `sched-proc-c${colorIdx}`,
                      isUpcoming ? 'is-upcoming' : '',
                      isLatestRunning ? 'is-running' : '',
                    ].filter(Boolean).join(' ')}
                    title={t('gantt.sliceTooltip', {
                      pid: label,
                      start: seg.start,
                      end: seg.end,
                      duration,
                    })}
                  >
                    {isPartial && (
                      <span
                        className="sched-gantt-partial-fill"
                        style={{ width: `${fillPct}%` }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="sched-gantt-pid">{label}</span>
                    <span className="sched-gantt-meta">
                      {showQueueBadge && !isIdle && seg.queueLevel !== null && seg.queueLevel !== undefined
                        ? `Q${seg.queueLevel} · ${duration}u`
                        : `${duration}u`}
                    </span>
                  </div>

                  <div className="sched-gantt-ticks" aria-hidden="true">
                    {showStartTick && (
                      <span className="sched-gantt-tick sched-gantt-tick--start">
                        {seg.start}
                      </span>
                    )}
                    <span
                      className={`sched-gantt-tick ${isLast ? 'sched-gantt-tick--last' : 'sched-gantt-tick--end'}`}
                    >
                      {seg.end}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {typeof onScrub === 'function' && totalSteps > 1 && (
        <div className="sched-gantt-scrubber">
          <input
            type="range"
            className="sched-scrubber-input"
            min={0}
            max={totalSteps - 1}
            value={stepIdx}
            aria-label={t('controls.playback')}
            onChange={(e) => onScrub(Number(e.target.value))}
          />
          <span className="sched-scrubber-hint ltr-keep">
            {t('controls.stepCounter', { current: stepIdx + 1, total: totalSteps })}
          </span>
        </div>
      )}
    </section>
  );
}
