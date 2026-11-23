import { useState, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import QuizPanel from '../components/practice/QuizPanel';
import ScoreBoard from '../components/practice/ScoreBoard';
import { buildPracticeSession } from '../application/quiz/BuildPracticeSessionUseCase';
import { questionRepository } from '../application/quiz/QuestionRepository';
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

const MODES = [
  { id: 'quiz', icon: '⊕' },
  { id: 'trace', icon: '⟳', comingSoon: true },
];

const TOPICS = {
  sorting: { icon: '⊞', course: 'Data Structures' },
  searching: { icon: '⌕', course: 'Data Structures' },
  graphs: { icon: '◇', course: 'Data Structures' },
  trees: { icon: '⬡', course: 'Advanced Data Structures' },
};

export default function PracticeMode() {
  const t = useT('practice');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [session, setSession] = useState(null);
  const { progress, recordAnswer, getStats, resetProgress } = useProgress();
  const stats = getStats();

  const startSession = useCallback((topicId) => {
    const questions = questionRepository.getQuestions(topicId);
    const topicStats = progress.scores[topicId];
    const recentIds = progress.history
      .filter((item) => item.topic === topicId && item.questionId)
      .slice(0, 10)
      .map((item) => item.questionId);

    setSelectedTopic(topicId);
    setSession(buildPracticeSession({
      questions,
      stats: topicStats,
      mastery: progress.mastery?.[topicId],
      recentIds,
    }));
  }, [progress]);

  const handleAnswer = useCallback((topic, isCorrect, question) => {
    recordAnswer(topic, isCorrect, question?.difficulty || 'medium', null, question?.id);
  }, [recordAnswer]);

  const handleBack = () => {
    if (session) setSession(null);
    else if (selectedTopic) setSelectedTopic(null);
    else setSelectedMode(null);
  };

  if (!selectedMode) {
    return (
      <div className="training-page">
        <header className="training-header">
          <h1 className="training-title">{t('title')}</h1>
          <p className="training-subtitle">{t('subtitle')}</p>
          <FeedbackLink label={t('feedback.link')} />
        </header>

        <ScoreBoard stats={stats} onClear={resetProgress} />

        <div className="training-grid">
          {MODES.map((mode, index) => (
            <button
              key={mode.id}
              type="button"
              className={`training-card ${mode.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => { if (!mode.comingSoon) setSelectedMode(mode.id); }}
              aria-disabled={mode.comingSoon || undefined}
              data-label={mode.comingSoon ? t('comingSoon') : undefined}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="training-card-icon">{mode.icon}</span>
              <span className="training-card-title">{t(`modes.${mode.id}.title`)}</span>
              <span className="training-card-desc">{t(`modes.${mode.id}.description`)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="training-page">
        <div className="training-top-actions">
          <button className="btn btn-outline practice-back" onClick={handleBack}>
            <span className="rtl-flip" aria-hidden="true">←</span> {t('backToMenu')}
          </button>
          <FeedbackLink label={t('feedback.link')} />
        </div>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>{t('selectTopic')}</h2>
        <div className="practice-topic-grid">
          {Object.entries(TOPICS).map(([id, topic]) => {
            const count = questionRepository.getQuestions(id).length;
            const topicProgress = progress.scores[id]?.total || 0;
            return (
              <button className="practice-topic-card" key={id} onClick={() => setSelectedTopic(id)}>
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-course">{topic.course}</span>
                <h3>{t(`topics.${id}`)}</h3>
                <span className="topic-count">{t('questionsAttempted', { count: topicProgress })}</span>
                <span className="topic-count">{count} {t('score.questions').toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!session) {
    const count = questionRepository.getQuestions(selectedTopic).length;
    return (
      <div className="training-page">
        <div className="training-top-actions">
          <button className="btn btn-outline practice-back" onClick={handleBack}>
            <span className="rtl-flip" aria-hidden="true">←</span> {t('backToMenu')}
          </button>
          <FeedbackLink label={t('feedback.link')} />
        </div>
        <div className="session-start-card">
          <p className="eyebrow">{TOPICS[selectedTopic].course}</p>
          <h1>{TOPICS[selectedTopic].icon} {t(`topics.${selectedTopic}`)}</h1>
          <p>{count} reviewed questions are available now. Each session contains up to 10 questions and never asks you to choose an artificial question type.</p>
          <button className="btn btn-primary" onClick={() => startSession(selectedTopic)} disabled={!count}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="training-page">
      <div className="training-top-actions">
        <button className="btn btn-outline practice-back" onClick={handleBack}>
          <span className="rtl-flip" aria-hidden="true">←</span> {t('backToMenu')}
        </button>
        <FeedbackLink label={t('feedback.link')} />
      </div>
      <div className="stage-heading">
        <p className="eyebrow">{TOPICS[selectedTopic].course}</p>
        <h1>{TOPICS[selectedTopic].icon} {t(`topics.${selectedTopic}`)} Practice</h1>
        <p>Ten questions selected from this topic. Missed questions will return more often in future sessions.</p>
      </div>
      <QuizPanel
        topic={selectedTopic}
        sessionQuestions={session}
        onComplete={handleAnswer}
        onSessionComplete={() => setSession(null)}
      />
    </div>
  );
}
