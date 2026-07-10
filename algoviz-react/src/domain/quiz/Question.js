export class Question {
  constructor({ question, type, difficulty, topic, subTopic, questionMode, options, correctAnswer, explanation, algorithm, language }) {
    this.question = question;
    this.type = type ?? 'mcq';
    this.difficulty = difficulty ?? 'easy';
    this.topic = topic;
    this.subTopic = subTopic ?? topic;
    this.questionMode = questionMode ?? 'general';
    this.options = options;
    this.correctAnswer = correctAnswer;
    this.explanation = explanation ?? '';
    this.algorithm = algorithm ?? null;
    this.language = language ?? null;
  }
}
