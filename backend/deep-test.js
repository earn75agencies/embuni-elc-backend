const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://embuni-elc-backend.onrender.com';

// Comprehensive deep testing
const tests = {
  // Authentication & Authorization
  auth: [],
  // Admin Operations
  admin: [],
  // Content Management
  content: [],
  // API Endpoints
  endpoints: [],
  // Error Handling
  errors: [],
  // Performance
  performance: []
};

let superAdminToken = null;
let testUserToken = null;

// Helper to make requests
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) {config.headers.Authorization = `Bearer ${token}`;}
    if (data) {config.data = data;}

    const start = Date.now();
    const response = await axios(config);
    const duration = Date.now() - start;

    return { success: true, data: response.data, status: response.status, duration };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      duration: 0
    };
  }
}

// Test 1: Super Admin Login with multiple credentials
async function testSuperAdminLoginDeep() {
  console.log('\n🔍 Deep Testing: Super Admin Login');
  const credentials = [
    { email: 'superadmin@elp.com', password: 'SuperAdmin@2024!' },
    { email: 'superadmin@elp.com', password: 'SuperAdmin123!' },
    { email: process.env.SUPERADMIN_EMAIL, password: process.env.SUPERADMIN_PASSWORD },
    { email: process.env.SUPER_ADMIN_EMAIL, password: process.env.SUPER_ADMIN_PASSWORD }
  ].filter(c => c.email && c.password);

  for (const creds of credentials) {
    const result = await apiCall('POST', '/api/auth/login', creds);
    if (result.success && result.data.token) {
      superAdminToken = result.data.token;
      console.log(`✅ Super Admin logged in: ${creds.email}`);
      return true;
    }
  }
  console.log('❌ Super Admin login failed');
  return false;
}

// Test 2: Create test user
async function testCreateTestUser() {
  console.log('\n🔍 Deep Testing: Create Test User');
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${Date.now()}@test.com`,
    password: 'Test123',
    confirmPassword: 'Test123'
  };

  const result = await apiCall('POST', '/api/auth/register', userData);
  if (result.success) {
    testUserToken = result.data.token;
    console.log('✅ Test user created');
    return true;
  } else {
    console.log(`❌ Test user creation failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

// Test 3: Test all admin roles creation
async function testAllAdminRolesCreation() {
  console.log('\n🔍 Deep Testing: All Admin Roles Creation');
  if (!superAdminToken) {
    console.log('⚠️  Skipped - No super admin token');
    return false;
  }

  const roles = [
    'events_admin', 'gallery_admin', 'content_admin', 'membership_admin',
    'partners_admin', 'programs_admin', 'testimonials_admin', 'announcements_admin',
    'contact_admin', 'security_admin'
  ];

  let successCount = 0;
  let failCount = 0;

  for (const role of roles) {
    const adminData = {
      email: `test_${role}_${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: role.replace('_admin', ''),
      password: 'Admin123!',
      adminRole: role
    };

    const result = await apiCall('POST', '/api/auth/admin/create-login', adminData, superAdminToken);
    if (result.success) {
      successCount++;
      console.log(`  ✅ ${role}: Created`);
    } else {
      failCount++;
      console.log(`  ❌ ${role}: Failed - ${JSON.stringify(result.error)}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Results: ${successCount} passed, ${failCount} failed`);
  return failCount === 0;
}

// Test 4: Test all API endpoints
async function testAllEndpoints() {
  console.log('\n🔍 Deep Testing: All API Endpoints');

  const endpoints = [
    { method: 'GET', path: '/api/health', auth: false },
    { method: 'GET', path: '/api/health/detailed', auth: false },
    { method: 'GET', path: '/api/health/ready', auth: false },
    { method: 'GET', path: '/api/health/live', auth: false },
    { method: 'GET', path: '/api/events', auth: false },
    { method: 'GET', path: '/api/events?limit=5', auth: false },
    { method: 'GET', path: '/api/posts', auth: false },
    { method: 'GET', path: '/api/posts?limit=5', auth: false },
    { method: 'GET', path: '/api/gallery', auth: false },
    { method: 'GET', path: '/api/recaptcha/config', auth: false },
    { method: 'GET', path: '/api/auth/profile', auth: true, token: testUserToken },
    { method: 'GET', path: '/api/admin/dashboard/stats', auth: true, token: superAdminToken },
    { method: 'GET', path: '/api/auth/admin/all-logins', auth: true, token: superAdminToken }
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    if (endpoint.auth && !endpoint.token) {
      console.log(`  ⚠️  ${endpoint.method} ${endpoint.path}: Skipped (no token)`);
      continue;
    }

    const result = await apiCall(endpoint.method, endpoint.path, null, endpoint.token);
    if (result.success) {
      passed++;
      console.log(`  ✅ ${endpoint.method} ${endpoint.path}: ${result.status} (${result.duration}ms)`);
    } else {
      failed++;
      console.log(`  ❌ ${endpoint.method} ${endpoint.path}: ${result.status}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n📊 Endpoint Tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 5: Test error handling
async function testErrorHandling() {
  console.log('\n🔍 Deep Testing: Error Handling');

  const errorTests = [
    { method: 'POST', path: '/api/auth/register', data: {}, expected: 400, name: 'Empty registration' },
    { method: 'POST', path: '/api/auth/login', data: { email: 'invalid' }, expected: 400, name: 'Invalid email' },
    { method: 'GET', path: '/api/events/invalid-id', expected: 404, name: 'Invalid event ID' },
    { method: 'GET', path: '/api/posts/invalid-id', expected: 404, name: 'Invalid post ID' },
    { method: 'POST', path: '/api/auth/admin/create-login', data: {}, token: testUserToken, expected: 403, name: 'Non-admin creating admin' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of errorTests) {
    const result = await apiCall(test.method, test.path, test.data, test.token);
    if (!result.success && result.status === test.expected) {
      passed++;
      console.log(`  ✅ ${test.name}: Correctly returned ${test.expected}`);
    } else {
      failed++;
      console.log(`  ❌ ${test.name}: Expected ${test.expected}, got ${result.status}`);
    }
  }

  console.log(`\n📊 Error Handling Tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 6: Test content CRUD operations
async function testContentCRUD() {
  console.log('\n🔍 Deep Testing: Content CRUD Operations');
  if (!superAdminToken) {
    console.log('⚠️  Skipped - No super admin token');
    return false;
  }

  // Create event
  const eventData = {
    title: `Test Event ${Date.now()}`,
    description: 'Test event description',
    shortDescription: 'Test',
    eventType: 'workshop',
    category: 'leadership',
    startDate: '2025-12-01',
    startTime: '10:00',
    endTime: '12:00',
    location: { venue: 'Test', isVirtual: false },
    status: 'draft'
  };

  const createResult = await apiCall('POST', '/api/events', eventData, superAdminToken);
  if (!createResult.success) {
    console.log(`❌ Event creation failed: ${JSON.stringify(createResult.error)}`);
    return false;
  }

  const eventId = createResult.data.data?._id || createResult.data.data?.id;
  console.log(`✅ Event created: ${eventId}`);

  // Update event
  if (eventId) {
    const updateResult = await apiCall('PUT', `/api/events/${eventId}`, {
      ...eventData,
      title: `Updated ${eventData.title}`
    }, superAdminToken);

    if (updateResult.success) {
      console.log('✅ Event updated');
    } else {
      console.log(`❌ Event update failed: ${JSON.stringify(updateResult.error)}`);
    }

    // Delete event
    const deleteResult = await apiCall('DELETE', `/api/events/${eventId}`, null, superAdminToken);
    if (deleteResult.success) {
      console.log('✅ Event deleted');
    } else {
      console.log(`❌ Event deletion failed: ${JSON.stringify(deleteResult.error)}`);
    }
  }

  return true;
}

// Main test runner
async function runDeepTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 DEEP TESTING SUITE');
  console.log('='.repeat(80));

  const results = {
    superAdminLogin: await testSuperAdminLoginDeep(),
    createTestUser: await testCreateTestUser(),
    allAdminRoles: await testAllAdminRolesCreation(),
    allEndpoints: await testAllEndpoints(),
    errorHandling: await testErrorHandling(),
    contentCRUD: await testContentCRUD()
  };

  console.log('\n' + '='.repeat(80));
  console.log('📊 DEEP TEST SUMMARY');
  console.log('='.repeat(80));
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '✅ All deep tests passed!' : '❌ Some tests failed'}`);
  console.log('='.repeat(80) + '\n');

  return allPassed;
}

if (require.main === module) {
  runDeepTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runDeepTests };


