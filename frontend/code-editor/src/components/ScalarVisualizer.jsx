/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react'
import './ScalarVisualizer.css'

export default function ScalarVisualizer({ name, type, current, previous }) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (previous !== undefined && previous !== current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 800)
      return () => clearTimeout(t)
    }
  }, [current])

  const getTypeColor = () => {
    switch (type) {
      case 'int':    return 'cyan'
      case 'float':  return 'purple'
      case 'str':    return 'green'
      case 'bool':   return current ? 'green' : 'red'
      default:       return 'cyan'
    }
  }

  return (
    <div className={`scalar-viz ${flash ? 'flashing' : ''}`}>
      <div className="var-header">
        <span className="var-name">{name}</span>
        <span className={`var-type-badge type-${getTypeColor()}`}>{type}</span>
      </div>
      <div className={`scalar-value color-${getTypeColor()}`}>
        {type === 'str' ? `"${current}"` : String(current)}
      </div>
      {previous !== undefined && previous !== current && (
        <div className="scalar-prev">
          was: <span>{type === 'str' ? `"${previous}"` : String(previous)}</span>
        </div>
      )}
    </div>
  )
}
