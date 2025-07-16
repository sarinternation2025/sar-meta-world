/**
 * Application Constants
 * Centralized configuration for the SAR-META-WORLD application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  SOCKET_URL: 'http://localhost:5000',
  TIMEOUT: 10000,
};

// Authentication
export const AUTH_CONFIG = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123',
  SESSION_KEY: 'sar_meta_world_session',
  TOKEN_KEY: 'sar_meta_world_token',
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  TYPING_TIMEOUT: 3000,
  MESSAGE_DELAY: 1000,
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  ANIMATION_DURATION: 300,
  GLOW_INTENSITY: 0.3,
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#00d4ff',
  SECONDARY: '#7c3aed',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  BACKGROUND: {
    DARK: '#0f172a',
    LIGHT: '#1e293b',
    GLASS: 'rgba(0, 0, 0, 0.2)',
  },
  TEXT: {
    PRIMARY: '#f8fafc',
    SECONDARY: '#cbd5e1',
    MUTED: '#64748b',
  },
};

// Feature Flags
export const FEATURES = {
  CHAT_ENABLED: true,
  ADMIN_CONTROLS_ENABLED: true,
  ANALYTICS_ENABLED: true,
  GLOBE_VISUALIZATION_ENABLED: true,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in as admin.',
  MESSAGE_SENT: 'Message sent successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  CHAT_CONFIG,
  UI_CONFIG,
  COLORS,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
