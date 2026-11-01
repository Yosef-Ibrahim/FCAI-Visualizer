import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fcai_visualizer_training_progress';
const TOPICS = ['sorting', 'searching', 'trees', 'graphs', 'data-structures'];

function createDefaultProgress() {
  return {
    scores: Object.fromEntries(TOPICS.map((topic) => [topic, {
      total: 0, correct: 0, streak: 0, bestStreak: 0, xp: 0, difficulty: 'easy',
    }])),
    algorithms: {},
    history: [],
    achievements: [],
    settings: { soundEnabled: true, showHints: true, autoAdvance: false },
  };
}

function normalizeProgress(value) {
  const defaults = createDefaultProgress();
  if (!value || typeof value !== 'object') return defaults;
  return {
    ...defaults,
    ...value,
    scores: { ...defaults.scores, ...(value.scores || {}) },
    algorithms: value.algorithms && typeof value.algorithms === 'object' ? value.algorithms : {},
    history: Array.isArray(value.history) ? value.history.slice(0, 500) : [],
    achievements: Array.isArray(value.achievements) ? value.achievements : [],
    settings: { ...defaults.settings, ...(value.settings || {}) },
  };
}

function readProgress() {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeProgress(JSON.parse(stored)) : createDefaultProgress();
  } catch (error) {
    console.error('Failed to load saved training progress:', error);
    return createDefaultProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save training progress:', error);
    }
  }, [progress]);

  useEffect(() => {
    const syncFromAnotherTab = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { setProgress(normalizeProgress(JSON.parse(event.newValue))); } catch { /* ignore invalid external writes */ }
    };
    window.addEventListener('storage', syncFromAnotherTab);
    return () => window.removeEventListener('storage', syncFromAnotherTab);
  }, []);

  const recordAnswer = useCallback((topic, isCorrect, difficulty, algorithm = null, questionId = null) => {
    setProgress((previous) => {
      const topicScore = previous.scores[topic] || { total: 0, correct: 0, streak: 0, bestStreak: 0, xp: 0, difficulty: 'easy' };
      const streak = isCorrect ? (topicScore.streak || 0) + 1 : 0;
      const xpEarned = isCorrect ? 10 + (streak > 0 && streak % 5 === 0 ? 15 : 0) : 2;
      const algorithmScore = algorithm ? (previous.algorithms[algorithm] || { total: 0, correct: 0, streak: 0, bestStreak: 0, xp: 0, seenQuestionIds: [] }) : null;
      const seen = algorithmScore?.seenQuestionIds || [];
      const updatedAlgorithm = algorithm ? {
        total: algorithmScore.total + 1,
        correct: algorithmScore.correct + (isCorrect ? 1 : 0),
        streak: isCorrect ? algorithmScore.streak + 1 : 0,
        bestStreak: Math.max(algorithmScore.bestStreak || 0, isCorrect ? algorithmScore.streak + 1 : 0),
        xp: (algorithmScore.xp || 0) + xpEarned,
        seenQuestionIds: questionId && !seen.includes(questionId) ? [...seen, questionId] : seen,
      } : null;
      const newProgress = {
        ...previous,
        scores: {
          ...previous.scores,
          [topic]: {
            ...topicScore,
            total: topicScore.total + 1,
            correct: topicScore.correct + (isCorrect ? 1 : 0),
            streak,
            bestStreak: Math.max(topicScore.bestStreak || 0, streak),
            xp: (topicScore.xp || 0) + xpEarned,
            difficulty: calculateNewDifficulty(topicScore.difficulty, isCorrect, streak),
          },
        },
        algorithms: algorithm ? { ...previous.algorithms, [algorithm]: updatedAlgorithm } : previous.algorithms,
        history: [{ topic, algorithm, questionId, isCorrect, difficulty, xpEarned, timestamp: Date.now() }, ...previous.history].slice(0, 500),
      };
      const totalCorrect = Object.values(newProgress.scores).reduce((sum, score) => sum + score.correct, 0);
      const achievements = new Set(newProgress.achievements);
      if (totalCorrect >= 1) achievements.add('first-correct');
      if (totalCorrect >= 100) achievements.add('century');
      if (Object.values(newProgress.algorithms).some((item) => item.bestStreak >= 10)) achievements.add('streak-10');
      newProgress.achievements = [...achievements];
      return newProgress;
    });
  }, []);

  const getTopicScore = useCallback((topic) => progress.scores[topic] || { total: 0, correct: 0, streak: 0, difficulty: 'easy' }, [progress]);
  const getDifficulty = useCallback((topic) => progress.scores[topic]?.difficulty || 'easy', [progress]);
  const getAlgorithmScore = useCallback((algorithm) => progress.algorithms[algorithm] || { total: 0, correct: 0, streak: 0, bestStreak: 0, xp: 0, seenQuestionIds: [] }, [progress]);
  const updateSettings = useCallback((settings) => setProgress((previous) => ({ ...previous, settings: { ...previous.settings, ...settings } })), []);
  const resetProgress = useCallback(() => {
    const fresh = createDefaultProgress();
    setProgress(fresh);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
  }, []);
  const getStats = useCallback(() => {
    const allTopics = Object.values(progress.scores);
    const totalQuestions = allTopics.reduce((sum, score) => sum + score.total, 0);
    const totalCorrect = allTopics.reduce((sum, score) => sum + score.correct, 0);
    return {
      totalQuestions, totalCorrect,
      accuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      bestStreak: Math.max(0, ...allTopics.map((score) => score.bestStreak || score.streak || 0)),
      totalXp: allTopics.reduce((sum, score) => sum + (score.xp || 0), 0),
      topics: progress.scores,
    };
  }, [progress]);

  return { progress, recordAnswer, getTopicScore, getDifficulty, getAlgorithmScore, updateSettings, resetProgress, getStats };
}

function calculateNewDifficulty(currentDifficulty, isCorrect, streak) {
  if (!isCorrect) return ['easy', 'medium', 'hard'][Math.max(0, ['easy', 'medium', 'hard'].indexOf(currentDifficulty) - 1)];
  if (streak >= 5 && currentDifficulty === 'easy') return 'medium';
  if (streak >= 10 && currentDifficulty === 'medium') return 'hard';
  return currentDifficulty;
}
