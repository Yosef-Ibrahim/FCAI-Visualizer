import { useMemo } from 'react';
import { useT } from '../../hooks/useT';

function makeCellKey(r, c) {
  return `${r}:${c}`;
}

export default function DPMatrixView({ dp, onInspectCell, inspectedCell }) {
  const t = useT('dp');

  const { activeKey, depSet, traceSet } = useMemo(() => {
    const active = dp?.activeCell ? makeCellKey(dp.activeCell[0], dp.activeCell[1]) : null;
    const deps = new Set((dp?.dependencies ?? []).map(([r, c]) => makeCellKey(r, c)));
    const trace = new Set((dp?.traceback ?? []).map(([r, c]) => makeCellKey(r, c)));
    return { activeKey: active, depSet: deps, traceSet: trace };
  }, [dp]);

  if (!dp || !Array.isArray(dp.table) || dp.table.length === 0) {
    return null;
  }

  const { dims, table, directions, rowLabels = [], colLabels = [] } = dp;
  const colCount = colLabels.length || table[0].length;
  const gridTemplateColumns = `minmax(${dims === 2 ? '104px' : '64px'}, auto) repeat(${colCount}, minmax(44px, 1fr))`;

  return (
    <div className="dp-matrix-shell">
      <div className="dp-matrix-scroll ltr-keep" dir="ltr">
        <div
          className={`dp-grid${dims === 1 ? ' dp-grid--1d' : ' dp-grid--2d'}`}
          role="grid"
          aria-label={t('title')}
          style={{ gridTemplateColumns }}
        >
          {/* Header row */}
          <div className="dp-cell dp-cell--corner" role="columnheader" aria-hidden="true">
            {dims === 2 ? 'i \\ w' : 'idx'}
          </div>
          {colLabels.map((label, c) => (
            <div key={`col-${c}`} className="dp-cell dp-cell--colhead" role="columnheader">
              {label}
            </div>
          ))}

          {/* Data rows */}
          {table.map((row, r) => (
            <div key={`row-${r}`} className="dp-row-group" role="row">
              <div className="dp-cell dp-cell--rowhead" role="rowheader" title={rowLabels[r] ?? ''}>
                {rowLabels[r] ?? r}
              </div>
              {row.map((val, c) => {
                const key = makeCellKey(r, c);
                const isActive = key === activeKey;
                const isDep = depSet.has(key);
                const isTrace = traceSet.has(key);
                const isEmpty = val === null || val === undefined;
                const isInf = val === '∞';
                const dirGlyph = directions?.[r]?.[c] ?? null;

                const classes = ['dp-cell', 'dp-cell--data'];
                if (isEmpty) classes.push('is-empty');
                if (isInf) classes.push('is-inf');
                if (isTrace) classes.push('is-traceback');
                if (isDep) classes.push('is-dependency');
                if (isActive) classes.push('is-active');

                const displayVal = isEmpty ? '·' : String(val);

                const handleInspect = () => {
                  onInspectCell?.({
                    row: r,
                    col: c,
                    rowLabel: rowLabels[r] ?? String(r),
                    colLabel: colLabels[c] ?? String(c),
                    value: displayVal,
                  });
                };

                return (
                  <div
                    key={key}
                    role="gridcell"
                    tabIndex={0}
                    className={classes.join(' ')}
                    aria-label={`${rowLabels[r] ?? r}, ${colLabels[c] ?? c}: ${displayVal}`}
                    aria-current={isActive ? 'step' : undefined}
                    onMouseEnter={handleInspect}
                    onFocus={handleInspect}
                  >
                    <span className="dp-cell-val">{displayVal}</span>
                    {dirGlyph && (isTrace || isActive) && (
                      <span className="dp-cell-dir" aria-hidden="true">{dirGlyph}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="dp-matrix-footer">
        <div className="dp-legend" aria-label="Cell legend">
          <span className="dp-legend-item">
            <span className="dp-swatch dp-swatch--active" aria-hidden="true" />
            {t('telemetry.legend.active')}
          </span>
          <span className="dp-legend-item">
            <span className="dp-swatch dp-swatch--dep" aria-hidden="true" />
            {t('telemetry.legend.dependency')}
          </span>
          <span className="dp-legend-item">
            <span className="dp-swatch dp-swatch--trace" aria-hidden="true" />
            {t('telemetry.legend.traceback')}
          </span>
          <span className="dp-legend-item">
            <span className="dp-swatch dp-swatch--empty" aria-hidden="true" />
            {t('telemetry.legend.empty')}
          </span>
        </div>

        <div className="dp-inspect-readout">
          <span className="dp-inspect-label">{t('telemetry.inspectCell')}:</span>
          <span className="dp-inspect-val ltr-keep">
            {inspectedCell
              ? t('telemetry.cellInspect', {
                row: inspectedCell.rowLabel,
                col: inspectedCell.colLabel,
                value: inspectedCell.value,
              })
              : t('telemetry.pending')}
          </span>
        </div>
      </div>
    </div>
  );
}
