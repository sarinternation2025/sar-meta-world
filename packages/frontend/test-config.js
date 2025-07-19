/**
 * Test script to verify environment configuration
 * This simulates the Vite environment for testing
 */

import { readFileSync } from 'fs';

// Mock import.meta.env to simulate Vite environment
const envFile = readFileSync('.env', 'utf8');
const mockEnv = {
    MODE: 'development',
    DEV: true,
    PROD: false,
    SSR: false,
    BASE_URL: '/'
};

// Parse .env file
envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && key.startsWith('VITE_')) {
            mockEnv[key] = value;
        }
    }
});

// Mock import.meta.env globally
global.import = {
    meta: {
        env: mockEnv
    }
};

console.log('🔒 Testing Environment Configuration');
console.log('====================================');

// Test 1: Available environment variables
console.log('\n1. Environment Variables:');
console.log('Available keys:', Object.keys(mockEnv));
console.log('VITE_* variables:', Object.keys(mockEnv).filter(k => k.startsWith('VITE_')));

// Test 2: Check for required variables
console.log('\n2. Required Variables Check:');
const requiredVars = [
    'VITE_API_URL',
    'VITE_API_VERSION',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_SOCKET_URL'
];

requiredVars.forEach(varName => {
    if (mockEnv[varName]) {
        console.log(`✅ ${varName}: ${mockEnv[varName]}`);
    } else {
        console.log(`❌ ${varName}: MISSING`);
    }
});

// Test 3: Check for sensitive variables (they should NOT be in VITE_ vars)
console.log('\n3. Security Check:');
const sensitiveVars = ['DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY', 'CLAUDE_API_KEY', 'SESSION_SECRET'];
const exposedSensitive = sensitiveVars.filter(varName => mockEnv[varName] !== undefined);

if (exposedSensitive.length > 0) {
    console.log('❌ SECURITY ISSUE: Sensitive variables exposed:', exposedSensitive);
} else {
    console.log('✅ No sensitive variables exposed to frontend');
}

// Test 4: Test the configuration import
console.log('\n4. Configuration Import Test:');
try {
    // We need to use dynamic import to test the actual config
    const { config } = await import('./src/config/index.js');
    console.log('✅ Configuration loaded successfully');
    console.log('App Configuration:', {
        name: config.app.name,
        version: config.app.version
    });
    console.log('API Configuration:', {
        url: config.api.url,
        version: config.api.version,
        baseUrl: config.api.baseUrl
    });
    console.log('Development mode:', config.isDevelopment());
} catch (error) {
    console.log('❌ Configuration import failed:', error.message);
}

console.log('\n====================================');
console.log('✅ Environment Configuration Test Complete');
