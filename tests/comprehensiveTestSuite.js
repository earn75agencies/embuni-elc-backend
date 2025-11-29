/**
 * Comprehensive Test Suite
 * Complete testing framework for frontend and backend
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { performanceMonitor } = require('../utils/performanceMonitor');

class TestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      coverage: {}
    };
    this.startTime = null;
    this.endTime = null;
  }

  // Add test case
  addTest(name, testFn, options = {}) {
    this.tests.push({
      name,
      testFn,
      timeout: options.timeout || 5000,
      category: options.category || 'general',
      skip: options.skip || false,
      only: options.only || false
    });
  }

  // Run all tests
  async runTests(app) {
    console.log('🧪 Starting comprehensive test suite...');
    this.startTime = Date.now();

    // Filter tests (handle 'only' flag)
    let testsToRun = this.tests;
    const onlyTests = this.tests.filter(test => test.only);
    if (onlyTests.length > 0) {
      testsToRun = onlyTests;
    }

    // Run tests by category
    const categories = ['unit', 'integration', 'e2e', 'performance', 'security'];

    for (const category of categories) {
      const categoryTests = testsToRun.filter(test => test.category === category);
      if (categoryTests.length > 0) {
        console.log(`\n📂 Running ${category} tests...`);
        await this.runCategoryTests(categoryTests, app);
      }
    }

    // Run general tests
    const generalTests = testsToRun.filter(test => test.category === 'general');
    if (generalTests.length > 0) {
      console.log('\n📂 Running general tests...');
      await this.runCategoryTests(generalTests, app);
    }

    this.endTime = Date.now();
    this.results.duration = this.endTime - this.startTime;
    this.printResults();
    return this.results;
  }

  // Run tests for a specific category
  async runCategoryTests(tests, app) {
    for (const test of tests) {
      if (test.skip) {
        console.log(`⏭️  Skipping: ${test.name}`);
        this.results.skipped++;
        continue;
      }

      try {
        console.log(`🔬 Running: ${test.name}`);
        const startTime = Date.now();

        await Promise.race([
          test.testFn(app),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Test timeout')), test.timeout)
          )
        ]);

        const duration = Date.now() - startTime;
        console.log(`✅ Passed: ${test.name} (${duration}ms)`);
        this.results.passed++;

      } catch (error) {
        console.error(`❌ Failed: ${test.name}`);
        console.error(`   Error: ${error.message}`);
        this.results.failed++;
      }

      this.results.total++;
    }
  }

  // Print test results
  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`   Total: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed} ✅`);
    console.log(`   Failed: ${this.results.failed} ❌`);
    console.log(`   Skipped: ${this.results.skipped} ⏭️`);
    console.log(`   Duration: ${this.results.duration}ms`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
  }

  // Generate test report
  generateReport() {
    return {
      summary: this.results,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      performance: performanceMonitor ? performanceMonitor.getSummary() : null
    };
  }
}

// Test utilities
const TestUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123456',
      role: 'user',
      isActive: true,
      ...userData
    };

    const User = mongoose.model('User');
    return await User.create(defaultUser);
  },

  // Create test admin
  createTestAdmin: async (adminData = {}) => {
    const defaultAdmin = {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin',
      permissions: ['manage_users', 'manage_content'],
      isActive: true,
      ...adminData
    };

    const User = mongoose.model('User');
    return await User.create(defaultAdmin);
  },

  // Create test event
  createTestEvent: async (eventData = {}) => {
    const defaultEvent = {
      title: 'Test Event',
      description: 'This is a test event',
      date: new Date(),
      location: 'Test Location',
      isActive: true,
      ...eventData
    };

    const Event = mongoose.model('Event');
    return await Event.create(defaultEvent);
  },

  // Generate JWT token
  generateTestToken: (userId, role = 'user') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  // Clean up test data
  cleanupTestData: async () => {
    const collections = ['users', 'events', 'votes', 'galleries', 'posts'];

    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
      } catch (error) {
        console.warn(`Warning: Could not clean ${collectionName}:`, error.message);
      }
    }
  },

  // Make authenticated request
  authenticatedRequest: (app, token) => {
    return {
      get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
      post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
      put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
      delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
      patch: (url) => request(app).patch(url).set('Authorization', `Bearer ${token}`)
    };
  },

  // Assert response
  assertResponse: (response, expectedStatus = 200, expectedFields = []) => {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    if (expectedFields.length > 0) {
      for (const field of expectedFields) {
        if (!(field in response.body)) {
          throw new Error(`Expected field '${field}' in response body`);
        }
      }
    }

    return response.body;
  },

  // Performance test helper
  performanceTest: async (testFn, iterations = 100) => {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await testFn();
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      iterations,
      avgTime: avgTime.toFixed(2),
      minTime: minTime.toFixed(2),
      maxTime: maxTime.toFixed(2),
      times
    };
  },

  // Load test helper
  loadTest: async (testFn, concurrency = 10, duration = 10000) => {
    const startTime = Date.now();
    const results = [];
    let completed = 0;
    let errors = 0;

    const runTest = async () => {
      try {
        const testStart = performance.now();
        await testFn();
        const testEnd = performance.now();
        results.push(testEnd - testStart);
        completed++;
      } catch (error) {
        errors++;
      }
    };

    // Run concurrent tests
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        (async () => {
          while (Date.now() - startTime < duration) {
            await runTest();
          }
        })()
      );
    }

    await Promise.all(promises);

    const avgTime = results.length > 0
      ? results.reduce((sum, time) => sum + time, 0) / results.length
      : 0;

    return {
      duration: Date.now() - startTime,
      concurrency,
      completed,
      errors,
      avgTime: avgTime.toFixed(2),
      requestsPerSecond: (completed / ((Date.now() - startTime) / 1000)).toFixed(2)
    };
  }
};

// Create test suite instance
const testSuite = new TestSuite();

// Add comprehensive tests
testSuite.addTest('Database Connection', async (app) => {
  const db = mongoose.connection;
  if (db.readyState !== 1) {
    throw new Error('Database not connected');
  }
}, { category: 'unit', timeout: 10000 });

testSuite.addTest('User Registration', async (app) => {
  const userData = {
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'password123'
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(userData)
    .expect(201);

  TestUtils.assertResponse(response, 201, ['success', 'user', 'token']);
}, { category: 'integration' });

testSuite.addTest('User Login', async (app) => {
  // First create a user
  const user = await TestUtils.createTestUser();

  const loginData = {
    email: user.email,
    password: 'test123456'
  };

  const response = await request(app)
    .post('/api/auth/login')
    .send(loginData)
    .expect(200);

  const result = TestUtils.assertResponse(response, 200, ['success', 'token', 'user']);

  if (!result.token) {
    throw new Error('Token not returned in login response');
  }
}, { category: 'integration' });

testSuite.addTest('Event Creation', async (app) => {
  const admin = await TestUtils.createTestAdmin();
  const token = TestUtils.generateTestToken(admin._id, 'admin');

  const eventData = {
    title: 'Test Event',
    description: 'This is a test event',
    date: new Date(),
    location: 'Test Location'
  };

  const response = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send(eventData)
    .expect(201);

  TestUtils.assertResponse(response, 201, ['success', 'event']);
}, { category: 'integration' });

testSuite.addTest('Event Retrieval', async (app) => {
  // Create test event
  await TestUtils.createTestEvent();

  const response = await request(app)
    .get('/api/events')
    .expect(200);

  const result = TestUtils.assertResponse(response, 200, ['success', 'events']);

  if (!Array.isArray(result.events)) {
    throw new Error('Events should be an array');
  }
}, { category: 'integration' });

testSuite.addTest('Performance - Database Query', async (app) => {
  const performance = await TestUtils.performanceTest(async () => {
    await request(app).get('/api/events');
  }, 50);

  if (parseFloat(performance.avgTime) > 100) {
    throw new Error(`Average response time too high: ${performance.avgTime}ms`);
  }
}, { category: 'performance' });

testSuite.addTest('Security - SQL Injection Prevention', async (app) => {
  const maliciousInput = {
    email: "'; DROP TABLE users; --",
    password: 'password'
  };

  const response = await request(app)
    .post('/api/auth/login')
    .send(maliciousInput)
    .expect(400);

  // Should not succeed with malicious input
  if (response.body.success) {
    throw new Error('SQL injection attempt was not blocked');
  }
}, { category: 'security' });

testSuite.addTest('Security - XSS Prevention', async (app) => {
  const admin = await TestUtils.createTestAdmin();
  const token = TestUtils.generateTestToken(admin._id, 'admin');

  const maliciousData = {
    title: '<script>alert("xss")</script>',
    description: 'Test description',
    date: new Date(),
    location: 'Test Location'
  };

  const response = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send(maliciousData)
    .expect(201);

  const result = TestUtils.assertResponse(response, 201, ['success', 'event']);

  // Check that script tags are sanitized
  if (result.event.title.includes('<script>')) {
    throw new Error('XSS attempt was not sanitized');
  }
}, { category: 'security' });

testSuite.addTest('Load Test - API Endpoints', async (app) => {
  const loadTest = await TestUtils.loadTest(async () => {
    await request(app).get('/api/events');
  }, 5, 5000);

  if (parseFloat(loadTest.requestsPerSecond) < 10) {
    throw new Error(`Requests per second too low: ${loadTest.requestsPerSecond}`);
  }
}, { category: 'performance', timeout: 15000 });

module.exports = {
  testSuite,
  TestUtils
};
