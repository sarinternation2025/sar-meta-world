import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage('React App is working!')
  }, [])

  return (
    <div className="app">
      <h1>SAR Meta World - Test Mode</h1>
      <p>{message}</p>
      <button onClick={() => setMessage('Button clicked!')}>
        Test Button
      </button>
    </div>
  )
}

export default App
