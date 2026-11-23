import { useT } from '../../hooks/useT';

export default function IntervalTimelineView({ greedy }) {
  const t = useT('greedy');
  if (!greedy || greedy.kind !== 'activity') return null;

  const { items = [], activeIndex, accepted = [], rejected = [], metrics = {} } = greedy;
  const acceptedSet = new Set(accepted);
  const rejectedSet = new Set(rejected);
  const minTime = metrics.minTime ?? 0;
  const maxTime = metrics.maxTime ?? 10;
  const span = Math.max(1, maxTime - minTime);

  const tickCount = Math.min(10, Math.max(2, Math.round(span)));
  const ticks = Array.from({ length: tickCount + 1 }, (_, idx) => {
    const val = minTime + (span * idx) / tickCount;
    return Math.round(val * 10) / 10;
  });

  const lastEndPct = metrics.lastEnd !== null && metrics.lastEnd !== undefined
    ? ((metrics.lastEnd - minTime) / span) * 100
    : null;

  return (
    <div className="greedy-view-wrap">
      <div className="greedy-view-head">
        <h3>{t('views.activity.title')}</h3>
        <div className="greedy-legend">
          <span className="greedy-legend-item">
            <span className="greedy-dot greedy-dot--accepted" aria-hidden="true" />
            {t('views.activity.accepted')}
          </span>
          <span className="greedy-legend-item">
            <span className="greedy-dot greedy-dot--rejected" aria-hidden="true" />
            {t('views.activity.rejected')}
          </span>
          <span className="greedy-legend-item">
            <span className="greedy-dot greedy-dot--active" aria-hidden="true" />
            {t('views.activity.active')}
          </span>
        </div>
      </div>

      <div className="greedy-gantt-scroll ltr-keep" dir="ltr">
        <div className="greedy-gantt">
          <div className="greedy-gantt-rows">
            {items.map((act, idx) => {
              const leftPct = ((act.start - minTime) / span) * 100;
              const widthPct = Math.max(4, ((act.end - act.start) / span) * 100);
              const isAccepted = acceptedSet.has(idx);
              const isRejected = rejectedSet.has(idx);
              const isActive = idx === activeIndex;

              let statusClass = 'is-pending';
              let statusLabel = t('views.activity.statusPending');
              if (isAccepted) {
                statusClass = 'is-accepted';
                statusLabel = t('views.activity.statusAccepted');
              } else if (isRejected) {
                statusClass = 'is-rejected';
                statusLabel = t('views.activity.statusRejected');
              } else if (isActive) {
                statusClass = 'is-active';
                statusLabel = t('views.activity.statusActive');
              }

              return (
                <div
                  key={`${act.name}-${act.originalIndex}`}
                  className={`greedy-gantt-row${isActive ? ' is-row-active' : ''}`}
                >
                  <div className="greedy-gantt-label">
                    <span className="greedy-gantt-name">{act.name}</span>
                    <span className="greedy-gantt-range">[{act.start}, {act.end}]</span>
                  </div>

                  <div className="greedy-gantt-track">
                    {lastEndPct !== null && (
                      <div
                        className="greedy-gantt-cursor"
                        style={{ left: `${lastEndPct}%` }}
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`greedy-gantt-bar ${statusClass}${isActive ? ' is-current' : ''}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${act.name}: [${act.start}, ${act.end}] — ${statusLabel}`}
                    >
                      <span className="greedy-gantt-bar-text">{act.name}</span>
                    </div>
                  </div>

                  <span className={`greedy-status-pill ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="greedy-gantt-axis" aria-hidden="true">
            <div className="greedy-gantt-axis-spacer" />
            <div className="greedy-gantt-axis-ticks">
              {ticks.map((val, idx) => (
                <span key={`${val}-${idx}`} className="greedy-gantt-tick">{val}</span>
              ))}
            </div>
            <div className="greedy-gantt-axis-spacer-end" />
          </div>
        </div>
      </div>
    </div>
  );
}
