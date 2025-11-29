/**
 * Enhanced Database Configuration
 * Optimized database connection with pooling, caching, and monitoring
 */

const mongoose = require('mongoose');
const { performanceMonitor } = require('../utils/performanceMonitor');
const logger = require('../utils/logger');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.healthCheckInterval = null;
    this.queryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Connect to database with retry logic
  async connect() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equity-leaders';

    const connectionOptions = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      family: 4, // Use IPv4, skip trying IPv6
      // Enable connection monitoring
      autoIndex: process.env.NODE_ENV === 'development', // Only auto-index in development
      // Connection string options
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      // SSL options for production
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
      // Authentication
      authSource: 'admin',
      // Compression
      compressors: ['snappy', 'zlib']
    };

    try {
      console.log('🔌 Connecting to MongoDB...');

      // Add connection monitoring
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.startHealthCheck();
      });

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
        this.handleConnectionError(error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
        this.stopHealthCheck();
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
        this.connectionAttempts = 0;
      });

      // Connect with performance monitoring
      const startTime = performance.now();
      await mongoose.connect(mongoUri, connectionOptions);
      const connectionTime = performance.now() - startTime;

      console.log(`⚡ MongoDB connected in ${connectionTime.toFixed(2)}ms`);

      // Track connection metrics
      if (performanceMonitor) {
        performanceMonitor.recordMetric('database_connection_time', connectionTime);
      }

      this.connection = mongoose.connection;
      return this.connection;

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // Handle connection errors with retry logic
  async handleConnectionError(error) {
    this.connectionAttempts++;

    if (this.connectionAttempts <= this.maxRetries) {
      console.log(`🔄 Retrying connection in ${this.retryDelay / 1000} seconds (attempt ${this.connectionAttempts}/${this.maxRetries})`);

      setTimeout(async () => {
        try {
          await this.connect();
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          this.handleConnectionError(retryError);
        }
      }, this.retryDelay);
    } else {
      console.error('❌ Max connection attempts reached. Please check your database connection.');
      process.exit(1);
    }
  }

  // Start health check monitoring
  startHealthCheck() {
    if (this.healthCheckInterval) {return;}

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        console.error('❌ Database health check failed:', error);
      }
    }, 30000); // Every 30 seconds
  }

  // Stop health check monitoring
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Check database health
  async checkHealth() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const startTime = performance.now();

    try {
      // Simple ping to database
      await mongoose.connection.db.admin().ping();

      const responseTime = performance.now() - startTime;

      // Track health check metrics
      if (performanceMonitor) {
        performanceMonitor.recordMetric('database_health_check_time', responseTime);
      }

      // Log slow health checks
      if (responseTime > 1000) {
        console.warn(`🐌 Slow database health check: ${responseTime.toFixed(2)}ms`);
      }

      return {
        status: 'healthy',
        responseTime: responseTime.toFixed(2),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;

      if (performanceMonitor) {
        performanceMonitor.recordMetric('database_health_check_error', 1, {
          error: error.message,
          responseTime
        });
      }

      throw error;
    }
  }

  // Enhanced query execution with caching and monitoring
  async executeQuery(queryFn, cacheKey = null, useCache = false) {
    const startTime = performance.now();

    try {
      // Check cache first
      if (useCache && cacheKey) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          if (performanceMonitor) {
            performanceMonitor.recordMetric('database_cache_hit', 1);
          }
          return cached;
        }
      }

      // Execute query
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Track query performance
      if (performanceMonitor) {
        performanceMonitor.recordQuery(queryFn.toString(), duration);
      }

      // Cache result if applicable
      if (useCache && cacheKey && result) {
        this.setCache(cacheKey, result);
      }

      // Log slow queries
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected: ${duration.toFixed(2)}ms`);
      }

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;

      // Track query errors
      if (performanceMonitor) {
        performanceMonitor.recordQuery(queryFn.toString(), duration, error);
      }

      console.error('❌ Query execution failed:', error);
      throw error;
    }
  }

  // Cache management
  getFromCache(key) {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    if (cached) {
      this.queryCache.delete(key);
    }

    return null;
  }

  setCache(key, data) {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.queryCache.size > 1000) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  // Get database statistics
  async getStats() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();

      return {
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize,
        cacheSize: this.queryCache.size,
        connectionState: {
          isConnected: this.isConnected,
          connectionAttempts: this.connectionAttempts,
          readyState: mongoose.connection.readyState
        }
      };

    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    }
  }

  // Create indexes for performance
  async createIndexes() {
    console.log('🔧 Creating database indexes...');

    try {
      // User indexes
      await mongoose.connection.db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { createdAt: -1 } },
        { key: { isActive: 1 } }
      ]);

      // Event indexes
      await mongoose.connection.db.collection('events').createIndexes([
        { key: { date: -1 } },
        { key: { isActive: 1 } },
        { key: { title: 'text', description: 'text' } }
      ]);

      // Vote indexes
      await mongoose.connection.db.collection('votes').createIndexes([
        { key: { electionId: 1, voterId: 1 }, unique: true },
        { key: { electionId: 1 } },
        { key: { createdAt: -1 } }
      ]);

      // Gallery indexes
      await mongoose.connection.db.collection('galleries').createIndexes([
        { key: { isActive: 1 } },
        { key: { createdAt: -1 } },
        { key: { tags: 1 } }
      ]);

      console.log('✅ Database indexes created successfully');

    } catch (error) {
      console.error('❌ Failed to create database indexes:', error);
      throw error;
    }
  }

  // Backup database
  async backup() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    console.log('💾 Starting database backup...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;

      // This would typically use mongodump or a similar tool
      // For now, we'll just log the backup initiation
      console.log(`📦 Database backup initiated: ${backupName}`);

      return {
        backupName,
        timestamp: new Date().toISOString(),
        status: 'initiated'
      };

    } catch (error) {
      console.error('❌ Database backup failed:', error);
      throw error;
    }
  }

  // Graceful shutdown
  async disconnect() {
    console.log('🔌 Disconnecting from MongoDB...');

    this.stopHealthCheck();

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      connectionAttempts: this.connectionAttempts
    };
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  try {
    await dbManager.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await dbManager.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

module.exports = dbManager;
