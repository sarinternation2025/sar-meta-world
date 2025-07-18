import { useState, useEffect } from 'react'
import InteractiveTimeline from './InteractiveTimeline'
import './WidgetDashboard.css'

const WidgetDashboard = ({ realTimeData, settings }) => {
  const [widgets, setWidgets] = useState([
    { id: 'metrics', type: 'metrics', position: { x: 0, y: 0 }, size: { w: 2, h: 2 }, visible: true },
    { id: 'timeline', type: 'timeline', position: { x: 2, y: 0 }, size: { w: 4, h: 2 }, visible: true },
    { id: 'network', type: 'network', position: { x: 0, y: 2 }, size: { w: 3, h: 2 }, visible: true },
    { id: 'alerts', type: 'alerts', position: { x: 3, y: 2 }, size: { w: 2, h: 2 }, visible: true },
    { id: 'performance', type: 'performance', position: { x: 0, y: 4 }, size: { w: 3, h: 1 }, visible: true },
    { id: 'logs', type: 'logs', position: { x: 3, y: 4 }, size: { w: 2, h: 1 }, visible: true }
  ])

  const [draggedWidget, setDraggedWidget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [logs, setLogs] = useState([])

  // Widget types configuration
  const widgetTypes = {
    metrics: { name: 'System Metrics', icon: '📊', color: '#00ff00' },
    timeline: { name: 'Timeline', icon: '📈', color: '#00ffff' },
    network: { name: 'Network Status', icon: '🌐', color: '#ff00ff' },
    alerts: { name: 'Alerts', icon: '⚠️', color: '#ffaa00' },
    performance: { name: 'Performance', icon: '⚡', color: '#8800ff' },
    logs: { name: 'System Logs', icon: '📝', color: '#ff4444' }
  }

  useEffect(() => {
    // Generate system logs
    const generateLog = () => {
      const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG']
      const messages = [
        'System startup complete',
        'Database connection established',
        'User authentication successful',
        'Cache memory cleared',
        'Network latency spike detected',
        'Security scan completed',
        'Backup process initiated',
        'Performance optimization applied'
      ]
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date(),
        type: logTypes[Math.floor(Math.random() * logTypes.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      }
      
      setLogs(prev => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
    }

    const interval = setInterval(generateLog, 3000)
    generateLog() // Initial log
    
    return () => clearInterval(interval)
  }, [])

  const handleWidgetDragStart = (widget, e) => {
    setDraggedWidget(widget)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleWidgetDragEnd = () => {
    setDraggedWidget(null)
    setIsDragging(false)
  }

  const handleGridDrop = (e) => {
    e.preventDefault()
    if (!draggedWidget) return

    const gridRect = e.currentTarget.getBoundingClientRect()
    const cellSize = gridRect.width / 6 // 6 column grid
    const x = Math.floor((e.clientX - gridRect.left) / cellSize)
    const y = Math.floor((e.clientY - gridRect.top) / cellSize)

    setWidgets(prev => prev.map(widget => 
      widget.id === draggedWidget.id 
        ? { ...widget, position: { x: Math.max(0, Math.min(x, 5)), y: Math.max(0, y) } }
        : widget
    ))
  }

  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ))
  }

  const resetLayout = () => {
    setWidgets(prev => prev.map((widget, index) => ({
      ...widget,
      position: { x: (index % 3) * 2, y: Math.floor(index / 3) * 2 },
      visible: true
    })))
  }

  const renderWidget = (widget) => {
    const config = widgetTypes[widget.type]
    if (!widget.visible) return null

    return (
      <div
        key={widget.id}
        className={`widget widget-${widget.type}`}
        style={{
          gridColumn: `${widget.position.x + 1} / span ${widget.size.w}`,
          gridRow: `${widget.position.y + 1} / span ${widget.size.h}`,
          borderColor: config.color
        }}
        draggable
        onDragStart={(e) => handleWidgetDragStart(widget, e)}
        onDragEnd={handleWidgetDragEnd}
      >
        <div className="widget-header">
          <span className="widget-icon">{config.icon}</span>
          <span className="widget-title">{config.name}</span>
          <button 
            className="widget-close"
            onClick={() => toggleWidget(widget.id)}
          >
            ✕
          </button>
        </div>
        
        <div className="widget-content">
          {renderWidgetContent(widget)}
        </div>
      </div>
    )
  }

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'metrics':
        return (
          <div className="metrics-widget">
            <div className="metric-item">
              <span className="metric-label">Neural Accuracy</span>
              <span className="metric-value">{realTimeData.neuralAccuracy.toFixed(1)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Connections</span>
              <span className="metric-value">{realTimeData.activeConnections.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Latency</span>
              <span className="metric-value">{realTimeData.latency}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput</span>
              <span className="metric-value">{realTimeData.dataThroughput}</span>
            </div>
          </div>
        )
      
      case 'timeline':
        return (
          <div className="timeline-widget">
            <InteractiveTimeline data={realTimeData} settings={settings} />
          </div>
        )
      
      case 'network':
        return (
          <div className="network-widget">
            <div className="network-status">
              <div className="status-indicator active"></div>
              <span>Network Online</span>
            </div>
            <div className="network-stats">
              <div className="stat">
                <span>Packets: {(realTimeData.transactions * 2.3).toFixed(0)}</span>
              </div>
              <div className="stat">
                <span>Bandwidth: {realTimeData.dataThroughput}</span>
              </div>
              <div className="stat">
                <span>Uptime: {realTimeData.uptime}</span>
              </div>
            </div>
          </div>
        )
      
      case 'alerts':
        return (
          <div className="alerts-widget">
            {realTimeData.neuralAccuracy < 90 && (
              <div className="alert warning">
                <span>⚠️ Low Neural Accuracy</span>
              </div>
            )}
            {parseInt(realTimeData.latency) > 25 && (
              <div className="alert error">
                <span>🔴 High Latency</span>
              </div>
            )}
            {realTimeData.quantumEntropy < 0.8 && (
              <div className="alert info">
                <span>🔵 Quantum Fluctuation</span>
              </div>
            )}
            <div className="alert success">
              <span>✅ All Systems Operational</span>
            </div>
          </div>
        )
      
      case 'performance':
        return (
          <div className="performance-widget">
            <div className="perf-metric">
              <span>CPU</span>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '45%', backgroundColor: '#00ff00' }}></div>
              </div>
              <span>45%</span>
            </div>
            <div className="perf-metric">
              <span>Memory</span>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '67%', backgroundColor: '#ffaa00' }}></div>
              </div>
              <span>67%</span>
            </div>
            <div className="perf-metric">
              <span>Disk</span>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '23%', backgroundColor: '#00ffff' }}></div>
              </div>
              <span>23%</span>
            </div>
          </div>
        )
      
      case 'logs':
        return (
          <div className="logs-widget">
            <div className="logs-container">
              {logs.slice(0, 8).map(log => (
                <div key={log.id} className={`log-entry ${log.type.toLowerCase()}`}>
                  <span className="log-time">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="log-type">{log.type}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return <div>Unknown widget type</div>
    }
  }

  return (
    <div className="widget-dashboard">
      <div className="dashboard-header">
        <h2>🎛️ Widget Dashboard</h2>
        <div className="dashboard-controls">
          <button onClick={resetLayout} className="reset-btn">
            🔄 Reset Layout
          </button>
          <div className="widget-toggles">
            {widgets.map(widget => (
              <button
                key={widget.id}
                className={`toggle-btn ${widget.visible ? 'active' : 'inactive'}`}
                onClick={() => toggleWidget(widget.id)}
                style={{ borderColor: widgetTypes[widget.type].color }}
              >
                {widgetTypes[widget.type].icon}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div 
        className={`widget-grid ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleGridDrop}
      >
        {widgets.map(renderWidget)}
      </div>
    </div>
  )
}

export default WidgetDashboard
