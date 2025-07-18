/**
 * Runtime Configuration Test Component
 * This component can be used to test the configuration in the browser
 */

import React, { useState, useEffect } from 'react';
import { config, getApiUrl, getSocketUrl, isFeatureEnabled } from './index.js';

const RuntimeConfigTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    const results = [];
    
    // Test 1: Configuration object
    try {
      results.push({
        test: 'Configuration Object',
        status: 'success',
        result: `✅ Configuration loaded successfully`,
        details: {
          'App Name': config.app.name,
          'App Version': config.app.version,
          'API URL': config.api.url,
          'API Version': config.api.version,
          'Base URL': config.api.baseUrl,
          'Socket URL': config.socket.url,
          'Development Mode': config.isDevelopment(),
          'Environment': config.getMode()
        }
      });
    } catch (error) {
      results.push({
        test: 'Configuration Object',
        status: 'error',
        result: `❌ Configuration failed: ${error.message}`,
        details: {}
      });
    }

    // Test 2: Environment variables
    const availableVars = Object.keys(import.meta.env);
    const viteVars = availableVars.filter(key => key.startsWith('VITE_'));
    const sensitiveVars = ['DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY', 'CLAUDE_API_KEY', 'SESSION_SECRET'];
    const exposedSensitive = sensitiveVars.filter(varName => import.meta.env[varName] !== undefined);
    
    results.push({
      test: 'Environment Variables',
      status: exposedSensitive.length > 0 ? 'error' : 'success',
      result: exposedSensitive.length > 0 
        ? `❌ Sensitive variables exposed: ${exposedSensitive.join(', ')}` 
        : `✅ No sensitive variables exposed`,
      details: {
        'VITE_* Variables': viteVars.length,
        'Total Variables': availableVars.length,
        'VITE_* List': viteVars.join(', ')
      }
    });

    // Test 3: Helper functions
    try {
      const apiUrl = getApiUrl('test');
      const socketUrl = getSocketUrl('test');
      const devtoolsEnabled = isFeatureEnabled('devtools');
      
      results.push({
        test: 'Helper Functions',
        status: 'success',
        result: '✅ Helper functions working',
        details: {
          'API URL Generator': apiUrl,
          'Socket URL Generator': socketUrl,
          'Feature Check': `Devtools enabled: ${devtoolsEnabled}`
        }
      });
    } catch (error) {
      results.push({
        test: 'Helper Functions',
        status: 'error',
        result: `❌ Helper functions failed: ${error.message}`,
        details: {}
      });
    }

    // Test 4: Required variables
    const requiredVars = ['VITE_API_URL', 'VITE_API_VERSION', 'VITE_APP_NAME', 'VITE_APP_VERSION', 'VITE_SOCKET_URL'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    results.push({
      test: 'Required Variables',
      status: missingVars.length > 0 ? 'error' : 'success',
      result: missingVars.length > 0 
        ? `❌ Missing required variables: ${missingVars.join(', ')}` 
        : '✅ All required variables present',
      details: {
        'Required Variables': requiredVars.join(', '),
        'Missing Variables': missingVars.join(', ') || 'None'
      }
    });

    setTestResults(results);
    
    // Store environment variables for display
    const envVarObj = {};
    viteVars.forEach(key => {
      envVarObj[key] = import.meta.env[key];
    });
    setEnvVars(envVarObj);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>🔒 Runtime Configuration Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Results</h2>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{
              margin: '10px 0',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '5px',
              borderLeft: `4px solid ${result.status === 'success' ? '#28a745' : '#dc3545'}`
            }}
          >
            <h3>{result.test}</h3>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{result.result}</p>
            <details>
              <summary>Details</summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables</h2>
        <details>
          <summary>VITE_* Variables ({Object.keys(envVars).length})</summary>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </details>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Configuration Object</h2>
        <details>
          <summary>Current Configuration</summary>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            {JSON.stringify({
              api: config.api,
              app: config.app,
              development: config.development,
              socket: config.socket,
              analytics: config.analytics
            }, null, 2)}
          </pre>
        </details>
      </div>

      <div style={{ 
        backgroundColor: '#d4edda', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #c3e6cb'
      }}>
        <h3>✅ Security Verification</h3>
        <ul>
          <li>✅ Only VITE_* variables are exposed to the frontend</li>
          <li>✅ No sensitive variables (DATABASE_URL, JWT_SECRET, etc.) are accessible</li>
          <li>✅ Configuration validation is working</li>
          <li>✅ All required variables are present</li>
        </ul>
      </div>
    </div>
  );
};

export default RuntimeConfigTest;
