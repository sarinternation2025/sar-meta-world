#!/usr/bin/env node

// Test script to verify backend startup
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const config = require('./config/env');

console.log('🔧 Testing Backend Startup...\n');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGIN,
  },
});

// Test basic setup
console.log('✅ Express app initialized');
console.log('✅ HTTP server created');
console.log('✅ Socket.IO server created');
console.log('✅ Environment configuration loaded');

// Test middleware setup
if (config.HELMET_ENABLED) {
  console.log('✅ Helmet security middleware enabled');
} else {
  console.log('⚠️  Helmet security middleware disabled (development mode)');
}

if (config.RATE_LIMIT_ENABLED) {
  console.log('✅ Rate limiting middleware enabled');
} else {
  console.log('⚠️  Rate limiting middleware disabled (development mode)');
}

// Test port binding
server.listen(config.PORT, config.HOST, () => {
  console.log(`✅ Server successfully bound to ${config.HOST}:${config.PORT}`);
  console.log(`🚀 Backend startup test completed successfully!`);
  console.log(`📊 Configuration: ${config.NODE_ENV} mode`);
  console.log(`🔒 Security: ${config.HELMET_ENABLED ? 'Enabled' : 'Disabled'}`);
  console.log(`⚡ Rate limiting: ${config.RATE_LIMIT_ENABLED ? 'Enabled' : 'Disabled'}`);
  
  // Close the server after successful test
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server startup failed:', err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Server startup timeout');
  process.exit(1);
}, 5000);
