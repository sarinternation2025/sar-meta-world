# 🚀 Real-Time Localhost Monitoring System

## Overview

The SAR-META-WORLD monitoring system provides comprehensive real-time monitoring of your localhost environment with advanced analytics, customizable dashboards, and intelligent alerting. This system includes both a frontend widget and backend API endpoints for complete monitoring capabilities.

## ✨ Features

### 🎯 **Real-Time Monitoring**
- **CPU Usage**: Real-time CPU utilization with temperature monitoring
- **Memory Management**: RAM usage tracking with detailed breakdowns
- **Disk Monitoring**: Storage usage and I/O performance tracking
- **Network Analytics**: Upload/download speeds and connection monitoring
- **Service Status**: Live monitoring of all localhost services

### 🔧 **Advanced Configuration**
- **Customizable Refresh Intervals**: Adjust from 1 second to 1 hour
- **Theme Customization**: Dark, Light, and Blue themes
- **Selective Metrics**: Choose which metrics to display
- **Alert Thresholds**: Configurable warning and error levels
- **Auto-refresh Toggle**: Enable/disable automatic updates

### 📊 **Analytics & Reporting**
- **Historical Data**: Track performance trends over time
- **Chart Visualizations**: Multiple chart types (Line, Bar, Area)
- **Export Capabilities**: JSON and CSV data export
- **Custom Reports**: Generate detailed performance reports
- **Trend Analysis**: Performance trend indicators

### 🚨 **Intelligent Alerting**
- **Threshold-based Alerts**: Automatic alerts for high usage
- **Service Status Monitoring**: Real-time service health checks
- **Log Analysis**: Comprehensive log monitoring and filtering
- **Alert History**: Track and manage all system alerts

### 🎨 **UI/UX Features**
- **Expandable Widget**: Minimize, expand, or full-screen view
- **Responsive Design**: Works on all screen sizes
- **Live Indicators**: Real-time status indicators
- **Interactive Controls**: Manual refresh and configuration
- **Professional Styling**: Modern, futuristic interface

## 🏗️ Architecture

### Frontend Components
```
SystemMonitor/
├── Real-time data display
├── Service status cards
├── Historical charts
├── Alert management
├── Configuration panel
└── Export/reporting tools
```

### Backend API Endpoints
```
/api/monitoring/
├── GET /metrics          # System metrics
├── GET /services         # Service status
├── GET /logs            # System logs
├── GET /alerts          # Active alerts
├── GET /config          # Configuration
├── PUT /config          # Update config
├── GET /health          # Health check
├── GET /export          # Export data
└── POST /report         # Generate reports
```

## 🚀 Quick Start

### 1. Start the System
```bash
# From the root directory
npm run dev
```

### 2. Access the Monitoring Widget
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Widget Location**: Bottom-right corner of the screen

### 3. Basic Usage
1. **View Real-time Data**: The widget displays live system metrics
2. **Expand for Details**: Click the expand button for full dashboard
3. **Configure Settings**: Click the settings icon for customization
4. **Monitor Services**: Check service status in the services section

## 📡 API Reference

### System Metrics
```bash
GET /api/monitoring/metrics
```
**Response:**
```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 45.2,
      "cores": 8,
      "temperature": 65.3
    },
    "memory": {
      "total": 17179869184,
      "used": 8589934592,
      "percentage": 50.0
    },
    "disk": {
      "total": 536870912000,
      "used": 268435456000,
      "percentage": 50.0
    },
    "network": {
      "upload": 25.5,
      "download": 45.2,
      "connections": 42
    }
  },
  "timestamp": 1752654181131
}
```

### Service Status
```bash
GET /api/monitoring/services
```
**Response:**
```json
{
  "success": true,
  "data": {
    "backend": {
      "status": "online",
      "uptime": 3600,
      "port": 3001,
      "host": "localhost",
      "protocol": "http"
    },
    "frontend": {
      "status": "online",
      "uptime": 1800,
      "port": 5173,
      "host": "localhost",
      "protocol": "http"
    }
  }
}
```

### System Logs
```bash
GET /api/monitoring/logs?level=warning&limit=10
```
**Parameters:**
- `level`: Filter by log level (info, warning, error)
- `limit`: Number of logs to return (default: 50)

### Configuration Management
```bash
# Get current configuration
GET /api/monitoring/config

# Update configuration
PUT /api/monitoring/config
Content-Type: application/json

{
  "config": {
    "monitoring": {
      "refreshInterval": 5000,
      "autoRefresh": true,
      "alertThresholds": {
        "cpu": 80,
        "memory": 85,
        "disk": 90
      }
    }
  }
}
```

### Data Export
```bash
# Export as JSON
GET /api/monitoring/export

# Export as CSV
GET /api/monitoring/export?format=csv
```

### Generate Reports
```bash
POST /api/monitoring/report
Content-Type: application/json

{
  "startTime": 1752654000000,
  "endTime": 1752654181131,
  "metrics": ["cpu", "memory", "disk"]
}
```

## 🎛️ Configuration Options

### Widget Settings
- **Refresh Interval**: 1000ms - 3600000ms (1 second - 1 hour)
- **Auto-refresh**: Enable/disable automatic updates
- **Theme**: Dark, Light, or Blue theme
- **Metrics Display**: Select which metrics to show
- **Alert Thresholds**: Customize warning and error levels

### Service Configuration
```json
{
  "localhost": {
    "backend": {
      "port": 3001,
      "host": "localhost",
      "protocol": "http"
    },
    "frontend": {
      "port": 5173,
      "host": "localhost",
      "protocol": "http"
    },
    "database": {
      "port": 5432,
      "host": "localhost",
      "protocol": "postgresql"
    },
    "redis": {
      "port": 6379,
      "host": "localhost",
      "protocol": "redis"
    },
    "mqtt": {
      "port": 1883,
      "host": "localhost",
      "protocol": "mqtt"
    }
  }
}
```

## 🔧 Advanced Features

### Custom Alert Rules
The system automatically generates alerts based on:
- **CPU Usage > 80%**: Warning alert
- **Memory Usage > 85%**: Warning alert
- **Disk Usage > 90%**: Critical alert
- **Service Offline**: Error alert

### Historical Data Tracking
- **Data Retention**: Configurable retention period
- **Trend Analysis**: Performance trend indicators
- **Chart Visualization**: Multiple chart types
- **Export Capabilities**: JSON and CSV formats

### Service Health Monitoring
- **Uptime Tracking**: Service uptime monitoring
- **Port Status**: Port availability checking
- **Protocol Support**: HTTP, PostgreSQL, Redis, MQTT
- **Real-time Status**: Live service status updates

## 🎨 UI Components

### Metric Cards
- **Color-coded Borders**: Different colors for different metrics
- **Trend Indicators**: Up/down arrows with percentage
- **Real-time Values**: Live updating numbers
- **Unit Display**: Proper unit formatting (GB, MB, %, etc.)

### Service Status Cards
- **Status Icons**: Visual indicators for online/offline
- **Uptime Display**: Service uptime in hours and minutes
- **Port Information**: Service port numbers
- **Color-coded Status**: Green for online, red for offline

### Chart Components
- **Multiple Chart Types**: Line, Bar, Area charts
- **Interactive Controls**: Chart type switching
- **Real-time Updates**: Live data updates
- **Responsive Design**: Adapts to container size

### Alert System
- **Alert Types**: Warning, Error, Info
- **Severity Levels**: Low, Medium, High, Critical
- **Timestamp Display**: Alert creation time
- **Auto-dismiss**: Configurable alert duration

## 🚀 Performance Features

### Real-time Updates
- **WebSocket Support**: Real-time data streaming
- **Polling Fallback**: HTTP polling for compatibility
- **Configurable Intervals**: Adjustable update frequency
- **Efficient Rendering**: Optimized React components

### Data Management
- **Memory Efficient**: Minimal memory footprint
- **Data Compression**: Optimized data storage
- **Cache Management**: Intelligent caching strategies
- **Garbage Collection**: Automatic cleanup

### Scalability
- **Modular Architecture**: Easy to extend
- **Plugin System**: Add custom metrics
- **API Extensibility**: Easy to add new endpoints
- **Multi-service Support**: Monitor multiple services

## 🔒 Security Features

### API Security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **Error Handling**: Secure error responses
- **CORS Configuration**: Proper cross-origin settings

### Data Protection
- **Sensitive Data Filtering**: Remove sensitive information
- **Log Sanitization**: Clean log output
- **Export Security**: Safe data export
- **Configuration Validation**: Validate all configs

## 🛠️ Troubleshooting

### Common Issues

#### Widget Not Loading
1. Check if the backend is running: `curl http://localhost:3001/health`
2. Verify frontend is accessible: `curl http://localhost:5173`
3. Check browser console for errors
4. Ensure all dependencies are installed

#### API Endpoints Not Responding
1. Verify backend server is running
2. Check port availability: `lsof -i :3001`
3. Review server logs for errors
4. Ensure routes are properly registered

#### Data Not Updating
1. Check auto-refresh setting
2. Verify refresh interval configuration
3. Check network connectivity
4. Review browser console for errors

### Debug Commands
```bash
# Check backend health
curl http://localhost:3001/health

# Test metrics endpoint
curl http://localhost:3001/api/monitoring/metrics

# Test services endpoint
curl http://localhost:3001/api/monitoring/services

# Check frontend
curl http://localhost:5173

# View running processes
ps aux | grep -E "(node|vite)"
```

## 📈 Future Enhancements

### Planned Features
- **Machine Learning**: Predictive analytics
- **Custom Dashboards**: User-defined layouts
- **Mobile App**: Native mobile monitoring
- **Cloud Integration**: AWS, Azure, GCP monitoring
- **Advanced Analytics**: Deep performance insights
- **Alert Notifications**: Email, SMS, Slack integration
- **Performance Optimization**: Enhanced caching and rendering
- **Plugin Ecosystem**: Third-party monitoring plugins

### API Extensions
- **WebSocket API**: Real-time streaming
- **GraphQL Support**: Flexible data queries
- **REST API v2**: Enhanced API features
- **Webhook Support**: Event-driven notifications

## 📚 Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Development Guide](./DEVELOPMENT.md)

### Examples
- [Custom Metrics](./examples/custom-metrics.js)
- [Alert Rules](./examples/alert-rules.js)
- [Dashboard Layouts](./examples/dashboard-layouts.js)
- [API Integration](./examples/api-integration.js)

---

## 🎉 Success!

Your real-time localhost monitoring system is now fully operational with:

✅ **Real-time system metrics**  
✅ **Service status monitoring**  
✅ **Advanced analytics and reporting**  
✅ **Customizable dashboards**  
✅ **Intelligent alerting**  
✅ **Data export capabilities**  
✅ **Professional UI/UX**  
✅ **Comprehensive API**  

The monitoring widget is now live at **http://localhost:5173** with full backend API support at **http://localhost:3001**! 