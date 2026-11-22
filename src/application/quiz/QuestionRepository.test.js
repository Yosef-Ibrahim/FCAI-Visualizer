import { describe, expect, it } from 'vitest';
import { questionRepository } from './QuestionRepository';

describe('LocalQuestionRepository', () => {
  it('exposes questions by stable course topic', () => {
    const topics = questionRepository.getTopics();
    expect(topics).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'sorting', courseId: 'data-structure' }),
      expect.objectContaining({ id: 'trees', courseId: 'advanced-data-structure' }),
    ]));
  });

  it('returns normalized questions without exposing source storage details', () => {
    const question = questionRepository.getQuestions('sorting')[0];
    expect(question).toEqual(expect.objectContaining({
      id: 'sort-001',
      topic: 'sorting',
      courseId: 'data-structure',
      q: expect.any(String),
      question: expect.any(String),
      options: expect.any(Array),
      answer: expect.stringMatching(/^[A-D]$/),
      correctAnswer: expect.stringMatching(/^[A-D]$/),
    }));
    expect(questionRepository.getQuestion('sorting', question.id)).toEqual(question);
  });

  it('returns an empty result for an unknown or not-yet-authored topic', () => {
    expect(questionRepository.getQuestions('unknown')).toEqual([]);
    expect(questionRepository.getQuestions('lossless-compression')).toEqual([]);
  });
});
