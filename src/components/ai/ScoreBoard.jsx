import { useState } from 'react';

export default function ScoreBoard({ stats, onClear }) {
  const [showConfirm, setShowConfirm] = useState(false);

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
        <h3>Your Progress</h3>
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
          {showConfirm ? 'Click to Confirm' : '🗑️ Clear'}
        </button>
      </div>
      
      <div className="scoreboard-grid">
        <div className="score-item">
          <div className="score-value">{stats.totalQuestions}</div>
          <div className="score-label">Questions</div>
        </div>
        <div className="score-item">
          <div className="score-value">{stats.totalCorrect}</div>
          <div className="score-label">Correct</div>
        </div>
        <div className="score-item">
          <div className="score-value">{stats.accuracy}%</div>
          <div className="score-label">Accuracy</div>
        </div>
        <div className="score-item">
          <div className="score-value">{stats.bestStreak} 🔥</div>
          <div className="score-label">Best Streak</div>
        </div>
      </div>
    </div>
  );
}