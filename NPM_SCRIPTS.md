# 📦 SAR Meta World - Available NPM Scripts

## 🚀 Development Scripts

### **Quick Start**
```bash
npm run dev-full        # Start all services (backend + frontend + 3D dashboard)
npm run dev-stack       # Start backend + 3D dashboard + dev sync
npm run dev:3d          # Start 3D dashboard only
npm run dev:backend     # Start backend API only
npm run dev:frontend    # Start frontend only
npm run dev:sync        # Start dev sync manager
npm run dev:dashboard   # Open dev dashboard
```

### **Individual Service Development**
```bash
# Backend API (Node.js + Express + MQTT)
npm run dev:backend     # Development server with hot reload
npm run start           # Production server

# Frontend (React + Vite)
npm run dev:frontend    # Development server
npm run start:frontend  # Production server

# 3D Dashboard (React Three Fiber)
npm run dev:3d          # Development server
npm run start:3d        # Production server

# CLI Agent
npm run dev:cli         # Development CLI
npm run start:cli       # Production CLI
npm run cli             # Direct CLI access
```

## 🔨 Build Scripts

### **Development Builds**
```bash
npm run build           # Build frontend only
npm run build:3d        # Build 3D dashboard
npm run build:backend   # Build backend
npm run build:all       # Build all packages
```

### **Production Builds**
```bash
npm run build:prod      # Production build (all packages)
npm run build:report    # Build with comprehensive report
npm run start:prod      # Start production servers
```

## 🧪 Testing Scripts

### **Unit & Integration Tests**
```bash
npm test               # Run all tests
npm run test:3d        # Test 3D dashboard components
npm run test:backend   # Test backend API
npm run test:connections # Test database connections
npm run test:all       # Run comprehensive test suite
```

### **Environment Validation**
```bash
npm run validate       # Validate environment setup
npm run security:audit # Run security audit
```

## 🐳 Docker Scripts

### **Container Management**
```bash
npm run docker:up      # Start all Docker services
npm run docker:down    # Stop all Docker services
npm run docker:prod    # Start production Docker stack
npm run docker:logs    # View service logs
npm run docker:build   # Build Docker images
```

## 🔧 Utility Scripts

### **Code Quality**
```bash
npm run lint           # Lint all packages
npm run lint:fix       # Fix linting issues
```

### **Maintenance**
```bash
npm run clean          # Clean all build artifacts
npm run clean:deps     # Remove node_modules
npm run clean:build    # Remove build directories
npm run clean:logs     # Remove log files
npm run setup          # Initial project setup
```

### **Monitoring & Deployment**
```bash
npm run monitor        # Start process monitor
npm run deploy:prod    # Deploy to production
```

## 📊 Development Workflow Examples

### **Full Stack Development**
```bash
# Terminal 1: Start all services
npm run dev-full

# Terminal 2: Watch logs and monitor
npm run monitor

# Terminal 3: Run tests
npm run test:all
```

### **3D Dashboard Focus**
```bash
# Terminal 1: 3D dashboard with sync
npm run dev-stack

# Terminal 2: Open dev dashboard
npm run dev:dashboard

# Terminal 3: Run 3D tests
npm run test:3d
```

### **Backend API Development**
```bash
# Terminal 1: Backend only
npm run dev:backend

# Terminal 2: Test connections
npm run test:connections

# Terminal 3: Watch Docker logs
npm run docker:logs
```

## 🎯 Service Access Points

### **Development URLs**
- **3D Dashboard**: http://localhost:9000
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Dev Dashboard**: http://localhost:8080

### **Production URLs**
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Adminer**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 📋 Package-Specific Scripts

### **React 3D Dashboard (`packages/react-app/`)**
```bash
cd packages/react-app
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run test            # Run Vitest tests
npm run dev-sync        # Start dev sync manager
npm run dev-full        # Dev server + sync manager
npm run dashboard       # Open dev dashboard
```

### **Backend API (`packages/backend/`)**
```bash
cd packages/backend
npm run dev             # Start with nodemon
npm run start           # Production start
npm run prod            # Production mode
npm test               # Run API tests
```

### **Frontend (`packages/frontend/`)**
```bash
cd packages/frontend
npm run dev             # Start development server
npm run build           # Build for production
npm test               # Run tests
npm run lint            # Check code quality
```

### **CLI Agent (`packages/cli-agent/`)**
```bash
cd packages/cli-agent
npm run dev             # Development CLI
npm run start           # Production CLI
npm link               # Install globally
```

## 🚨 Troubleshooting Scripts

### **Common Issues**
```bash
# Port conflicts
npm run clean && npm run setup

# Dependencies issues
npm run clean:deps && npm install

# Build failures
npm run clean:build && npm run build:all

# Docker issues
npm run docker:down && npm run docker:up

# Environment problems
npm run validate
```

### **Debug Commands**
```bash
# Check service status
npm run monitor

# View detailed logs
npm run docker:logs

# Test all connections
npm run test:all

# Security check
npm run security:audit
```

## 💡 Pro Tips

### **Development Efficiency**
- Use `npm run dev-full` for complete development environment
- Use `npm run dev-stack` for focused 3D dashboard development
- Use `npm run build:report` to get detailed build analytics

### **Production Deployment**
- Always run `npm run validate` before deployment
- Use `npm run build:prod` for optimized production builds
- Use `npm run security:audit` for security validation

### **Monitoring**
- Use `npm run monitor` to track all processes
- Use `npm run docker:logs` to debug container issues
- Use `npm run test:all` for comprehensive validation

---

**🎉 All scripts are now available for seamless development!**

Run `npm run` to see the complete list of available scripts at any time.
