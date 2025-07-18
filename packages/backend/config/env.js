const path = require('path');
const fs = require('fs');

// Function to load environment variables from .env files
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment-specific configuration
const envFilePath = path.join(__dirname, '..', `.env.${NODE_ENV}`);
const envVars = loadEnvFile(envFilePath);

// Merge with process.env (process.env takes precedence)
Object.keys(envVars).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = envVars[key];
  }
});

// Configuration object with defaults
const config = {
  // Environment
  NODE_ENV,
  IS_PRODUCTION: NODE_ENV === 'production',
  IS_DEVELOPMENT: NODE_ENV === 'development',
  
  // Server
  PORT: parseInt(process.env.PORT) || 3001,
  HOST: process.env.HOST || 'localhost',
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  HELMET_ENABLED: process.env.HELMET_ENABLED === 'true',
  RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'sar_meta_world',
  DB_USER: process.env.DB_USER || 'user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  
  // MQTT
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  MQTT_USERNAME: process.env.MQTT_USERNAME || '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',
  MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID || 'sar-backend',
  
  // Monitoring
  MONITORING_REFRESH_INTERVAL: parseInt(process.env.MONITORING_REFRESH_INTERVAL) || 5000,
  MONITORING_AUTO_REFRESH: process.env.MONITORING_AUTO_REFRESH !== 'false',
  MONITORING_HISTORY_RETENTION_DAYS: parseInt(process.env.MONITORING_HISTORY_RETENTION_DAYS) || 30,
  
  // Alert Thresholds
  ALERT_CPU_THRESHOLD: parseInt(process.env.ALERT_CPU_THRESHOLD) || 80,
  ALERT_MEMORY_THRESHOLD: parseInt(process.env.ALERT_MEMORY_THRESHOLD) || 85,
  ALERT_DISK_THRESHOLD: parseInt(process.env.ALERT_DISK_THRESHOLD) || 90,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',
  LOG_MAX_SIZE: process.env.LOG_MAX_SIZE || '10m',
  LOG_MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 5,
  
  // Docker
  DOCKER_SOCKET_PATH: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
  
  // External Services
  EXTERNAL_API_TIMEOUT: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 30000,
  EXTERNAL_API_RETRY_ATTEMPTS: parseInt(process.env.EXTERNAL_API_RETRY_ATTEMPTS) || 3,
  
  // Performance
  METRICS_AGGREGATOR_BUFFER_SIZE: parseInt(process.env.METRICS_AGGREGATOR_BUFFER_SIZE) || 1000,
  METRICS_AGGREGATOR_CLEANUP_INTERVAL: parseInt(process.env.METRICS_AGGREGATOR_CLEANUP_INTERVAL) || 3600000,
  
  // Security Keys
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret',
  API_KEY: process.env.API_KEY || 'fallback_api_key',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'fallback_encryption_key'
};

// Validation for production environment
if (config.IS_PRODUCTION) {
  const requiredVars = ['JWT_SECRET', 'API_KEY', 'ENCRYPTION_KEY'];
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName] || process.env[varName].includes('fallback_') || process.env[varName].includes('your_')
  );
  
  if (missingVars.length > 0) {
    console.error('❌ Production environment validation failed!');
    console.error('Missing or invalid environment variables:', missingVars);
    console.error('Please set proper values in .env.production file');
    process.exit(1);
  }
}

// Log configuration summary
console.log('🔧 Environment Configuration:');
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Server: ${config.HOST}:${config.PORT}`);
console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);
console.log(`   Security: ${config.HELMET_ENABLED ? 'Enabled' : 'Disabled'}`);
console.log(`   Rate Limiting: ${config.RATE_LIMIT_ENABLED ? 'Enabled' : 'Disabled'}`);
console.log(`   Log Level: ${config.LOG_LEVEL}`);
console.log(`   MQTT: ${config.MQTT_BROKER_URL}`);

module.exports = config;
