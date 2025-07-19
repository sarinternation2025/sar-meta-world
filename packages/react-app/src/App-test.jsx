import React from 'react'
import './App.css'

function AppTest() {
  return (
    <div className="app">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
        color: 'white'
      }}>
        <h1>🌐 SAR Meta-World Test</h1>
        <p>React development server is working!</p>
        <div style={{ marginTop: '20px' }}>
          <button style={{
            padding: '10px 20px',
            background: 'rgba(0, 255, 255, 0.2)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            borderRadius: '8px',
            color: '#00ffff',
            cursor: 'pointer'
          }}>
            Test Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppTest
