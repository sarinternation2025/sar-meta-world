import { useState, useEffect } from 'react'
import './AdvancedControls.css'

const AdvancedControls = ({ 
  settings, 
  onSettingsChange, 
  realTimeData,
  onExportData,
  onImportData 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [theme, setTheme] = useState('dark')
  
  // Themes available
  const themes = [
    { id: 'dark', name: '🌙 Dark', colors: { bg: '#000011', accent: '#00ffff' } },
    { id: 'cyber', name: '🔮 Cyber', colors: { bg: '#001122', accent: '#ff00ff' } },
    { id: 'matrix', name: '💚 Matrix', colors: { bg: '#000800', accent: '#00ff00' } },
    { id: 'orange', name: '🔥 Fire', colors: { bg: '#110800', accent: '#ff8800' } },
    { id: 'purple', name: '🌌 Cosmic', colors: { bg: '#110022', accent: '#8800ff' } }
  ]

  // Performance monitoring
  const [performance, setPerformance] = useState({
    fps: 60,
    memory: 45,
    cpu: 23,
    gpu: 67
  })

  useEffect(() => {
    // Simulate performance monitoring
    const interval = setInterval(() => {
      setPerformance({
        fps: Math.floor(Math.random() * 10) + 55,
        memory: Math.floor(Math.random() * 30) + 40,
        cpu: Math.floor(Math.random() * 40) + 15,
        gpu: Math.floor(Math.random() * 50) + 40
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Generate alerts based on data
    const newAlerts = []
    if (realTimeData.neuralAccuracy < 90) {
      newAlerts.push({ id: 'accuracy', type: 'warning', message: 'Neural accuracy below threshold' })
    }
    if (parseInt(realTimeData.latency) > 25) {
      newAlerts.push({ id: 'latency', type: 'error', message: 'High latency detected' })
    }
    if (performance.cpu > 80) {
      newAlerts.push({ id: 'cpu', type: 'warning', message: 'CPU usage high' })
    }
    setAlerts(newAlerts)
  }, [realTimeData, performance])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    const themeData = themes.find(t => t.id === newTheme)
    document.documentElement.style.setProperty('--theme-bg', themeData.colors.bg)
    document.documentElement.style.setProperty('--theme-accent', themeData.colors.accent)
    onSettingsChange({ ...settings, theme: newTheme })
  }

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      realTimeData,
      performance,
      settings
    }
    onExportData(exportData)
  }

  return (
    <div className={`advanced-controls ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Advanced Controls"
      >
        ⚙️ {isExpanded ? '◀' : '▶'}
      </button>

      {isExpanded && (
        <div className="controls-panel">
          {/* Header */}
          <div className="panel-header">
            <h3>🎛️ Advanced Controls</h3>
            <div className="header-actions">
              <button onClick={handleExport} className="export-btn">
                📤 Export
              </button>
              <input 
                type="file" 
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target.result)
                        onImportData(data)
                      } catch (err) {
                        alert('Invalid file format')
                      }
                    }
                    reader.readAsText(file)
                  }
                }}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file" className="import-btn">
                📥 Import
              </label>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="control-section">
            <h4>🎨 Themes</h4>
            <div className="theme-grid">
              {themes.map(themeOption => (
                <button
                  key={themeOption.id}
                  className={`theme-btn ${theme === themeOption.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(themeOption.id)}
                  style={{ 
                    background: themeOption.colors.bg,
                    border: `2px solid ${themeOption.colors.accent}`
                  }}
                >
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Monitor */}
          <div className="control-section">
            <h4>📊 Performance</h4>
            <div className="performance-grid">
              <div className="perf-item">
                <span>FPS</span>
                <div className="perf-bar">
                  <div 
                    className="perf-fill fps"
                    style={{ width: `${Math.min(performance.fps, 60) / 60 * 100}%` }}
                  ></div>
                  <span className="perf-value">{performance.fps}</span>
                </div>
              </div>
              <div className="perf-item">
                <span>Memory</span>
                <div className="perf-bar">
                  <div 
                    className="perf-fill memory"
                    style={{ width: `${performance.memory}%` }}
                  ></div>
                  <span className="perf-value">{performance.memory}%</span>
                </div>
              </div>
              <div className="perf-item">
                <span>CPU</span>
                <div className="perf-bar">
                  <div 
                    className="perf-fill cpu"
                    style={{ width: `${performance.cpu}%` }}
                  ></div>
                  <span className="perf-value">{performance.cpu}%</span>
                </div>
              </div>
              <div className="perf-item">
                <span>GPU</span>
                <div className="perf-bar">
                  <div 
                    className="perf-fill gpu"
                    style={{ width: `${performance.gpu}%` }}
                  ></div>
                  <span className="perf-value">{performance.gpu}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="control-section">
              <h4>⚠️ Alerts</h4>
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert ${alert.type}`}>
                    <span className="alert-icon">
                      {alert.type === 'error' ? '🔴' : '🟡'}
                    </span>
                    <span className="alert-message">{alert.message}</span>
                    <button 
                      className="alert-close"
                      onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="control-section">
            <h4>⚙️ Settings</h4>
            <div className="settings-grid">
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={settings.autoRotate || false}
                  onChange={(e) => onSettingsChange({ ...settings, autoRotate: e.target.checked })}
                />
                <span>Auto Rotate</span>
              </label>
              
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={settings.showFPS || false}
                  onChange={(e) => onSettingsChange({ ...settings, showFPS: e.target.checked })}
                />
                <span>Show FPS</span>
              </label>
              
              <label className="setting-item">
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={settings.speed || 1}
                  onChange={(e) => onSettingsChange({ ...settings, speed: parseFloat(e.target.value) })}
                />
                <span>Animation Speed: {(settings.speed || 1).toFixed(1)}x</span>
              </label>
              
              <label className="setting-item">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.opacity || 1}
                  onChange={(e) => onSettingsChange({ ...settings, opacity: parseFloat(e.target.value) })}
                />
                <span>Opacity: {Math.round((settings.opacity || 1) * 100)}%</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedControls
