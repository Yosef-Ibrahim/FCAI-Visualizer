import { useState, useCallback, useEffect } from 'react';

const TRACING_DATA = {
  sorting: {
    bubbleSort: {
      name: 'Bubble Sort',
      dataType: 'array',
      steps: [
        { state: [5, 3, 8, 1, 9], action: 'compare', indices: [0, 1], question: 'Compare index 0 and 1. Should we swap?', options: ['A) Yes, 5 > 3', 'B) No, 5 < 3', 'C) Always swap', 'D) Never swap'], answer: 'A' },
        { state: [3, 5, 8, 1, 9], action: 'compare', indices: [1, 2], question: 'Compare index 1 and 2. Should we swap?', options: ['A) Yes', 'B) No, 5 < 8', 'C) Always', 'D) Never'], answer: 'B' },
        { state: [3, 5, 1, 8, 9], action: 'swap', indices: [2, 3], question: 'Swap indices 2 and 3?', options: ['A) Yes', 'B) No', 'C) Maybe', 'D) Skip'], answer: 'A' },
        { state: [1, 3, 5, 8, 9], action: 'done', indices: [], question: 'Is the array sorted?', options: ['A) Yes', 'B) No', 'C) Partially', 'D) Unknown'], answer: 'A' },
      ]
    },
    insertionSort: {
      name: 'Insertion Sort', 
      dataType: 'array',
      steps: [
        { state: [3, 5, 8, 1, 9], action: 'key', indices: [3], question: 'Select key element at index 3. What is the key value?', options: ['A) 3', 'B) 5', 'C) 1', 'D) 8'], answer: 'C' },
        { state: [3, 5, 8, 1, 9], action: 'compare', indices: [2, 3], question: 'Compare 8 with key (1). Which is larger?', options: ['A) 8', 'B) 1', 'C) Equal', 'D) Cannot tell'], answer: 'A' },
        { state: [3, 5, 8, 8, 9], action: 'shift', indices: [2, 3], question: 'Shift element at index 2 right. What happens to 8?', options: ['A) Moves to index 3', 'B) Stays', 'C) Deleted', 'D) Duplicated'], answer: 'A' },
        { state: [1, 3, 5, 8, 9], action: 'insert', indices: [0], question: 'Insert key at index 0. Array is now:', options: ['A) [1,3,5,8,9]', 'B) [3,5,1,8,9]', 'C) [3,5,8,1,9]', 'D) [3,5,8,9,1]'], answer: 'A' },
      ]
    },
    quickSort: {
      name: 'Quick Sort',
      dataType: 'array', 
      steps: [
        { state: [5, 3, 8, 1, 9], action: 'pivot', indices: [4], question: 'Select last element as pivot. What is the pivot value?', options: ['A) 5', 'B) 3', 'C) 8', 'D) 9'], answer: 'D' },
        { state: [5, 3, 8, 1, 9], action: 'compare', indices: [0, 3], question: 'Compare 5 with 1. 5 > 1, so move left?', options: ['A) Yes, swap', 'B) No, stay', 'C) Skip', 'D) Error'], answer: 'A' },
        { state: [1, 3, 8, 5, 9], action: 'partition', indices: [2, 4], question: 'Partition complete. Where does 5 go?', options: ['A) Index 2', 'B) Index 3', 'C) Index 1', 'D) Index 4'], answer: 'A' },
      ]
    }
  },
  searching: {
    linearSearch: {
      name: 'Linear Search',
      dataType: 'array',
      steps: [
        { state: [5, 3, 8, 1, 9], action: 'check', indices: [0], question: 'Check first element: 5. Is this target 8?', options: ['A) Yes', 'B) No', 'C) Skip', 'D) Done'], answer: 'B' },
        { state: [5, 3, 8, 1, 9], action: 'check', indices: [1], question: 'Check next: 3. Is this target 8?', options: ['A) Yes', 'B) No', 'C) Skip', 'D) Done'], answer: 'B' },
        { state: [5, 3, 8, 1, 9], action: 'found', indices: [2], question: 'Found 8 at index 2! Return:', options: ['A) Index 2', 'B) Index 3', 'C) -1', 'D) Not found'], answer: 'A' },
      ]
    },
    binarySearch: {
      name: 'Binary Search',
      dataType: 'sorted_array',
      steps: [
        { state: [1, 3, 5, 8, 9], action: 'mid', indices: [2], question: 'Search for 5 in [1,3,5,8,9]. Find middle index.', options: ['A) 2', 'B) 1', 'C) 3', 'D) 0'], answer: 'A' },
        { state: [1, 3, 5, 8, 9], action: 'compare', indices: [2], question: 'Middle value is 5. Target is 5. Found?', options: ['A) Yes - return 2', 'B) No - search left', 'C) No - search right', 'D) Continue'], answer: 'A' },
      ]
    }
  },
  trees: {
    bstInsert: {
      name: 'BST Insert',
      dataType: 'tree',
      steps: [
        { state: { root: 10, left: null, right: null }, action: 'insert', indices: [], question: 'Insert 5 into tree with root 10. 5 < 10, go:', options: ['A) Left', 'B) Right', 'C) Stay', 'D) Replace'], answer: 'A' },
        { state: { root: 10, left: 5, right: null }, action: 'place', indices: [], question: 'Insert 5 as left child of 10. Tree is now:', options: ['A) 10→(5,null,null)', 'B) 5→(10,null,null)', 'C) Both children', 'D) Empty'], answer: 'A' },
      ]
    },
    bstSearch: {
      name: 'BST Search',
      dataType: 'tree',
      steps: [
        { state: { root: 10, left: 5, right: 15 }, action: 'check', indices: [], question: 'Search for 5. Root is 10. 5 < 10, go:', options: ['A) Left', 'B) Right', 'C) Found', 'D) Stop'], answer: 'A' },
        { state: { root: 10, left: 5, right: 15 }, action: 'found', indices: [], question: 'At node 5. Found target?', options: ['A) Yes', 'B) No', 'C) Continue', 'D) Error'], answer: 'A' },
      ]
    }
  },
  graphs: {
    bfs: {
      name: 'BFS',
      dataType: 'graph',
      steps: [
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'start', indices: [], question: 'Start BFS from node A. Add neighbors to queue:', options: ['A) B, C', 'B) A', 'C) D', 'D) All'], answer: 'A' },
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'visit', indices: [], question: 'Visit A, then dequeue next:', options: ['A) B', 'B) C', 'C) B and C', 'D) None'], answer: 'B' },
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'neighbors', indices: [], question: 'From B, add unvisited neighbors:', options: ['A) D', 'B) A, C', 'C) None', 'D) All'], answer: 'A' },
      ]
    },
    dfs: {
      name: 'DFS',
      dataType: 'graph',
      steps: [
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'push', indices: [], question: 'Start DFS from A. Push to stack:', options: ['A) A', 'B) B', 'C) All', 'D) None'], answer: 'A' },
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'visit', indices: [], question: 'Pop A and visit. Next unvisited neighbor?', options: ['A) B', 'B) C', 'C) Same time', 'D) Stop'], answer: 'A' },
        { state: { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] }, action: 'recurse', indices: [], question: 'Push B, visit. Next neighbor?', options: ['A) D', 'B) A', 'C) Backtrack', 'D) Done'], answer: 'A' },
      ]
    }
  }
};

const DEFAULT_STEPS = {
  sorting: [
    { state: [5, 3, 8, 1], action: 'compare', indices: [0, 1], question: 'Compare elements at index 0 and 1:', options: ['A) Swap (5>3)', 'B) No swap (5<3)', 'C) Always swap', 'D) Never swap'], answer: 'A' },
    { state: [3, 5, 8, 1], action: 'compare', indices: [1, 2], question: 'Compare index 1 and 2:', options: ['A) Swap', 'B) No swap (5<8)', 'C) Always', 'D) Never'], answer: 'B' },
    { state: [3, 5, 1, 8], action: 'swap', indices: [2, 3], question: 'Swap indices 2 and 3?', options: ['A) Yes', 'B) No', 'C) Maybe', 'D) Skip'], answer: 'A' },
    { state: [1, 3, 5, 8], action: 'done', indices: [], question: 'Array sorted!', options: ['A) Done', 'B) Continue', 'C) Stop', 'D) Clear'], answer: 'A' }
  ],
  searching: [
    { state: [5, 3, 8, 1], action: 'check', indices: [0], question: 'Check first element - is it target?', options: ['A) Yes', 'B) No, continue', 'C) Stop', 'D) Error'], answer: 'B' },
    { state: [5, 3, 8, 1], action: 'found', indices: [2], question: 'Found 8 at index:', options: ['A) 2', 'B) 3', 'C) 0', 'D) Not found'], answer: 'A' }
  ],
  trees: [
    { state: { root: 10 }, action: 'insert', indices: [], question: 'Insert 5 into BST(10). Go:', options: ['A) Left', 'B) Right', 'C) Replace', 'D) Error'], answer: 'A' },
    { state: { root: 10, left: 5 }, action: 'done', indices: [], question: 'Done! Tree structure:', options: ['A) 10→(5,null,null)', 'B) 5→(10,null,null)', 'C) 10���(null,5,null)', 'D) Invalid'], answer: 'A' }
  ],
  graphs: [
    { state: { A: ['B', 'C'], B: ['A'] }, action: 'start', indices: [], question: 'Start from A. Visit order:', options: ['A) A→B→C', 'B) A→C→B', 'C) B→C→A', 'D) Any'], answer: 'A' }
  ]
};

export default function TracePanel({ topic, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const availableAlgorithms = TRACING_DATA[topic] || TRACING_DATA.sorting;
  const algorithms = Object.keys(availableAlgorithms);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0] || 'bubbleSort');
  
  const steps = availableAlgorithms[selectedAlgorithm]?.steps || DEFAULT_STEPS[topic] || DEFAULT_STEPS.sorting;
  
  const step = steps[currentStep];

  const handleAnswer = (answer) => {
    if (submitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || submitted) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === step.answer;
    if (isCorrect) setScore((s) => s + 10);
    setFeedback({
      isCorrect,
      explanation: isCorrect ? 'Correct!' : `Wrong! Correct answer: ${step.answer}`
    });
  };

  const handleNext = () => {
    if (onComplete && submitted) {
      onComplete(topic, selectedAnswer === step.answer);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setFeedback(null);
    } else {
      setCurrentStep(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setFeedback(null);
    }
  };

  const getOptionClass = (option) => {
    const letter = option.charAt(0);
    let classes = 'quiz-option';
    if (submitted) {
      if (letter === step.answer) classes += ' correct';
      else if (letter === selectedAnswer) classes += ' incorrect';
    } else if (letter === selectedAnswer) {
      classes += ' selected';
    }
    return classes;
  };

  if (topic === 'sorting' || topic === 'searching') {
    return (
      <div className="trace-visual">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <select 
            value={selectedAlgorithm}
            onChange={(e) => {
              setSelectedAlgorithm(e.target.value);
              setCurrentStep(0);
              setSelectedAnswer(null);
              setSubmitted(false);
              setFeedback(null);
            }}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem' }}
          >
            {algorithms.map((algo) => (
              <option key={algo} value={algo}>{availableAlgorithms[algo]?.name || algo}</option>
            ))}
          </select>
          <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            Score: {score}
          </div>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Step {currentStep + 1}: {step?.action || 'Start'}
        </h3>

        {step?.state && Array.isArray(step.state) && (
          <div className="trace-array">
            {step.state.map((val, idx) => (
              <div 
                key={idx} 
                className={`trace-element ${step.indices?.includes(idx) ? 'comparing' : ''}`}
              >
                {val}
              </div>
            ))}
          </div>
        )}

        {step?.state && !Array.isArray(step.state) && (
          <div style={{ 
            background: 'var(--surface2)', 
            padding: '1rem', 
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            {JSON.stringify(step.state, null, 2)}
          </div>
        )}

        {step?.question && (
          <>
            <div className="quiz-question" style={{ marginTop: '1.5rem' }}>
              <h3 className="quiz-question-text">{step.question}</h3>
            </div>

            <div className="quiz-options">
              {step.options?.map((option) => (
                <button
                  key={option}
                  className={getOptionClass(option)}
                  onClick={() => handleAnswer(option.charAt(0))}
                  disabled={submitted}
                >
                  <span className="quiz-option-letter">{option.charAt(0)}</span>
                  <span>{option.substring(3)}</span>
                </button>
              ))}
            </div>

            {feedback && (
              <div className={`quiz-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="quiz-feedback-title">
                  {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="quiz-feedback-text">
                  {feedback.explanation}
                </div>
              </div>
            )}

            <div className="quiz-actions">
              {!submitted ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleNext}>
                  {currentStep < steps.length - 1 ? 'Next Step →' : 'Restart ↻'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="trace-visual">
      <h2 style={{ marginBottom: '1rem' }}>Tracing: {topic}</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Select a topic above to start tracing practice.
      </p>
    </div>
  );
}