import { describe, expect, it } from 'vitest';
import {
  MIXED_TOPIC,
  PRACTICE_TOPICS,
  buildSessionPool,
  loadPracticeTopic,
  selectSessionQuestions,
} from './index.js';

const LETTERS = ['A', 'B', 'C', 'D'];

describe('practice question bank', () => {
  it('registers a topic for every course', () => {
    const courses = new Set(PRACTICE_TOPICS.map((topic) => topic.course));
    expect(courses.size).toBe(5);
    expect(PRACTICE_TOPICS.length).toBeGreaterThanOrEqual(14);
  });

  it('keeps every tree type as its own practice topic', () => {
    const ids = PRACTICE_TOPICS.map((topic) => topic.id);
    for (const id of ['bst', 'avl', 'red-black', 'b-tree']) expect(ids).toContain(id);
    expect(ids).not.toContain('trees');
  });

  for (const topic of PRACTICE_TOPICS) {
    describe(topic.id, () => {
      it('provides at least 200 questions', async () => {
        const questions = await loadPracticeTopic(topic.id);
        expect(questions.length).toBeGreaterThanOrEqual(200);
      });

      if (['bst', 'avl', 'red-black', 'b-tree'].includes(topic.id)) {
        it('fills a 10-question session at every difficulty', async () => {
          const questions = await loadPracticeTopic(topic.id);
          for (const level of ['easy', 'medium', 'hard']) {
            expect(buildSessionPool(questions, level).length).toBeGreaterThanOrEqual(10);
          }
        });
      }

      it('keeps ids unique and every question well formed', async () => {
        const questions = await loadPracticeTopic(topic.id);
        const ids = new Set();
        for (const question of questions) {
          expect(ids.has(question.id)).toBe(false);
          ids.add(question.id);
          expect(question.topic).toBe(topic.id);
          expect(['easy', 'medium', 'hard']).toContain(question.difficulty);
          expect(question.question.length).toBeGreaterThan(8);
          expect(question.explanation.length).toBeGreaterThan(3);
          expect(question.options).toHaveLength(4);
          expect(new Set(question.options).size).toBe(4);
          expect(LETTERS).toContain(question.correctAnswer);
          const answerIndex = LETTERS.indexOf(question.correctAnswer);
          expect(question.options[answerIndex]).toBeTruthy();
          for (const option of question.options) {
            expect(option).toMatch(/^[A-D]\) /);
          }
        }
      });
    });
  }
});

describe('mixed practice session', () => {
  it('combines questions from every registered topic', async () => {
    const mixed = await loadPracticeTopic('mixed');
    const mixedTopics = new Set(mixed.map((question) => question.topic));
    expect([...mixedTopics].sort()).toEqual(PRACTICE_TOPICS.map((topic) => topic.id).sort());
    expect(mixed.length).toBeGreaterThanOrEqual(MIXED_TOPIC.questionCount);
  });

  it('builds a random session without duplicate questions', async () => {
    const mixed = await loadPracticeTopic('mixed');
    const selected = selectSessionQuestions(mixed, { limit: 10 });
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((question) => `${question.topic}::${question.id}`)).size).toBe(10);
  });
});

describe('practice session selection', () => {
  const bank = Array.from({ length: 30 }, (_, index) => ({
    id: `q${index}`,
    difficulty: index % 2 === 0 ? 'easy' : 'hard',
  }));

  it('keeps a named difficulty strict instead of falling back to other levels', () => {
    for (const question of buildSessionPool(bank, 'easy')) {
      expect(question.difficulty).toBe('easy');
    }
  });

  it('never pads an easy session with harder questions', () => {
    const selected = selectSessionQuestions(bank, { limit: 50, difficulty: 'easy' });
    expect(selected).toHaveLength(15);
    expect(selected.every((question) => question.difficulty === 'easy')).toBe(true);
  });

  it('prefers questions that were never answered', () => {
    const seenIds = bank.slice(0, 10).map((question) => question.id);
    const selected = selectSessionQuestions(bank, { limit: 5, seenIds });
    expect(selected).toHaveLength(5);
    expect(selected.every((question) => !seenIds.includes(question.id))).toBe(true);
  });

  it('reuses answered questions only after the fresh pool runs out', () => {
    const easy = bank.filter((question) => question.difficulty === 'easy');
    const seenIds = easy.slice(0, easy.length - 3).map((question) => question.id);
    const selected = selectSessionQuestions(bank, { limit: 10, difficulty: 'easy', seenIds });
    expect(selected).toHaveLength(10);
    expect(selected.slice(0, 3).every((question) => !seenIds.includes(question.id))).toBe(true);
    expect(selected.slice(3).every((question) => seenIds.includes(question.id))).toBe(true);
  });
});
