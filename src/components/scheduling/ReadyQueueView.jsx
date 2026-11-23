import { Cpu, ArrowDown } from 'lucide-react';
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

export default function ReadyQueueView({
  readyQueues = [],
  runningPid = null,
  activeQueueLevel = null,
  processes = [],
  algoId = 'fcfs',
  phase = 'init',
}) {
  const t = useT('scheduling');
  const procByPid = Object.fromEntries(processes.map((p) => [p.pid, p]));
  const runningProc = runningPid ? procByPid[runningPid] : null;
  const showPriority = algoId === 'priority';
  const isMultiQueue = algoId === 'mlq' || algoId === 'mlfq';

  const normalizedQueues = readyQueues.length > 0
    ? readyQueues
    : [{ level: 0, label: t('queues.readyQueue'), policy: '', pids: [] }];

  return (
    <section className="sched-queues-section" aria-label={t('queues.title')}>
      <div className="sched-section-head">
        <h3 className="sched-section-title">{t('queues.title')}</h3>
        {algoId === 'mlfq' && (
          <span className="sched-demotion-hint">{t('queues.demotionHint')}</span>
        )}
      </div>

      <div className="sched-queues-layout ltr-keep">
        {/* Active CPU slot */}
        <div className={`sched-cpu-box${runningPid ? ' is-busy' : ''}${phase === 'idle' ? ' is-idle' : ''}`}>
          <div className="sched-cpu-head">
            <span className="sched-cpu-label">
              <Cpu size={14} aria-hidden="true" />
              {t('queues.cpuSlot')}
            </span>
            {isMultiQueue && runningPid && activeQueueLevel !== null && activeQueueLevel !== undefined && (
              <span className="sched-cpu-qtag">Q{activeQueueLevel}</span>
            )}
          </div>

          {runningPid ? (
            <div className={`sched-pid-chip sched-pid-chip--cpu sched-proc-c${getProcColorIndex(runningPid)}`}>
              <span className="sched-pid-dot" aria-hidden="true" />
              <strong>{runningPid}</strong>
              {runningProc && (
                <span className="sched-pid-sub">
                  {t('queues.remainingTag', { remaining: runningProc.remaining })}
                  {showPriority ? ` · ${t('queues.priorityTag', { priority: runningProc.priority })}` : ''}
                </span>
              )}
            </div>
          ) : (
            <div className="sched-cpu-empty">
              {phase === 'idle' ? t('queues.cpuIdle') : t('queues.cpuWaiting')}
            </div>
          )}
        </div>

        {/* Ready Queue lane(s) */}
        <div className="sched-queue-lanes">
          {normalizedQueues.map((q, idx) => {
            const isActiveLane = isMultiQueue && activeQueueLevel === q.level;
            const pids = Array.isArray(q.pids) ? q.pids : [];
            return (
              <div key={`${q.level}-${q.label}-${idx}`} className="sched-queue-lane-wrap">
                <div className={`sched-queue-lane${isActiveLane ? ' is-active' : ''}`}>
                  <div className="sched-queue-lane-head">
                    <span className="sched-queue-lane-label">{q.label || t('queues.readyQueue')}</span>
                    <div className="sched-queue-lane-tags">
                      {q.policy && <span className="sched-queue-policy">{q.policy}</span>}
                      {isActiveLane && (
                        <span className="sched-queue-active-tag">{t('queues.activeQueueBadge')}</span>
                      )}
                    </div>
                  </div>

                  <div className="sched-queue-chips">
                    {pids.length === 0 ? (
                      <span className="sched-queue-empty">{t('queues.emptyQueue')}</span>
                    ) : (
                      pids.map((pid, pIdx) => {
                        const proc = procByPid[pid];
                        return (
                          <span
                            key={`${pid}-${pIdx}`}
                            className={`sched-pid-chip sched-proc-c${getProcColorIndex(pid)}`}
                          >
                            <span className="sched-pid-dot" aria-hidden="true" />
                            <strong>{pid}</strong>
                            {proc && (
                              <span className="sched-pid-sub">
                                {showPriority
                                  ? `${t('queues.priorityTag', { priority: proc.priority })} · ${proc.remaining}u`
                                  : `${proc.remaining}u`}
                              </span>
                            )}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {algoId === 'mlfq' && idx < normalizedQueues.length - 1 && (
                  <div className="sched-demote-connector" aria-hidden="true">
                    <ArrowDown size={13} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
