// config/index.js - Configuration system
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.cli-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const defaultConfig = {
  ai: {
    provider: 'openai',
    apiKey: null,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },
  project: {
    defaultTemplate: 'react',
    autoInstall: true,
    packageManager: 'npm'
  },
  deploy: {
    defaultService: 'vercel',
    autoTest: true,
    autoBackup: true
  },
  docker: {
    defaultRegistry: 'docker.io',
    buildArgs: {},
    volumes: []
  },
  git: {
    defaultBranch: 'main',
    autoCommit: false,
    commitConvention: 'conventional'
  },
  server: {
    defaultPort: 3000,
    autoRestart: true,
    processManager: 'pm2'
  },
  database: {
    defaultType: 'mongodb',
    connectionString: null,
    migrations: true
  },
  security: {
    scanEnabled: true,
    auditEnabled: true,
    reportFormat: 'json'
  },
  monitoring: {
    enabled: true,
    interval: 30000,
    alerts: {
      cpu: 80,
      memory: 85,
      disk: 90
    }
  },
  logging: {
    level: 'info',
    format: 'json',
    file: true
  },
  plugins: {
    autoUpdate: true,
    registry: 'npm'
  },
  templates: {
    customPath: null,
    syncRemote: true
  },
  backup: {
    enabled: true,
    schedule: '0 2 * * *',
    retention: 30
  },
  network: {
    timeout: 30000,
    retries: 3
  }
};

class Config {
  constructor() {
    this.config = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        this.config = { ...defaultConfig, ...fs.readJsonSync(CONFIG_FILE) };
      } else {
        this.config = { ...defaultConfig };
      }
    } catch (error) {
      console.error('Error loading config:', error.message);
      this.config = { ...defaultConfig };
    }
  }

  save() {
    try {
      fs.ensureDirSync(CONFIG_DIR);
      fs.writeJsonSync(CONFIG_FILE, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Error saving config:', error.message);
    }
  }

  get(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], this.config);
  }

  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) obj[k] = {};
      return obj[k];
    }, this.config);
    target[lastKey] = value;
    this.save();
  }

  getAll() {
    return this.config;
  }

  reset() {
    this.config = { ...defaultConfig };
    this.save();
  }
}

const config = new Config();

module.exports = { config, CONFIG_DIR, CONFIG_FILE, defaultConfig };
