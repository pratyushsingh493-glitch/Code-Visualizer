import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import Codepanel from './components/Codepanel'
import VisualizationPanel from './components/VisulizationPanel'
import StepControls from './components/StepsControls'
import StepLog from './components/StepLog'
import ExplainModal from './components/ExplainModal'
import './App.css'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Client-side rate limiter
let _lastApiCallAt = 0
const MIN_GAP_MS = 2000

// We keep the name 'callGemini' so we don't have to rewrite the rest of the file, but it calls Groq now!
async function callGemini(prompt) {
  const now = Date.now()
  const elapsed = now - _lastApiCallAt
  if (elapsed < MIN_GAP_MS) {
    await new Promise(r => setTimeout(r, MIN_GAP_MS - elapsed))
  }
  _lastApiCallAt = Date.now()

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }]
    })
  }).catch(() => {
    throw new Error('Network error. Check your connection.')
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody?.error?.message || `Groq error (${res.status})`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'No response from Groq.'
}


const DEFAULT_CODE = `arr = [5, 2, 9, 1, 5, 6]

n = len(arr)
for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
`

const API_URL = 'https://code-visualizer-xce3.onrender.com/run-code'  // Change to your backend URL

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [executionSteps, setExecutionSteps] = useState([])
  const [detectedStructures, setDetectedStructures] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(800)
  const [hasRun, setHasRun] = useState(false)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainResult, setExplainResult] = useState(null)
  const [showExplainModal, setShowExplainModal] = useState(false)
  const [errorSuggestion, setErrorSuggestion] = useState(null)
  const [suggestionLoading, setSuggestionLoading] = useState(false)

  const handleVisualize = useCallback(async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setError(null)
    setErrorSuggestion(null)
    setExecutionSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setHasRun(false)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${res.status}`)
      }

      const data = await res.json()
      console.log('API response:', data)
      console.log('Execution steps:', data.execution)

      // Backend may return 200 with an error field for runtime errors
      if (data.error) {
        throw new Error(data.error)
      }

      setExecutionSteps(data.execution || [])
      setDetectedStructures(data.detected_structures || [])
      setCurrentStep(0)
      setHasRun(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [code])

  // Manual AI suggestion for errors
  const handleGetSuggestion = useCallback(async () => {
    if (!error || suggestionLoading) return
    setSuggestionLoading(true)
    setErrorSuggestion(null)
    try {
      const suggestion = await callGemini(
        `The following Python code has an error.\n\nCode:\n\`\`\`python\n${code}\n\`\`\`\n\nError message: ${error}\n\nPlease:\n1. Explain what is wrong with this code in simple terms\n2. Point out the exact line(s) causing the issue\n3. Provide a corrected version of the code\n\nFormat your response clearly with sections: **Problem**, **Location**, **Fix**`
      )
      setErrorSuggestion(suggestion)
    } catch (aiErr) {
      setErrorSuggestion('Could not fetch AI suggestion. ' + aiErr.message)
    } finally {
      setSuggestionLoading(false)
    }
  }, [error, code, suggestionLoading])

  const handleExplain = useCallback(async () => {
    if (!code.trim()) return
    setExplainLoading(true)
    setExplainResult(null)
    setShowExplainModal(true)
    try {
      const result = await callGemini(
        `Please explain the following Python code in a clear, educational way.\n\nCode:\n\`\`\`python\n${code}\n\`\`\`\n\nYour explanation should include:\n1. **Overview** – What does this code do overall?\n2. **Step-by-step breakdown** – Walk through the key parts of the code\n3. **Data structures & algorithms** – Mention any notable patterns or algorithms used\n4. **Time & Space Complexity** – If applicable\n5. **Example output** – What would this print or return?\n\nMake it beginner-friendly but thorough.`
      )
      setExplainResult(result)
    } catch (err) {
      setExplainResult('Error: ' + err.message)
    } finally {
      setExplainLoading(false)
    }
  }, [code])

  // Auto-play logic
  React.useEffect(() => {
    if (!isPlaying || executionSteps.length === 0) return
    if (currentStep >= executionSteps.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1)
    }, playSpeed)
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, executionSteps.length, playSpeed])

  const handleStepForward = () => {
    if (currentStep < executionSteps.length - 1) setCurrentStep(s => s + 1)
  }
  const handleStepBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }
  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }
  const handlePlayPause = () => {
    if (currentStep >= executionSteps.length - 1) setCurrentStep(0)
    setIsPlaying(p => !p)
  }

  const activeStep = executionSteps[currentStep] || null

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="left-panel">
          <Codepanel
            code={code}
            onChange={setCode}
            activeLine={activeStep?.line}
            onVisualize={handleVisualize}
            isLoading={isLoading}
            onExplain={handleExplain}
            explainLoading={explainLoading}
          />

          {hasRun && executionSteps.length > 0 && (
            <StepLog
              steps={executionSteps}
              currentStep={currentStep}
              onJumpTo={setCurrentStep}
            />
          )}
        </div>

        <div className="right-panel">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠</span>
              <div className="error-content">
                <div className="error-top-row">
                  <span className="error-text">{error}</span>
                  {!errorSuggestion && !suggestionLoading && (
                    <button
                      className="ai-help-btn"
                      onClick={handleGetSuggestion}
                      disabled={suggestionLoading}
                      title="Get AI fix suggestion"
                    >
                      ✦ Get AI Help
                    </button>
                  )}
                </div>
                {suggestionLoading && (
                  <div className="error-ai-loading">
                    <span className="ai-spinner" />
                    <span>Getting AI suggestion...</span>
                  </div>
                )}
                {errorSuggestion && !suggestionLoading && (
                  <div className="error-ai-suggestion">
                    <div className="ai-suggestion-header">
                      <span className="ai-gemini-icon">✦</span>
                      <span>Groq Suggestion</span>
                    </div>
                    <div className="ai-suggestion-body" dangerouslySetInnerHTML={{ __html: formatMarkdown(errorSuggestion) }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasRun && !isLoading && (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <h2>Write Python, Watch It Think</h2>
              <p>Paste your Python code, hit Visualize, and watch every variable change come to life — step by step.</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="loading-orb" />
              <p>Analyzing your code...</p>
            </div>
          )}

          {hasRun && executionSteps.length > 0 && (
            <>
              <VisualizationPanel
                steps={executionSteps}
                currentStep={currentStep}
                detectedStructures={detectedStructures}
                activeStep={activeStep}
              />

              <StepControls
                currentStep={currentStep}
                totalSteps={executionSteps.length}
                isPlaying={isPlaying}
                playSpeed={playSpeed}
                onPlayPause={handlePlayPause}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onReset={handleReset}
                onSpeedChange={setPlaySpeed}
              />
            </>
          )}

          {hasRun && executionSteps.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-icon">∅</div>
              <h2>No Steps Recorded</h2>
              <p>The backend returned no execution steps. Try a different snippet.</p>
            </div>
          )}
        </div>
      </main>

      {showExplainModal && (
        <ExplainModal
          isLoading={explainLoading}
          result={explainResult}
          onClose={() => setShowExplainModal(false)}
        />
      )}
    </div>
  )
}

// Simple markdown-like formatter for Gemini responses
function formatMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n/g, '<br />')
}
