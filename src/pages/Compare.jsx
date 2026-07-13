import { useState, useRef, useEffect } from 'react';
import { getAllAlgorithms, getAlgorithm } from '../application/AlgorithmRegistry';
import { CanvasRenderer } from '../infrastructure/canvas/CanvasRenderer';
import { GraphCanvasRenderer } from '../infrastructure/canvas/GraphCanvasRenderer';
import { DataStructureRenderer } from '../infrastructure/canvas/DataStructureRenderer';

const CATEGORY_LABELS = {
  sorting: 'Sorting', searching: 'Searching',
  trees: 'Trees', graphs: 'Graphs', 'data-structures': 'Data Structures',
};

export default function Compare() {
  const [algoA, setAlgoA] = useState('bubble');
  const [algoB, setAlgoB] = useState('quick');
  const [stepsA, setStepsA] = useState([]);
  const [stepsB, setStepsB] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [input, setInput] = useState('30, 20, 40, 10, 25, 35, 50');
  const [metrics, setMetrics] = useState(null);

  const canvasARef = useRef(null);
  const canvasBRef = useRef(null);
  const rendererARef = useRef(null);
  const rendererBRef = useRef(null);

  const allAlgos = getAllAlgorithms();
  const categories = [...new Set(allAlgos.map(a => a.category))];

  const getAlgosByCategory = (cat) => allAlgos.filter(a => a.category === cat);

  const runComparison = () => {
    try {
      const parsedInput = input.split(',').map(s => s.trim()).filter(Boolean).map(Number);
      const algo1 = getAlgorithm(algoA);
      const algo2 = getAlgorithm(algoB);

      const startA = performance.now();
      const sA = algo1.generateSteps(algo1.category === 'graphs'
        ? { nodes: ['A','B','C','D','E'], edges: [['A','B'],['A','C'],['B','D'],['C','D'],['D','E']], start: 'A' }
        : parsedInput);
      const timeA = performance.now() - startA;

      const startB = performance.now();
      const sB = algo2.generateSteps(algo2.category === 'graphs'
        ? { nodes: ['A','B','C','D','E'], edges: [['A','B'],['A','C'],['B','D'],['C','D'],['D','E']], start: 'A' }
        : parsedInput);
      const timeB = performance.now() - startB;

      setStepsA(sA);
      setStepsB(sB);
      setStepIdx(0);
      setMetrics({ stepsA: sA.length, stepsB: sB.length, timeA: timeA.toFixed(2), timeB: timeB.toFixed(2) });
    } catch (e) {
      console.error('Comparison error:', e);
    }
  };

  useEffect(() => {
    if (stepsA.length === 0) return;
    const idx = Math.min(stepIdx, stepsA.length - 1);
    const stepA = stepsA[idx];
    const stepB = stepsB[Math.min(idx, stepsB.length - 1)];

    const renderStep = (canvasRef, rendererRef, algoId, step, fullSteps) => {
      if (!canvasRef.current) return;
      rendererRef.current?.destroy();
      const cat = getAlgorithm(algoId)?.category;
      if (cat === 'graphs') {
        rendererRef.current = new GraphCanvasRenderer(canvasRef.current);
        rendererRef.current.draw(step);
      } else if (cat === 'data-structures') {
        rendererRef.current = new DataStructureRenderer(canvasRef.current);
        rendererRef.current.draw(step);
      } else {
        rendererRef.current = new CanvasRenderer(canvasRef.current);
        rendererRef.current.draw(fullSteps, idx, algoId);
      }
    };

    renderStep(canvasARef, rendererARef, algoA, stepA, stepsA);
    renderStep(canvasBRef, rendererBRef, algoB, stepB, stepsB);
  }, [stepsA, stepsB, stepIdx, algoA, algoB]);

  useEffect(() => {
    return () => {
      rendererARef.current?.destroy();
      rendererBRef.current?.destroy();
    };
  }, []);

  return (
    <div className="page compare-page">
      <div className="page__header">
        <h1>Algorithm Comparison</h1>
        <p className="page__subtitle">Compare two algorithms side by side on the same input.</p>
      </div>

      <div className="compare-controls">
        <div className="compare-selectors">
          <div className="compare-selector">
            <label>Algorithm A</label>
            <select value={algoA} onChange={e => setAlgoA(e.target.value)}>
              {categories.map(cat => (
                <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                  {getAlgosByCategory(cat).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="compare-selector">
            <label>Algorithm B</label>
            <select value={algoB} onChange={e => setAlgoB(e.target.value)}>
              {categories.map(cat => (
                <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                  {getAlgosByCategory(cat).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="compare-input-row">
          <label>Input data (comma-separated):</label>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} className="compare-input" />
          <button className="compare-run-btn" onClick={runComparison}>Run Comparison</button>
        </div>
      </div>

      {metrics && (
        <div className="compare-metrics">
          <div className="compare-metric-card">
            <span className="metric-label">{getAlgorithm(algoA)?.name}</span>
            <span className="metric-value">{metrics.stepsA} steps</span>
            <span className="metric-sub">{metrics.timeA} ms</span>
          </div>
          <div className="compare-metric-card">
            <span className="metric-label">{getAlgorithm(algoB)?.name}</span>
            <span className="metric-value">{metrics.stepsB} steps</span>
            <span className="metric-sub">{metrics.timeB} ms</span>
          </div>
        </div>
      )}

      {stepsA.length > 0 && (
        <>
          <div className="compare-canvases">
            <div className="compare-canvas-wrapper">
              <h3>{getAlgorithm(algoA)?.name}</h3>
              <canvas ref={canvasARef} className="compare-canvas" />
              <p className="compare-msg">{stepsA[Math.min(stepIdx, stepsA.length - 1)]?.msg || ''}</p>
            </div>
            <div className="compare-canvas-wrapper">
              <h3>{getAlgorithm(algoB)?.name}</h3>
              <canvas ref={canvasBRef} className="compare-canvas" />
              <p className="compare-msg">{stepsB[Math.min(stepIdx, stepsB.length - 1)]?.msg || ''}</p>
            </div>
          </div>
          <div className="compare-stepper">
            <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}>◀ Prev</button>
            <span>Step {stepIdx + 1} / {Math.max(stepsA.length, stepsB.length)}</span>
            <button onClick={() => setStepIdx(Math.min(Math.max(stepsA.length, stepsB.length) - 1, stepIdx + 1))} disabled={stepIdx >= Math.max(stepsA.length, stepsB.length) - 1}>Next ▶</button>
          </div>
        </>
      )}
    </div>
  );
}
