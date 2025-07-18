#!/usr/bin/env node

import { spawn } from 'child_process'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

class BuildReporter {
  constructor() {
    this.buildResults = []
    this.reportPath = 'build-report.json'
    this.htmlReportPath = 'build-report.html'
    
    this.loadExistingReport()
  }

  loadExistingReport() {
    if (existsSync(this.reportPath)) {
      try {
        const data = readFileSync(this.reportPath, 'utf-8')
        this.buildResults = JSON.parse(data)
        console.log(chalk.blue(`📋 Loaded ${this.buildResults.length} previous build records`))
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not load previous report, starting fresh'))
        this.buildResults = []
      }
    }
  }

  async runBuildTest() {
    console.log(chalk.green('🚀 Starting comprehensive build test...'))

    // Test 1: Normal successful build
    await this.testSuccessfulBuild()

    // Test 2: Create syntax error and test failed build
    await this.testFailedBuild()

    // Test 3: Fix error and test recovery
    await this.testRecoveryBuild()

    // Generate comprehensive report
    this.generateReport()
  }

  async testSuccessfulBuild() {
    console.log(chalk.blue('\n📦 Testing successful production build...'))
    
    const buildResult = {
      id: `build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'production',
      trigger: 'test-successful',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: 'running',
      output: '',
      error: '',
      buildSize: null,
      chunkInfo: [],
      warnings: [],
      environment: {
        node: process.version,
        npm: await this.getNpmVersion(),
        vite: await this.getViteVersion()
      }
    }

    try {
      const result = await this.runBuild()
      buildResult.endTime = Date.now()
      buildResult.duration = buildResult.endTime - buildResult.startTime
      buildResult.status = 'success'
      buildResult.output = result.stdout
      buildResult.buildSize = this.extractBuildSize(result.stdout)
      buildResult.chunkInfo = this.extractChunkInfo(result.stdout)
      buildResult.warnings = this.extractWarnings(result.stdout)

      console.log(chalk.green(`✅ Successful build completed in ${buildResult.duration}ms`))
      
    } catch (error) {
      buildResult.endTime = Date.now()
      buildResult.duration = buildResult.endTime - buildResult.startTime
      buildResult.status = 'failed'
      buildResult.error = error.message
      buildResult.output = error.stdout || ''
      
      console.log(chalk.red(`❌ Build failed: ${error.message}`))
    }

    this.buildResults.push(buildResult)
    this.saveReport()
  }

  async testFailedBuild() {
    console.log(chalk.blue('\n💥 Testing failed build scenario...'))

    // Create a critical syntax error
    const appJsxPath = 'src/App.jsx'
    const originalContent = readFileSync(appJsxPath, 'utf-8')
    
    // Inject critical import error
    const errorContent = originalContent.replace(
      'import React',
      'import React from "nonexistent-package"' // Nonexistent import
    )
    
    writeFileSync(appJsxPath, errorContent)
    console.log(chalk.yellow('🐛 Injected critical import error for testing'))

    const buildResult = {
      id: `build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'production',
      trigger: 'test-failed',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: 'running',
      output: '',
      error: '',
      buildSize: null,
      chunkInfo: [],
      warnings: [],
      environment: {
        node: process.version,
        npm: await this.getNpmVersion(),
        vite: await this.getViteVersion()
      }
    }

    try {
      const result = await this.runBuild()
      // This shouldn't happen with syntax error
      buildResult.status = 'unexpected-success'
      buildResult.output = result.stdout
      
    } catch (error) {
      buildResult.endTime = Date.now()
      buildResult.duration = buildResult.endTime - buildResult.startTime
      buildResult.status = 'failed'
      buildResult.error = error.message
      buildResult.output = error.stderr || error.stdout || ''
      
      console.log(chalk.red(`❌ Build failed as expected: ${this.truncateError(error.message)}`))
    }

    // Restore original file
    writeFileSync(appJsxPath, originalContent)
    console.log(chalk.green('🔧 Restored original file'))

    this.buildResults.push(buildResult)
    this.saveReport()
  }

  async testRecoveryBuild() {
    console.log(chalk.blue('\n🔄 Testing recovery build after error fix...'))

    const buildResult = {
      id: `build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'production',
      trigger: 'test-recovery',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: 'running',
      output: '',
      error: '',
      buildSize: null,
      chunkInfo: [],
      warnings: [],
      environment: {
        node: process.version,
        npm: await this.getNpmVersion(),
        vite: await this.getViteVersion()
      }
    }

    try {
      const result = await this.runBuild()
      buildResult.endTime = Date.now()
      buildResult.duration = buildResult.endTime - buildResult.startTime
      buildResult.status = 'success'
      buildResult.output = result.stdout
      buildResult.buildSize = this.extractBuildSize(result.stdout)
      buildResult.chunkInfo = this.extractChunkInfo(result.stdout)
      buildResult.warnings = this.extractWarnings(result.stdout)

      console.log(chalk.green(`✅ Recovery build successful in ${buildResult.duration}ms`))
      
    } catch (error) {
      buildResult.endTime = Date.now()
      buildResult.duration = buildResult.endTime - buildResult.startTime
      buildResult.status = 'failed'
      buildResult.error = error.message
      
      console.log(chalk.red(`❌ Recovery build failed: ${error.message}`))
    }

    this.buildResults.push(buildResult)
    this.saveReport()
  }

  runBuild() {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      buildProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      buildProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          const error = new Error(`Build failed with exit code ${code}`)
          error.stdout = stdout
          error.stderr = stderr
          reject(error)
        }
      })

      buildProcess.on('error', (error) => {
        error.stdout = stdout
        error.stderr = stderr
        reject(error)
      })
    })
  }

  async getNpmVersion() {
    try {
      return new Promise((resolve) => {
        const proc = spawn('npm', ['--version'])
        let output = ''
        proc.stdout.on('data', (data) => output += data.toString())
        proc.on('close', () => resolve(output.trim()))
      })
    } catch {
      return 'unknown'
    }
  }

  async getViteVersion() {
    try {
      return new Promise((resolve) => {
        const proc = spawn('npx', ['vite', '--version'])
        let output = ''
        proc.stdout.on('data', (data) => output += data.toString())
        proc.on('close', () => resolve(output.trim()))
      })
    } catch {
      return 'unknown'
    }
  }

  extractBuildSize(output) {
    const sizeMatch = output.match(/dist\/assets\/index-[a-zA-Z0-9]+\.js\s+([\d,]+\.?\d*)\s*kB/)
    return sizeMatch ? sizeMatch[1] + ' kB' : null
  }

  extractChunkInfo(output) {
    const chunks = []
    const chunkMatches = output.matchAll(/dist\/([\w\/.-]+)\s+([\d,]+\.?\d*)\s*kB/g)
    
    for (const match of chunkMatches) {
      chunks.push({
        file: match[1],
        size: match[2] + ' kB'
      })
    }
    
    return chunks
  }

  extractWarnings(output) {
    const warnings = []
    if (output.includes('chunks are larger than 500 kB')) {
      warnings.push({
        type: 'performance',
        message: 'Large chunk size detected (>500kB)',
        suggestion: 'Consider code splitting or dynamic imports'
      })
    }
    
    return warnings
  }

  truncateError(error) {
    return error.length > 100 ? error.substring(0, 100) + '...' : error
  }

  saveReport() {
    writeFileSync(this.reportPath, JSON.stringify(this.buildResults, null, 2))
  }

  generateReport() {
    console.log(chalk.green('\n📊 Generating comprehensive build report...'))

    const stats = this.calculateStats()
    this.generateJSONReport(stats)
    this.generateHTMLReport(stats)
    this.generateConsoleReport(stats)
  }

  calculateStats() {
    const total = this.buildResults.length
    const successful = this.buildResults.filter(b => b.status === 'success').length
    const failed = this.buildResults.filter(b => b.status === 'failed').length
    const avgDuration = this.buildResults.reduce((sum, b) => sum + (b.duration || 0), 0) / total
    
    const recentBuilds = this.buildResults.slice(-10) // Last 10 builds
    const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0
    
    const buildSizes = this.buildResults
      .filter(b => b.buildSize)
      .map(b => parseFloat(b.buildSize.replace(/[^\d.]/g, '')))
    
    const avgBuildSize = buildSizes.length > 0 
      ? (buildSizes.reduce((a, b) => a + b, 0) / buildSizes.length).toFixed(1) + ' kB'
      : 'N/A'

    return {
      total,
      successful,
      failed,
      successRate,
      avgDuration: Math.round(avgDuration),
      avgBuildSize,
      recentBuilds,
      buildTrend: this.calculateTrend(),
      commonErrors: this.getCommonErrors(),
      performanceMetrics: this.getPerformanceMetrics()
    }
  }

  calculateTrend() {
    const recent = this.buildResults.slice(-5)
    const older = this.buildResults.slice(-10, -5)
    
    if (recent.length === 0 || older.length === 0) return 'insufficient-data'
    
    const recentSuccess = recent.filter(b => b.status === 'success').length / recent.length
    const olderSuccess = older.filter(b => b.status === 'success').length / older.length
    
    if (recentSuccess > olderSuccess) return 'improving'
    if (recentSuccess < olderSuccess) return 'declining'
    return 'stable'
  }

  getCommonErrors() {
    const errors = this.buildResults
      .filter(b => b.status === 'failed')
      .map(b => b.error)
      .filter(e => e)
    
    const errorCounts = {}
    errors.forEach(error => {
      const key = error.substring(0, 50) // First 50 chars as key
      errorCounts[key] = (errorCounts[key] || 0) + 1
    })
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([error, count]) => ({ error, count }))
  }

  getPerformanceMetrics() {
    const durations = this.buildResults
      .filter(b => b.duration && b.status === 'success')
      .map(b => b.duration)
    
    if (durations.length === 0) return null
    
    return {
      fastest: Math.min(...durations),
      slowest: Math.max(...durations),
      median: durations.sort()[Math.floor(durations.length / 2)]
    }
  }

  generateJSONReport(stats) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: stats,
      builds: this.buildResults,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
    
    writeFileSync('production-build-report.json', JSON.stringify(report, null, 2))
    console.log(chalk.green('📄 JSON report saved: production-build-report.json'))
  }

  generateHTMLReport(stats) {
    const html = this.createHTMLReport(stats)
    writeFileSync(this.htmlReportPath, html)
    console.log(chalk.green('🌐 HTML report saved: build-report.html'))
  }

  generateConsoleReport(stats) {
    console.log(chalk.cyan('\n' + '='.repeat(60)))
    console.log(chalk.cyan('📊 PRODUCTION BUILD REPORT'))
    console.log(chalk.cyan('='.repeat(60)))
    
    console.log(chalk.white(`\n📈 OVERVIEW:`))
    console.log(`   Total Builds: ${chalk.yellow(stats.total)}`)
    console.log(`   Successful: ${chalk.green(stats.successful)}`)
    console.log(`   Failed: ${chalk.red(stats.failed)}`)
    console.log(`   Success Rate: ${chalk.yellow(stats.successRate + '%')}`)
    console.log(`   Trend: ${this.getTrendIcon(stats.buildTrend)} ${stats.buildTrend}`)
    
    console.log(chalk.white(`\n⚡ PERFORMANCE:`))
    console.log(`   Average Duration: ${chalk.yellow(stats.avgDuration + 'ms')}`)
    console.log(`   Average Build Size: ${chalk.yellow(stats.avgBuildSize)}`)
    
    if (stats.performanceMetrics) {
      console.log(`   Fastest Build: ${chalk.green(stats.performanceMetrics.fastest + 'ms')}`)
      console.log(`   Slowest Build: ${chalk.red(stats.performanceMetrics.slowest + 'ms')}`)
    }
    
    console.log(chalk.white(`\n📋 RECENT BUILDS:`))
    stats.recentBuilds.slice(-5).forEach((build, i) => {
      const status = build.status === 'success' ? chalk.green('✅') : chalk.red('❌')
      const duration = build.duration ? `${build.duration}ms` : 'N/A'
      const time = new Date(build.timestamp).toLocaleTimeString()
      console.log(`   ${status} ${time} - ${build.trigger} (${duration})`)
    })
    
    if (stats.commonErrors.length > 0) {
      console.log(chalk.white(`\n🐛 COMMON ERRORS:`))
      stats.commonErrors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.error} (${error.count}x)`)
      })
    }
    
    console.log(chalk.cyan('\n' + '='.repeat(60)))
  }

  getTrendIcon(trend) {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '📊'
      default: return '❓'
    }
  }

  createHTMLReport(stats) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Build Report - SAR Meta World</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'SF Mono', Monaco, Consolas, monospace;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(0, 255, 255, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 255, 0.2);
        }
        .header h1 {
            color: #00ffff;
            font-size: 2.5rem;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #00ffff;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #ccc;
            font-size: 0.9rem;
        }
        .builds-table {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            margin-bottom: 20px;
        }
        .builds-table h2 {
            color: #00ffff;
            margin-bottom: 20px;
            text-align: center;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        th { color: #00ffff; font-weight: 600; }
        .success { color: #00ff00; }
        .failed { color: #ff0000; }
        .timestamp { color: #888; font-size: 0.85rem; }
        .duration { color: #ffaa00; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Production Build Report</h1>
            <p>SAR Meta World - Generated ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Builds</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successful}</div>
                <div class="stat-label">Successful</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avgDuration}ms</div>
                <div class="stat-label">Average Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avgBuildSize}</div>
                <div class="stat-label">Average Size</div>
            </div>
        </div>
        
        <div class="builds-table">
            <h2>Recent Builds</h2>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Timestamp</th>
                        <th>Trigger</th>
                        <th>Duration</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.recentBuilds.slice(-10).map(build => `
                    <tr>
                        <td class="${build.status}">${build.status === 'success' ? '✅ Success' : '❌ Failed'}</td>
                        <td class="timestamp">${new Date(build.timestamp).toLocaleString()}</td>
                        <td>${build.trigger}</td>
                        <td class="duration">${build.duration ? build.duration + 'ms' : 'N/A'}</td>
                        <td>${build.buildSize || 'N/A'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`
  }
}

// Run the build test and generate report
const reporter = new BuildReporter()
reporter.runBuildTest().catch(console.error)

export default BuildReporter
