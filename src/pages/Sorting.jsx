import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAlgorithm, getAlgorithmsByCategory } from '../application/AlgorithmRegistry';
import { SortingVisualizer } from '../algorithms/sorting/sortingVisualizer';
import { useLang } from '../hooks/useLang';
import { useT } from '../hooks/useT';
import { stepText } from '../i18n/stepText';
import { hasTranslation } from '../i18n/exists';

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
  const location = useLocation();
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
  const t = useT();

  // ── Canvas init ───────────────────────────────────────────────────────
  useEffect(() => {
    if (canvasRef.current) SortingVisualizer.init(canvasRef.current);
    return () => SortingVisualizer.stopAnimation();
  }, []);

  // ── Array generation ──────────────────────────────────────────────────
  const generateArray = (size, currentAlgo = algo) => {
    const instance = getAlgorithm(currentAlgo);
    const newArr = instance.getDefaultInput(size);
    setArray(newArr);
    setCustomInput('');
    return newArr;
  };

  const applyCustomInput = (nums) => {
    setArray(nums);
  };

  /* eslint-disable react-hooks/set-state-in-effect -- playback engine pushes derived state into React by design */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => { SortingVisualizer.setState({ speed }); }, [speed]);

  // ── Controls ──────────────────────────────────────────────────────────
  const reset = () => {
    setIsPlaying(false);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    SortingVisualizer.stopAnimation();
    setStepIdx(-1);
    SortingVisualizer.drawStep(-1);
  };

  /* eslint-disable react-hooks/set-state-in-effect -- URL-driven playback state sync */
  // ── Deep-link sync (after the helpers above are declared) ─────────────
  useEffect(() => {
    if (urlAlgo && sortingAlgorithms[urlAlgo] && urlAlgo !== algo) {
      setAlgo(urlAlgo);
      generateArray(arraySize, urlAlgo);
      reset();
    }
  }, [urlAlgo]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  /* eslint-disable react-hooks/set-state-in-effect -- player loop ends itself when the trace is exhausted */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── Derived ───────────────────────────────────────────────────────────
  const activeStep       = stepIdx >= 0 && steps[stepIdx] ? steps[stepIdx] : null;
  const activeLine       = activeStep
    ? (activeStep.codeLines?.[lang] ?? activeStep.codeLine ?? -1)
    : -1;
  const currentAlgoData  = sortingAlgorithms[algo];
  const metadata = currentAlgoData;
  const algorithmName = t(`algorithms:${algo}.name`, { defaultValue: metadata?.name || algo });
  const complexity = metadata?.complexity;
  const description = ((hasTranslation(`algorithms:${algo}.explanation.intro`)
    ? t(`algorithms:${algo}.explanation.intro`)
    : '')
  )
    || (metadata?.explanation?.body
      ? metadata.explanation.body.replace(/<[^>]*>/g, '').substring(0, 200)
      : '')
    || t('sorting:descriptionFallback', { name: algorithmName });
  const codeByLang = metadata?.codeSnippets
    ? Object.fromEntries(Object.entries(metadata.codeSnippets).map(([lang, lines]) => [lang, lines.join('\n')]))
    : null;

  return (
    <div className="sorting-page">
      <div className="sorting-header">
        <h2>{algorithmName}</h2>
        {activeStep && (
          <div className="step-msg">{stepText(activeStep)}</div>
        )}
        <div aria-live="polite" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          {activeStep ? stepText(activeStep) : ''}
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
        setAlgorithm={(a) => {
          setAlgo(a);
          // Keep the algorithm switch inside the current (course or legacy) route.
          const base = location.pathname.startsWith('/courses/data-structure/sorting')
            ? '/courses/data-structure/sorting'
            : '/sorting';
          navigate(`${base}/${a}`);
          reset();
        }}
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
            <canvas ref={canvasRef} role="img" aria-label={t('sorting:canvasAria')} />
          </div>
        </div>

        <div className="sorting-side-panel">
          <ComplexityPanel complexity={complexity} algoId={algo} />

          <div className="panel-card">
            <h3>{t('panel.description')}</h3>
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
