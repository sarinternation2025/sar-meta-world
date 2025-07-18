module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: 'index.js',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
        POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
        POSTGRES_DB: process.env.POSTGRES_DB || 'chatapp',
        POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres123',
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
        MQTT_HOST: process.env.MQTT_HOST || 'localhost',
        MQTT_PORT: process.env.MQTT_PORT || 1883,
        INFLUXDB_HOST: process.env.INFLUXDB_HOST || 'localhost',
        INFLUXDB_PORT: process.env.INFLUXDB_PORT || 8086,
        INFLUXDB_TOKEN: process.env.INFLUXDB_TOKEN || '',
        INFLUXDB_ORG: process.env.INFLUXDB_ORG || 'chatapp',
        INFLUXDB_BUCKET: process.env.INFLUXDB_BUCKET || 'metrics'
      },
      // Auto-restart configuration
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Performance monitoring
      monitoring: false,
      pmx: true,
      
      // Advanced restart options
      exponential_backoff_restart_delay: 100,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Health check (requires endpoint implementation)
      health_check_url: 'http://localhost:3001/health',
      health_check_grace_period: 30000,
      
      // Process configuration
      node_args: [
        '--max-old-space-size=1024',
        '--optimize-for-size'
      ],
      
      // Error handling
      autorestart: true,
      watch_delay: 1000,
      
      // Time-based restart (optional)
      cron_restart: '0 2 * * *' // Restart at 2 AM daily
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'nodejs',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
