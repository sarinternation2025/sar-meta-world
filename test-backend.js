const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/api/monitoring/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
    timestamp: Date.now()
  });
});

app.get('/api/monitoring/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      cpu: {
        usage: 25.5,
        cores: 8,
        temperature: 45
      },
      memory: {
        total: 16777216000,
        used: 8388608000,
        percentage: 50.0
      },
      disk: {
        total: 1000000000000,
        used: 500000000000,
        percentage: 50.0
      },
      network: {
        upload: 1024,
        download: 2048,
        connections: 5
      },
      system: {
        platform: 'darwin',
        uptime: 86400
      }
    },
    timestamp: Date.now()
  });
});

app.get('/api/monitoring/services', (req, res) => {
  res.json({
    success: true,
    data: {
      frontend: {
        status: 'online',
        uptime: 3600,
        port: 5173,
        host: 'localhost',
        protocol: 'http'
      },
      backend: {
        status: 'online',
        uptime: 3600,
        port: 3001,
        host: 'localhost',
        protocol: 'http'
      }
    },
    timestamp: Date.now()
  });
});

app.get('/api/monitoring/alerts', (req, res) => {
  res.json({
    success: true,
    data: [],
    timestamp: Date.now()
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected to WebSocket');
  
  const sendData = () => {
    const data = {
      metrics: {
        cpu: {
          usage: 25.5 + Math.random() * 10,
          cores: 8,
          temperature: 45 + Math.random() * 5
        },
        memory: {
          total: 16777216000,
          used: 8388608000 + Math.random() * 1000000000,
          percentage: 50.0 + Math.random() * 10
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          percentage: 50.0
        },
        network: {
          upload: 1024 + Math.random() * 500,
          download: 2048 + Math.random() * 1000,
          connections: 5
        },
        system: {
          platform: 'darwin',
          uptime: 86400
        }
      },
      services: {
        frontend: {
          status: 'online',
          uptime: 3600,
          port: 5173,
          host: 'localhost',
          protocol: 'http'
        },
        backend: {
          status: 'online',
          uptime: 3600,
          port: 3001,
          host: 'localhost',
          protocol: 'http'
        }
      },
      alerts: [],
      timestamp: Date.now()
    };
    
    socket.emit('data', data);
  };
  
  // Send initial data
  sendData();
  
  // Set up interval for regular updates
  const interval = setInterval(sendData, 5000);
  
  socket.on('get-metrics', sendData);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from WebSocket');
    clearInterval(interval);
  });
});

// Start server
server.listen(3001, () => {
  console.log('🚀 Test Backend API started on port 3001');
  console.log('📊 Mock monitoring data active');
  console.log('🔌 WebSocket server ready');
});
