const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const Docker = require('dockerode');
const { checkAlerts, getActiveAlerts, clearAlert, getAlertHistory } = require('./alerts');
const { checkAllServicesHealth, defaultServices } = require('./utils/serviceHealth');
const MetricsAggregator = require('./utils/metricsAggregator');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mqtt = require('mqtt');
const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');
const cron = require('node-cron');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const docker = new Docker();

// MQTT Client setup
const mqttClient = mqtt.connect('mqtt://localhost:1883');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ],
});

// Configuration storage
let config = {
  monitoring: {
    refreshInterval: 5000,
    autoRefresh: true,
    alertThresholds: {
      cpu: 80,
      memory: 85,
      disk: 90
    }
  }
};

// Initialize metrics aggregator
const metricsAggregator = new MetricsAggregator();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Helper function to get system metrics
const getSystemMetrics = async () => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const fsSize = await si.fsSize();
    const networkStats = await si.networkStats();
    const temp = await si.cpuTemperature();
    const osInfo = await si.osInfo();
    
    return {
      cpu: {
        usage: Math.round(cpu.currentLoad * 100) / 100,
        cores: cpu.cpus.length,
        temperature: temp.main || 0
      },
      memory: {
        total: mem.total,
        used: mem.used,
        percentage: Math.round((mem.used / mem.total) * 100 * 100) / 100
      },
      disk: {
        total: fsSize[0]?.size || 0,
        used: fsSize[0]?.used || 0,
        percentage: Math.round((fsSize[0]?.use || 0) * 100) / 100
      },
      network: {
        upload: networkStats[0]?.tx_sec || 0,
        download: networkStats[0]?.rx_sec || 0,
        connections: networkStats.length
      },
      system: {
        platform: osInfo.platform,
        uptime: Math.floor(process.uptime())
      }
    };
  } catch (error) {
    logger.error('Error getting system metrics:', error);
    throw error;
  }
};

// Helper function to get service status
const getServiceStatus = async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    const services = {};
    
    containers.forEach(container => {
      const name = container.Names[0].substring(1);
      services[name] = {
        status: container.State === 'running' ? 'online' : 'offline',
        uptime: container.State === 'running' ? Math.floor((Date.now() - container.Created * 1000) / 1000) : 0,
        port: container.Ports.length > 0 ? container.Ports[0].PublicPort : null,
        host: 'localhost',
        protocol: 'http'
      };
    });
    
    return services;
  } catch (error) {
    logger.error('Error getting service status:', error);
    return {};
  }
};

// API Endpoints
app.get('/api/monitoring/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
    timestamp: Date.now()
  });
});

app.get('/api/monitoring/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/services', async (req, res) => {
  try {
    const services = await getServiceStatus();
    res.json({
      success: true,
      data: services,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/services:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/logs', (req, res) => {
  try {
    const { level = 'info', limit = 50 } = req.query;
    const logsPath = path.join(__dirname, 'logs', 'combined.log');
    
    if (!fs.existsSync(logsPath)) {
      return res.json({ success: true, data: [], message: 'No logs found' });
    }
    
    const logData = fs.readFileSync(logsPath, 'utf8');
    const logs = logData.split('\n')
      .filter(line => line.trim())
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, level: 'info', timestamp: Date.now() };
        }
      })
      .filter(log => !level || log.level === level);
    
    res.json({
      success: true,
      data: logs,
      total: logs.length,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/alerts', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    const alerts = checkAlerts({
      cpu: metrics.cpu.usage,
      memory: metrics.memory.percentage,
      disk: metrics.disk.percentage
    });
    
    res.json({
      success: true,
      data: alerts,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/config', (req, res) => {
  res.json({
    success: true,
    data: config,
    timestamp: Date.now()
  });
});

app.put('/api/monitoring/config', (req, res) => {
  try {
    const { config: newConfig } = req.body;
    if (newConfig) {
      config = { ...config, ...newConfig };
      logger.info('Configuration updated:', config);
    }
    res.json({
      success: true,
      data: config,
      message: 'Configuration updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/export', (req, res) => {
  try {
    const { format = 'json', startTime, endTime } = req.query;
    const exportData = metricsAggregator.exportData(format, startTime ? parseInt(startTime) : null, endTime ? parseInt(endTime) : null);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}`);
      res.send(exportData.content);
    } else {
      res.json({
        success: true,
        data: exportData,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    logger.error('Error in /api/monitoring/export:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/monitoring/report', async (req, res) => {
  try {
    const { startTime, endTime, metrics: requestedMetrics } = req.body;
    
    // Generate comprehensive report using metrics aggregator
    const report = metricsAggregator.generateSummary(endTime - startTime);
    const filteredData = metricsAggregator.getDataRange(startTime, endTime);
    
    const enhancedReport = {
      period: { startTime, endTime },
      metrics: requestedMetrics || ['cpu', 'memory', 'disk'],
      data: filteredData,
      summary: report,
      generatedAt: Date.now()
    };
    
    res.json({
      success: true,
      data: enhancedReport,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Additional API endpoints
app.get('/api/monitoring/services/health', async (req, res) => {
  try {
    const healthStatus = await checkAllServicesHealth();
    res.json({
      success: true,
      data: healthStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/services/health:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/alerts/active', (req, res) => {
  try {
    const activeAlerts = getActiveAlerts();
    res.json({
      success: true,
      data: activeAlerts,
      total: activeAlerts.length,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/alerts/active:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/alerts/history', (req, res) => {
  try {
    const alertHistory = getAlertHistory();
    res.json({
      success: true,
      data: alertHistory,
      total: alertHistory.length,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/alerts/history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/monitoring/alerts/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const cleared = clearAlert(alertId);
    res.json({
      success: true,
      message: cleared ? 'Alert cleared successfully' : 'Alert not found',
      alertId: alertId,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/alerts/:alertId:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/metrics/summary', (req, res) => {
  try {
    const { timeWindow = 3600000 } = req.query; // 1 hour default
    const summary = metricsAggregator.generateSummary(parseInt(timeWindow));
    res.json({
      success: true,
      data: summary,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/metrics/summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/metrics/trends', (req, res) => {
  try {
    const { metric = 'cpu', timeWindow = 300000 } = req.query; // 5 minutes default
    const trends = metricsAggregator.getTrendAnalysis(metric, parseInt(timeWindow));
    res.json({
      success: true,
      data: trends,
      metric: metric,
      timeWindow: parseInt(timeWindow),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/metrics/trends:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/system/info', (req, res) => {
  try {
    const systemInfo = {
      backend: {
        version: '1.0.0',
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      metrics: {
        aggregator: metricsAggregator.getMemoryUsage(),
        dataPoints: metricsAggregator.getDataLength()
      },
      config: config
    };
    
    res.json({
      success: true,
      data: systemInfo,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error in /api/monitoring/system/info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MQTT Event Handlers
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  
  // Subscribe to relevant topics
  mqttClient.subscribe('metrics/cpu', (err) => {
    if (err) logger.error('Error subscribing to metrics/cpu:', err);
  });
  
  mqttClient.subscribe('metrics/memory', (err) => {
    if (err) logger.error('Error subscribing to metrics/memory:', err);
  });
  
  mqttClient.subscribe('alerts', (err) => {
    if (err) logger.error('Error subscribing to alerts:', err);
  });
});

mqttClient.on('message', (topic, message) => {
  logger.info(`Received MQTT message on topic ${topic}:`, message.toString());
  
  // Broadcast MQTT messages to WebSocket clients
  io.emit('mqtt-message', {
    topic,
    message: message.toString(),
    timestamp: Date.now()
  });
});

mqttClient.on('error', (error) => {
  logger.error('MQTT connection error:', error);
});

// WebSocket handling
io.on('connection', (socket) => {
  logger.info('Client connected to WebSocket');
  
  const sendData = async () => {
    try {
      const metrics = await getSystemMetrics();
      const services = await getServiceStatus();
      const alerts = checkAlerts({
        cpu: metrics.cpu.usage,
        memory: metrics.memory.percentage,
        disk: metrics.disk.percentage
      });
      
      const data = { metrics, services, alerts, timestamp: Date.now() };
      
      // Store in metrics aggregator
      metricsAggregator.addDataPoint(metrics);
      
      // Send to WebSocket client
      socket.emit('data', data);
      
      // Publish to MQTT
      mqttClient.publish('metrics/system', JSON.stringify(metrics));
      if (alerts.length > 0) {
        mqttClient.publish('alerts/system', JSON.stringify(alerts));
      }
      
    } catch (error) {
      logger.error('Error in sendData:', error);
      socket.emit('error', { message: 'Failed to get system data' });
    }
  };
  
  // Send initial data
  sendData();
  
  // Set up interval for regular updates
  const interval = setInterval(sendData, config.monitoring.refreshInterval);
  
  // Handle client requests
  socket.on('get-metrics', sendData);
  
  socket.on('update-config', (newConfig) => {
    config = { ...config, ...newConfig };
    logger.info('Configuration updated via WebSocket:', config);
    socket.emit('config-updated', config);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from WebSocket');
    clearInterval(interval);
  });
});

// Scheduled tasks
cron.schedule('0 */6 * * *', async () => {
  logger.info('Running scheduled system check');
  try {
    const metrics = await getSystemMetrics();
    const alerts = checkAlerts({
      cpu: metrics.cpu.usage,
      memory: metrics.memory.percentage,
      disk: metrics.disk.percentage
    });
    
    if (alerts.length > 0) {
      logger.warn('Scheduled check found alerts:', alerts);
      mqttClient.publish('alerts/scheduled', JSON.stringify(alerts));
    }
  } catch (error) {
    logger.error('Error in scheduled task:', error);
  }
});

// Create logs directory if it doesn't exist
fs.ensureDirSync(path.join(__dirname, 'logs'));

// Start server
server.listen(3001, () => {
  logger.info('Server listening on port 3001');
  console.log('🚀 SAR-META-WORLD Backend API started on port 3001');
  console.log('📊 Real-time monitoring active');
  console.log('🔌 WebSocket server ready');
  console.log('📡 MQTT integration enabled');
});
