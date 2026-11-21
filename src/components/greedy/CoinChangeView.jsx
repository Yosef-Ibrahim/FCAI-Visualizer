import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useT } from '../../hooks/useT';

export default function CoinChangeView({ greedy }) {
  const t = useT('greedy');
  if (!greedy || greedy.kind !== 'coin-change') return null;

  const {
    items = [],
    activeIndex,
    accepted = [],
    rejected = [],
    metrics = {},
    optimalComparison = null,
  } = greedy;

  const rejectedSet = new Set(rejected);
  const target = metrics.target ?? 0;
  const remaining = metrics.remaining ?? 0;
  const covered = metrics.covered ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((covered / target) * 100)) : 100;

  let verdictTone = 'optimal';
  let verdictTitle = '';
  let verdictBody = '';
  if (optimalComparison) {
    if (!optimalComparison.greedyReachable && !optimalComparison.optimalReachable) {
      verdictTone = 'impossible';
      verdictTitle = t('views.coin.verdictImpossibleTitle');
      verdictBody = t('views.coin.verdictImpossibleBody');
    } else if (!optimalComparison.greedyReachable && optimalComparison.optimalReachable) {
      verdictTone = 'fail';
      verdictTitle = t('views.coin.verdictFailedTitle');
      verdictBody = t('views.coin.verdictFailedBody', {
        remaining: optimalComparison.remaining,
        optCount: optimalComparison.optimalCount,
      });
    } else if (!optimalComparison.isOptimal) {
      verdictTone = 'fail';
      verdictTitle = t('views.coin.verdictSuboptimalTitle');
      verdictBody = t('views.coin.verdictSuboptimalBody', {
        first: optimalComparison.greedyCoins[0] ?? '',
        greedyCount: optimalComparison.greedyCount,
        optCount: optimalComparison.optimalCount,
      });
    } else {
      verdictTone = 'optimal';
      verdictTitle = t('views.coin.verdictOptimalTitle');
      verdictBody = t('views.coin.verdictOptimalBody');
    }
  }

  return (
    <div className="greedy-view-wrap">
      <div className="greedy-view-head">
        <h3>{t('views.coin.title')}</h3>
        <div className="greedy-inline-stats ltr-keep">
          <span>{t('views.coin.target')}: <strong>{target}</strong></span>
          <span>{t('views.coin.remaining')}: <strong>{remaining}</strong></span>
          <span>{t('views.coin.coinsUsed')}: <strong>{metrics.coinCount ?? 0}</strong></span>
        </div>
      </div>

      {/* Running remainder bar */}
      <div className="greedy-fill-block">
        <div className="greedy-fill-caption">
          <span>{t('views.coin.covered')}: <strong className="ltr-keep">{covered} / {target}</strong></span>
          <span className="ltr-keep">{pct}%</span>
        </div>
        <div
          className="greedy-fill-bar ltr-keep"
          dir="ltr"
          role="progressbar"
          aria-valuenow={covered}
          aria-valuemin={0}
          aria-valuemax={Math.max(1, target)}
          aria-label={t('views.coin.covered')}
        >
          <div className="greedy-fill-seg greedy-fill-seg--accent3" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Denomination cards */}
      <div className="greedy-coin-grid ltr-keep" dir="ltr">
        {items.map((coin, idx) => {
          const isActive = idx === activeIndex;
          const isSkipped = rejectedSet.has(idx);
          const hasPicked = coin.count > 0;
          const classes = ['greedy-coin-card'];
          if (hasPicked) classes.push('is-picked');
          if (isSkipped) classes.push('is-skipped');
          if (isActive) classes.push('is-active');

          return (
            <div key={coin.value} className={classes.join(' ')}>
              <span className="greedy-coin-disc">{coin.value}</span>
              <span className="greedy-coin-meta">
                {t('views.coin.countBadge', { count: coin.count })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Picked sequence */}
      <div className="greedy-picked-strip">
        <span className="greedy-picked-label">{t('views.coin.pickedSequence')}:</span>
        {accepted.length === 0 ? (
          <span className="greedy-picked-empty">{t('views.coin.emptyPicked')}</span>
        ) : (
          <div className="greedy-picked-pills ltr-keep" dir="ltr">
            {accepted.map((val, i) => (
              <span key={`${val}-${i}`} className="greedy-coin-pill">{val}</span>
            ))}
          </div>
        )}
      </div>

      {/* Quiet side-by-side counterexample verdict ribbon */}
      {optimalComparison && (
        <div className={`greedy-verdict greedy-verdict--${verdictTone}`} role="status">
          <div className="greedy-verdict-head">
            {verdictTone === 'optimal'
              ? <CheckCircle2 size={17} />
              : <AlertTriangle size={17} />}
            <strong>{verdictTitle}</strong>
          </div>
          <p className="greedy-verdict-body">{verdictBody}</p>
          <div className="greedy-verdict-compare">
            <div className="greedy-verdict-col">
              <span className="greedy-verdict-col-label">{t('views.coin.greedyLabel')}</span>
              <span className="greedy-verdict-col-val ltr-keep">
                {optimalComparison.greedyReachable
                  ? t('views.coin.coinsSummary', {
                    count: optimalComparison.greedyCount,
                    coins: optimalComparison.greedyCoins.join(', ') || '∅',
                  })
                  : t('views.coin.unreachedSummary', { remaining: optimalComparison.remaining })}
              </span>
            </div>
            <div className="greedy-verdict-col">
              <span className="greedy-verdict-col-label">{t('views.coin.dpOptLabel')}</span>
              <span className="greedy-verdict-col-val ltr-keep">
                {optimalComparison.optimalReachable
                  ? t('views.coin.coinsSummary', {
                    count: optimalComparison.optimalCount,
                    coins: optimalComparison.optimalCoins.join(', ') || '∅',
                  })
                  : t('views.coin.impossibleSummary')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
