import React, { useState } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, RefreshCw, Edit3, Check } from 'lucide-react';

/**
 * ControlPanel — shared by Sorting and Searching pages.
 *
 * New props (all optional, backwards-compatible):
 *   customInput    {string}   current value of the custom-input field
 *   setCustomInput {Function} setter
 *   onApplyCustom  {Function} called when user presses Apply
 *   extraControls  {ReactNode} any extra UI to slot in (e.g. target-value input)
 */
export default function ControlPanel({
  isPlaying,
  onPlayPause,
  onReset,
  onStepBack,
  onStepForward,
  onGenerateRandom,
  algorithm,
  setAlgorithm,
  arraySize,
  setArraySize,
  speed,
  setSpeed,
  algorithms,
  // ── new optional ──────────────────────────────────────
  customInput    = '',
  setCustomInput = null,
  onApplyCustom  = null,
  extraControls  = null,
}) {
  const [inputError, setInputError] = useState(false);

  const handleApply = () => {
    if (!onApplyCustom) return;
    const raw = customInput.trim();
    // Validate: must be comma-separated integers
    const nums = raw.split(',').map(s => parseInt(s.trim(), 10));
    if (raw === '' || nums.some(isNaN) || nums.length < 2) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1200);
      return;
    }
    setInputError(false);
    onApplyCustom(nums);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="sorting-controls">
      {/* ── Row 1: Algorithm selector + Generate ─────────────────────── */}
      <div className="control-group">
        <select
          className="control-select"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          {Object.entries(algorithms).map(([key, data]) => (
            <option key={key} value={key}>{data.name}</option>
          ))}
        </select>

        <button className="btn" onClick={onGenerateRandom}>
          <RefreshCw size={14} /> Random
        </button>
      </div>

      {/* ── Row 2: Custom Input ───────────────────────────────────────── */}
      {setCustomInput && (
        <div className="control-group">
          <Edit3 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className={`custom-input-field${inputError ? ' input-error' : ''}`}
            placeholder="e.g.  5, 3, 8, 1, 9"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            title="Enter comma-separated integers then press Apply"
          />
          <button className="btn success" onClick={handleApply} title="Apply custom input">
            <Check size={13} /> Apply
          </button>
        </div>
      )}

      {/* ── Row 3: Extra slot (e.g. target-value input) ───────────────── */}
      {extraControls && (
        <div className="control-group">{extraControls}</div>
      )}

      {/* ── Row 4: Size + Speed sliders ──────────────────────────────── */}
      <div className="control-group">
        <div className="slider-group">
          <span>Size</span>
          <input
            type="range"
            min="5"
            max={algorithm === 'radix' ? '30' : algorithm === 'merge' ? '25' : '50'}
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
          />
          <span>{arraySize}</span>
        </div>

        <div className="slider-group">
          <span>Speed</span>
          <input
            type="range"
            min="1"
            max="15"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}x</span>
        </div>
      </div>

      {/* ── Row 5: Playback controls ──────────────────────────────────── */}
      <div className="control-group" style={{ marginLeft: 'auto' }}>
        <button className="btn" onClick={onStepBack} disabled={isPlaying}>
          <SkipBack size={14} />
        </button>
        <button
          className={`btn ${isPlaying ? 'danger' : 'primary'}`}
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button className="btn" onClick={onStepForward} disabled={isPlaying}>
          <SkipForward size={14} />
        </button>
        <button className="btn" onClick={onReset}>
          <Square size={14} /> Reset
        </button>
      </div>
    </div>
  );
}



