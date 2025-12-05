/**
 * Advanced Caching Strategies
 * Implements multiple caching patterns for optimal performance
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.persistentCache = new Map();
    this.cacheConfig = {
      memory: {
        maxSize: 50 * 1024 * 1024, // 50MB
        ttl: 5 * 60 * 1000 // 5 minutes
      },
      persistent: {
        maxSize: 100 * 1024 * 1024, // 100MB
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      }
    };
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Initialize cache system
   */
  async init() {
    await this.loadPersistentCache();
    this.setupCacheCleanup();
    this.setupCacheMonitoring();
  }

  /**
   * Set cache entry with strategy
   */
  async set(key, data, options = {}) {
    const config = {
      strategy: 'cacheFirst', // cacheFirst, networkFirst, staleWhileRevalidate
      ttl: this.cacheConfig.memory.ttl,
      persistent: false,
      tags: [],
      priority: 'normal', // high, normal, low
      ...options
    };

    const entry = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      strategy: config.strategy,
      tags: config.tags,
      priority: config.priority,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Store in memory cache
    if (this.memoryCache.size < this.cacheConfig.memory.maxSize) {
      this.memoryCache.set(key, entry);
    } else {
      this.evictLRU('memory');
      this.memoryCache.set(key, entry);
    }

    // Store in persistent cache if requested
    if (config.persistent) {
      await this.setPersistentCache(key, entry);
    }

    this.cacheStats.sets++;
    return true;
  }

  /**
   * Get cache entry with strategy
   */
  async get(key, options = {}) {
    const config = {
      strategy: 'cacheFirst',
      updateAccess: true,
      ...options
    };

    // Try memory cache first
    let entry = this.memoryCache.get(key);
    
    if (!entry) {
      // Try persistent cache
      entry = await this.getPersistentCache(key);
      if (entry) {
        // Move to memory cache
        this.memoryCache.set(key, entry);
      }
    }

    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    // Update access info
    if (config.updateAccess) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }

    this.cacheStats.hits++;
    return entry.data;
  }

  /**
   * Delete cache entry
   */
  async delete(key) {
    const memoryDeleted = this.memoryCache.delete(key);
    const persistentDeleted = await this.deletePersistentCache(key);
    
    if (memoryDeleted || persistentDeleted) {
      this.cacheStats.deletes++;
      return true;
    }
    
    return false;
  }

  /**
   * Clear cache by pattern or tags
   */
  async clear(pattern = null, tags = null) {
    if (pattern) {
      // Clear by pattern
      for (const [key] of this.memoryCache) {
        if (key.match(pattern)) {
          this.memoryCache.delete(key);
        }
      }
      
      await this.clearPersistentCacheByPattern(pattern);
    } else if (tags) {
      // Clear by tags
      for (const [key, entry] of this.memoryCache) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }
      
      await this.clearPersistentCacheByTags(tags);
    } else {
      // Clear all
      this.memoryCache.clear();
      await this.clearAllPersistentCache();
    }
  }

  /**
   * Cache-first strategy
   */
  async cacheFirst(key, fetchFn, options = {}) {
    // Try cache first
    let data = await this.get(key);
    
    if (data !== null) {
      return data;
    }

    // Cache miss, fetch from network
    try {
      data = await fetchFn();
      await this.set(key, data, { ...options, strategy: 'cacheFirst' });
      return data;
    } catch (error) {
      // Network failed, try stale cache
      const staleData = await this.get(key, { updateAccess: false });
      if (staleData !== null) {
        console.warn('Network failed, returning stale cache for:', key);
        return staleData;
      }
      throw error;
    }
  }

  /**
   * Network-first strategy
   */
  async networkFirst(key, fetchFn, options = {}) {
    try {
      // Try network first
      const data = await fetchFn();
      await this.set(key, data, { ...options, strategy: 'networkFirst' });
      return data;
    } catch (error) {
      // Network failed, try cache
      const data = await this.get(key);
      if (data !== null) {
        console.warn('Network failed, returning cache for:', key);
        return data;
      }
      throw error;
    }
  }

  /**
   * Stale-while-revalidate strategy
   */
  async staleWhileRevalidate(key, fetchFn, options = {}) {
    // Try cache first
    let data = await this.get(key);
    let isStale = false;

    if (data === null) {
      isStale = true;
    } else {
      // Check if stale
      const entry = this.memoryCache.get(key) || await this.getPersistentCache(key);
      if (entry && Date.now() - entry.timestamp > entry.ttl) {
        isStale = true;
      }
    }

    // Revalidate in background
    const revalidatePromise = fetchFn()
      .then(async (newData) => {
        await this.set(key, newData, { ...options, strategy: 'staleWhileRevalidate' });
        return newData;
      })
      .catch(error => {
        console.warn('Revalidation failed:', error);
        return data;
      });

    // Return stale data immediately if available
    if (data !== null) {
      // Don't wait for revalidation
      revalidatePromise.then(() => {
        console.log('Cache revalidated for:', key);
      });
      return data;
    }

    // No cache data, wait for network
    return revalidatePromise;
  }

  /**
   * Persistent cache operations
   */
  async setPersistentCache(key, entry) {
    try {
      const cacheKey = `cache_${key}`;
      const value = JSON.stringify(entry);
      
      // Check size limit
      if (value.length > this.cacheConfig.persistent.maxSize) {
        console.warn('Cache entry too large for persistent storage:', key);
        return false;
      }
      
      localStorage.setItem(cacheKey, value);
      return true;
    } catch (error) {
      console.warn('Failed to set persistent cache:', error);
      return false;
    }
  }

  async getPersistentCache(key) {
    try {
      const cacheKey = `cache_${key}`;
      const value = localStorage.getItem(cacheKey);
      
      if (value) {
        const entry = JSON.parse(value);
        return entry;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get persistent cache:', error);
      return null;
    }
  }

  async deletePersistentCache(key) {
    try {
      const cacheKey = `cache_${key}`;
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.warn('Failed to delete persistent cache:', error);
      return false;
    }
  }

  async loadPersistentCache() {
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const entry = JSON.parse(value);
              const cacheKey = key.replace('cache_', '');
              
              // Check if still valid
              if (Date.now() - entry.timestamp <= entry.ttl) {
                this.persistentCache.set(cacheKey, entry);
              } else {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            console.warn('Failed to load persistent cache entry:', key, error);
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }

  /**
   * LRU eviction
   */
  evictLRU(cacheType) {
    const cache = cacheType === 'memory' ? this.memoryCache : this.persistentCache;
    
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      cache.delete(oldestKey);
      console.log(`Evicted LRU cache entry: ${oldestKey}`);
    }
  }

  /**
   * Cache cleanup
   */
  setupCacheCleanup() {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clean persistent cache
    for (const [key, entry] of this.persistentCache) {
      if (now - entry.timestamp > entry.ttl) {
        this.deletePersistentCache(key);
        this.persistentCache.delete(key);
      }
    }
  }

  /**
   * Cache monitoring
   */
  setupCacheMonitoring() {
    // Log cache stats every minute
    setInterval(() => {
      console.log('Cache Stats:', {
        ...this.cacheStats,
        hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100,
        memorySize: this.memoryCache.size,
        persistentSize: this.persistentCache.size
      });
    }, 60000);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100 || 0,
      memorySize: this.memoryCache.size,
      persistentSize: this.persistentCache.size
    };
  }

  /**
   * Export cache data
   */
  async exportCache() {
    const exportData = {
      memoryCache: Array.from(this.memoryCache.entries()),
      persistentCache: Array.from(this.persistentCache.entries()),
      stats: this.getStats(),
      timestamp: Date.now()
    };
    
    return exportData;
  }

  /**
   * Import cache data
   */
  async importCache(importData) {
    try {
      // Import memory cache
      for (const [key, entry] of importData.memoryCache) {
        this.memoryCache.set(key, entry);
      }
      
      // Import persistent cache
      for (const [key, entry] of importData.persistentCache) {
        await this.setPersistentCache(key, entry);
        this.persistentCache.set(key, entry);
      }
      
      console.log('Cache imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }
}

export const cacheManager = new CacheManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  cacheManager.init();
}

export default cacheManager;
