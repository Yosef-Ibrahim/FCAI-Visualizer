import { useState, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import QuizPanel from '../components/ai/QuizPanel';
import TracePanel from '../components/ai/TracePanel';
import ScoreBoard from '../components/ai/ScoreBoard';
import { useProgress } from '../hooks/useProgress';
import { useT } from '../hooks/useT';
import '../styles/Training.css';

const FEEDBACK_URL = 'https://github.com/Yosef-Ibrahim/FCAI-Visualizer/issues/new/choose';

function FeedbackLink({ label }) {
  return (
    <a className="training-feedback-link" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
      <MessageSquare size={16} aria-hidden="true" /> {label}
    </a>
  );
}

const TOPICS = {
  sorting: { icon: '⊞' },
  searching: { icon: '⌕' },
  trees: { icon: '⬡' },
  graphs: { icon: '◇' },
};

const TOPIC_COLORS = {
  sorting: { bg: 'rgba(108, 99, 255, 0.15)', border: '#6c63ff', text: '#6c63ff' },
  searching: { bg: 'rgba(255, 101, 132, 0.15)', border: '#ff6584', text: '#ff6584' },
  trees: { bg: 'rgba(67, 217, 173, 0.15)', border: '#43d9ad', text: '#43d9ad' },
  graphs: { bg: 'rgba(247, 197, 159, 0.15)', border: '#f7c59f', text: '#f7c59f' },
};

const MODES = [
  { id: 'quiz', icon: '⊕' },
  { id: 'trace', icon: '⟳', comingSoon: true },
];

export default function PracticeMode() {
  const t = useT('practice');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('sorting');
  const [showTopicSelect, setShowTopicSelect] = useState(true);
  const { progress, recordAnswer, getDifficulty, getStats, resetProgress } = useProgress();

  const stats = getStats();

  const handleStart = (modeId) => {
    if (modeId === 'trace') return;
    setSelectedMode(modeId);
    setShowTopicSelect(true);
  };

  const handleTopicSelect = () => {
    setShowTopicSelect(false);
  };

  const handleBack = () => {
    if (!showTopicSelect) {
      setShowTopicSelect(true);
    } else {
      setSelectedMode(null);
    }
  };

  const handleComplete = useCallback((topic, isCorrect) => {
    recordAnswer(topic, isCorrect, 'medium');
  }, [recordAnswer]);

  if (!selectedMode) {
    return (
      <div className="training-page">
        <header className="training-header">
          <h1 className="training-title">
            {t('title')}
          </h1>
          <p className="training-subtitle">
            {t('subtitle')}
          </p>
          <FeedbackLink label={t('feedback.link')} />
        </header>

        <ScoreBoard stats={stats} onClear={resetProgress} />

        <div className="training-grid">
          {MODES.map((mode, index) => (
            <button
              key={mode.id}
              type="button"
              className={`training-card ${mode.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => { if (mode.comingSoon) return; handleStart(mode.id); }}
              aria-disabled={mode.comingSoon || undefined}
              data-label={mode.comingSoon ? t('comingSoon') : undefined}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="training-card-icon">
                {mode.icon}
              </span>
              <span className="training-card-title">{t(`modes.${mode.id}.title`)}</span>
              <span className="training-card-desc">
                {t(`modes.${mode.id}.description`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="training-page">
      <div className="training-top-actions">
      <button
        className="btn btn-outline"
        onClick={handleBack}
        style={{ marginBottom: '1.5rem' }}
      >
        <span className="rtl-flip" aria-hidden="true">←</span> {t('backToMenu')}
      </button>
      <FeedbackLink label={t('feedback.link')} />
      </div>

      {showTopicSelect ? (
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {t('selectTopic')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(TOPICS).map(([topicId, topicInfo]) => {
              const color = TOPIC_COLORS[topicId];
              const topicProgress = progress.scores[topicId]?.total || 0;
              return (
                <button
                  key={topicId}
                  onClick={() => {
                    setSelectedTopic(topicId);
                    handleTopicSelect();
                  }}
                  style={{
                    padding: '1.5rem 1rem',
                    background: color.bg,
                    border: `2px solid ${color.border}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: 1
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {topicInfo.icon}
                  </div>
                  <h3 style={{
                    color: color.text,
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {t(`topics.${topicId}`)}
                  </h3>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    margin: 0
                  }}>
                    {t('questionsAttempted', { count: topicProgress })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {TOPICS[selectedTopic].icon} {t(`session.${selectedMode}`)}: {t(`topics.${selectedTopic}`)}
          </h2>

          {selectedMode === 'quiz' ? (
            <QuizPanel
              topic={selectedTopic}
              difficulty={getDifficulty(selectedTopic)}
              onComplete={(topic, isCorrect) => handleComplete(topic, isCorrect)}
            />
          ) : (
            <TracePanel
              topic={selectedTopic}
              onComplete={(topic, isCorrect) => handleComplete(topic, isCorrect)}
            />
          )}
        </div>
      )}
    </div>
  );
}
