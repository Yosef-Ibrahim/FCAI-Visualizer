import { useState } from 'react';

function CodeBlock({ question }) {
  const codeMatch = question.match(/```[\s\S]*?```/);
  if (!codeMatch) return <h3 className="quiz-question-text">{question}</h3>;

  const code = codeMatch[0].replace(/```\w*\n?/g, '').trim();
  const before = question.split(/```[\s\S]*?```/)[0].trim();
  const after = question.split(/```[\s\S]*?```/).slice(1).join(' ').trim();

  return (
    <div className="code-question-container">
      {before && <h3 className="quiz-question-text">{before}</h3>}
      <pre className="practice-code-block"><code>{code}</code></pre>
      {after && <p>{after}</p>}
    </div>
  );
}

export default function QuizPanel({
  topic,
  sessionQuestions = [],
  onComplete,
  onSessionComplete,
}) {
  const [started, setStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const start = () => {
    setStarted(true);
    setQuestionNumber(0);
    setQuestion(sessionQuestions[0] || null);
    setSelectedAnswer(null);
    setSubmitted(false);
    setCorrectCount(0);
  };

  const submit = () => {
    if (!question || !selectedAnswer || submitted) return;
    const isCorrect = selectedAnswer === question.answer;
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
  };

  const next = () => {
    if (!question || !submitted) return;
    const isCorrect = selectedAnswer === question.answer;
    onComplete?.(topic, isCorrect, question);

    if (questionNumber >= sessionQuestions.length - 1) {
      setCompleted(true);
      return;
    }

    const nextNumber = questionNumber + 1;
    setQuestionNumber(nextNumber);
    setQuestion(sessionQuestions[nextNumber]);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  if (!started) {
    return (
      <div className="quiz-container session-start-card">
        <p className="eyebrow">Adaptive practice</p>
        <h2>Ready to practice?</h2>
        <p>
          Questions are selected from the reviewed topic bank. Your answers affect
          future difficulty and review priority.
        </p>
        <button className="btn btn-primary" onClick={start} disabled={!sessionQuestions.length}>
          Start Session
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="quiz-container session-start-card">
        <p className="eyebrow">Session complete</p>
        <h2>Good work</h2>
        <p>You answered {correctCount} of {sessionQuestions.length} questions correctly.</p>
        <button className="btn btn-primary" onClick={onSessionComplete}>Back to topic</button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {questionNumber + 1} of {sessionQuestions.length}
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((questionNumber + 1) / sessionQuestions.length) * 100}%` }} />
          </div>
        </div>
        <div className={`quiz-difficulty ${question.difficulty}`}>{question.difficulty}</div>
      </div>

      <div className="quiz-question">
        <CodeBlock question={question.q} />
      </div>

      <div className="quiz-options">
        {question.options.map((option) => {
          const letter = option.charAt(0);
          const isCorrect = submitted && letter === question.answer;
          const isWrong = submitted && letter === selectedAnswer && !isCorrect;
          return (
            <button
              className={`quiz-option${selectedAnswer === letter ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' incorrect' : ''}`}
              key={option}
              onClick={() => !submitted && setSelectedAnswer(letter)}
              disabled={submitted}
            >
              <span className="quiz-option-letter">{letter}</span>
              <span>{option.substring(3)}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`quiz-feedback ${selectedAnswer === question.answer ? 'correct' : 'incorrect'}`} aria-live="polite">
          <strong>{selectedAnswer === question.answer ? 'Correct!' : `Incorrect. Answer: ${question.answer}`}</strong>
          <p>{question.exp}</p>
        </div>
      )}

      <div className="quiz-actions">
        {!submitted ? (
          <button className="btn btn-primary" onClick={submit} disabled={!selectedAnswer}>Submit Answer</button>
        ) : (
          <button className="btn btn-primary" onClick={next}>
            {questionNumber === sessionQuestions.length - 1 ? 'Finish Session' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
