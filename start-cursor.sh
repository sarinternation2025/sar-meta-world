#!/bin/bash

echo "🚀 Starting SAR Meta World in Cursor AI..."
echo "============================================"

# Check if Cursor is installed
if ! command -v cursor &> /dev/null; then
    echo "❌ Cursor AI is not installed or not in PATH"
    echo "💡 Please install Cursor AI from https://cursor.sh"
    exit 1
fi

# Navigate to project directory
cd /Users/sar-international/Desktop/meta-world/sar-meta-world

# Check if project exists
if [ ! -f "package.json" ]; then
    echo "❌ SAR Meta World project not found in current directory"
    exit 1
fi

echo "✅ Project found: SAR Meta World"
echo "📁 Location: $(pwd)"

# Show project info
echo ""
echo "📊 Project Overview:"
echo "   • Backend API: Node.js + Express + MQTT"
echo "   • Frontend: React + Vite"  
echo "   • 3D Dashboard: React Three Fiber + Three.js"
echo "   • CLI Agent: Custom command line tools"
echo "   • Docker: Production-ready containerization"
echo "   • Monitoring: Grafana + Prometheus stack"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    
    # Install CLI globally
    echo "🔧 Installing CLI agent globally..."
    cd packages/cli-agent && npm link && cd ../..
fi

# Check if Docker services are running
echo ""
echo "🐳 Checking Docker services..."
if docker-compose -f docker/docker-compose.yml ps | grep -q "Up"; then
    echo "   ✅ Docker services are running"
else
    echo "   ⚠️  Docker services not running"
    echo "   💡 Run 'docker-compose -f docker/docker-compose.yml up -d' to start them"
fi

# Open in Cursor AI
echo ""
echo "🎯 Opening in Cursor AI..."
cursor . 

# Wait a moment for Cursor to load
sleep 2

# Show helpful information
echo ""
echo "🎉 SAR Meta World is now open in Cursor AI!"
echo ""
echo "🚀 Quick Start Commands:"
echo "   • Start full development: Cmd+Shift+P → 'Tasks: Run Task' → 'Start Development Environment'"
echo "   • Start 3D dashboard only: Cmd+Shift+P → 'Tasks: Run Task' → 'Start 3D Dashboard Only'"
echo "   • Debug backend: F5 → Select 'Debug Backend API'"
echo "   • Run build tests: Cmd+Shift+P → 'Tasks: Run Task' → 'Run Build Report'"
echo ""
echo "💡 AI Development Tips:"
echo "   • Use Cmd+K to open AI chat for code assistance"
echo "   • Ask: 'Help me create a new 3D visualization component'"
echo "   • Ask: 'Debug the MQTT connection issues'"
echo "   • Ask: 'Optimize the dashboard performance'"
echo ""
echo "📚 Key Files to Explore:"
echo "   • CURSOR_AI_DEVELOPMENT.md - Complete development guide"
echo "   • .cursor/ai_rules.md - AI assistant configuration"
echo "   • packages/react-app/src/App.jsx - Main 3D dashboard"
echo "   • packages/backend/index.js - API server"
echo ""
echo "🌐 Development URLs:"
echo "   • 3D Dashboard: http://localhost:9000"
echo "   • Backend API: http://localhost:3001"
echo "   • Dev Dashboard: http://localhost:8080"
echo "   • Grafana: http://localhost:3000"
echo ""
echo "Happy coding with AI assistance! 🤖✨"
