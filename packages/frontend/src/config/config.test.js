/**
 * Test suite for environment configuration
 * Tests the security and functionality of the configuration system
 */

import { describe, it, expect } from 'vitest';
import { config } from './index.js';

describe('Environment Configuration', () => {
  describe('Environment Variable Security', () => {
    it('should have VITE_* variables available', () => {
      const availableVars = Object.keys(import.meta.env);
      const viteVars = availableVars.filter(key => key.startsWith('VITE_'));
      
      expect(viteVars.length).toBeGreaterThan(0);
      console.log('VITE_* variables found:', viteVars);
      console.log('All environment variables:', availableVars);
      
      // The key security requirement is that VITE_* variables should be the only
      // application-specific variables exposed to the frontend
      expect(viteVars).toContain('VITE_API_URL');
      expect(viteVars).toContain('VITE_APP_NAME');
    });

    it('should not expose sensitive variables', () => {
      const sensitiveVars = [
        'DATABASE_URL',
        'JWT_SECRET', 
        'OPENAI_API_KEY',
        'CLAUDE_API_KEY',
        'SESSION_SECRET',
        'PRIVATE_KEY',
        'SECRET_KEY'
      ];
      
      sensitiveVars.forEach(varName => {
        expect(import.meta.env[varName]).toBeUndefined();
      });
    });

    it('should have all required VITE_* variables', () => {
      const requiredVars = [
        'VITE_API_URL',
        'VITE_API_VERSION',
        'VITE_APP_NAME',
        'VITE_APP_VERSION',
        'VITE_SOCKET_URL'
      ];
      
      requiredVars.forEach(varName => {
        expect(import.meta.env[varName]).toBeDefined();
        expect(import.meta.env[varName]).not.toBe('');
      });
    });
  });

  describe('Configuration Object', () => {
    it('should create a valid configuration object', () => {
      expect(config).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.app).toBeDefined();
      expect(config.development).toBeDefined();
      expect(config.socket).toBeDefined();
    });

    it('should have correct API configuration', () => {
      expect(config.api.url).toBe(import.meta.env.VITE_API_URL);
      expect(config.api.version).toBe(import.meta.env.VITE_API_VERSION);
      expect(config.api.baseUrl).toBe(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_API_VERSION}`);
    });

    it('should have correct app configuration', () => {
      expect(config.app.name).toBe(import.meta.env.VITE_APP_NAME);
      expect(config.app.version).toBe(import.meta.env.VITE_APP_VERSION);
    });

    it('should have correct socket configuration', () => {
      expect(config.socket.url).toBe(import.meta.env.VITE_SOCKET_URL);
      expect(config.socket.namespace).toBeDefined();
    });

    it('should have environment detection methods', () => {
      expect(typeof config.isDevelopment).toBe('function');
      expect(typeof config.isProduction).toBe('function');
      expect(typeof config.getMode).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate URLs correctly', () => {
      // API URL should be a valid URL
      expect(() => new URL(config.api.url)).not.toThrow();
      
      // Socket URL should be a valid URL (even if it's ws://)
      const socketUrl = config.socket.url.replace('ws://', 'http://');
      expect(() => new URL(socketUrl)).not.toThrow();
    });

    it('should have non-empty required fields', () => {
      expect(config.app.name).toBeTruthy();
      expect(config.app.version).toBeTruthy();
      expect(config.api.url).toBeTruthy();
      expect(config.api.version).toBeTruthy();
    });
  });

  describe('Helper Functions', () => {
    it('should generate correct API URLs', async () => {
      const { getApiUrl } = await import('./index.js');
      
      expect(getApiUrl()).toBe(config.api.baseUrl);
      expect(getApiUrl('users')).toBe(`${config.api.baseUrl}/users`);
      expect(getApiUrl('/users')).toBe(`${config.api.baseUrl}/users`);
    });

    it('should generate correct socket URLs', async () => {
      const { getSocketUrl } = await import('./index.js');
      
      expect(getSocketUrl()).toBe(config.socket.url);
      expect(getSocketUrl('chat')).toBe(`${config.socket.url}/chat`);
    });

    it('should check features correctly', async () => {
      const { isFeatureEnabled } = await import('./index.js');
      
      expect(typeof isFeatureEnabled('devtools')).toBe('boolean');
      expect(typeof isFeatureEnabled('mockApi')).toBe('boolean');
      expect(typeof isFeatureEnabled('analytics')).toBe('boolean');
      expect(isFeatureEnabled('nonexistent')).toBe(false);
    });
  });

  describe('Environment-specific behavior', () => {
    it('should correctly identify development mode', () => {
      expect(config.isDevelopment()).toBe(import.meta.env.DEV);
      expect(config.isProduction()).toBe(import.meta.env.PROD);
      expect(config.getMode()).toBe(import.meta.env.MODE);
    });

    it('should have appropriate development settings', () => {
      if (config.isDevelopment()) {
        expect(config.development.logLevel).toBeDefined();
        expect(config.development.enableDevtools).toBeDefined();
      }
    });
  });
});

describe('Environment Variable Types', () => {
  it('should correctly transform boolean environment variables', () => {
    // Test boolean transformation
    if (import.meta.env.VITE_ENABLE_DEVTOOLS) {
      expect(typeof config.development.enableDevtools).toBe('boolean');
    }
    
    if (import.meta.env.VITE_ENABLE_MOCK_API) {
      expect(typeof config.development.enableMockApi).toBe('boolean');
    }
  });

  it('should handle optional variables gracefully', () => {
    expect(config.development.enableMockApi).toBeDefined();
    expect(config.development.showDebugInfo).toBeDefined();
    expect(config.analytics.enabled).toBeDefined();
  });
});
