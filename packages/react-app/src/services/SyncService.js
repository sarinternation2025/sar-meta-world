import { io } from 'socket.io-client'

class SyncService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.syncInterval = null
    this.retryCount = 0
    this.maxRetries = 5
    this.retryDelay = 3000
    this.syncQueue = []
    this.callbacks = new Map()
    
    // Configuration endpoints
    this.endpoints = {
      localhost: 'http://localhost:3001',
      backup: 'http://localhost:8080',
      production: 'https://api.meta-world.com',
      websocket: 'ws://localhost:3001'
    }
    
    // Auto-detect available servers
    this.availableServers = []
    this.currentServer = null
    
    this.init()
  }

  async init() {
    console.log('🔄 Initializing SyncService...')
    await this.detectAvailableServers()
    await this.establishConnection()
    this.setupEventHandlers()
    this.startAutoSync()
  }

  async detectAvailableServers() {
    console.log('🔍 Detecting available servers...')
    const servers = Object.entries(this.endpoints).filter(([key]) => key !== 'websocket')
    
    for (const [name, url] of servers) {
      try {
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const health = await response.json()
          this.availableServers.push({
            name,
            url,
            status: 'online',
            latency: health.latency || 0,
            version: health.version || '1.0.0'
          })
          console.log(`✅ Server ${name} is available at ${url}`)
        }
      } catch (error) {
        console.warn(`⚠️ Server ${name} at ${url} is not available:`, error.message)
        this.availableServers.push({
          name,
          url,
          status: 'offline',
          error: error.message
        })
      }
    }
    
    // Select best available server
    this.currentServer = this.availableServers
      .filter(server => server.status === 'online')
      .sort((a, b) => a.latency - b.latency)[0]
      
    if (this.currentServer) {
      console.log(`🎯 Selected server: ${this.currentServer.name} (${this.currentServer.url})`)
    } else {
      console.error('❌ No servers available')
    }
  }

  async establishConnection() {
    if (!this.currentServer) return

    try {
      // HTTP connection test
      const response = await fetch(`${this.currentServer.url}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: this.generateClientId(),
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        })
      })

      if (response.ok) {
        const connectionData = await response.json()
        console.log('🔗 HTTP connection established:', connectionData)
        
        // Setup WebSocket connection
        this.setupWebSocket()
      }
    } catch (error) {
      console.error('❌ Failed to establish connection:', error)
      this.handleConnectionError()
    }
  }

  setupWebSocket() {
    if (this.socket) {
      this.socket.disconnect()
    }

    const wsUrl = this.currentServer.url.replace('http', 'ws')
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    })

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected')
      this.isConnected = true
      this.retryCount = 0
      this.processQueue()
      this.emit('connected', { server: this.currentServer })
    })

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
      this.isConnected = false
      this.emit('disconnected')
    })

    this.socket.on('config_sync', (data) => {
      console.log('📥 Received config sync:', data)
      this.handleConfigSync(data)
    })

    this.socket.on('server_sync', (data) => {
      console.log('📥 Received server sync:', data)
      this.handleServerSync(data)
    })

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
      this.handleConnectionError()
    })
  }

  setupEventHandlers() {
    // Listen for visibility changes to resume sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected) {
        this.reconnect()
      }
    })

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Network is online')
      this.reconnect()
    })

    window.addEventListener('offline', () => {
      console.log('🌐 Network is offline')
      this.isConnected = false
    })
  }

  startAutoSync() {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (this.isConnected) {
        this.performAutoSync()
      }
    }, 30000)
  }

  async performAutoSync() {
    try {
      const localConfig = this.getLocalConfig()
      const timestamp = Date.now()
      
      // Send local config to server
      await this.syncToServer({
        type: 'config_update',
        config: localConfig,
        timestamp,
        source: 'auto_sync'
      })
      
      // Request server config
      await this.requestServerConfig()
      
      console.log('🔄 Auto-sync completed successfully')
    } catch (error) {
      console.error('❌ Auto-sync failed:', error)
    }
  }

  async syncToServer(data) {
    if (!this.isConnected) {
      this.queueSync(data)
      return
    }

    try {
      // Send via WebSocket first
      if (this.socket && this.socket.connected) {
        this.socket.emit('sync_data', data)
      }
      
      // Also send via HTTP as backup
      await fetch(`${this.currentServer.url}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      console.log('📤 Data synced to server:', data.type)
    } catch (error) {
      console.error('❌ Sync to server failed:', error)
      this.queueSync(data)
    }
  }

  async requestServerConfig() {
    try {
      const response = await fetch(`${this.currentServer.url}/api/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const serverConfig = await response.json()
        this.handleServerConfig(serverConfig)
      }
    } catch (error) {
      console.error('❌ Failed to request server config:', error)
    }
  }

  handleConfigSync(data) {
    // Handle incoming config sync from server
    const { config, timestamp, source } = data
    
    if (this.shouldApplyConfig(config, timestamp)) {
      this.applyConfig(config)
      this.emit('config_updated', { config, source })
    }
  }

  handleServerSync(data) {
    // Handle server synchronization data
    const { servers, timestamp } = data
    
    if (servers) {
      this.updateServerList(servers)
      this.emit('servers_updated', { servers })
    }
  }

  handleServerConfig(config) {
    const localConfig = this.getLocalConfig()
    const mergedConfig = this.mergeConfigs(localConfig, config)
    
    if (JSON.stringify(localConfig) !== JSON.stringify(mergedConfig)) {
      this.applyConfig(mergedConfig)
      this.emit('config_merged', { config: mergedConfig })
    }
  }

  shouldApplyConfig(config, timestamp) {
    const localTimestamp = this.getLocalTimestamp()
    return timestamp > localTimestamp
  }

  applyConfig(config) {
    // Apply configuration to local storage
    localStorage.setItem('dashboard_config', JSON.stringify(config))
    localStorage.setItem('config_timestamp', Date.now().toString())
    
    // Apply to DOM if needed
    this.applyThemeConfig(config.theme)
    this.applyDisplayConfig(config.display)
  }

  applyThemeConfig(theme) {
    if (theme && theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })
    }
  }

  applyDisplayConfig(display) {
    if (display) {
      // Apply display configuration
      document.body.classList.toggle('full-screen', display.fullScreen)
      document.body.classList.toggle('high-contrast', display.highContrast)
    }
  }

  mergeConfigs(local, server) {
    // Merge local and server configs intelligently
    return {
      ...local,
      ...server,
      theme: { ...local.theme, ...server.theme },
      display: { ...local.display, ...server.display },
      widgets: { ...local.widgets, ...server.widgets },
      timestamp: Math.max(local.timestamp || 0, server.timestamp || 0)
    }
  }

  getLocalConfig() {
    try {
      const config = localStorage.getItem('dashboard_config')
      return config ? JSON.parse(config) : this.getDefaultConfig()
    } catch (error) {
      console.error('❌ Failed to get local config:', error)
      return this.getDefaultConfig()
    }
  }

  getLocalTimestamp() {
    return parseInt(localStorage.getItem('config_timestamp') || '0')
  }

  getDefaultConfig() {
    return {
      theme: {
        name: 'dark',
        colors: {
          'theme-bg': '#000011',
          'theme-accent': '#00ffff'
        }
      },
      display: {
        fullScreen: false,
        highContrast: false,
        animations: true
      },
      widgets: {
        enabled: ['metrics', 'timeline', 'network'],
        layout: 'grid'
      },
      timestamp: Date.now()
    }
  }

  updateServerList(servers) {
    this.availableServers = servers
    
    // Switch to better server if available
    const bestServer = servers
      .filter(s => s.status === 'online')
      .sort((a, b) => a.latency - b.latency)[0]
    
    if (bestServer && bestServer.url !== this.currentServer?.url) {
      console.log(`🔄 Switching to better server: ${bestServer.name}`)
      this.currentServer = bestServer
      this.reconnect()
    }
  }

  queueSync(data) {
    this.syncQueue.push({
      ...data,
      queuedAt: Date.now()
    })
    
    // Limit queue size
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-50)
    }
  }

  processQueue() {
    while (this.syncQueue.length > 0 && this.isConnected) {
      const data = this.syncQueue.shift()
      this.syncToServer(data)
    }
  }

  handleConnectionError() {
    this.isConnected = false
    this.retryCount++
    
    if (this.retryCount <= this.maxRetries) {
      setTimeout(() => {
        console.log(`🔄 Retrying connection (${this.retryCount}/${this.maxRetries})...`)
        this.reconnect()
      }, this.retryDelay * this.retryCount)
    } else {
      console.error('❌ Max retries reached. Switching to offline mode.')
      this.emit('offline_mode')
    }
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect...')
    await this.detectAvailableServers()
    await this.establishConnection()
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event).push(callback)
  }

  emit(event, data) {
    const callbacks = this.callbacks.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  off(event, callback) {
    const callbacks = this.callbacks.get(event) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // Public API methods
  async syncConfig(config) {
    await this.syncToServer({
      type: 'config_update',
      config,
      timestamp: Date.now(),
      source: 'manual'
    })
  }

  async syncWidgets(widgets) {
    await this.syncToServer({
      type: 'widgets_update',
      widgets,
      timestamp: Date.now(),
      source: 'manual'
    })
  }

  async syncTheme(theme) {
    await this.syncToServer({
      type: 'theme_update',
      theme,
      timestamp: Date.now(),
      source: 'manual'
    })
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentServer: this.currentServer,
      availableServers: this.availableServers,
      queueLength: this.syncQueue.length
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    if (this.socket) {
      this.socket.disconnect()
    }
    
    this.callbacks.clear()
    console.log('🔄 SyncService destroyed')
  }
}

export default new SyncService()
