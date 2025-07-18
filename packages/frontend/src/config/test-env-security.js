/**
 * Test script to verify environment variable security and configuration
 * This ensures that only VITE_* variables are exposed to the frontend
 */

import { config } from './index.js';

console.log('🔒 Testing Environment Variable Security');
console.log('========================================');

// Test 1: Check what variables are available in import.meta.env
console.log('\n1. Available variables in import.meta.env:');
console.log('Keys:', Object.keys(import.meta.env));

// Test 2: Check that only VITE_* variables are exposed
console.log('\n2. Checking for VITE_* variables only:');
const availableVars = Object.keys(import.meta.env);
const viteVars = availableVars.filter(key => key.startsWith('VITE_'));
const nonViteVars = availableVars.filter(key => !key.startsWith('VITE_') && !['BASE_URL', 'MODE', 'DEV', 'PROD', 'SSR'].includes(key));

console.log('✅ VITE_* variables:', viteVars);
console.log('⚠️  Non-VITE variables (should be minimal):', nonViteVars);

// Test 3: Check that sensitive variables are NOT exposed
console.log('\n3. Checking for sensitive variables (should NOT be present):');
const sensitiveVars = ['DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY', 'CLAUDE_API_KEY', 'SESSION_SECRET'];
const exposedSensitiveVars = sensitiveVars.filter(varName => import.meta.env[varName] !== undefined);

if (exposedSensitiveVars.length > 0) {
    console.error('❌ SECURITY ISSUE: Sensitive variables exposed:', exposedSensitiveVars);
} else {
    console.log('✅ No sensitive variables exposed');
}

// Test 4: Test the configuration validation
console.log('\n4. Testing configuration validation:');
try {
    console.log('✅ Configuration loaded successfully');
    console.log('App name:', config.app.name);
    console.log('API URL:', config.api.url);
    console.log('Development mode:', config.isDevelopment());
} catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
}

// Test 5: Check for missing required VITE_* variables
console.log('\n5. Checking for missing required variables:');
const requiredVars = [
    'VITE_API_URL',
    'VITE_API_VERSION',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_SOCKET_URL'
];

const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required variables:', missingVars);
} else {
    console.log('✅ All required variables present');
}

// Test 6: Test environment-specific behavior
console.log('\n6. Environment-specific tests:');
console.log('Mode:', import.meta.env.MODE);
console.log('Is Development:', import.meta.env.DEV);
console.log('Is Production:', import.meta.env.PROD);

// Test 7: Test that build-time variables are properly handled
console.log('\n7. Build-time variable handling:');
console.log('Base URL:', import.meta.env.BASE_URL);

console.log('\n========================================');
console.log('🔒 Environment Security Test Complete');
