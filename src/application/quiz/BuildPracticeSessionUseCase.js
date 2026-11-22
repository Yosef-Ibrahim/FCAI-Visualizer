import { selectPracticeQuestion } from './SelectPracticeQuestionUseCase';

export const PRACTICE_SESSION_SIZE = 10;

export function buildPracticeSession({
  questions,
  stats,
  mastery = {},
  recentIds = [],
  size = PRACTICE_SESSION_SIZE,
}) {
  const session = [];
  const remaining = [...(questions || [])];
  const recent = [...recentIds];

  while (remaining.length > 0 && session.length < size) {
    const question = selectPracticeQuestion({
      questions: remaining,
      stats,
      mastery,
      recentIds: recent,
    });
    if (!question) break;

    session.push(question);
    remaining.splice(remaining.indexOf(question), 1);
    recent.push(question.id);
  }

  return session;
}
