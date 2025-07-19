const http = require('http');
const https = require('https');
const net = require('net');

// Common service configurations for localhost monitoring
const defaultServices = {
  frontend: {
    port: 5173,
    host: 'localhost',
    protocol: 'http',
    path: '/',
    timeout: 5000
  },
  backend: {
    port: 3001,
    host: 'localhost',
    protocol: 'http',
    path: '/api/monitoring/health',
    timeout: 5000
  },
  postgres: {
    port: 5432,
    host: 'localhost',
    protocol: 'tcp',
    timeout: 3000
  },
  redis: {
    port: 6379,
    host: 'localhost',
    protocol: 'tcp',
    timeout: 3000
  },
  mqtt: {
    port: 1883,
    host: 'localhost',
    protocol: 'tcp',
    timeout: 3000
  },
  grafana: {
    port: 3000,
    host: 'localhost',
    protocol: 'http',
    path: '/api/health',
    timeout: 5000
  },
  prometheus: {
    port: 9090,
    host: 'localhost',
    protocol: 'http',
    path: '/-/healthy',
    timeout: 5000
  }
};

// Check if a TCP port is open
const checkTcpPort = (host, port, timeout = 3000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(true);
      }
    });
    
    socket.on('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });
    
    socket.on('error', () => {
      if (!isResolved) {
        isResolved = true;
        resolve(false);
      }
    });
    
    socket.connect(port, host);
  });
};

// Check HTTP/HTTPS endpoint
const checkHttpEndpoint = (service) => {
  return new Promise((resolve) => {
    const protocol = service.protocol === 'https' ? https : http;
    const options = {
      hostname: service.host,
      port: service.port,
      path: service.path || '/',
      method: 'GET',
      timeout: service.timeout || 5000
    };

    const req = protocol.request(options, (res) => {
      resolve({
        isHealthy: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime
      });
    });

    const startTime = Date.now();
    
    req.on('error', () => {
      resolve({
        isHealthy: false,
        statusCode: null,
        responseTime: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        isHealthy: false,
        statusCode: null,
        responseTime: Date.now() - startTime
      });
    });

    req.end();
  });
};

// Check single service health
const checkServiceHealth = async (serviceName, serviceConfig) => {
  const startTime = Date.now();
  
  try {
    let result;
    
    if (serviceConfig.protocol === 'http' || serviceConfig.protocol === 'https') {
      result = await checkHttpEndpoint(serviceConfig);
    } else {
      // For TCP services (like databases)
      const isHealthy = await checkTcpPort(serviceConfig.host, serviceConfig.port, serviceConfig.timeout);
      result = {
        isHealthy,
        statusCode: isHealthy ? 200 : 503,
        responseTime: Date.now() - startTime
      };
    }
    
    return {
      name: serviceName,
      status: result.isHealthy ? 'online' : 'offline',
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      host: serviceConfig.host,
      port: serviceConfig.port,
      protocol: serviceConfig.protocol,
      lastChecked: Date.now()
    };
  } catch (error) {
    return {
      name: serviceName,
      status: 'error',
      statusCode: null,
      responseTime: Date.now() - startTime,
      host: serviceConfig.host,
      port: serviceConfig.port,
      protocol: serviceConfig.protocol,
      error: error.message,
      lastChecked: Date.now()
    };
  }
};

// Check all services health
const checkAllServicesHealth = async (customServices = null) => {
  const services = customServices || defaultServices;
  const results = {};
  
  // Check all services in parallel
  const healthChecks = Object.entries(services).map(([serviceName, serviceConfig]) =>
    checkServiceHealth(serviceName, serviceConfig)
  );
  
  const healthResults = await Promise.all(healthChecks);
  
  // Convert array to object
  healthResults.forEach(result => {
    results[result.name] = result;
  });
  
  return results;
};

// Get service uptime (simplified version)
const getServiceUptime = (_serviceName) => {
  // In a real implementation, this would track actual uptime
  // For now, return a mock uptime
  return Math.floor(Math.random() * 86400); // Random uptime up to 24 hours
};

module.exports = {
  checkServiceHealth,
  checkAllServicesHealth,
  checkTcpPort,
  checkHttpEndpoint,
  getServiceUptime,
  defaultServices
};
