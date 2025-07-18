// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  socketURL: import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001',
  endpoints: {
    health: '/api/monitoring/health',
    metrics: '/api/monitoring/metrics',
    services: '/api/monitoring/services',
    logs: '/api/monitoring/logs',
  }
};

// Service URLs
export const SERVICE_URLS = {
  grafana: import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000',
  prometheus: import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090',
  influxdb: import.meta.env.VITE_INFLUXDB_URL || 'http://localhost:8086',
  adminer: import.meta.env.VITE_ADMINER_URL || 'http://localhost:8080',
  redisCommander: import.meta.env.VITE_REDIS_COMMANDER_URL || 'http://localhost:8081',
};

// Development mode check
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

// Helper function to create API URL
export const createApiUrl = (endpoint) => {
  const baseURL = API_CONFIG.baseURL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${cleanEndpoint}`;
};
