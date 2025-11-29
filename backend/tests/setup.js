/**
 * Jest Test Setup
 * Global test configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.SESSION_SECRET = 'test-session-secret-key-minimum-32-characters';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/elp-test';

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock logger to avoid console spam during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  stream: {
    write: jest.fn()
  }
}));

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

