#!/usr/bin/env node

/**
 * SAR Meta World - Local Development Deployment Script
 * Cross-platform deployment script for starting the development server
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { platform } from 'os';
import { join } from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n🚀 ${message}`, 'cyan');
  log('='.repeat(message.length + 3), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`📋 ${message}`, 'blue');
}

async function checkPrerequisites() {
  logInfo('Checking prerequisites...');
  
  // Check Node.js
  try {
    const nodeVersion = process.version;
    logSuccess(`Node.js version: ${nodeVersion}`);
  } catch (error) {
    logError('Node.js is not installed or not accessible');
    process.exit(1);
  }

  // Check npm
  try {
    const npmProcess = spawn('npm', ['--version'], { stdio: 'pipe' });
    npmProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('npm is available');
      } else {
        logError('npm is not installed or not accessible');
        process.exit(1);
      }
    });
  } catch (error) {
    logError('npm is not installed or not accessible');
    process.exit(1);
  }

  logInfo(`Platform: ${platform()}`);
  logInfo(`Current directory: ${process.cwd()}`);
}

function createDefaultEnvFile() {
  const envContent = `# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_VERSION=v1

# App Configuration
VITE_APP_NAME=SAR Meta World
VITE_APP_VERSION=1.0.0

# Socket Configuration
VITE_SOCKET_URL=ws://localhost:3001
VITE_SOCKET_NAMESPACE=default

# Development Settings
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK_API=false
VITE_SHOW_DEBUG_INFO=true

# Service URLs (for development)
VITE_BACKEND_URL=http://localhost:3001
VITE_GRAFANA_URL=http://localhost:3000
VITE_PROMETHEUS_URL=http://localhost:9090
VITE_INFLUXDB_URL=http://localhost:8086
VITE_ADMINER_URL=http://localhost:8080
VITE_REDIS_COMMANDER_URL=http://localhost:8081
`;

  writeFileSync('.env', envContent);
  logSuccess('Default .env file created');
}

function checkEnvironmentFile() {
  if (!existsSync('.env')) {
    logWarning('.env file not found. Creating default environment variables...');
    createDefaultEnvFile();
  } else {
    logSuccess('Environment variables loaded from .env file');
  }
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    if (!existsSync('node_modules')) {
      logInfo('Installing dependencies...');
      const installProcess = spawn('npm', ['install'], { 
        stdio: 'inherit',
        shell: true 
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Dependencies installed successfully');
          resolve();
        } else {
          logError('Failed to install dependencies');
          reject(new Error('npm install failed'));
        }
      });
    } else {
      logSuccess('Dependencies already installed');
      resolve();
    }
  });
}

function validateConfiguration() {
  return new Promise((resolve) => {
    logInfo('Validating configuration...');
    
    if (existsSync('verify-config.js')) {
      const configProcess = spawn('node', ['verify-config.js'], { 
        stdio: 'pipe',
        shell: true 
      });
      
      configProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Configuration validation passed');
        } else {
          logWarning('Configuration validation failed, but continuing...');
        }
        resolve();
      });
    } else {
      logWarning('Configuration validation script not found, skipping...');
      resolve();
    }
  });
}

function displayDeploymentInfo() {
  log('\n🌐 Deployment Information:', 'cyan');
  log('   Application: SAR Meta World Frontend');
  log('   Environment: Development');
  log('   Framework: React + Vite');
  log('   Hot Module Replacement: Enabled');
  log('   Live Reload: Enabled');
  
  log('\n📡 Server will be available at:', 'magenta');
  log('   🔗 Local: http://localhost:5173/');
  log('   🔗 Network: Will be displayed when server starts');
  
  log('\n🛠️  Development Features:', 'green');
  log('   ✅ Real-time code changes');
  log('   ✅ Hot module replacement');
  log('   ✅ Error overlay');
  log('   ✅ Fast refresh');
  log('   ✅ Environment variable hot reload');
  
  log('\n🎯 Available Commands:', 'yellow');
  log('   📱 Open in browser: http://localhost:5173');
  log('   🔄 Restart server: Ctrl+C then run this script again');
  log('   📊 View logs: Check terminal output');
  log('   🧪 Run tests: npm test');
  log('   🏗️  Build production: npm run build');
  
  log('\n🔧 Configuration Test:', 'blue');
  log('   Run "npm test -- --run src/config/config.test.js" to test config');
}

function startDevelopmentServer() {
  return new Promise((resolve, reject) => {
    log('\nStarting development server...', 'cyan');
    log('='.repeat(30), 'cyan');
    
    const devProcess = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    devProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Development server exited with code ${code}`));
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down development server...', 'yellow');
      devProcess.kill('SIGINT');
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
  });
}

async function main() {
  try {
    logHeader('SAR Meta World - Local Development Deployment');
    
    await checkPrerequisites();
    checkEnvironmentFile();
    await installDependencies();
    await validateConfiguration();
    displayDeploymentInfo();
    await startDevelopmentServer();
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment script
main().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
