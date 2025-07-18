#!/bin/bash

# SAR Meta World - Local Development Deployment Script
# This script deploys the frontend application to localhost with live reloading

echo "🚀 SAR Meta World - Local Development Deployment"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Display Node.js and npm versions
echo "📋 Environment Information:"
echo "   Node.js version: $(node --version)"
echo "   npm version: $(npm --version)"
echo "   Current directory: $(pwd)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating default environment variables..."
    cat > .env << EOF
# API Configuration
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
EOF
    echo "✅ Default .env file created"
else
    echo "✅ Environment variables loaded from .env file"
fi

# Run configuration validation
echo "🔍 Validating configuration..."
if [ -f "verify-config.js" ]; then
    node verify-config.js --quick
    if [ $? -ne 0 ]; then
        echo "⚠️  Configuration validation failed, but continuing..."
    fi
else
    echo "⚠️  Configuration validation script not found, skipping..."
fi

# Display deployment information
echo ""
echo "🌐 Deployment Information:"
echo "   Application: SAR Meta World Frontend"
echo "   Environment: Development"
echo "   Framework: React + Vite"
echo "   Hot Module Replacement: Enabled"
echo "   Live Reload: Enabled"
echo ""
echo "📡 Server will be available at:"
echo "   🔗 Local: http://localhost:5173/"
echo "   🔗 Network: Will be displayed when server starts"
echo ""
echo "🛠️  Development Features:"
echo "   ✅ Real-time code changes"
echo "   ✅ Hot module replacement"
echo "   ✅ Error overlay"
echo "   ✅ Fast refresh"
echo "   ✅ Environment variable hot reload"
echo ""
echo "🎯 Available Commands:"
echo "   📱 Open in browser: http://localhost:5173"
echo "   🔄 Restart server: Ctrl+C then run this script again"
echo "   📊 View logs: Check terminal output"
echo "   🧪 Run tests: npm test"
echo "   🏗️  Build production: npm run build"
echo ""
echo "🔧 Configuration Test:"
echo "   Run 'npm test -- --run src/config/config.test.js' to test config"
echo ""
echo "Starting development server..."
echo "================================="

# Start the development server
npm run dev
