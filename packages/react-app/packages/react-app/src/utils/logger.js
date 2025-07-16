/**
 * Frontend Logger Utility
 * Provides consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS.DEBUG; // Always debug in development
  }

  error(message, ...args) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  // Specialized logging for different features
  chat(message, ...args) {
    this.info(`[CHAT] ${message}`, ...args);
  }

  auth(message, ...args) {
    this.info(`[AUTH] ${message}`, ...args);
  }

  admin(message, ...args) {
    this.info(`[ADMIN] ${message}`, ...args);
  }
}

export const logger = new Logger();
export default logger;
