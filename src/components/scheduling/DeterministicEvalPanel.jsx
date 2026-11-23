import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { compareSchedulersOnWorkload } from '../../application/algorithms/scheduling';
import { useT } from '../../hooks/useT';

function fmtMetric(val, suffix = '') {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const num = Number(val);
  const text = Number.isInteger(num) ? String(num) : Number(num.toFixed(2)).toString();
  return `${text}${suffix}`;
}

export default function DeterministicEvalPanel({
  processes = [],
  quantum = 4,
  preemptive = false,
  activeAlgoId = 'fcfs',
  onSelectAlgo,
  compareFn = compareSchedulersOnWorkload,
}) {
  const t = useT('scheduling');

  const rows = useMemo(() => {
    if (!Array.isArray(processes) || processes.length === 0) return [];
    try {
      return compareFn(processes, { quantum, preemptive });
    } catch {
      return [];
    }
  }, [processes, quantum, preemptive, compareFn]);

  const minAvgWait = useMemo(() => {
    if (rows.length === 0) return null;
    const valid = rows
      .map((r) => Number(r.avgWaiting))
      .filter((n) => Number.isFinite(n));
    return valid.length > 0 ? Math.min(...valid) : null;
  }, [rows]);

  const prioModeLabel = preemptive ? t('controls.preemptive') : t('controls.nonPreemptive');

  return (
    <div className="sched-eval-panel">
      <div className="sched-eval-head">
        <h3>{t('eval.title')}</h3>
        <p>{t('eval.subtitle')}</p>
      </div>

      <div className="sched-table-scroll">
        <table className="sched-eval-table">
          <thead>
            <tr>
              <th scope="col">{t('eval.algorithm')}</th>
              <th scope="col" className="is-num">{t('eval.avgWaiting')}</th>
              <th scope="col" className="is-num">{t('eval.avgTurnaround')}</th>
              <th scope="col" className="is-num">{t('eval.avgResponse')}</th>
              <th scope="col" className="is-num">{t('eval.cpuUtil')}</th>
              <th scope="col" className="is-num">{t('eval.switches')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isBest = (
                minAvgWait !== null
                && Number.isFinite(Number(row.avgWaiting))
                && Math.abs(Number(row.avgWaiting) - minAvgWait) < 1e-6
              );
              const isCurrent = row.id === activeAlgoId;
              const algoName = t(`algos.${row.id}.name`, { defaultValue: row.id });

              return (
                <tr
                  key={row.id}
                  className={[
                    isBest ? 'is-best-row' : '',
                    isCurrent ? 'is-current-row' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <td>
                    <div className="sched-eval-algo-cell">
                      {onSelectAlgo ? (
                        <button
                          type="button"
                          className="sched-eval-algo-btn"
                          onClick={() => onSelectAlgo(row.id)}
                          aria-label={t('eval.switchAria', { name: algoName })}
                        >
                          {algoName}
                        </button>
                      ) : (
                        <strong>{algoName}</strong>
                      )}
                      {isCurrent && (
                        <span className="sched-eval-tag sched-eval-tag--current">
                          {t('eval.activeTag')}
                        </span>
                      )}
                      {isBest && (
                        <span className="sched-eval-tag sched-eval-tag--best">
                          <Award size={11} aria-hidden="true" />
                          {t('eval.lowestWait')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`is-num ltr-keep${isBest ? ' is-best-val' : ''}`}>
                    {fmtMetric(row.avgWaiting)}
                  </td>
                  <td className="is-num ltr-keep">{fmtMetric(row.avgTurnaround)}</td>
                  <td className="is-num ltr-keep">{fmtMetric(row.avgResponse)}</td>
                  <td className="is-num ltr-keep">{fmtMetric(row.cpuUtilization, '%')}</td>
                  <td className="is-num ltr-keep">{fmtMetric(row.contextSwitches)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="sched-eval-note">
        {t('eval.settingsNote', { quantum, mode: prioModeLabel })}
      </p>
    </div>
  );
}
