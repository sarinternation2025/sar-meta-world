#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to read and parse .env file
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

// Test database connection
async function testPostgresConnection(env) {
  console.log('🔍 Testing PostgreSQL connection...');
  
  try {
    // Check if we can connect to PostgreSQL
    const { Client } = require('pg');
    const client = new Client({
      host: env.POSTGRES_HOST || 'localhost',
      port: env.POSTGRES_PORT || 5432,
      database: env.POSTGRES_DB || 'chatapp',
      user: env.POSTGRES_USER || 'postgres',
      password: env.POSTGRES_PASSWORD,
    });
    
    await client.connect();
    console.log('   ✅ PostgreSQL connection successful');
    await client.end();
    return true;
  } catch (error) {
    console.log('   ❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Test Redis connection
async function testRedisConnection(env) {
  console.log('🔍 Testing Redis connection...');
  
  try {
    const redis = require('redis');
    const client = redis.createClient({
      host: env.REDIS_HOST || 'localhost',
      port: env.REDIS_PORT || 6379,
      // Don't use password if it's set but Redis doesn't require it
    });
    
    await client.connect();
    console.log('   ✅ Redis connection successful');
    await client.disconnect();
    return true;
  } catch (error) {
    console.log('   ❌ Redis connection failed:', error.message);
    return false;
  }
}

// Test InfluxDB connection
async function testInfluxDBConnection(env) {
  console.log('🔍 Testing InfluxDB connection...');
  
  try {
    const { InfluxDB } = require('@influxdata/influxdb-client');
    const influxDB = new InfluxDB({
      url: `http://${env.INFLUXDB_HOST || 'localhost'}:${env.INFLUXDB_PORT || 8086}`,
      token: env.INFLUXDB_TOKEN,
    });
    
    const queryApi = influxDB.getQueryApi(env.INFLUXDB_ORG || 'chatapp');
    await queryApi.queryRows('buckets()');
    console.log('   ✅ InfluxDB connection successful');
    return true;
  } catch (error) {
    console.log('   ❌ InfluxDB connection failed:', error.message);
    return false;
  }
}

// Main test function
async function testConnections() {
  console.log('🔍 Testing Database Connections...\n');
  
  // Read backend environment variables
  const backendEnv = readEnvFile(path.join('packages/backend', '.env'));
  if (!backendEnv) {
    console.log('❌ Could not read backend .env file');
    return false;
  }
  
  let allConnectionsWork = true;
  
  // Test PostgreSQL (if pg module is available)
  try {
    require('pg');
    const pgResult = await testPostgresConnection(backendEnv);
    allConnectionsWork = allConnectionsWork && pgResult;
  } catch (error) {
    console.log('⚠️  PostgreSQL client not installed, skipping connection test');
  }
  
  // Test Redis (if redis module is available)
  try {
    require('redis');
    const redisResult = await testRedisConnection(backendEnv);
    allConnectionsWork = allConnectionsWork && redisResult;
  } catch (error) {
    console.log('⚠️  Redis client not installed, skipping connection test');
  }
  
  // Test InfluxDB (if influxdb-client module is available)
  try {
    require('@influxdata/influxdb-client');
    const influxResult = await testInfluxDBConnection(backendEnv);
    allConnectionsWork = allConnectionsWork && influxResult;
  } catch (error) {
    console.log('⚠️  InfluxDB client not installed, skipping connection test');
  }
  
  console.log('\n📊 CONNECTION TEST SUMMARY');
  console.log('==========================');
  if (allConnectionsWork) {
    console.log('✅ All database connections are working!');
  } else {
    console.log('❌ Some database connections failed.');
    console.log('💡 Make sure the database services are running.');
  }
  
  return allConnectionsWork;
}

// Run tests
testConnections().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});
