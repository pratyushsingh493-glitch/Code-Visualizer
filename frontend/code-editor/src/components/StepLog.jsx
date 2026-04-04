import React, { useEffect, useRef } from 'react'
import './StepLog.css'

export default function StepLog({ steps, currentStep, onJumpTo }) {
  const activeRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const item = activeRef.current
      
      const itemTop = item.offsetTop
      const itemBottom = itemTop + item.offsetHeight
      
      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.clientHeight
      
      // If item is out of view (either above or below)
      if (itemBottom > containerBottom || itemTop < containerTop) {
        // Scroll so the active item is positioned in the middle of the list
        container.scrollTo({
          top: itemTop - (container.clientHeight / 2) + (item.offsetHeight / 2),
          behavior: 'smooth'
        })
      }
    }
  }, [currentStep])

  const getStepIcon = (step, index) => {
    if (index < currentStep) return '✓'
    if (index === currentStep) return '▶'
    return '○'
  }

  const formatValue = (val) => {
    if (Array.isArray(val)) return `[${val.join(', ')}]`
    if (typeof val === 'object' && val !== null) return JSON.stringify(val)
    return String(val)
  }

  return (
    <div className="step-log">
      <div className="step-log-header">
        <span className="step-log-title">Execution Log</span>
        <span className="step-log-count">{steps.length} steps</span>
      </div>
      <div className="step-log-list" ref={containerRef}>
        {steps.map((step, i) => {
          const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
          return (
            <div
              key={i}
              ref={i === currentStep ? activeRef : null}
              className={`step-log-item ${status}`}
              onClick={() => onJumpTo(i)}
              title={`Jump to step ${i + 1}`}
            >
              <div className="step-log-icon">{getStepIcon(step, i)}</div>
              <div className="step-log-content">
                <div className="step-log-top">
                  <span className="step-log-line">L{step.line}</span>
                  <span className="step-log-var">{step.variable}</span>
                  <span className="step-log-type">
  {step.visual_type ? `${step.visual_type} (${step.python_type})` : step.type}
</span>
                </div>
                <div className="step-log-value">{formatValue(step.value)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
