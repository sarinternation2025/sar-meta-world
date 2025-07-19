# 🚀 SAR Meta World - Cursor AI Development Setup

## 📋 Quick Start Guide

### 1. Open Project in Cursor AI
```bash
# Navigate to project directory
cd /Users/sar-international/Desktop/meta-world/sar-meta-world

# Open in Cursor AI
cursor .
```

### 2. Essential Cursor AI Extensions
Install these extensions for optimal development:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Docker**
- **GitLens**
- **Thunder Client** (for API testing)
- **Error Lens**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **Material Icon Theme**

## 🏗️ Project Structure Overview

```
sar-meta-world/
├── packages/
│   ├── backend/           # Node.js API server
│   ├── frontend/          # React frontend
│   ├── react-app/         # 3D React dashboard
│   └── cli-agent/         # CLI tools
├── docker/                # Docker configurations
├── scripts/               # Automation scripts
└── config/               # Environment configs
```

## 🔧 Development Environments

### Option 1: Full Stack Development
```bash
# Start all services
npm run dev-full

# Access points:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - 3D Dashboard: http://localhost:9000
# - Dev Dashboard: http://localhost:8080
```

### Option 2: Individual Package Development
```bash
# Backend only
cd packages/backend && npm run dev

# Frontend only  
cd packages/frontend && npm run dev

# 3D Dashboard only
cd packages/react-app && npm run dev

# CLI development
cd packages/cli-agent && npm link
```

### Option 3: Docker Development
```bash
# Production-like environment
docker-compose -f docker/docker-compose.yml up -d

# With real-time sync
docker-compose -f docker/docker-compose.yml up -d --build
```

## 🎯 Key Development Commands

### Build & Test
```bash
# Build all packages
npm run build

# Test all packages
npm test

# Build production
npm run build:prod

# Run comprehensive build report
./packages/react-app/scripts/comprehensive-build-report.sh
```

### Development Tools
```bash
# Start dev sync manager
npm run dev-sync

# Monitor services
./scripts/process-monitor.sh

# Check environment
node validate-env.js

# Security audit
./docker/scripts/security_monitoring_verification.sh
```

## 🧩 Cursor AI Specific Features

### 1. AI Chat Context
When using Cursor AI chat, provide this context:
```
I'm working on SAR Meta World - a full-stack 3D visualization platform with:
- React 3D dashboard using Three.js and React Three Fiber
- Node.js backend with MQTT integration
- Docker containerized services
- Real-time monitoring and analytics
- CLI tools for management
```

### 2. Useful AI Prompts
```
# Code Generation
"Generate a new 3D component for the dashboard that shows real-time metrics"

# Debugging
"Help me debug the MQTT connection issue in the backend"

# Architecture
"Suggest improvements for the Docker service architecture"

# Testing
"Create comprehensive tests for the React 3D components"
```

### 3. Code Snippets
Cursor AI will recognize these patterns:
- React functional components with hooks
- Three.js 3D scenes and animations
- Express.js API endpoints
- Docker configurations
- MQTT message handling

## 🎨 3D Dashboard Development

### Key Files to Focus On:
```
packages/react-app/src/
├── App.jsx              # Main app with view switching
├── components/
│   ├── Globe3D.jsx      # 3D globe visualization
│   ├── Dashboard.jsx    # Main dashboard
│   ├── ParticleField.jsx # Particle effects
│   └── WidgetDashboard.jsx # Customizable widgets
```

### Development Workflow:
1. **Design Phase**: Use Cursor AI to generate 3D component ideas
2. **Implementation**: Live code with AI assistance
3. **Testing**: Real-time preview with hot reload
4. **Integration**: Connect to backend APIs
5. **Optimization**: Performance tuning with AI suggestions

## 🔌 Backend API Development

### Key Endpoints:
```javascript
// Health check
GET /health

// MQTT status
GET /mqtt/status

// Real-time data
GET /api/data/realtime

// System metrics
GET /api/metrics
```

### Development Focus Areas:
- MQTT message processing
- WebSocket connections
- Database operations
- API rate limiting
- Security middleware

## 📦 Package-Specific Development

### React App (3D Dashboard)
```bash
cd packages/react-app
npm run dev        # Start dev server
npm run build      # Build for production
npm run test       # Run tests
```

### Backend API
```bash
cd packages/backend
npm run dev        # Start with nodemon
npm run prod       # Production mode
npm test          # Run API tests
```

### CLI Agent
```bash
cd packages/cli-agent
npm link          # Global install
sar-meta --help   # Test commands
```

## 🐛 Debugging in Cursor AI

### Common Debug Scenarios:
1. **3D Rendering Issues**
   - Check Three.js console logs
   - Verify WebGL support
   - Monitor performance metrics

2. **API Connection Problems**
   - Test endpoints with Thunder Client
   - Check MQTT broker status
   - Verify environment variables

3. **Docker Service Issues**
   - Check container logs: `docker-compose logs [service]`
   - Verify port mappings
   - Check health status

### Debug Commands:
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Test backend connectivity
node test-backend.js

# Validate environment
node validate-env.js
```

## 🚀 Deployment from Cursor AI

### Quick Deploy Commands:
```bash
# Production deployment
./scripts/deploy-production.sh

# Docker production stack
docker-compose -f docker/docker-compose.prod.yml up -d

# Build and push
git add . && git commit -m "feature: [description]" && git push
```

## 🎯 AI-Assisted Development Workflows

### 1. Feature Development
```
"I want to add a new 3D visualization for network topology. 
Help me create a component that shows nodes and connections in 3D space."
```

### 2. Bug Fixing
```
"The MQTT connection keeps dropping. Help me analyze the connection 
handling in the backend and suggest improvements."
```

### 3. Performance Optimization
```
"The 3D dashboard is running slowly with large datasets. 
Help me optimize the rendering and data handling."
```

### 4. Testing & Quality
```
"Generate comprehensive tests for the new dashboard widgets 
including unit tests and integration tests."
```

## 📚 Resources & Documentation

### Internal Docs:
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `PRODUCTION_DEPLOYMENT_REPORT.md` - Deployment guide
- `packages/react-app/README.md` - 3D dashboard docs
- `packages/backend/PRODUCTION_SETUP_REPORT.md` - Backend setup

### External Resources:
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Docker Documentation](https://docs.docker.com/)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)

## 🔄 Continuous Development

### Git Workflow in Cursor AI:
```bash
# Create feature branch
git checkout -b feature/new-visualization

# Regular commits
git add . && git commit -m "wip: developing new feature"

# Push and create PR
git push origin feature/new-visualization
```

### Real-time Development:
- Use `npm run dev-sync` for auto-reload
- Monitor with dev dashboard at `http://localhost:8080`
- Live 3D preview at `http://localhost:9000`

## ⚡ Quick Tips for Cursor AI

1. **Use AI for boilerplate**: Generate component structures, API routes, and Docker configs
2. **Debugging assistance**: Paste error messages for instant solutions
3. **Code refactoring**: Get suggestions for cleaner, more efficient code
4. **Documentation**: Auto-generate JSDoc comments and README sections
5. **Testing**: Create test suites with AI assistance

---

**Happy coding in Cursor AI! 🎉** 

Your SAR Meta World project is fully configured for seamless development with AI assistance.
