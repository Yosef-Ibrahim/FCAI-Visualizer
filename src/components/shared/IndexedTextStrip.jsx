import '../../styles/IndexedTextStrip.css';

/**
 * Reusable LTR-isolated indexed character strip for string structures (Suffix Trie,
 * Suffix Tree, Suffix Array). Highlights an active suffix range, a current cursor,
 * and zero or more matched spans.
 */
export default function IndexedTextStrip({
  text = '',
  activeStart = -1,
  activeEnd = -1,
  cursorIndex = -1,
  matchRanges = [],
  ariaLabel = 'Indexed input string',
}) {
  const chars = Array.from(text);

  const isInMatch = (idx) => matchRanges.some(([start, end]) => idx >= start && idx < end);

  return (
    <div className="idx-strip-wrap ltr-keep" role="region" aria-label={ariaLabel}>
      <div className="idx-strip-cells" role="list">
        {chars.map((ch, idx) => {
          const isSentinel = ch === '$' && idx === chars.length - 1;
          const isCursor = idx === cursorIndex;
          const isActive = activeStart >= 0 && idx >= activeStart && (activeEnd < 0 || idx <= activeEnd);
          const isMatch = isInMatch(idx);

          const classes = ['idx-strip-cell'];
          if (isSentinel) classes.push('is-sentinel');
          if (isActive) classes.push('is-active');
          if (isMatch) classes.push('is-match');
          if (isCursor) classes.push('is-cursor');

          return (
            <div className={classes.join(' ')} key={`${idx}-${ch}`} role="listitem">
              <span className="idx-strip-index">{idx}</span>
              <span className="idx-strip-char">{ch}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
