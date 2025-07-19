#!/usr/bin/env node
/* eslint-env node */

import { spawn, exec } from 'child_process'
import { watch } from 'chokidar'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { readFileSync as _readFileSync, writeFileSync as _writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

class DevSyncManager {
  constructor() {
    this.config = null
    this.processes = new Map()
    this.watchers = new Map()
    this.websocketServer = null
    this.clients = new Set()
    this.buildQueue = []
    this.isBuilding = false
    this.lastBuildTime = 0
    this.buildStats = {
      total: 0,
      successful: 0,
      failed: 0,
      avgTime: 0
    }
    
    this.loadConfig()
    this.setupWebSocket()
    this.setupFileWatchers()
    this.setupServers()
    this.setupGracefulShutdown()
    
    console.log(chalk.green('🚀 Dev Sync Manager Started'))
    this.broadcast({ type: 'status', message: 'Dev Sync Manager Online' })
  }

  loadConfig() {
    try {
      const configPath = join(projectRoot, 'dev-sync.config.js')
      if (existsSync(configPath)) {
        // Dynamic import for ES modules
        import(configPath).then(module => {
          this.config = module.default
          console.log(chalk.blue('📋 Configuration loaded'))
        })
      } else {
        // Default configuration
        this.config = {
          watch: {
            paths: ['src/**/*', '*.json'],
            ignore: ['node_modules/**', 'dist/**']
          },
          build: { debounceMs: 500 },
          servers: {
            dev: { port: 5173 },
            api: { port: 3001 },
            static: { port: 8080 }
          }
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Config load error:'), error.message)
    }
  }

  setupWebSocket() {
    const server = createServer()
    this.websocketServer = new WebSocketServer({ server })
    
    this.websocketServer.on('connection', (ws) => {
      console.log(chalk.cyan('🔌 Client connected'))
      this.clients.add(ws)
      
      // Send current status
      ws.send(JSON.stringify({
        type: 'init',
        status: 'connected',
        stats: this.buildStats,
        processes: Array.from(this.processes.keys())
      }))

      ws.on('close', () => {
        console.log(chalk.yellow('🔌 Client disconnected'))
        this.clients.delete(ws)
      })

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data)
          this.handleClientMessage(message)
        } catch (error) {
          console.error('Invalid WebSocket message:', error)
        }
      })
    })

    server.listen(9999, () => {
      console.log(chalk.green('🌐 WebSocket server running on :9999'))
    })
  }

  handleClientMessage(message) {
    switch (message.type) {
      case 'force-build':
        this.triggerBuild('manual')
        break
      case 'restart-server':
        this.restartServer(message.server)
        break
      case 'get-status':
        this.sendStatus()
        break
    }
  }

  broadcast(message) {
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...message
    })
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data)
      }
    })
  }

  setupFileWatchers() {
    const watchPaths = this.config?.watch?.paths || ['src/**/*']
    const ignorePaths = this.config?.watch?.ignore || ['node_modules/**']

    console.log(chalk.blue('👁️  Setting up file watchers...'))
    
    const watcher = watch(watchPaths, {
      ignored: ignorePaths,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    })

    watcher
      .on('add', path => this.handleFileChange('add', path))
      .on('change', path => this.handleFileChange('change', path))
      .on('unlink', path => this.handleFileChange('delete', path))
      .on('addDir', path => this.handleFileChange('addDir', path))
      .on('unlinkDir', path => this.handleFileChange('deleteDir', path))
      .on('error', error => console.error(chalk.red('👁️  Watcher error:'), error))
      .on('ready', () => console.log(chalk.green('👁️  File watchers ready')))

    this.watchers.set('main', watcher)
  }

  handleFileChange(event, filePath) {
    console.log(chalk.cyan(`📁 ${event}: ${filePath}`))
    
    this.broadcast({
      type: 'file-change',
      event,
      path: filePath,
      timestamp: Date.now()
    })

    // Debounced build trigger
    this.debouncedBuild(filePath)
  }

  debouncedBuild(triggerFile) {
    const debounceMs = this.config?.build?.debounceMs || 500
    
    clearTimeout(this.buildTimeout)
    this.buildTimeout = setTimeout(() => {
      this.triggerBuild(triggerFile)
    }, debounceMs)
  }

  async triggerBuild(trigger = 'file-change') {
    if (this.isBuilding) {
      this.buildQueue.push(trigger)
      return
    }

    console.log(chalk.yellow(`🔨 Build triggered by: ${trigger}`))
    this.isBuilding = true
    this.lastBuildTime = Date.now()

    this.broadcast({
      type: 'build-start',
      trigger,
      timestamp: this.lastBuildTime
    })

    try {
      await this.runBuild()
      const buildTime = Date.now() - this.lastBuildTime
      
      this.buildStats.total++
      this.buildStats.successful++
      this.buildStats.avgTime = 
        (this.buildStats.avgTime * (this.buildStats.total - 1) + buildTime) / this.buildStats.total

      console.log(chalk.green(`✅ Build completed in ${buildTime}ms`))
      
      this.broadcast({
        type: 'build-success',
        duration: buildTime,
        stats: this.buildStats
      })

      // Auto-sync after successful build
      await this.performSync()
      
    } catch (error) {
      this.buildStats.total++
      this.buildStats.failed++
      
      console.error(chalk.red('❌ Build failed:'), error.message)
      
      this.broadcast({
        type: 'build-error',
        error: error.message,
        stats: this.buildStats
      })
    } finally {
      this.isBuilding = false
      
      // Process queued builds
      if (this.buildQueue.length > 0) {
        const nextTrigger = this.buildQueue.shift()
        setTimeout(() => this.triggerBuild(nextTrigger), 100)
      }
    }
  }

  runBuild() {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: projectRoot,
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      buildProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      buildProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(errorOutput || `Build process exited with code ${code}`))
        }
      })

      buildProcess.on('error', (error) => {
        reject(new Error(`Build process error: ${error.message}`))
      })
    })
  }

  async performSync() {
    console.log(chalk.blue('🔄 Performing auto-sync...'))
    
    this.broadcast({
      type: 'sync-start'
    })

    try {
      // Restart static server to serve new build
      await this.restartServer('static')
      
      // Trigger browser refresh
      this.broadcast({
        type: 'refresh-browser'
      })

      console.log(chalk.green('✅ Sync completed'))
      
      this.broadcast({
        type: 'sync-success'
      })
      
    } catch (error) {
      console.error(chalk.red('❌ Sync failed:'), error.message)
      
      this.broadcast({
        type: 'sync-error',
        error: error.message
      })
    }
  }

  setupServers() {
    console.log(chalk.blue('🌐 Setting up development servers...'))

    // API Server (Mock Server)
    this.startServer('api', 'node', ['mock-server.cjs'])
    
    // Static Server for built files
    this.startServer('static', 'python3', ['-m', 'http.server', '8080'], './dist')

    // Development Server (Vite) - optional, can be started separately
    // this.startServer('dev', 'npm', ['run', 'dev', '--', '--port', '5173'])
  }

  startServer(name, command, args, cwd = projectRoot) {
    console.log(chalk.green(`🚀 Starting ${name} server...`))

    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, NVM_DIR: process.env.HOME + '/.nvm' }
    })

    process.stdout.on('data', (data) => {
      console.log(chalk.gray(`[${name}] ${data.toString().trim()}`))
    })

    process.stderr.on('data', (data) => {
      console.log(chalk.red(`[${name}] ${data.toString().trim()}`))
    })

    process.on('close', (code) => {
      console.log(chalk.yellow(`[${name}] Process exited with code ${code}`))
      this.processes.delete(name)
      
      // Auto-restart on unexpected exit
      if (code !== 0 && code !== null) {
        setTimeout(() => {
          console.log(chalk.blue(`🔄 Auto-restarting ${name} server...`))
          this.startServer(name, command, args, cwd)
        }, 2000)
      }
    })

    this.processes.set(name, process)
    
    this.broadcast({
      type: 'server-start',
      server: name
    })
  }

  async restartServer(name) {
    console.log(chalk.yellow(`🔄 Restarting ${name} server...`))
    
    const process = this.processes.get(name)
    if (process) {
      process.kill('SIGTERM')
      
      // Wait a moment before restarting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Restart based on server type
    switch (name) {
      case 'api':
        this.startServer('api', 'node', ['mock-server.cjs'])
        break
      case 'static':
        this.startServer('static', 'python3', ['-m', 'http.server', '8080'], './dist')
        break
    }
  }

  sendStatus() {
    this.broadcast({
      type: 'status-update',
      buildStats: this.buildStats,
      processes: Array.from(this.processes.keys()),
      watchers: Array.from(this.watchers.keys()),
      isBuilding: this.isBuilding,
      queueLength: this.buildQueue.length
    })
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      console.log(chalk.yellow('\n🛑 Shutting down Dev Sync Manager...'))
      
      // Kill all spawned processes
      this.processes.forEach((process, name) => {
        console.log(chalk.yellow(`⏹️  Stopping ${name} server...`))
        process.kill('SIGTERM')
      })

      // Close file watchers
      this.watchers.forEach((watcher, name) => {
        console.log(chalk.yellow(`⏹️  Closing ${name} watcher...`))
        watcher.close()
      })

      // Close WebSocket server
      if (this.websocketServer) {
        this.websocketServer.close()
      }

      console.log(chalk.green('✅ Graceful shutdown complete'))
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
}

// Install required dependencies if missing
const requiredDeps = ['chokidar', 'ws', 'chalk']
const missingDeps = requiredDeps.filter(dep => {
  try {
    require.resolve(dep)
    return false
  } catch {
    return true
  }
})

if (missingDeps.length > 0) {
  console.log(chalk.yellow(`📦 Installing missing dependencies: ${missingDeps.join(', ')}`))
  exec(`npm install ${missingDeps.join(' ')}`, (error, _stdout, _stderr) => {
    if (error) {
      console.error(chalk.red('❌ Failed to install dependencies:'), error)
      process.exit(1)
    } else {
      console.log(chalk.green('✅ Dependencies installed'))
      new DevSyncManager()
    }
  })
} else {
  new DevSyncManager()
}

export default DevSyncManager
