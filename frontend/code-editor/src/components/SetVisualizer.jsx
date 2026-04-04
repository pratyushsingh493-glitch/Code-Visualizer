/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react'
import './SetVisualizer.css'

function normalizeSet(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return Object.values(data)
  return []
}

function getAddedRemoved(prev, curr) {
  const prevSet = new Set(normalizeSet(prev))
  const currSet = new Set(normalizeSet(curr))

  const added = []
  const removed = []

  currSet.forEach(item => {
    if (!prevSet.has(item)) added.push(item)
  })

  prevSet.forEach(item => {
    if (!currSet.has(item)) removed.push(item)
  })

  return { added, removed }
}

export default function SetVisualizer({
  name,
  current,
  previous,
  type = 'set',
  pythonType = 'set'
}) {
  const currentItems = normalizeSet(current)
  const { added, removed } = getAddedRemoved(previous, current)
  const [animatingAdded, setAnimatingAdded] = useState([])
  const [animatingRemoved, setAnimatingRemoved] = useState([])

  useEffect(() => {
    if (added.length > 0 || removed.length > 0) {
      setAnimatingAdded(added)
      setAnimatingRemoved(removed)

      const timer = setTimeout(() => {
        setAnimatingAdded([])
        setAnimatingRemoved([])
      }, 900)

      return () => clearTimeout(timer)
    }
  }, [JSON.stringify(current), JSON.stringify(previous)])

  return (
    <div className="set-viz">
      <div className="set-header">
        <span className="set-name">{name}</span>
        <span className="set-type-badge">{type} ({pythonType})</span>
        <span className="set-length">{`{${currentItems.length}}`}</span>
      </div>

      {(added.length > 0 || removed.length > 0) && (
        <div className="set-change-summary">
          {added.length > 0 && (
            <span className="set-added-text">
              + Added: {added.map(String).join(', ')}
            </span>
          )}
          {removed.length > 0 && (
            <span className="set-removed-text">
              − Removed: {removed.map(String).join(', ')}
            </span>
          )}
        </div>
      )}

      <div className="set-container">
        <div className="set-brace">{'{'}</div>

        <div className="set-items">
          {currentItems.length === 0 ? (
            <div className="set-empty">empty set</div>
          ) : (
            currentItems.map((item, index) => {
              const isAdded = animatingAdded.includes(item)

              return (
                <div
                  key={`${String(item)}-${index}`}
                  className={`set-item ${isAdded ? 'set-item-added' : ''}`}
                >
                  {String(item)}
                </div>
              )
            })
          )}
        </div>

        <div className="set-brace">{'}'}</div>
      </div>

      {animatingRemoved.length > 0 && (
        <div className="set-removed-box">
          <span className="set-removed-label">Recently removed:</span>
          <div className="set-removed-items">
            {animatingRemoved.map((item, index) => (
              <span key={`${String(item)}-${index}`} className="set-item removed">
                {String(item)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}