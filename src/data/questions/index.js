import { advancedDataStructureQuestions } from './advancedDataStructures';
import { compressionQuestions } from './compression';
import { dataStructureQuestions } from './dataStructures';

export const QUESTION_TOPICS = [
  ...Object.entries(dataStructureQuestions).map(([id, questions]) => ({
    id,
    courseId: 'data-structure',
    questions,
  })),
  ...Object.entries(advancedDataStructureQuestions).map(([id, questions]) => ({
    id,
    courseId: 'advanced-data-structure',
    questions,
  })),
  ...Object.entries(compressionQuestions).map(([id, questions]) => ({
    id,
    courseId: 'information-theory-compression',
    questions,
  })),
];

export function getQuestionTopic(topicId) {
  return QUESTION_TOPICS.find((topic) => topic.id === topicId);
}
