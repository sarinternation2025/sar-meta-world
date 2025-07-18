const redis = require('redis');
const logger = require('../utils/logger');

class CacheManager {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Cache Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Cache Connected');
    });

    // Default TTL values (in seconds)
    this.defaultTTL = {
      metrics: 5, // 5 seconds for system metrics
      services: 30, // 30 seconds for service status
      logs: 60, // 1 minute for logs
      alerts: 10, // 10 seconds for alerts
      config: 300, // 5 minutes for configuration
    };
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 60) {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async flush() {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  // Middleware for caching responses
  middleware(cacheKey, ttl = 60) {
    return async (req, res, next) => {
      try {
        const key = typeof cacheKey === 'function' ? cacheKey(req) : cacheKey;
        const cached = await this.get(key);
        
        if (cached) {
          logger.debug(`Cache hit for key: ${key}`);
          return res.json(cached);
        }

        // Store original json method
        const originalJson = res.json;
        
        // Override json method to cache response
        res.json = function(data) {
          // Cache the response
          cache.set(key, data, ttl);
          logger.debug(`Cache set for key: ${key}`);
          
          // Call original json method
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Generate cache keys
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
}

const cache = new CacheManager();

module.exports = cache;
