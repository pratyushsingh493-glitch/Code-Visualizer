import React, { useState, useEffect } from 'react'
import './DictVisualizer.css'

export default function DictVisualizer({ name, current, previous }) {
  const [changedKeys, setChangedKeys] = useState([])

  useEffect(() => {
    if (!previous || typeof previous !== 'object') return
    const changed = Object.keys({ ...previous, ...current }).filter(
      k => JSON.stringify(current[k]) !== JSON.stringify(previous[k])
    )
    if (changed.length) {
      setChangedKeys(changed)
      const t = setTimeout(() => setChangedKeys([]), 900)
      return () => clearTimeout(t)
    }
  }, [JSON.stringify(current)])

  const entries = Object.entries(current || {})

  return (
    <div className="dict-viz">
      <div className="var-header">
        <span className="var-name">{name}</span>
        <span className="var-type-badge">dict</span>
        <span className="var-length">{entries.length} keys</span>
      </div>
      <div className="dict-entries">
        {entries.map(([k, v]) => (
          <div key={k} className={`dict-entry ${changedKeys.includes(k) ? 'changed' : ''}`}>
            <span className="dict-key">"{k}"</span>
            <span className="dict-arrow">→</span>
            <span className="dict-val">{JSON.stringify(v)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
