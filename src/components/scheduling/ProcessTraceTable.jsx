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

function fmtNum(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const num = Number(val);
  return Number.isInteger(num) ? String(num) : Number(num.toFixed(2)).toString();
}

function normalizeState(rawState) {
  const s = String(rawState ?? 'new').toLowerCase();
  if (s === 'completed' || s === 'finished') return 'done';
  if (s === 'running' || s === 'ready' || s === 'done' || s === 'new') return s;
  return 'new';
}

export default function ProcessTraceTable({
  processes = [],
  highlightPid = null,
  runningPid = null,
  metrics = null,
  algoId = 'fcfs',
}) {
  const t = useT('scheduling');
  const showPriority = algoId === 'priority';
  const showQueue = algoId === 'mlq' || algoId === 'mlfq';

  const hasCompleted = processes.some((p) => normalizeState(p.state) === 'done');
  const leadingColsCount = 3 + (showPriority ? 1 : 0) + (showQueue ? 1 : 0) + 3;

  return (
    <section className="sched-table-section" aria-label={t('table.title')}>
      <div className="sched-section-head">
        <h3 className="sched-section-title">{t('table.title')}</h3>
      </div>

      <div className="sched-table-scroll">
        <table className="sched-trace-table">
          <thead>
            <tr>
              <th scope="col">{t('table.pid')}</th>
              <th scope="col" className="is-num">{t('table.arrival')}</th>
              <th scope="col" className="is-num">{t('table.burst')}</th>
              {showPriority && <th scope="col" className="is-num">{t('table.priority')}</th>}
              {showQueue && <th scope="col" className="is-num">{t('table.queue')}</th>}
              <th scope="col" className="is-num">{t('table.remaining')}</th>
              <th scope="col" className="is-num">{t('table.start')}</th>
              <th scope="col" className="is-num">{t('table.finish')}</th>
              <th scope="col" className="is-num">{t('table.turnaround')}</th>
              <th scope="col" className="is-num">{t('table.waiting')}</th>
              <th scope="col" className="is-num">{t('table.response')}</th>
              <th scope="col">{t('table.state')}</th>
            </tr>
          </thead>

          <tbody>
            {processes.map((proc) => {
              const stateKey = normalizeState(proc.state);
              const isHighlighted = proc.pid === highlightPid || proc.pid === runningPid;
              const colorIdx = getProcColorIndex(proc.pid);

              return (
                <tr
                  key={proc.pid}
                  className={isHighlighted ? 'is-row-active' : undefined}
                >
                  <td>
                    <span className={`sched-table-pid ltr-keep sched-proc-c${colorIdx}`}>
                      <span className="sched-pid-dot" aria-hidden="true" />
                      <strong>{proc.pid}</strong>
                    </span>
                  </td>
                  <td className="is-num ltr-keep">{fmtNum(proc.arrival)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.burst)}</td>
                  {showPriority && (
                    <td className="is-num ltr-keep">{fmtNum(proc.priority)}</td>
                  )}
                  {showQueue && (
                    <td className="is-num ltr-keep">
                      {proc.queue !== null && proc.queue !== undefined ? `Q${proc.queue}` : '—'}
                    </td>
                  )}
                  <td className="is-num ltr-keep">{fmtNum(proc.remaining)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.startTime)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.finishTime)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.turnaround)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.waiting)}</td>
                  <td className="is-num ltr-keep">{fmtNum(proc.response)}</td>
                  <td>
                    <span className={`sched-state-pill sched-state-pill--${stateKey}`}>
                      {t(`table.states.${stateKey}`)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {metrics && hasCompleted && (
            <tfoot>
              <tr>
                <th scope="row" colSpan={leadingColsCount} className="sched-tfoot-label">
                  {t('table.averages')}
                </th>
                <td className="is-num ltr-keep">{fmtNum(metrics.avgTurnaround)}</td>
                <td className="is-num ltr-keep is-emphasis">{fmtNum(metrics.avgWaiting)}</td>
                <td className="is-num ltr-keep">{fmtNum(metrics.avgResponse)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
