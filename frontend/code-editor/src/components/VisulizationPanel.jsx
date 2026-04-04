import React, { useMemo } from 'react'
import ListVisualizer from './ListVisualizer'
import DictVisualizer from './DictVisualizer'
import ScalarVisualizer from './ScalarVisualizer'
import './VisualizationPanel.css'
import ArrayVisualizer from './ArrayVisualizer'

export default function VisualizationPanel({ steps, currentStep, detectedStructures, activeStep }) {
  // Group all variables at current step to get their latest values
  const variables = useMemo(() => {
    const map = {}
    const prevMap = {}

    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i]
      if (s) {
        if (i < currentStep && steps[i].variable) {
          prevMap[steps[i].variable] = steps[i].value
        }
        if (steps[i].variable) {
          map[steps[i].variable] = {
            ...steps[i],
            prevValue: prevMap[steps[i].variable] ?? null
          }
        }
      }
    }

    return Object.values(map)
  }, [steps, currentStep])

  const prevVariables = useMemo(() => {
    const map = {}
    for (let i = 0; i < currentStep; i++) {
      const s = steps[i]
      if (s?.variable) map[s.variable] = s.value
    }
    return map
  }, [steps, currentStep])

 const renderVariable = (varInfo) => {
  const prev = prevVariables[varInfo.variable]
  const displayType = varInfo.visual_type || varInfo.type
  const pythonType = varInfo.python_type || varInfo.type

  switch (displayType) {
    case 'array':
  return (
    <ArrayVisualizer
      key={varInfo.variable}
      name={varInfo.variable}
      current={varInfo.value}
      previous={prev}
      type={displayType}
      pythonType={pythonType}
    />
  )

case 'list':
  return (
    <ListVisualizer
      key={varInfo.variable}
      name={varInfo.variable}
      current={varInfo.value}
      previous={prev}
      type={displayType}
      pythonType={pythonType}
    />
  )

    case 'dict':
      return (
        <DictVisualizer
          key={varInfo.variable}
          name={varInfo.variable}
          current={varInfo.value}
          previous={prev}
        />
      )

    default:
      return (
        <ScalarVisualizer
          key={varInfo.variable}
          name={varInfo.variable}
          type={pythonType}
          current={varInfo.value}
          previous={prev}
        />
      )
  }
}

  return (
    <div className="viz-panel">
      <div className="viz-panel-header">
        <span className="viz-title">Variable State</span>
        <div className="viz-meta">
          {detectedStructures.map(s => (
            <span key={s} className="structure-tag">{s}</span>
          ))}
        </div>
      </div>

      <div className="step-info-banner">
        <div className="step-info-row">
          <span className="step-info-label">Step</span>
          <span className="step-info-value cyan">{currentStep + 1} / {steps.length}</span>
        </div>
        {activeStep && (
          <div className="step-info-row">
            <span className="step-info-label">Line</span>
            <span className="step-info-value orange">{activeStep.line}</span>
          </div>
        )}
        {activeStep && (
          <div className="step-info-row">
            <span className="step-info-label">Variable</span>
            <span className="step-info-value green">{activeStep.variable}</span>
          </div>
        )}
      </div>

      <div className="viz-variables">
        {variables.length === 0 && (
          <div className="viz-empty">No variables yet</div>
        )}
        {variables.map(renderVariable)}
      </div>
    </div>
  )
}
