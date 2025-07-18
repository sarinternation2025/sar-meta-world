import { useState, useEffect, useRef } from 'react'
import './InteractiveTimeline.css'

const InteractiveTimeline = ({ data, settings }) => {
  const [history, setHistory] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('neuralAccuracy')
  const [timeRange, setTimeRange] = useState(60) // seconds
  const [isPlaying, setIsPlaying] = useState(true)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  const metrics = [
    { key: 'neuralAccuracy', label: 'Neural Accuracy', color: '#00ff00', unit: '%' },
    { key: 'activeConnections', label: 'Connections', color: '#00ffff', unit: '' },
    { key: 'transactions', label: 'Transactions', color: '#ff00ff', unit: '' },
    { key: 'quantumEntropy', label: 'Quantum Entropy', color: '#ffaa00', unit: '' },
    { key: 'latency', label: 'Latency', color: '#ff4444', unit: 'ms', isString: true }
  ]

  useEffect(() => {
    // Add current data to history
    const timestamp = Date.now()
    const newEntry = {
      timestamp,
      ...data,
      latencyValue: parseInt(data.latency) || 0 // Convert string to number
    }

    setHistory(prev => {
      const updated = [...prev, newEntry]
      // Keep only data within time range
      const cutoff = timestamp - (timeRange * 1000)
      return updated.filter(entry => entry.timestamp >= cutoff)
    })
  }, [data, timeRange])

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw grid
      drawGrid(ctx, width, height)

      // Draw timeline
      drawTimeline(ctx, width, height)

      // Draw metrics
      metrics.forEach(metric => {
        if (selectedMetric === 'all' || selectedMetric === metric.key) {
          drawMetric(ctx, width, height, metric)
        }
      })

      // Draw current time indicator
      drawCurrentTime(ctx, width, height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [history, selectedMetric, timeRange, isPlaying])

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const drawTimeline = (ctx, width, height) => {
    if (history.length === 0) return

    const now = Date.now()
    const start = now - (timeRange * 1000)

    // Draw time labels
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'

    for (let i = 0; i <= 5; i++) {
      const time = start + (timeRange * 1000 * i / 5)
      const x = (width / 5) * i
      const label = new Date(time).toLocaleTimeString()
      ctx.fillText(label, x, height - 5)
    }
  }

  const drawMetric = (ctx, width, height, metric) => {
    if (history.length < 2) return

    const now = Date.now()
    const start = now - (timeRange * 1000)
    const dataKey = metric.key === 'latency' ? 'latencyValue' : metric.key

    // Get min/max values for scaling
    const values = history.map(entry => {
      const val = entry[dataKey]
      return typeof val === 'number' ? val : 0
    })
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    // Draw line
    ctx.strokeStyle = metric.color
    ctx.lineWidth = 2
    ctx.beginPath()

    let firstPoint = true
    history.forEach((entry, index) => {
      const x = ((entry.timestamp - start) / (timeRange * 1000)) * width
      const normalizedValue = (entry[dataKey] - min) / range
      const y = height - (normalizedValue * (height - 50)) - 25

      if (firstPoint) {
        ctx.moveTo(x, y)
        firstPoint = false
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    ctx.fillStyle = metric.color
    history.forEach((entry, index) => {
      const x = ((entry.timestamp - start) / (timeRange * 1000)) * width
      const normalizedValue = (entry[dataKey] - min) / range
      const y = height - (normalizedValue * (height - 50)) - 25

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw label
    ctx.fillStyle = metric.color
    ctx.font = '14px monospace'
    ctx.textAlign = 'left'
    const currentValue = history[history.length - 1]?.[dataKey] || 0
    const label = `${metric.label}: ${currentValue.toFixed(1)}${metric.unit}`
    ctx.fillText(label, 10, 20 + (metrics.indexOf(metric) * 20))
  }

  const drawCurrentTime = (ctx, width, height) => {
    const now = Date.now()
    const start = now - (timeRange * 1000)
    const x = ((now - start) / (timeRange * 1000)) * width

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const exportData = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `timeline-data-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="interactive-timeline">
      <div className="timeline-header">
        <h3>📈 Interactive Timeline</h3>
        <div className="timeline-controls">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-select"
          >
            <option value="all">All Metrics</option>
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
          
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-select"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={900}>15 minutes</option>
          </select>
          
          <button 
            className={`play-btn ${isPlaying ? 'playing' : 'paused'}`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <button 
            className="export-btn"
            onClick={exportData}
          >
            💾
          </button>
        </div>
      </div>

      <div className="timeline-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="timeline-canvas"
        />
      </div>

      <div className="timeline-stats">
        <div className="stat-item">
          <span>📊 Data Points:</span>
          <span className="stat-value">{history.length}</span>
        </div>
        <div className="stat-item">
          <span>⏱️ Duration:</span>
          <span className="stat-value">{timeRange}s</span>
        </div>
        <div className="stat-item">
          <span>🔄 Update Rate:</span>
          <span className="stat-value">{isPlaying ? 'Real-time' : 'Paused'}</span>
        </div>
      </div>
    </div>
  )
}

export default InteractiveTimeline
