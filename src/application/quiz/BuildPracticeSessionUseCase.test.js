import { describe, expect, it } from 'vitest';
import { buildPracticeSession } from './BuildPracticeSessionUseCase';

describe('BuildPracticeSessionUseCase', () => {
  it('creates a fixed-size session without repeating questions', () => {
    const questions = Array.from({ length: 12 }, (_, index) => ({
      id: `question-${index}`,
      difficulty: index < 8 ? 'easy' : 'medium',
    }));

    const session = buildPracticeSession({
      questions,
      stats: { total: 0, correct: 0, streak: 0 },
      size: 10,
    });

    expect(session).toHaveLength(10);
    expect(new Set(session.map((question) => question.id)).size).toBe(10);
  });
});
