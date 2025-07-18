// Real-Time Development Auto-Sync Configuration
export default {
  // File watching configuration
  watch: {
    paths: ['src/**/*', 'public/**/*', '*.json', '*.js', '*.jsx', '*.css', '*.md'],
    ignore: ['node_modules/**', 'dist/**', '.git/**', '*.log'],
    options: {
      ignoreInitial: false,
      persistent: true,
      followSymlinks: true,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    }
  },

  // Auto-build configuration
  build: {
    onFileChange: true,
    debounceMs: 500,
    parallel: true,
    incremental: true,
    sourceMaps: true,
    minify: false, // Faster dev builds
    target: 'esnext'
  },

  // Auto-sync targets
  sync: {
    local: {
      enabled: true,
      target: './dist',
      clean: false
    },
    remote: {
      enabled: false, // Can be configured for remote sync
      target: 'user@server:/path/to/deploy',
      method: 'rsync'
    },
    cloud: {
      enabled: false, // Can be configured for cloud sync
      provider: 'aws-s3',
      bucket: 'your-bucket-name'
    }
  },

  // Server configuration
  servers: {
    dev: {
      port: 5173,
      host: '0.0.0.0',
      hmr: true,
      livereload: true
    },
    api: {
      port: 3001,
      restart: true,
      watch: ['mock-server.cjs']
    },
    static: {
      port: 8080,
      path: './dist',
      reload: true
    }
  },

  // Notifications
  notifications: {
    enabled: true,
    success: true,
    errors: true,
    builds: false, // Too frequent
    deploys: true
  },

  // Integration hooks
  hooks: {
    beforeBuild: [],
    afterBuild: ['notify-build-complete'],
    beforeSync: ['run-tests'],
    afterSync: ['notify-deployment', 'update-status'],
    onError: ['log-error', 'notify-error']
  }
}
