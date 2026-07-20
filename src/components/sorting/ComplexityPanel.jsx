import React from 'react';

export default function ComplexityPanel({ complexity }) {
  if (!complexity) return null;

  return (
    <div className="panel-card">
      <h3>Time & Space Complexity</h3>
      <div className="complexity-grid">
        <span className="complexity-label">Best Time:</span>
        <span className="complexity-value">{complexity.best}</span>
        
        <span className="complexity-label">Average Time:</span>
        <span className="complexity-value">{complexity.average}</span>
        
        <span className="complexity-label">Worst Time:</span>
        <span className="complexity-value">{complexity.worst}</span>
        
        <span className="complexity-label">Space Complexity:</span>
        <span className="complexity-value">{complexity.space}</span>
      </div>
    </div>
  );
}
