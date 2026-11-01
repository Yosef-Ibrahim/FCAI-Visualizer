import { describe, expect, it } from 'vitest';
import { buildDataStructureQuestionBank, DATA_STRUCTURE_ALGORITHMS } from './dataStructureQuestionBank';

describe('data structure question curriculum', () => {
  it('provides 3,000 stable, unique questions for every registered structure', () => {
    for (const algorithm of DATA_STRUCTURE_ALGORITHMS) {
      const questions = buildDataStructureQuestionBank(algorithm);
      expect(questions).toHaveLength(3000);
      expect(new Set(questions.map((question) => question.id)).size).toBe(3000);
      expect(questions.every((question) => question.options.length === 4)).toBe(true);
      expect(questions.every((question) => ['A', 'B', 'C', 'D'].includes(question.correctAnswer))).toBe(true);
    }
  });

  it('keeps question identifiers stable across language variants', () => {
    const english = buildDataStructureQuestionBank('stack-ds', 'en');
    const arabic = buildDataStructureQuestionBank('stack-ds', 'ar');
    expect(arabic.map((question) => question.id)).toEqual(english.map((question) => question.id));
    expect(arabic[0].question).not.toEqual(english[0].question);
  });
});
