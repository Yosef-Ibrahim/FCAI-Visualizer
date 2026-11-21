import { useT } from '../../hooks/useT';

const SEGMENT_TONES = ['accent', 'accent3', 'accent4', 'accent2'];

export default function KnapsackFillView({ greedy }) {
  const t = useT('greedy');
  if (!greedy || greedy.kind !== 'fractional-knapsack') return null;

  const { items = [], activeIndex, accepted = [], rejected = [], metrics = {} } = greedy;
  const acceptedMap = new Map(accepted.map((entry) => [entry.index, entry]));
  const rejectedSet = new Set(rejected);
  const capacity = metrics.capacity || 1;
  const usedWeight = metrics.usedWeight ?? 0;
  const totalValue = metrics.totalValue ?? 0;

  return (
    <div className="greedy-view-wrap">
      <div className="greedy-view-head">
        <h3>{t('views.knapsack.title')}</h3>
        <div className="greedy-inline-stats ltr-keep">
          <span>
            {t('views.knapsack.capacityUsed')}: <strong>{usedWeight} / {capacity}</strong>
          </span>
          <span>
            {t('views.knapsack.totalValue')}: <strong className="greedy-val-emerald">{totalValue}</strong>
          </span>
        </div>
      </div>

      {/* Segmented proportional fill bar */}
      <div className="greedy-fill-block">
        <div className="greedy-fill-caption">
          <span>{t('views.knapsack.fillBarLabel')}</span>
          <span className="ltr-keep">{Math.min(100, Math.round((usedWeight / capacity) * 100))}%</span>
        </div>
        <div
          className="greedy-fill-bar ltr-keep"
          dir="ltr"
          role="progressbar"
          aria-valuenow={usedWeight}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-label={t('views.knapsack.fillBarLabel')}
        >
          {accepted.map((seg, i) => {
            const widthPct = Math.max(2, (seg.takenWeight / capacity) * 100);
            const tone = SEGMENT_TONES[i % SEGMENT_TONES.length];
            const isFraction = seg.fraction < 1;
            return (
              <div
                key={`${seg.name}-${seg.index}`}
                className={`greedy-fill-seg greedy-fill-seg--${tone}${isFraction ? ' is-fraction' : ''}`}
                style={{ width: `${widthPct}%` }}
                title={`${seg.name}: ${seg.takenWeight}w (+${seg.takenValue})`}
              >
                <span>{seg.name}{isFraction ? ` ${Math.round(seg.fraction * 100)}%` : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ratio-sorted item list */}
      <div className="greedy-item-list">
        {items.map((item, idx) => {
          const taken = acceptedMap.get(idx);
          const isSkipped = rejectedSet.has(idx);
          const isActive = idx === activeIndex;
          const ratioStr = (Math.round(item.ratio * 100) / 100).toString();

          let rowState = 'is-pending';
          let badgeText = t('views.knapsack.pending');
          if (taken) {
            rowState = taken.fraction < 1 ? 'is-partial' : 'is-accepted';
            badgeText = taken.fraction < 1
              ? t('views.knapsack.fractionTag', { percent: Math.round(taken.fraction * 100) })
              : t('views.knapsack.wholeTag');
          } else if (isSkipped) {
            rowState = 'is-rejected';
            badgeText = t('views.knapsack.skipped');
          }

          return (
            <div
              key={`${item.name}-${item.originalIndex}`}
              className={`greedy-item-row ${rowState}${isActive ? ' is-row-active' : ''}`}
            >
              <div className="greedy-item-ident">
                <span className="greedy-item-name">{item.name}</span>
                <span className="greedy-item-ratio ltr-keep">
                  {t('views.knapsack.ratio')}: {ratioStr}
                </span>
              </div>
              <div className="greedy-item-nums ltr-keep">
                <span>{t('views.knapsack.weight')}: {item.weight}</span>
                <span>{t('views.knapsack.value')}: {item.value}</span>
                {taken && (
                  <span className="greedy-item-gain">+{taken.takenValue}</span>
                )}
              </div>
              <span className={`greedy-status-pill ${rowState}`}>{badgeText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
