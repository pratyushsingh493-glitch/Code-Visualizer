import { useState } from 'react'
import './App.css'
import Codepanel from './components/codepanel'
import Header from './components/Header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header/>
      <Codepanel/>
    </>
  )
}

export default App
