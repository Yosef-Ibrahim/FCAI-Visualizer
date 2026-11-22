const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_RATIOS = {
  beginner: { easy: 0.8, medium: 0.2, hard: 0 },
  learning: { easy: 0.5, medium: 0.4, hard: 0.1 },
  intermediate: { easy: 0.25, medium: 0.5, hard: 0.25 },
  advanced: { easy: 0.1, medium: 0.4, hard: 0.5 },
  expert: { easy: 0, medium: 0.25, hard: 0.75 },
};

function getMasteryBand(stats = {}) {
  const total = stats.total ?? 0;
  const accuracy = total === 0 ? 0 : (stats.correct ?? 0) / total;
  const streak = stats.streak ?? 0;

  if (total < 5 || accuracy < 0.5) return 'beginner';
  if (accuracy < 0.7 || streak < 3) return 'learning';
  if (accuracy < 0.82) return 'intermediate';
  if (accuracy < 0.92) return 'advanced';
  return 'expert';
}

function chooseDifficulty(pool, band) {
  const available = new Set(pool.map((question) => question.difficulty));
  const ratios = DIFFICULTY_RATIOS[band];
  return [...DIFFICULTIES]
    .filter((difficulty) => available.has(difficulty))
    .sort((left, right) => (ratios[right] ?? 0) - (ratios[left] ?? 0))[0];
}

function questionPriority(question, mastery = {}, recentIds = []) {
  const stats = mastery[question.id] ?? {};
  const recentIndex = recentIds.indexOf(question.id);
  const recencyPenalty = recentIndex === -1 ? 0 : recentIds.length - recentIndex;
  const incorrectPenalty = (stats.incorrect ?? 0) * -10;
  const unansweredBonus = stats.attempts ? 0 : 20;
  return unansweredBonus + incorrectPenalty - recencyPenalty;
}

/**
 * Selects a question from the requested topic without coupling selection to React.
 * Missed and unanswered questions are prioritized, while difficulty follows mastery.
 */
export function selectPracticeQuestion({
  questions,
  stats,
  mastery,
  recentIds = [],
}) {
  if (!questions?.length) return null;

  const band = getMasteryBand(stats);
  const difficulty = chooseDifficulty(questions, band);
  const candidates = questions.filter((question) => question.difficulty === difficulty);
  const pool = candidates.length ? candidates : questions;

  return [...pool].sort((left, right) => (
    questionPriority(right, mastery, recentIds) - questionPriority(left, mastery, recentIds)
  ))[0];
}

export { getMasteryBand };
