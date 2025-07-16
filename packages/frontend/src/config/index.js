import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // API Configuration
  VITE_API_URL: z.string().url('API URL must be a valid URL'),
  VITE_API_VERSION: z.string().min(1, 'API version is required'),
  
  // App Configuration
  VITE_APP_NAME: z.string().min(1, 'App name is required'),
  VITE_APP_VERSION: z.string().min(1, 'App version is required'),
  
  // Development Settings
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_ENABLE_DEVTOOLS: z.string().transform((val) => val === 'true').default('false'),
  VITE_ENABLE_MOCK_API: z.string().transform((val) => val === 'true').optional(),
  
  // Socket.io Configuration
  VITE_SOCKET_URL: z.string().url('Socket URL must be a valid URL'),
  VITE_SOCKET_NAMESPACE: z.string().default('default'),
  
  // Development-specific features (optional)
  VITE_SHOW_DEBUG_INFO: z.string().transform((val) => val === 'true').optional(),
  VITE_HOT_RELOAD: z.string().transform((val) => val === 'true').optional(),
  
  // Production-specific features (optional)
  VITE_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').optional(),
  VITE_SENTRY_DSN: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment variable validation failed:');
    console.error(error.errors);
    throw new Error('Invalid environment configuration');
  }
}

// Parse and validate environment variables
const env = validateEnv();

// Export typed configuration object
export const config = {
  // API Configuration
  api: {
    url: env.VITE_API_URL,
    version: env.VITE_API_VERSION,
    baseUrl: `${env.VITE_API_URL}/${env.VITE_API_VERSION}`,
  },
  
  // App Configuration
  app: {
    name: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
  },
  
  // Development Settings
  development: {
    logLevel: env.VITE_LOG_LEVEL,
    enableDevtools: env.VITE_ENABLE_DEVTOOLS,
    enableMockApi: env.VITE_ENABLE_MOCK_API ?? false,
    showDebugInfo: env.VITE_SHOW_DEBUG_INFO ?? false,
    hotReload: env.VITE_HOT_RELOAD ?? false,
  },
  
  // Socket.io Configuration
  socket: {
    url: env.VITE_SOCKET_URL,
    namespace: env.VITE_SOCKET_NAMESPACE,
  },
  
  // Analytics & Monitoring
  analytics: {
    enabled: env.VITE_ENABLE_ANALYTICS ?? false,
    sentryDsn: env.VITE_SENTRY_DSN,
  },
  
  // Utility functions
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getMode: () => import.meta.env.MODE,
};

// Export individual config sections for convenience
export const { api, app, development, socket, analytics } = config;

// Export the default config
export default config;

// Helper functions for common configuration tasks
export const getApiUrl = (endpoint = '') => {
  const baseUrl = config.api.baseUrl;
  if (!endpoint) return baseUrl;
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

export const getSocketUrl = (namespace = '') => {
  const socketUrl = config.socket.url;
  if (!namespace) return socketUrl;
  return `${socketUrl}/${namespace}`;
};

export const isFeatureEnabled = (feature) => {
  switch (feature) {
    case 'devtools':
      return config.development.enableDevtools;
    case 'mockApi':
      return config.development.enableMockApi;
    case 'debugInfo':
      return config.development.showDebugInfo;
    case 'analytics':
      return config.analytics.enabled;
    default:
      return false;
  }
};

// Log configuration in development mode
if (config.isDevelopment()) {
  console.log('🔧 Application Configuration:', {
    mode: config.getMode(),
    api: config.api,
    app: config.app,
    features: {
      devtools: config.development.enableDevtools,
      mockApi: config.development.enableMockApi,
      debugInfo: config.development.showDebugInfo,
      analytics: config.analytics.enabled,
    },
  });
}
