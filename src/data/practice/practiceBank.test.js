import { describe, expect, it } from 'vitest';
import { PRACTICE_TOPICS, loadPracticeTopic } from './index.js';

const LETTERS = ['A', 'B', 'C', 'D'];

describe('practice question bank', () => {
  it('registers a topic for every course', () => {
    const courses = new Set(PRACTICE_TOPICS.map((topic) => topic.course));
    expect(courses.size).toBe(5);
    expect(PRACTICE_TOPICS.length).toBeGreaterThanOrEqual(14);
  });

  for (const topic of PRACTICE_TOPICS) {
    describe(topic.id, () => {
      it('provides at least 200 questions', async () => {
        const questions = await loadPracticeTopic(topic.id);
        expect(questions.length).toBeGreaterThanOrEqual(200);
      });

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
