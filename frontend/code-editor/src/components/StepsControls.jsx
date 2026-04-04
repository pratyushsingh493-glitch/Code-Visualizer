import React from 'react'
import './StepControls.css'

const SPEEDS = [
  { label: '0.5×', value: 1600 },
  { label: '1×',   value: 800  },
  { label: '2×',   value: 400  },
  { label: '4×',   value: 200  },
]

export default function StepControls({
  currentStep,
  totalSteps,
  isPlaying,
  playSpeed,
  onPlayPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="step-controls">
      {/* Progress bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-thumb"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="controls-row">
        {/* Left: step info */}
        <div className="ctrl-left">
          <span className="step-counter">
            <span className="step-cur">{currentStep + 1}</span>
            <span className="step-sep">/</span>
            <span className="step-tot">{totalSteps}</span>
          </span>
        </div>

        {/* Center: playback buttons */}
        <div className="ctrl-center">
          <button
            className="ctrl-btn"
            onClick={onReset}
            title="Reset"
            disabled={currentStep === 0 && !isPlaying}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          <button
            className="ctrl-btn"
            onClick={onStepBack}
            disabled={currentStep === 0}
            title="Previous step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
            </svg>
          </button>

          <button
            className="ctrl-btn play-btn"
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            className="ctrl-btn"
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
            title="Next step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>

          <button
            className="ctrl-btn"
            onClick={() => { onReset(); setTimeout(onStepForward, 0) }}
            title="Skip to end"
            disabled={currentStep >= totalSteps - 1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14 4.5 2.64-4.5 2.64V9.86zM16 6h2v12h-2z"/>
            </svg>
          </button>
        </div>

        {/* Right: speed selector */}
        <div className="ctrl-right">
          <span className="speed-label">Speed</span>
          <div className="speed-btns">
            {SPEEDS.map(s => (
              <button
                key={s.value}
                className={`speed-btn ${playSpeed === s.value ? 'active' : ''}`}
                onClick={() => onSpeedChange(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
