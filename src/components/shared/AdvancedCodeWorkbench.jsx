import { useMemo, useState } from 'react';
import { Check, Clipboard, Code2 } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { ADVANCED_STRUCTURE_CODE } from '../../data/advancedStructureCode';
import '../../styles/AdvancedCodeWorkbench.css';

const LANGUAGES = [
  ['js', 'JS'],
  ['python', 'Python'],
  ['cpp', 'C++'],
  ['csharp', 'C#'],
  ['java', 'Java'],
];

export default function AdvancedCodeWorkbench({ structure, activeStep, executionSteps, stepIndex = -1 }) {
  const t = useT();
  const data = ADVANCED_STRUCTURE_CODE[structure];
  const trace = activeStep?.codeTrace;
  const tracedHelper = data.helpers[trace?.functionKey] ? trace.functionKey : data.defaultHelper;
  const [mode, setMode] = useState('visualizer');
  const [language, setLanguage] = useState('js');
  const [manualSelection, setManualSelection] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const helper = manualSelection?.executionSteps === executionSteps
    && manualSelection.stepIndex === stepIndex
    && manualSelection.stepId === trace?.stepId
    ? manualSelection.helper
    : tracedHelper;

  const selectedHelper = data.helpers[helper] ?? data.helpers[data.defaultHelper];
  const source = mode === 'implementation'
    ? data.implementations[language]
    : selectedHelper.codeByLang[language].join('\n');
  const activeLine = useMemo(() => {
    if (mode === 'implementation') {
      const functionStart = data.implementationLineMap[language]?.[helper] ?? -1;
      const semanticOffset = selectedHelper.lineByStep[language]?.[trace?.stepId] ?? 0;
      return functionStart < 0 ? -1 : functionStart + semanticOffset;
    }
    return selectedHelper.lineByStep[language]?.[trace?.stepId] ?? -1;
  }, [data.implementationLineMap, helper, language, mode, selectedHelper, trace?.stepId]);
  const lines = source.split('\n');

  const copySource = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(source);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  return (
    <aside className="advanced-code-workbench" aria-label={t('codePanel.ariaLabel')}>
      <header className="advanced-code-header">
        <h2><Code2 size={16} aria-hidden="true" /> {t('codePanel.title')}</h2>
        <div className="advanced-code-mode" role="group" aria-label={t('codePanel.modeLabel')}>
          <button type="button" aria-pressed={mode === 'visualizer'} onClick={() => setMode('visualizer')}>
            {t('codePanel.visualizerMode')}
          </button>
          <button type="button" aria-pressed={mode === 'implementation'} onClick={() => setMode('implementation')}>
            {t('codePanel.fullImplementation')}
          </button>
        </div>
      </header>
      <div className="advanced-code-toolbar">
        {mode === 'visualizer' && (
          <label className="advanced-code-helper">
            <span>{t('codePanel.helperLabel')}</span>
            <select
              value={helper}
              onChange={(event) => {
                setManualSelection({
                  executionSteps,
                  stepIndex,
                  stepId: trace?.stepId,
                  helper: event.target.value,
                });
              }}
            >
              {Object.entries(data.helpers).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
          </label>
        )}
        <div className="advanced-code-languages" role="group" aria-label={t('codePanel.languageLabel')}>
          {LANGUAGES.map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={language === key}
              onClick={() => {
                setLanguage(key);
                setCopyStatus('');
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="advanced-code-copy" onClick={copySource}>
          {copyStatus === 'copied' ? <Check size={14} /> : <Clipboard size={14} />}
          {t(copyStatus === 'copied' ? 'codePanel.copied' : 'codePanel.copy')}
        </button>
      </div>
      {copyStatus === 'error' && <p className="advanced-code-copy-error" role="status">{t('codePanel.copyError')}</p>}
      <div className="advanced-code-step" aria-live="polite">
        {activeStep?.msg ?? activeStep?.explanation ?? t('codePanel.waitingForStep')}
      </div>
      <pre className="advanced-code-source" aria-label={`${t('codePanel.title')} ${language}`}>
        <code>
          {lines.map((line, index) => (
            <span className={`advanced-code-line${index === activeLine ? ' is-active' : ''}`} key={`${index}-${line}`}>
              <span className="advanced-code-line-number" aria-hidden="true">{index + 1}</span>
              <span>{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </aside>
  );
}
