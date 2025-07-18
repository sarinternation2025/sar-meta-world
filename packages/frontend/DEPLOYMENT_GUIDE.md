# SAR Meta World - Local Development Deployment Guide

## 🚀 Quick Start

### Option 1: Using the Node.js Deployment Script (Recommended)

```bash
# Run the automated deployment script
node deploy.js
```

### Option 2: Using the Bash Script (Unix/Linux/macOS)

```bash
# Make the script executable (first time only)
chmod +x deploy-local.sh

# Run the deployment script
./deploy-local.sh
```

### Option 3: Manual Deployment

```bash
# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

## 🌐 Server Information

Once deployed, the application will be available at:

- **Local URL**: `http://localhost:5173/` (or next available port)
- **Network URL**: Displayed in terminal when server starts
- **Application**: SAR Meta World Frontend
- **Framework**: React + Vite

## 🛠️ Development Features

### Real-time Updates
- **Hot Module Replacement (HMR)**: Instant updates when you save changes
- **Fast Refresh**: Preserves component state during updates
- **Error Overlay**: Visual error reporting in the browser
- **Environment Variable Hot Reload**: Changes to .env files are picked up automatically

### Development Tools
- **React DevTools**: Browser extension support
- **Redux DevTools**: State management debugging
- **Vite DevTools**: Build and performance insights

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (all must be prefixed with `VITE_`):

```bash
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
```

### Vite Configuration

The Vite configuration includes:
- React plugin for Fast Refresh
- Path aliases for cleaner imports
- Proxy configuration for API calls
- Development server settings

## 📱 Application Features

### Core Components
- **Dashboard Layout**: Main application layout with navigation
- **Chat Window**: Real-time chat interface
- **Admin Components**: Administrative tools and analytics
- **Configuration System**: Type-safe environment variable management

### Real-time Features
- **WebSocket Connection**: Live chat and notifications
- **Live Chat**: Real-time messaging system
- **Connection Status**: Visual indicators for connection state

## 🧪 Testing and Validation

### Configuration Tests
```bash
# Run all configuration tests
npm test -- --run src/config/config.test.js

# Run complete configuration verification
node verify-config.js

# Test environment variable security
node src/config/test-env-security.js
```

### Runtime Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔍 Debugging

### Common Issues

1. **Port Already in Use**
   - Vite automatically finds the next available port
   - Check the terminal output for the actual port number

2. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Check that `.env` file exists and is properly formatted
   - Restart the development server after changes

3. **Module Resolution Errors**
   - Check path aliases in `vite.config.js`
   - Ensure imports use the correct paths
   - Verify that all dependencies are installed

4. **API Connection Issues**
   - Verify `VITE_API_URL` is correct
   - Check that the backend server is running
   - Ensure CORS is properly configured

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)" | grep VITE

# Verify configuration
node verify-config.js

# Check dependencies
npm list

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🏗️ Production Deployment

### Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output
- **Directory**: `dist/`
- **Entry Point**: `dist/index.html`
- **Assets**: Optimized and minified
- **Environment Variables**: Embedded at build time

## 📊 Performance Monitoring

### Development Metrics
- **Bundle Size**: Monitored during build
- **Hot Reload Time**: Typically under 50ms
- **Memory Usage**: Displayed in browser dev tools
- **Network Requests**: Visible in browser network tab

### Optimization Features
- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Unused code removal
- **Asset Optimization**: Image and CSS optimization
- **Lazy Loading**: Components loaded on demand

## 🔐 Security

### Environment Variable Security
- Only `VITE_*` prefixed variables are exposed to the client
- Sensitive data should never use the `VITE_` prefix
- Configuration validation prevents common security issues

### Development Security
- **HTTPS**: Can be enabled for development
- **CORS**: Properly configured for local development
- **CSP**: Content Security Policy headers
- **Input Validation**: Client-side validation for all inputs

## 🆘 Troubleshooting

### Server Won't Start
1. Check if Node.js is installed: `node --version`
2. Check if npm is available: `npm --version`
3. Verify dependencies: `npm install`
4. Check for port conflicts: `lsof -i :5173`

### Hot Reload Not Working
1. Ensure you're editing files in the `src/` directory
2. Check file permissions
3. Verify the file extension is supported
4. Restart the development server

### Configuration Issues
1. Run configuration tests: `npm test -- --run src/config/config.test.js`
2. Check environment variables: `node verify-config.js`
3. Verify `.env` file format
4. Ensure all required variables are set

## 📞 Support

For additional help:
1. Check the [Environment Variables Guide](./ENVIRONMENT_VARIABLES.md)
2. Review the [Configuration Test Summary](./CONFIG_TEST_SUMMARY.md)
3. Run the configuration validation: `node verify-config.js`
4. Check the browser console for errors
5. Review the terminal output for warnings

## 🎯 Next Steps

After successful deployment:
1. Open `http://localhost:5173` in your browser
2. Test the chat functionality
3. Verify all components load correctly
4. Check the browser console for any errors
5. Test real-time features (if backend is available)

---

## 📋 Quick Reference

### Essential Commands
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Validate configuration
node verify-config.js

# Deploy with automated script
node deploy.js
```

### Important URLs
- **Local Development**: `http://localhost:5173/`
- **Config Test Page**: `http://localhost:5173/src/config/test-env.html`
- **Runtime Config Test**: Available as React component

### File Structure
```
src/
├── config/           # Configuration management
├── features/         # Feature modules
├── components/       # Reusable components
├── layouts/          # Layout components
├── app/             # Redux store and app-level code
└── main.jsx         # Application entry point
```
