import React, { useEffect, useRef } from 'react'
import './ExplainModal.css'

// Simple markdown → HTML renderer (safe subset)
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks first (before inline code)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Bullet lists
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Paragraphs (double newline)
    .replace(/\n{2,}/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br />')
    .replace(/^(.+)/, '<p>$1')
    .replace(/(.+)$/, '$1</p>')
}

export default function ExplainModal({ isLoading, result, onClose }) {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Click outside closes
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="explain-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="explain-modal">
        {/* Header */}
        <div className="explain-modal-header">
          <div className="explain-modal-title">
            <span className="explain-gemini-badge">✦ Gemini</span>
            <h2>Code Explanation</h2>
          </div>
          <button className="explain-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="explain-modal-body">
          {isLoading && (
            <div className="explain-loading">
              <div className="explain-dots">
                <span /><span /><span />
              </div>
              <p>Gemini is analyzing your code…</p>
            </div>
          )}

          {!isLoading && result && (
            <div
              className="explain-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
