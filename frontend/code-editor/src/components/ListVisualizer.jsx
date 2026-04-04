/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react'
import './ListVisualizer.css'

function getChangedIndices(prev, curr) {
  if (!prev || !Array.isArray(prev) || !Array.isArray(curr)) return []
  const changed = []
  for (let i = 0; i < Math.max(prev.length, curr.length); i++) {
    if (prev[i] !== curr[i]) changed.push(i)
  }
  return changed
}

export default function ListVisualizer({ name, current, previous, type = 'list', pythonType = 'list' }) {
  const changedIndices = getChangedIndices(previous, current)
  const [animating, setAnimating] = useState([])
  const [swapPair, setSwapPair] = useState([])

  useEffect(() => {
    if (changedIndices.length > 0) {
      setSwapPair(changedIndices)
      setAnimating(changedIndices)
      const timer = setTimeout(() => {
        setAnimating([])
        setSwapPair([])
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [current?.join?.('+')])

  return (
    <div className="list-viz">
      <div className="var-header">
        <span className="var-name">{name}</span>
        <span className="var-type-badge">{type} ({pythonType})</span>
        <span className="var-length">[{current.length}]</span>
        {changedIndices.length > 0 && (
          <span className="change-note">
            ↺ index {changedIndices.join(', ')} changed
          </span>
        )}
      </div>

      {/* Node chain */}
      <div className="node-chain">
        {current.map((val, i) => {
          const isChanged = changedIndices.includes(i)
          const isAnimating = animating.includes(i)
          const isSwap = swapPair.includes(i)

          return (
            <React.Fragment key={i}>
              {/* Node */}
              <div className={`node-wrapper ${isAnimating && isChanged ? 'node-animating' : ''} ${isSwap ? 'node-swap' : ''}`}>
                {/* Index label above */}
                <div className="node-index">{i}</div>

                {/* Circle node */}
                <div className={`node-circle ${isAnimating && isChanged ? 'node-changed' : ''}`}>
                  <span className="node-value">{String(val)}</span>

                  {/* Pulse ring on change */}
                  {isAnimating && isChanged && (
                    <div className="node-pulse-ring" />
                  )}
                </div>

                {/* HEAD label */}
                {i === 0 && (
                  <div className="node-head-label">HEAD</div>
                )}

                {/* TAIL label */}
                {i === current.length - 1 && (
                  <div className="node-tail-label">TAIL</div>
                )}
              </div>

              {/* Arrow between nodes */}
              {i < current.length - 1 && (
                <div className={`node-arrow ${swapPair.includes(i) || swapPair.includes(i + 1) ? 'arrow-active' : ''}`}>
                  <div className="arrow-line" />
                  <div className="arrow-head" />
                </div>
              )}

              {/* NULL terminator at end */}
              {i === current.length - 1 && (
                <div className="null-terminator">
                  <div className="null-arrow">
                    <div className="arrow-line" />
                    <div className="arrow-head" />
                  </div>
                  <div className="null-box">NULL</div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Index row below nodes */}
      <div className="node-meta-row">
        {current.map((val, i) => (
          <div key={i} className="node-meta-item">
            <div className={`node-meta-val ${animating.includes(i) && changedIndices.includes(i) ? 'meta-changed' : ''}`}>
              {String(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}