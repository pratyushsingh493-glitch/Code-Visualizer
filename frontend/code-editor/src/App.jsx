import { useState } from 'react'
import './App.css'
import Codepanel from './components/codepanel'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Codepanel/>
    </>
  )
}

export default App
