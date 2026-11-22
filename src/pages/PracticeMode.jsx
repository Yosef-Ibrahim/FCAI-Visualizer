import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import QuizPanel from '../components/practice/QuizPanel';
import ScoreBoard from '../components/practice/ScoreBoard';
import { buildPracticeSession } from '../application/quiz/BuildPracticeSessionUseCase';
import { questionRepository } from '../application/quiz/QuestionRepository';
import { useProgress } from '../hooks/useProgress';
import { useT } from '../hooks/useT';
import '../styles/Training.css';

const TOPICS = {
  sorting: { icon: '⊞', course: 'Data Structures' },
  searching: { icon: '⌕', course: 'Data Structures' },
  graphs: { icon: '◇', course: 'Data Structures' },
  trees: { icon: '⬡', course: 'Advanced Data Structures' },
};

export default function PracticeMode() {
  const t = useT('practice');
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
    recordAnswer(topic, isCorrect, question?.difficulty || 'medium', question?.id);
  }, [recordAnswer]);

  if (session) {
    return (
      <div className="training-page">
        <button className="btn btn-outline practice-back" onClick={() => setSession(null)}>
          ← {t('backToMenu')}
        </button>
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

  if (selectedTopic) {
    const count = questionRepository.getQuestions(selectedTopic).length;
    return (
      <div className="training-page">
        <button className="btn btn-outline practice-back" onClick={() => setSelectedTopic(null)}>
          ← {t('backToMenu')}
        </button>
        <div className="session-start-card">
          <p className="eyebrow">{TOPICS[selectedTopic].course}</p>
          <h1>{TOPICS[selectedTopic].icon} {t(`topics.${selectedTopic}`)}</h1>
          <p>{count} reviewed questions are available now. Each session contains up to 10 questions and never asks you to choose an artificial question type.</p>
          <button className="btn btn-primary" onClick={() => startSession(selectedTopic)}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="training-page">
      <header className="training-header">
        <h1 className="training-title">{t('title')}</h1>
        <p className="training-subtitle">Choose a topic. The practice engine selects the next questions from your progress.</p>
      </header>
      <ScoreBoard stats={stats} onClear={resetProgress} />
      <div className="practice-topic-grid">
        {Object.entries(TOPICS).map(([id, topic]) => {
          const count = questionRepository.getQuestions(id).length;
          return (
            <button className="practice-topic-card" key={id} onClick={() => setSelectedTopic(id)}>
              <span className="topic-icon">{topic.icon}</span>
              <span className="topic-course">{topic.course}</span>
              <h2>{t(`topics.${id}`)}</h2>
              <span className="topic-count">{count} reviewed questions</span>
            </button>
          );
        })}
      </div>
      <div className="level-card content-coming">
        <RotateCcw size={22} />
        <h2>More questions are being prepared</h2>
        <p>The current bank is organized for safe practice now. It is not being presented as 200 questions yet.</p>
      </div>
    </div>
  );
}
