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

// Validation rules for each package
const validationRules = {
  'backend': {
    required: ['POSTGRES_PASSWORD', 'JWT_SECRET', 'INFLUXDB_TOKEN', 'CORS_ORIGIN'],
    shouldNotBe: {
      'POSTGRES_PASSWORD': ['your_secure_password_here'],
      'JWT_SECRET': ['your_jwt_secret_here'],
      'INFLUXDB_TOKEN': ['your_influxdb_token_here']
    }
  },
  'frontend': {
    required: ['VITE_API_URL', 'VITE_SOCKET_URL'],
    shouldNotBe: {}
  },
  'cli-agent': {
    required: ['POSTGRES_PASSWORD', 'API_BASE_URL'],
    shouldNotBe: {
      'POSTGRES_PASSWORD': ['your_secure_password_here']
    }
  },
  'react-app': {
    required: ['JWT_SECRET', 'DATABASE_URL'],
    shouldNotBe: {
      'JWT_SECRET': ['your_jwt_secret_here'],
      'DATABASE_URL': ['postgresql://postgres:your_secure_password@localhost:5432/chatapp']
    }
  },
  'docker': {
    required: ['POSTGRES_PASSWORD', 'GRAFANA_PASSWORD', 'INFLUXDB_PASSWORD', 'INFLUXDB_ADMIN_TOKEN'],
    shouldNotBe: {
      'POSTGRES_PASSWORD': ['your_secure_postgres_password_here'],
      'GRAFANA_PASSWORD': ['your_grafana_password_here'],
      'INFLUXDB_PASSWORD': ['your_influxdb_password_here'],
      'INFLUXDB_ADMIN_TOKEN': ['your_influxdb_admin_token_here']
    }
  }
};

// Package directories
const packages = {
  'backend': 'packages/backend',
  'frontend': 'packages/frontend', 
  'cli-agent': 'packages/cli-agent',
  'react-app': 'packages/react-app',
  'docker': 'docker'
};

console.log('🔍 Validating Environment Variables...\n');

let allValid = true;

// Validate each package
Object.entries(packages).forEach(([packageName, packageDir]) => {
  const envPath = path.join(packageDir, '.env');
  const envExamplePath = path.join(packageDir, '.env.example');
  
  console.log(`📦 ${packageName.toUpperCase()}`);
  console.log(`   Path: ${envPath}`);
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('   ❌ .env file not found');
    allValid = false;
    return;
  }
  console.log('   ✅ .env file exists');
  
  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.log('   ⚠️  .env.example file not found');
  } else {
    console.log('   ✅ .env.example file exists');
  }
  
  // Read environment variables
  const env = readEnvFile(envPath);
  if (!env) {
    console.log('   ❌ Failed to read .env file');
    allValid = false;
    return;
  }
  
  // Check required variables
  const rules = validationRules[packageName];
  if (rules) {
    rules.required.forEach(varName => {
      if (!env[varName] || env[varName].trim() === '') {
        console.log(`   ❌ Missing required variable: ${varName}`);
        allValid = false;
      } else {
        console.log(`   ✅ ${varName} is set`);
      }
    });
    
    // Check for placeholder values
    Object.entries(rules.shouldNotBe).forEach(([varName, invalidValues]) => {
      if (env[varName] && invalidValues.includes(env[varName])) {
        console.log(`   ❌ ${varName} still has placeholder value`);
        allValid = false;
      }
    });
  }
  
  console.log();
});

// Summary
console.log('📊 VALIDATION SUMMARY');
console.log('====================');
if (allValid) {
  console.log('✅ All environment variables are properly configured!');
  console.log('🎉 Environment setup is complete and valid.');
} else {
  console.log('❌ Some environment variables need attention.');
  console.log('📝 Please review the issues above and update your .env files.');
}

process.exit(allValid ? 0 : 1);
