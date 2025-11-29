/**
 * Cache Configuration
 * Redis and in-memory caching setup for performance optimization
 */

const Redis = require('redis');
const NodeCache = require('node-cache');

// Environment-based cache configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300
};

// In-memory cache fallback
const memoryCacheConfig = {
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // 1 minute
  useClones: false,
  deleteOnExpire: true,
  enableLegacyCallbacks: false,
  maxKeys: 1000
};

// Cache TTL settings (in seconds)
const cacheTTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
  DAILY: 86400,   // 24 hours
  WEEKLY: 604800  // 7 days
};

// Cache key patterns
const cacheKeys = {
  USER: (id) => `user:${id}`,
  USERS: 'users:all',
  EVENTS: 'events:all',
  EVENT: (id) => `event:${id}`,
  POSTS: 'posts:all',
  POST: (id) => `post:${id}`,
  GALLERY: 'gallery:all',
  CONTACT: 'contact:info',
  SETTINGS: 'settings:all',
  STATS: 'stats:daily',
  SESSION: (id) => `session:${id}`,
  VOTE: (electionId, userId) => `vote:${electionId}:${userId}`,
  ELECTION: (id) => `election:${id}`,
  ELECTIONS: 'elections:all'
};

// Initialize Redis client
let redisClient = null;
let memoryCache = null;

// Cache connection management
const connectRedis = async () => {
  try {
    if (!isDevelopment && !isTest) {
      redisClient = Redis.createClient(redisConfig);
      
      redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });
      
      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis connection error, falling back to memory cache:', err.message);
        redisClient = null;
      });
      
      redisClient.on('end', () => {
        console.log('Redis connection ended');
      });
      
      await redisClient.connect();
      return redisClient;
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to Redis, using memory cache:', error.message);
    return null;
  }
};

// Initialize memory cache as fallback
const initMemoryCache = () => {
  memoryCache = new NodeCache(memoryCacheConfig);
  
  memoryCache.on('set', (key, value) => {
    if (isDevelopment) {
      console.log(`📝 Cache SET: ${key}`);
    }
  });
  
  memoryCache.on('del', (key, value) => {
    if (isDevelopment) {
      console.log(`🗑️ Cache DEL: ${key}`);
    }
  });
  
  memoryCache.on('expired', (key, value) => {
    if (isDevelopment) {
      console.log(`⏰ Cache EXPIRED: ${key}`);
    }
  });
  
  return memoryCache;
};

// Cache operations
const cache = {
  // Get value from cache
  async get(key) {
    try {
      if (redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      }
      
      if (memoryCache) {
        return memoryCache.get(key);
      }
      
      return null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  },

  // Set value in cache
  async set(key, value, ttl = cacheTTL.MEDIUM) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (redisClient) {
        await redisClient.setEx(key, ttl, serializedValue);
        return true;
      }
      
      if (memoryCache) {
        return memoryCache.set(key, value, ttl);
      }
      
      return false;
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  },

  // Delete value from cache
  async del(key) {
    try {
      if (redisClient) {
        await redisClient.del(key);
        return true;
      }
      
      if (memoryCache) {
        return memoryCache.del(key);
      }
      
      return false;
    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  },

  // Clear all cache
  async clear() {
    try {
      if (redisClient) {
        await redisClient.flushDb();
        return true;
      }
      
      if (memoryCache) {
        memoryCache.flushAll();
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Cache clear error:', error.message);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      if (redisClient) {
        const result = await redisClient.exists(key);
        return result === 1;
      }
      
      if (memoryCache) {
        return memoryCache.has(key);
      }
      
      return false;
    } catch (error) {
      console.warn(`Cache exists error for key ${key}:`, error.message);
      return false;
    }
  },

  // Get multiple keys
  async mget(keys) {
    try {
      if (redisClient) {
        const values = await redisClient.mGet(keys);
        return values.map(value => value ? JSON.parse(value) : null);
      }
      
      if (memoryCache) {
        return keys.map(key => memoryCache.get(key));
      }
      
      return new Array(keys.length).fill(null);
    } catch (error) {
      console.warn('Cache mget error:', error.message);
      return new Array(keys.length).fill(null);
    }
  },

  // Set multiple key-value pairs
  async mset(keyValuePairs, ttl = cacheTTL.MEDIUM) {
    try {
      if (redisClient) {
        const pipeline = redisClient.multi();
        
        keyValuePairs.forEach(([key, value]) => {
          pipeline.setEx(key, ttl, JSON.stringify(value));
        });
        
        await pipeline.exec();
        return true;
      }
      
      if (memoryCache) {
        keyValuePairs.forEach(([key, value]) => {
          memoryCache.set(key, value, ttl);
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Cache mset error:', error.message);
      return false;
    }
  },

  // Increment counter
  async incr(key, amount = 1) {
    try {
      if (redisClient) {
        return await redisClient.incrBy(key, amount);
      }
      
      if (memoryCache) {
        const current = memoryCache.get(key) || 0;
        const newValue = current + amount;
        memoryCache.set(key, newValue);
        return newValue;
      }
      
      return null;
    } catch (error) {
      console.warn(`Cache increment error for key ${key}:`, error.message);
      return null;
    }
  },

  // Get cache statistics
  async getStats() {
    try {
      if (redisClient) {
        const info = await redisClient.info('memory');
        return {
          type: 'redis',
          connected: true,
          info: info
        };
      }
      
      if (memoryCache) {
        const stats = memoryCache.getStats();
        return {
          type: 'memory',
          connected: true,
          ...stats
        };
      }
      
      return {
        type: 'none',
        connected: false
      };
    } catch (error) {
      console.warn('Cache stats error:', error.message);
      return {
        type: 'error',
        connected: false,
        error: error.message
      };
    }
  },

  // Close cache connections
  async close() {
    try {
      if (redisClient) {
        await redisClient.quit();
        redisClient = null;
      }
      
      if (memoryCache) {
        memoryCache.close();
        memoryCache = null;
      }
      
      console.log('Cache connections closed');
    } catch (error) {
      console.warn('Cache close error:', error.message);
    }
  }
};

// Initialize cache
const initializeCache = async () => {
  try {
    await connectRedis();
    
    if (!redisClient) {
      console.log('🔄 Initializing memory cache as fallback');
      initMemoryCache();
    }
    
    // Test cache operations
    const testKey = 'cache:test';
    await cache.set(testKey, { initialized: true }, 10);
    const testValue = await cache.get(testKey);
    await cache.del(testKey);
    
    if (testValue && testValue.initialized) {
      console.log('✅ Cache initialized successfully');
    } else {
      console.warn('⚠️ Cache initialization test failed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Cache initialization failed:', error.message);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing cache connections...');
  await cache.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing cache connections...');
  await cache.close();
  process.exit(0);
});

// Initialize on module load
initializeCache();

module.exports = {
  cache,
  cacheKeys,
  cacheTTL,
  redisConfig,
  memoryCacheConfig,
  initializeCache
};