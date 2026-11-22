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
  runningPid = null,
  currentTime = 0,
  algoId = 'fcfs',
}) {
  const t = useT('scheduling');
  const showQueueBadge = algoId === 'mlq' || algoId === 'mlfq';

  const totalEnd = gantt.length > 0 ? gantt[gantt.length - 1].end : currentTime;

  return (
    <section className="sched-gantt-section" aria-label={t('gantt.ariaLabel')}>
      <div className="sched-section-head">
        <div>
          <h3 className="sched-section-title">{t('gantt.title')}</h3>
          <p className="sched-section-sub">{t('gantt.subtitle')}</p>
        </div>
        <span className="sched-span-badge ltr-keep">
          {t('gantt.totalSpan', { time: totalEnd })}
        </span>
      </div>

      {gantt.length === 0 ? (
        <div className="sched-gantt-empty ltr-keep">
          <span className="sched-gantt-origin">t = 0</span>
          <p>{t('gantt.empty')}</p>
        </div>
      ) : (
        <div className="sched-gantt-scroll ltr-keep">
          <div className="sched-gantt-track" role="list" aria-label={t('gantt.ariaLabel')}>
            {gantt.map((seg, idx) => {
              const duration = Math.max(1, seg.end - seg.start);
              const isIdle = !seg.pid || String(seg.pid).toUpperCase() === 'IDLE';
              const colorIdx = isIdle ? 0 : getProcColorIndex(seg.pid);
              const isLatestRunning = (
                idx === gantt.length - 1
                && !isIdle
                && runningPid === seg.pid
                && seg.end === currentTime
              );
              const prevEnd = idx > 0 ? gantt[idx - 1].end : null;
              const showStartTick = idx === 0 || (prevEnd !== null && prevEnd !== seg.start);
              const isLast = idx === gantt.length - 1;
              const minPx = Math.max(46, Math.min(140, duration * 16));
              const label = isIdle ? t('gantt.idleLabel') : seg.pid;

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
                      isLatestRunning ? 'is-running' : '',
                    ].filter(Boolean).join(' ')}
                    title={t('gantt.sliceTooltip', {
                      pid: label,
                      start: seg.start,
                      end: seg.end,
                      duration,
                    })}
                  >
                    <span className="sched-gantt-pid">{label}</span>
                    <span className="sched-gantt-meta">
                      {showQueueBadge && !isIdle && seg.queueLevel !== null && seg.queueLevel !== undefined
                        ? `Q${seg.queueLevel} · ${duration}`
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
    </section>
  );
}
