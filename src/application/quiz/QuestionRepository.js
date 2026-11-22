import { QUESTION_TOPICS, getQuestionTopic } from '../../data/questions';

function cloneQuestion(question, topicId, courseId) {
  return {
    ...question,
    topic: topicId,
    courseId,
    question: question.q,
    correctAnswer: question.answer,
    explanation: question.exp,
  };
}

export class LocalQuestionRepository {
  getTopics() {
    return QUESTION_TOPICS.map(({ id, courseId, questions }) => ({
      id,
      courseId,
      questionCount: questions.length,
    }));
  }

  getQuestions(topicId) {
    const topic = getQuestionTopic(topicId);
    if (!topic) return [];
    return topic.questions.map((question) => cloneQuestion(question, topic.id, topic.courseId));
  }

  getQuestion(topicId, questionId) {
    return this.getQuestions(topicId).find((question) => question.id === questionId);
  }
}

export const questionRepository = new LocalQuestionRepository();
