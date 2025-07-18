const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const yaml = require('yaml');
const { logger } = require('./logger');

/**
 * Configuration management utility
 */
class Config {
  constructor() {
    this.configDir = path.join(os.homedir(), '.sar-cli');
    this.configFile = path.join(this.configDir, 'config.yaml');
    this.config = {};
    this.loaded = false;
  }

  /**
   * Load configuration from file
   */
  async load() {
    try {
      await fs.ensureDir(this.configDir);
      
      if (await fs.pathExists(this.configFile)) {
        const configData = await fs.readFile(this.configFile, 'utf8');
        this.config = yaml.parse(configData) || {};
        logger.debug('Configuration loaded successfully');
      } else {
        this.config = this.getDefaultConfig();
        await this.save();
        logger.info('Default configuration created');
      }
      
      this.loaded = true;
    } catch (error) {
      logger.error('Failed to load configuration:', error.message);
      this.config = this.getDefaultConfig();
      this.loaded = true;
    }
  }

  /**
   * Save configuration to file
   */
  async save() {
    try {
      await fs.ensureDir(this.configDir);
      const configData = yaml.stringify(this.config, { indent: 2 });
      await fs.writeFile(this.configFile, configData, 'utf8');
      logger.debug('Configuration saved successfully');
    } catch (error) {
      logger.error('Failed to save configuration:', error.message);
      throw error;
    }
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Configuration value
   */
  get(key, defaultValue = null) {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }

    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} value - Value to set
   */
  set(key, value) {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }

    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Delete configuration value
   * @param {string} key - Configuration key (supports dot notation)
   */
  delete(key) {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }

    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        return false;
      }
      current = current[k];
    }
    
    delete current[keys[keys.length - 1]];
    return true;
  }

  /**
   * Check if configuration key exists
   * @param {string} key - Configuration key (supports dot notation)
   * @returns {boolean} True if key exists
   */
  has(key) {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }

    const keys = key.split('.');
    let current = this.config;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get all configuration
   * @returns {object} Complete configuration object
   */
  getAll() {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return { ...this.config };
  }

  /**
   * Clear all configuration
   */
  clear() {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    this.config = {};
  }

  /**
   * Get default configuration
   * @returns {object} Default configuration object
   */
  getDefaultConfig() {
    return {
      general: {
        theme: 'default',
        verbose: false,
        autoUpdate: true,
        timezone: 'UTC'
      },
      project: {
        defaultTemplate: 'basic',
        autoInit: true,
        gitInitOnCreate: true
      },
      deploy: {
        defaultEnvironment: 'development',
        confirmBeforeDeploy: true,
        backupBeforeDeploy: true,
        rollbackOnFailure: true
      },
      server: {
        defaultPort: 3000,
        autoRestart: true,
        logLevel: 'info'
      },
      database: {
        defaultEngine: 'sqlite',
        backupRetention: 7,
        autoMigrate: false
      },
      monitoring: {
        enabled: true,
        interval: 30,
        alerts: {
          email: false,
          slack: false
        }
      },
      security: {
        enforceSSL: true,
        sessionTimeout: 3600,
        rateLimiting: true
      }
    };
  }

  /**
   * Get configuration file path
   * @returns {string} Path to configuration file
   */
  getConfigPath() {
    return this.configFile;
  }

  /**
   * Get configuration directory path
   * @returns {string} Path to configuration directory
   */
  getConfigDir() {
    return this.configDir;
  }
}

// Create singleton instance
const config = new Config();

module.exports = {
  Config,
  config
};
