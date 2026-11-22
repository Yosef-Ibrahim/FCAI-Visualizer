import { describe, expect, it } from 'vitest';
import { getMasteryBand, selectPracticeQuestion } from './SelectPracticeQuestionUseCase';

const questions = [
  { id: 'easy-1', difficulty: 'easy' },
  { id: 'medium-1', difficulty: 'medium' },
  { id: 'hard-1', difficulty: 'hard' },
];

describe('SelectPracticeQuestionUseCase', () => {
  it('moves from easy toward harder content as mastery improves', () => {
    expect(getMasteryBand({ total: 0, correct: 0 })).toBe('beginner');
    expect(getMasteryBand({ total: 10, correct: 8, streak: 4 })).toBe('intermediate');
    expect(getMasteryBand({ total: 20, correct: 19, streak: 8 })).toBe('expert');

    expect(selectPracticeQuestion({
      questions,
      stats: { total: 0, correct: 0 },
      mastery: {},
    }).difficulty).toBe('easy');
    expect(selectPracticeQuestion({
      questions,
      stats: { total: 20, correct: 19, streak: 8 },
      mastery: {},
    }).difficulty).toBe('hard');
  });

  it('prioritizes unanswered questions and then questions answered incorrectly', () => {
    const selected = selectPracticeQuestion({
      questions: [
        { id: 'answered', difficulty: 'easy' },
        { id: 'new', difficulty: 'easy' },
        { id: 'missed', difficulty: 'easy' },
      ],
      stats: { total: 1, correct: 1, streak: 1 },
      mastery: {
        answered: { attempts: 2, incorrect: 0 },
        missed: { attempts: 1, incorrect: 1 },
      },
    });

    expect(selected.id).toBe('new');
  });
});
