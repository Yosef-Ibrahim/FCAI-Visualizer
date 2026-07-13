import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlgorithm, getAlgorithmsByCategory } from '../application/AlgorithmRegistry';
import { SortingVisualizer } from '../algorithms/sorting/sortingVisualizer';
import { useLang } from '../hooks/useLang';

import ControlPanel from '../components/sorting/ControlPanel';
import CodePanel from '../components/sorting/CodePanel';
import ComplexityPanel from '../components/sorting/ComplexityPanel';

import '../styles/Sorting.css';

const SORTING_KEYS = ['bubble','selection','insertion','merge','quick','heap','counting','radix'];
const sortingAlgorithms = Object.fromEntries(
  getAlgorithmsByCategory('sorting')
    .filter(a => SORTING_KEYS.includes(a.id))
    .map(a => [a.id, a])
);

export default function Sorting() {
  const { algo: urlAlgo } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const initialAlgo = urlAlgo && sortingAlgorithms[urlAlgo] ? urlAlgo : 'bubble';

  const [algo,      setAlgo]      = useState(initialAlgo);
  const [arraySize, setArraySize] = useState(20);
  const [speed,     setSpeed]     = useState(5);
  const [array,     setArray]     = useState([]);
  const [steps,     setSteps]     = useState([]);
  const [stepIdx,   setStepIdx]   = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // ── Custom input ──────────────────────────────────────────────────────
  const [customInput, setCustomInput] = useState('');

  // ── Language persistence ──────────────────────────────────────────────
  const [lang, setLang] = useLang('js');

  // ── URL sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (urlAlgo && sortingAlgorithms[urlAlgo] && urlAlgo !== algo) {
      setAlgo(urlAlgo);
      generateArray(arraySize, urlAlgo);
      reset();
    }
  }, [urlAlgo]);

  // ── Canvas init ───────────────────────────────────────────────────────
  useEffect(() => {
    if (canvasRef.current) SortingVisualizer.init(canvasRef.current);
    return () => SortingVisualizer.stopAnimation();
  }, []);

  // ── Array generation ──────────────────────────────────────────────────
  const generateArray = (size, currentAlgo = algo) => {
    const instance = getAlgorithm(currentAlgo);
    const newArr = instance.getDefaultInput().slice(0, size);
    setArray(newArr);
    setCustomInput('');
    return newArr;
  };

  const applyCustomInput = (nums) => {
    setArray(nums);
  };

  useEffect(() => { generateArray(arraySize, algo); }, [arraySize]);

  // ── Step generation ───────────────────────────────────────────────────
  useEffect(() => {
    if (array.length > 0) {
      const instance = getAlgorithm(algo);
      const newSteps = instance.generateSteps([...array]);
      setSteps(newSteps);
      setStepIdx(-1);
      SortingVisualizer.setState({ array, steps: newSteps, algo, speed });
      SortingVisualizer.drawStep(-1);
    }
  }, [array, algo, speed]);

  useEffect(() => { SortingVisualizer.setState({ speed }); }, [speed]);

  // ── Controls ──────────────────────────────────────────────────────────
  const reset = () => {
    setIsPlaying(false);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    SortingVisualizer.stopAnimation();
    setStepIdx(-1);
    SortingVisualizer.drawStep(-1);
  };

  const stepForward = () => {
    if (stepIdx < steps.length - 1) {
      const next = stepIdx + 1;
      setStepIdx(next);
      SortingVisualizer.animateStep(next, null);
    }
  };

  const stepBack = () => {
    if (stepIdx >= 0) {
      const prev = stepIdx - 1;
      setStepIdx(prev);
      SortingVisualizer.drawStep(prev);
    }
  };

  // ── Play loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      if (stepIdx < steps.length - 1) {
        SortingVisualizer.animateStep(stepIdx + 1, () => {
          setStepIdx(prev => prev + 1);
        });
      } else {
        setIsPlaying(false);
      }
    }
    return () => SortingVisualizer.stopAnimation();
  }, [isPlaying, stepIdx]);

  // ── Derived ───────────────────────────────────────────────────────────
  const activeStep       = stepIdx >= 0 && steps[stepIdx] ? steps[stepIdx] : null;
  const activeLine       = activeStep
    ? (activeStep.codeLines?.[lang] ?? activeStep.codeLine ?? -1)
    : -1;
  const currentAlgoData  = sortingAlgorithms[algo];
  const metadata = currentAlgoData;
  const complexity = metadata?.complexity;
  const description = metadata?.explanation?.body
    ? metadata.explanation.body.replace(/<[^>]*>/g, '').substring(0, 200)
    : `${metadata?.name || algo} visualization`;
  const codeByLang = metadata?.codeSnippets
    ? Object.fromEntries(Object.entries(metadata.codeSnippets).map(([lang, lines]) => [lang, lines.join('\n')]))
    : null;

  return (
    <div className="sorting-page">
      <div className="sorting-header">
        <h2>{metadata?.name}</h2>
        {activeStep && (
          <div className="step-msg">{activeStep.msg}</div>
        )}
        <div aria-live="polite" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          {activeStep ? activeStep.msg : ''}
        </div>
      </div>

      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={reset}
        onStepBack={stepBack}
        onStepForward={stepForward}
        onGenerateRandom={() => generateArray(arraySize)}
        algorithm={algo}
        setAlgorithm={(a) => { setAlgo(a); navigate(`/sorting/${a}`); reset(); }}
        arraySize={arraySize}
        setArraySize={setArraySize}
        speed={speed}
        setSpeed={setSpeed}
        algorithms={sortingAlgorithms}
        customInput={customInput}
        setCustomInput={setCustomInput}
        onApplyCustom={applyCustomInput}
      />

      <div className="sorting-main">
        <div className="sorting-viz-container">
          <div className="sorting-canvas-wrapper">
            <canvas ref={canvasRef} role="img" aria-label="Sorting Visualization Canvas" />
          </div>
        </div>

        <div className="sorting-side-panel">
          <ComplexityPanel complexity={complexity} />

          <div className="panel-card">
            <h3>Description</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {description}
            </p>
          </div>

          <CodePanel
            codeByLang={codeByLang}
            codeSnippet={codeByLang?.[lang] || ''}
            activeLine={activeLine}
            lang={lang}
            setLang={setLang}
          />
        </div>
      </div>
    </div>
  );
}
