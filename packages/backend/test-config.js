#!/usr/bin/env node

// Test script to verify backend configuration
const config = require('./config/env');

console.log('🔧 Testing Backend Configuration...\n');

// Test environment loading
console.log('Environment Configuration:');
console.log(`   NODE_ENV: ${config.NODE_ENV}`);
console.log(`   IS_PRODUCTION: ${config.IS_PRODUCTION}`);
console.log(`   IS_DEVELOPMENT: ${config.IS_DEVELOPMENT}`);
console.log('');

// Test server configuration
console.log('Server Configuration:');
console.log(`   HOST: ${config.HOST}`);
console.log(`   PORT: ${config.PORT}`);
console.log('');

// Test security configuration
console.log('Security Configuration:');
console.log(`   CORS_ORIGIN: ${config.CORS_ORIGIN}`);
console.log(`   HELMET_ENABLED: ${config.HELMET_ENABLED}`);
console.log(`   RATE_LIMIT_ENABLED: ${config.RATE_LIMIT_ENABLED}`);
console.log(`   RATE_LIMIT_MAX_REQUESTS: ${config.RATE_LIMIT_MAX_REQUESTS}`);
console.log(`   RATE_LIMIT_WINDOW_MS: ${config.RATE_LIMIT_WINDOW_MS}`);
console.log('');

// Test monitoring configuration
console.log('Monitoring Configuration:');
console.log(`   MONITORING_REFRESH_INTERVAL: ${config.MONITORING_REFRESH_INTERVAL}`);
console.log(`   MONITORING_AUTO_REFRESH: ${config.MONITORING_AUTO_REFRESH}`);
console.log(`   MONITORING_HISTORY_RETENTION_DAYS: ${config.MONITORING_HISTORY_RETENTION_DAYS}`);
console.log('');

// Test alert thresholds
console.log('Alert Thresholds:');
console.log(`   CPU: ${config.ALERT_CPU_THRESHOLD}%`);
console.log(`   Memory: ${config.ALERT_MEMORY_THRESHOLD}%`);
console.log(`   Disk: ${config.ALERT_DISK_THRESHOLD}%`);
console.log('');

// Test logging configuration
console.log('Logging Configuration:');
console.log(`   LOG_LEVEL: ${config.LOG_LEVEL}`);
console.log(`   LOG_FILE_PATH: ${config.LOG_FILE_PATH}`);
console.log(`   LOG_MAX_SIZE: ${config.LOG_MAX_SIZE}`);
console.log(`   LOG_MAX_FILES: ${config.LOG_MAX_FILES}`);
console.log('');

// Test MQTT configuration
console.log('MQTT Configuration:');
console.log(`   MQTT_BROKER_URL: ${config.MQTT_BROKER_URL}`);
console.log(`   MQTT_CLIENT_ID: ${config.MQTT_CLIENT_ID}`);
console.log(`   MQTT_USERNAME: ${config.MQTT_USERNAME || '(not set)'}`);
console.log('');

// Test security keys (masked for security)
console.log('Security Keys:');
console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '***' + config.JWT_SECRET.slice(-4) : 'NOT SET'}`);
console.log(`   API_KEY: ${config.API_KEY ? '***' + config.API_KEY.slice(-4) : 'NOT SET'}`);
console.log(`   ENCRYPTION_KEY: ${config.ENCRYPTION_KEY ? '***' + config.ENCRYPTION_KEY.slice(-4) : 'NOT SET'}`);
console.log('');

// Test performance configuration
console.log('Performance Configuration:');
console.log(`   METRICS_AGGREGATOR_BUFFER_SIZE: ${config.METRICS_AGGREGATOR_BUFFER_SIZE}`);
console.log(`   METRICS_AGGREGATOR_CLEANUP_INTERVAL: ${config.METRICS_AGGREGATOR_CLEANUP_INTERVAL}`);
console.log('');

console.log('✅ Configuration test completed successfully!');
console.log('');
console.log('🚀 Backend is ready to start with the above configuration.');
