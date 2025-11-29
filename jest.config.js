/**
 * Jest Configuration
 * Testing framework setup
 */

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/logs/',
    '/uploads/',
    '/dist/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/logs/**',
    '!**/uploads/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};

