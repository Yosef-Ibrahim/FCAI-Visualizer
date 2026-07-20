import React from 'react';

const LANG_LABELS = {
  js:     'JS',
  python: 'Python',
  cpp:    'C++',
  java:   'Java',
  csharp: 'C#',
};

/**
 * CodePanel — displays algorithm code with syntax-highlighted active line.
 *
 * Props:
 *   codeByLang  {Object}   { js, python, cpp, java, csharp } — multi-lang map
 *   codeSnippet {string}   legacy single-string fallback
 *   activeLine  {number}   0-based index of the line to highlight (-1 = none)
 *   lang        {string}   currently selected language key
 *   setLang     {Function} called when user clicks a tab
 */
export default function CodePanel({ codeByLang, codeSnippet, activeLine, lang = 'js', setLang }) {
  // Resolve code string: prefer multi-lang map, fall back to legacy prop
  const resolvedSnippet = codeByLang
    ? (codeByLang[lang] ?? codeByLang.js ?? '')
    : (codeSnippet ?? '');

  if (!resolvedSnippet) return null;

  const lines = resolvedSnippet.split('\n');

  return (
    <div className="panel-card code-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Implementation</h3>

        {/* Language tab bar */}
        {codeByLang && setLang && (
          <div className="lang-tab-bar">
            {Object.entries(LANG_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`lang-tab${lang === key ? ' active' : ''}`}
                onClick={() => setLang(key)}
                title={`View in ${label}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <pre>
        <code>
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`code-line${activeLine === idx ? ' active' : ''}`}
            >
              <span className="line-num">{idx + 1}</span>
              <span className="line-text">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
