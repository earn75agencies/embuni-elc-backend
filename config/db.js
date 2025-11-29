const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
const options = {
      // Optimized connection pooling for better performance
      maxPoolSize: 50, // Increased pool size for better concurrency
      minPoolSize: 5, // Maintain minimum connections
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // 10 second connection timeout
      family: 4, // Use IPv4, skip trying IPv6
      // Read preferences for better performance
      readPreference: 'primaryPreferred'
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`, { error: err });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    mongoose.connection.on('connecting', () => {
      logger.info('🔄 Connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected');
    });

  } catch (error) {
    logger.error(`❌ Error connecting to MongoDB: ${error.message}`, { error });
    process.exit(1);
  }
};

module.exports = connectDB;
