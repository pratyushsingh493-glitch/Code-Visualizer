import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import Codepanel from './components/Codepanel'
import VisualizationPanel from './components/VisulizationPanel'
import StepControls from './components/StepsControls'
import StepLog from './components/StepLog'
import './App.css'

const DEFAULT_CODE = `arr = [5, 2, 9, 1, 5, 6]

n = len(arr)
for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
`

const API_URL = 'https://codevisualized-api.onrender.com/run-code'  // Change to your backend URL

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

  const handleVisualize = useCallback(async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setError(null)
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
              <span>{error}</span>
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
    </div>
  )
}
