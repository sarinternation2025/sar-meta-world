const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

// Create Express app
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Mock database
let dashboardConfigs = new Map()
let connectedClients = new Map()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: Date.now(),
    version: '1.0.0',
    latency: Math.floor(Math.random() * 50) + 10,
    uptime: process.uptime()
  })
})

// Connect endpoint
app.post('/api/connect', (req, res) => {
  const { clientId, timestamp, userAgent } = req.body
  
  const clientInfo = {
    id: clientId,
    connectedAt: timestamp,
    userAgent,
    lastSeen: Date.now(),
    ip: req.ip
  }
  
  connectedClients.set(clientId, clientInfo)
  
  console.log(`🔗 Client connected: ${clientId}`)
  
  res.json({
    success: true,
    clientId,
    serverId: 'mock-server-1',
    timestamp: Date.now(),
    message: 'Connection established'
  })
})

// Sync endpoint
app.post('/api/sync', (req, res) => {
  const { type, config, widgets, theme, timestamp, source } = req.body
  
  console.log(`📥 Sync received: ${type} from ${source}`)
  
  // Store configuration
  const configKey = `config-${Date.now()}`
  dashboardConfigs.set(configKey, {
    type,
    config,
    widgets,
    theme,
    timestamp,
    source,
    synced: true
  })
  
  // Broadcast to other clients
  io.emit('config_sync', {
    type,
    config,
    widgets,
    theme,
    timestamp,
    source: 'server'
  })
  
  res.json({
    success: true,
    timestamp: Date.now(),
    message: 'Data synced successfully'
  })
})

// Config endpoint
app.get('/api/config', (req, res) => {
  // Return latest config
  const configs = Array.from(dashboardConfigs.values())
  const latestConfig = configs
    .filter(c => c.config)
    .sort((a, b) => b.timestamp - a.timestamp)[0]
  
  if (latestConfig) {
    res.json({
      ...latestConfig.config,
      timestamp: latestConfig.timestamp,
      source: 'server'
    })
  } else {
    res.json({
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
      timestamp: Date.now(),
      source: 'server_default'
    })
  }
})

// Server list endpoint
app.get('/api/servers', (req, res) => {
  const servers = [
    {
      name: 'localhost',
      url: 'http://localhost:3001',
      status: 'online',
      latency: Math.floor(Math.random() * 30) + 10,
      version: '1.0.0'
    },
    {
      name: 'backup',
      url: 'http://localhost:8080',
      status: Math.random() > 0.3 ? 'online' : 'offline',
      latency: Math.floor(Math.random() * 100) + 20,
      version: '1.0.0'
    },
    {
      name: 'production',
      url: 'https://api.meta-world.com',
      status: 'offline',
      error: 'Connection timeout'
    }
  ]
  
  res.json(servers)
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`)
  
  // Send current server status
  socket.emit('server_sync', {
    servers: [
      {
        name: 'localhost',
        url: 'http://localhost:3001',
        status: 'online',
        latency: Math.floor(Math.random() * 30) + 10,
        version: '1.0.0'
      }
    ],
    timestamp: Date.now()
  })
  
  // Handle sync data
  socket.on('sync_data', (data) => {
    console.log(`📥 Socket sync received: ${data.type}`)
    
    // Store and broadcast
    const configKey = `socket-${Date.now()}`
    dashboardConfigs.set(configKey, {
      ...data,
      socketId: socket.id,
      synced: true
    })
    
    // Broadcast to other clients
    socket.broadcast.emit('config_sync', {
      ...data,
      source: 'websocket'
    })
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`)
  })
})

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Mock sync server running on port ${PORT}`)
  console.log(`📡 Socket.io server ready`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
  console.log(`🔧 API base: http://localhost:${PORT}/api`)
})

// Periodic server updates
setInterval(() => {
  io.emit('server_sync', {
    servers: [
      {
        name: 'localhost',
        url: 'http://localhost:3001',
        status: 'online',
        latency: Math.floor(Math.random() * 30) + 10,
        version: '1.0.0'
      },
      {
        name: 'backup',
        url: 'http://localhost:8080',
        status: Math.random() > 0.7 ? 'online' : 'offline',
        latency: Math.floor(Math.random() * 100) + 20,
        version: '1.0.0'
      }
    ],
    timestamp: Date.now()
  })
}, 60000) // Every minute
