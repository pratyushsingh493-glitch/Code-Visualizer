import React, { useEffect, useState } from 'react'
import './ArrayVisualizer.css'

function getChangedIndices(prev, curr) {
  if (!prev || !Array.isArray(prev) || !Array.isArray(curr)) return []
  const changed = []
  for (let i = 0; i < Math.max(prev.length, curr.length); i++) {
    if (prev[i] !== curr[i]) changed.push(i)
  }
  return changed
}

export default function ArrayVisualizer({ name, current, previous, type = 'array', pythonType = 'list' }) {
  const changedIndices = getChangedIndices(previous, current)
  const [animating, setAnimating] = useState([])

  useEffect(() => {
    if (changedIndices.length > 0) {
      setAnimating(changedIndices)
      const timer = setTimeout(() => {
        setAnimating([])
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [JSON.stringify(current)])

  // Compute maximum value for bar graph scaling
  const numValues = current.filter(val => typeof val === 'number' && !isNaN(val));
  // Find relative max, using absolute value to handle negatives gracefully in height
  const maxNum = numValues.length > 0 ? Math.max(...numValues.map(Math.abs), 1) : 1;

  return (
    <div className="array-viz">
      <div className="var-header">
        <span className="var-name">{name}</span>
        <span className="var-type-badge">{type} ({pythonType})</span>
        <span className="var-length">[{current.length}]</span>
      </div>

      <div className="array-row">
        {current.map((val, i) => {
          const isAnimating = animating.includes(i);
          const isNumber = typeof val === 'number' && !isNaN(val);
          let heightPercent = 0;
          let isNegative = false;
          
          if (isNumber) {
            heightPercent = (Math.abs(val) / maxNum) * 100;
            isNegative = val < 0;
          }

          return (
            <div key={i} className="array-item-wrapper">
              <div className="bar-graph-area">
                {isNumber && (
                  <div 
                    className={`bar ${isAnimating ? 'bar-changed' : ''} ${isNegative ? 'bar-negative' : ''}`}
                    style={{ height: `${Math.max(heightPercent, 3)}%` }}
                  />
                )}
              </div>
              <div
                className={`array-cell ${isAnimating ? 'array-cell-changed' : ''}`}
              >
                <div className="array-index">{i}</div>
                <div className="array-value">{String(val)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}