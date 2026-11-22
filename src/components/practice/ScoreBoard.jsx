import { useState } from 'react';
import { useT } from '../../hooks/useT';
import { useLocale } from '../../hooks/useLocale';
import { formatNumber, formatPercent } from '../../i18n/format';

export default function ScoreBoard({ stats, onClear }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const t = useT('practice');
  const { locale } = useLocale();

  const handleClear = () => {
    if (showConfirm) {
      onClear();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="scoreboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{t('score.title')}</h3>
        <button
          onClick={handleClear}
          style={{
            background: showConfirm ? 'var(--accent2)' : 'transparent',
            border: '1px solid var(--accent2)',
            color: showConfirm ? '#fff' : 'var(--accent2)',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          {showConfirm ? t('score.confirm') : t('score.reset')}
        </button>
      </div>

      <div className="scoreboard-grid">
        <div className="score-item">
          <div className="score-value">{formatNumber(stats.totalQuestions, locale)}</div>
          <div className="score-label">{t('score.questions')}</div>
        </div>
        <div className="score-item">
          <div className="score-value">{formatNumber(stats.totalCorrect, locale)}</div>
          <div className="score-label">{t('score.correct')}</div>
        </div>
        <div className="score-item">
          <div className="score-value">{formatPercent(stats.accuracy / 100, locale)}</div>
          <div className="score-label">{t('score.accuracy')}</div>
        </div>
        <div className="score-item">
          <div className="score-value">{formatNumber(stats.bestStreak, locale)} 🔥</div>
          <div className="score-label">{t('score.bestStreak')}</div>
        </div>
      </div>
    </div>
  );
}
