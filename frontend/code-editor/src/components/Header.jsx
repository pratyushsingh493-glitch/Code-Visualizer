import React from 'react'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">VIZ Pro</span>
        </div>
        <div className="header-tagline">Python Code Visualizer</div>
      </div>

      <div className="header-badges">
        <span className="badge badge-python">
          <span className="badge-dot" />
          Python
        </span>
        <span className="badge badge-live">
          <span className="badge-dot pulse" />
          Step-by-Step
        </span>
      </div>
    </header>
  )
}
