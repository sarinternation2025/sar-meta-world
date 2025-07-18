import { useState, useEffect } from 'react'
import SyncService from '../services/SyncService'
import './SyncStatus.css'

const SyncStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    currentServer: null,
    availableServers: [],
    queueLength: 0
  })
  const [lastSync, setLastSync] = useState(null)
  const [syncActivity, setSyncActivity] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Update connection status
    const updateStatus = () => {
      const status = SyncService.getConnectionStatus()
      setConnectionStatus(status)
    }

    // Set up event listeners
    const onConnected = (data) => {
      console.log('SyncStatus: Connected to server', data)
      updateStatus()
      addSyncActivity('Connected', `Connected to ${data.server.name}`, 'success')
    }

    const onDisconnected = () => {
      console.log('SyncStatus: Disconnected from server')
      updateStatus()
      addSyncActivity('Disconnected', 'Lost connection to server', 'warning')
    }

    const onConfigUpdated = (data) => {
      console.log('SyncStatus: Config updated', data)
      setLastSync(new Date())
      addSyncActivity('Config Sync', `Configuration updated from ${data.source}`, 'info')
    }

    const onServersUpdated = (data) => {
      console.log('SyncStatus: Servers updated', data)
      updateStatus()
      addSyncActivity('Server Update', `Updated server list (${data.servers.length} servers)`, 'info')
    }

    const onOfflineMode = () => {
      console.log('SyncStatus: Offline mode activated')
      addSyncActivity('Offline Mode', 'Switched to offline mode', 'error')
    }

    // Register event listeners
    SyncService.on('connected', onConnected)
    SyncService.on('disconnected', onDisconnected)
    SyncService.on('config_updated', onConfigUpdated)
    SyncService.on('servers_updated', onServersUpdated)
    SyncService.on('offline_mode', onOfflineMode)

    // Initial status update
    updateStatus()

    // Update status every 5 seconds
    const statusInterval = setInterval(updateStatus, 5000)

    return () => {
      clearInterval(statusInterval)
      SyncService.off('connected', onConnected)
      SyncService.off('disconnected', onDisconnected)
      SyncService.off('config_updated', onConfigUpdated)
      SyncService.off('servers_updated', onServersUpdated)
      SyncService.off('offline_mode', onOfflineMode)
    }
  }, [])

  const addSyncActivity = (type, message, level) => {
    const activity = {
      id: Date.now(),
      type,
      message,
      level,
      timestamp: new Date()
    }
    
    setSyncActivity(prev => [activity, ...prev.slice(0, 19)]) // Keep last 20 activities
  }

  const getStatusIcon = () => {
    if (!connectionStatus.isConnected) {
      return '🔴'
    }
    if (connectionStatus.queueLength > 0) {
      return '🟡'
    }
    return '🟢'
  }

  const getStatusText = () => {
    if (!connectionStatus.isConnected) {
      return 'Offline'
    }
    if (connectionStatus.queueLength > 0) {
      return `Syncing (${connectionStatus.queueLength} pending)`
    }
    return 'Online'
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString()
  }

  const handleServerSwitch = async (server) => {
    if (server.status === 'online' && server.url !== connectionStatus.currentServer?.url) {
      try {
        addSyncActivity('Server Switch', `Switching to ${server.name}`, 'info')
        // The SyncService will handle the actual switching
        await SyncService.reconnect()
      } catch (error) {
        addSyncActivity('Switch Failed', `Failed to switch to ${server.name}`, 'error')
      }
    }
  }

  return (
    <div className={`sync-status ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div 
        className="sync-status-indicator"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to expand sync details"
      >
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="sync-status-details">
          {/* Connection Info */}
          <div className="status-section">
            <h4>🔗 Connection Status</h4>
            <div className="connection-info">
              <div className="info-item">
                <span>Status:</span>
                <span className={`status ${connectionStatus.isConnected ? 'online' : 'offline'}`}>
                  {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {connectionStatus.currentServer && (
                <div className="info-item">
                  <span>Server:</span>
                  <span className="server-name">
                    {connectionStatus.currentServer.name} ({connectionStatus.currentServer.url})
                  </span>
                </div>
              )}
              
              <div className="info-item">
                <span>Queue:</span>
                <span className="queue-length">
                  {connectionStatus.queueLength} items
                </span>
              </div>
              
              <div className="info-item">
                <span>Last Sync:</span>
                <span className="last-sync">{formatTime(lastSync)}</span>
              </div>
            </div>
          </div>

          {/* Available Servers */}
          <div className="status-section">
            <h4>🌐 Available Servers</h4>
            <div className="servers-list">
              {connectionStatus.availableServers.map((server, index) => (
                <div 
                  key={index} 
                  className={`server-item ${server.status} ${
                    server.url === connectionStatus.currentServer?.url ? 'current' : ''
                  }`}
                  onClick={() => handleServerSwitch(server)}
                >
                  <span className="server-status">
                    {server.status === 'online' ? '🟢' : '🔴'}
                  </span>
                  <span className="server-name">{server.name}</span>
                  {server.status === 'online' && (
                    <span className="server-latency">{server.latency}ms</span>
                  )}
                  {server.url === connectionStatus.currentServer?.url && (
                    <span className="current-indicator">●</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sync Activity */}
          <div className="status-section">
            <h4>📋 Recent Activity</h4>
            <div className="activity-list">
              {syncActivity.map((activity) => (
                <div key={activity.id} className={`activity-item ${activity.level}`}>
                  <span className="activity-time">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="activity-type">{activity.type}</span>
                  <span className="activity-message">{activity.message}</span>
                </div>
              ))}
              
              {syncActivity.length === 0 && (
                <div className="no-activity">No recent activity</div>
              )}
            </div>
          </div>

          {/* Sync Controls */}
          <div className="status-section">
            <h4>⚙️ Sync Controls</h4>
            <div className="sync-controls">
              <button 
                className="sync-btn primary"
                onClick={() => SyncService.performAutoSync()}
                disabled={!connectionStatus.isConnected}
              >
                🔄 Force Sync
              </button>
              
              <button 
                className="sync-btn secondary"
                onClick={() => SyncService.reconnect()}
              >
                🔌 Reconnect
              </button>
              
              <button 
                className="sync-btn secondary"
                onClick={() => {
                  setSyncActivity([])
                  addSyncActivity('Clear Log', 'Activity log cleared', 'info')
                }}
              >
                🗑️ Clear Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyncStatus
