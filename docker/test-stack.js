#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');
const colors = require('colors');

// Test configuration
const tests = [
  { name: 'Frontend', url: 'http://localhost:80', expected: 'SAR Universe' },
  { name: 'Backend API', url: 'http://localhost:3001', expected: 'Cannot GET' },
  { name: 'Grafana', url: 'http://localhost:3000', expected: 'Found' },
  { name: 'Prometheus', url: 'http://localhost:9090', expected: 'Prometheus' },
  { name: 'InfluxDB', url: 'http://localhost:8086', expected: 'InfluxDB' },
  { name: 'Adminer', url: 'http://localhost:8080', expected: 'Adminer' },
  { name: 'Redis Commander', url: 'http://localhost:8081', expected: 'Redis Commander' },
  { name: 'Node Exporter', url: 'http://localhost:9100', expected: 'Node Exporter' },
  { name: 'Redis Exporter', url: 'http://localhost:9121', expected: 'redis_exporter' },
  { name: 'Postgres Exporter', url: 'http://localhost:9187', expected: 'postgres_exporter' },
  { name: 'Nginx Proxy', url: 'http://localhost:8088', expected: 'nginx' }
];

// Database connection tests
const dbTests = [
  { name: 'PostgreSQL', port: 5432, type: 'tcp' },
  { name: 'Redis', port: 6379, type: 'tcp' },
  { name: 'MQTT', port: 1883, type: 'tcp' },
  { name: 'MQTT WebSocket', port: 9001, type: 'tcp' }
];

let totalTests = 0;
let passedTests = 0;

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

function testPort(port, host = 'localhost') {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(3000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
    
    socket.connect(port, host);
  });
}

async function runHttpTests() {
  console.log('🌐 Testing HTTP Services...\n'.cyan.bold);
  
  for (const test of tests) {
    totalTests++;
    try {
      const parsedUrl = url.parse(test.url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'GET',
        protocol: parsedUrl.protocol,
        timeout: 5000
      };
      
      const response = await makeRequest(options);
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        if (test.expected && response.data.includes(test.expected)) {
          console.log(`✅ ${test.name}: OK (${response.statusCode})`.green);
          passedTests++;
        } else if (!test.expected) {
          console.log(`✅ ${test.name}: OK (${response.statusCode})`.green);
          passedTests++;
        } else {
          console.log(`⚠️  ${test.name}: Service running but unexpected content (${response.statusCode})`.yellow);
        }
      } else {
        console.log(`❌ ${test.name}: HTTP ${response.statusCode}`.red);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`.red);
    }
  }
}

async function runPortTests() {
  console.log('\n🔌 Testing Database & Service Ports...\n'.cyan.bold);
  
  for (const test of dbTests) {
    totalTests++;
    try {
      await testPort(test.port);
      console.log(`✅ ${test.name} (Port ${test.port}): Connection successful`.green);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name} (Port ${test.port}): ${error.message}`.red);
    }
  }
}

async function testComponentInteractions() {
  console.log('\n🔗 Testing Component Interactions...\n'.cyan.bold);
  
  // Test Prometheus scraping targets
  totalTests++;
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/v1/targets',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      const targets = JSON.parse(response.data);
      const activeTargets = targets.data.activeTargets.length;
      console.log(`✅ Prometheus: Found ${activeTargets} active targets`.green);
      passedTests++;
    } else {
      console.log(`❌ Prometheus targets: HTTP ${response.statusCode}`.red);
    }
  } catch (error) {
    console.log(`❌ Prometheus targets: ${error.message}`.red);
  }
  
  // Test InfluxDB health
  totalTests++;
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8086,
      path: '/health',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ InfluxDB: Health check passed`.green);
      passedTests++;
    } else {
      console.log(`❌ InfluxDB health: HTTP ${response.statusCode}`.red);
    }
  } catch (error) {
    console.log(`❌ InfluxDB health: ${error.message}`.red);
  }
}

async function generateReport() {
  console.log('\n📊 Stack Deployment Report\n'.cyan.bold);
  console.log('═'.repeat(50));
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${totalTests - passedTests}`.red);
  console.log(`Success Rate: ${successRate}%`);
  
  if (successRate >= 90) {
    console.log('\n🎉 EXCELLENT! Stack is fully operational'.green.bold);
  } else if (successRate >= 80) {
    console.log('\n✅ GOOD! Stack is mostly operational with minor issues'.yellow.bold);
  } else if (successRate >= 60) {
    console.log('\n⚠️  WARNING! Stack has significant issues'.yellow.bold);
  } else {
    console.log('\n❌ CRITICAL! Stack deployment failed'.red.bold);
  }
  
  console.log('\n🔍 Service Access URLs:'.cyan.bold);
  console.log('Frontend:         http://localhost:80');
  console.log('Backend API:      http://localhost:3001');
  console.log('Grafana:          http://localhost:3000');
  console.log('Prometheus:       http://localhost:9090');
  console.log('InfluxDB:         http://localhost:8086');
  console.log('Adminer:          http://localhost:8080');
  console.log('Redis Commander:  http://localhost:8081');
  console.log('Node Exporter:    http://localhost:9100');
  console.log('Redis Exporter:   http://localhost:9121');
  console.log('Postgres Exporter: http://localhost:9187');
  console.log('Nginx Proxy:      http://localhost:8088');
  
  console.log('\n📋 Common Issues Found:'.cyan.bold);
  console.log('- MQTT Backend Connection: Backend cannot connect to MQTT broker');
  console.log('- Backend Health Endpoint: /health endpoint not properly configured');
  console.log('- Nginx Health Check: Health endpoint not available');
  console.log('\n💡 Recommendations:'.cyan.bold);
  console.log('1. Fix MQTT authentication/authorization in backend');
  console.log('2. Implement proper health check endpoints');
  console.log('3. Configure MQTT credentials in backend environment');
  console.log('4. Verify all service dependencies are properly configured');
}

// Main execution
async function main() {
  console.log('🚀 SAR Meta-World Stack Deployment Test\n'.rainbow.bold);
  
  await runHttpTests();
  await runPortTests();
  await testComponentInteractions();
  await generateReport();
}

main().catch(console.error);
