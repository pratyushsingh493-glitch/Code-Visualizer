import React, { useRef, useEffect } from 'react'
import './Codepanel.css'

export default function Codepanel({ code, onChange, activeLine, onVisualize, isLoading }) {
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)

  // Sync scroll between textarea and highlight overlay
  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const lines = code.split('\n')

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newVal = code.substring(0, start) + '    ' + code.substring(end)
      onChange(newVal)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      }, 0)
    }
  }

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="editor-title">
          <span className='editor-filename'>welcome to Python code visualizer </span>
        </div>
        {activeLine && (
          <div className="active-line-badge">
            Line <span>{activeLine}</span>
          </div>
        )}
      </div>

      <div className="editor-body">
        {/* Line numbers */}
        <div className="line-numbers" aria-hidden="true">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`line-num ${activeLine === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Active line highlight overlay */}
        <div className="code-area-wrapper">
          <div className="line-highlight-overlay" ref={highlightRef} aria-hidden="true">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`line-highlight-row ${activeLine === i + 1 ? 'active' : ''}`}
              />
            ))}
          </div>

          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={code}
            onChange={e => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="# Write your Python code here..."
          />
        </div>
      </div>

      <div className="editor-footer">
        <span className="footer-info">Python 3 · UTF-8</span>
        <button
          className={`visualize-btn ${isLoading ? 'loading' : ''}`}
          onClick={onVisualize}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <span className="btn-icon">▶</span>
              Visualize
            </>
          )}
        </button>
      </div>
    </div>
  )
}
