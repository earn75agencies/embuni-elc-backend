/**
 * ELC System Automated QA Test Script
 * Tests the deployed backend and frontend integration
 */

const axios = require('axios');

const BACKEND_URL = 'https://embuni-elc-backend.onrender.com';
const FRONTEND_URL = 'https://embuni-elc-frontend.vercel.app';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper function to log test results
function logTest(name, passed, message, responseTime = null, statusCode = null) {
  testResults.summary.total++;
  const result = {
    name,
    passed,
    message,
    responseTime,
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  if (passed) {
    testResults.passed.push(result);
    testResults.summary.passed++;
    console.log(`✅ PASS: ${name} - ${message}${responseTime ? ` (${responseTime}ms)` : ''}`);
  } else {
    testResults.failed.push(result);
    testResults.summary.failed++;
    console.log(`❌ FAIL: ${name} - ${message}${responseTime ? ` (${responseTime}ms)` : ''}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message, timestamp: new Date().toISOString() });
  testResults.summary.warnings++;
  console.log(`⚠️  WARN: ${name} - ${message}`);
}

// Helper to measure response time
async function measureTime(fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const time = Date.now() - start;
    return { result, time };
  } catch (error) {
    const time = Date.now() - start;
    return { error, time };
  }
}

// Test data
const testUsers = {
  regular: {
    email: `testuser_${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'User',
    password: 'TestPassword123!',
    phone: '+254700000000',
    studentId: 'B135/00000/2024',
    course: 'Computer Science',
    yearOfStudy: '2'
  },
  superAdmin: {
    email: 'superadmin@elp.com',
    password: 'SuperAdmin@2024!'
  }
};

const adminRoles = [
  { role: 'events_admin', label: 'Events Admin' },
  { role: 'gallery_admin', label: 'Gallery Admin' },
  { role: 'content_admin', label: 'Blog Admin' },
  { role: 'membership_admin', label: 'Team Admin' },
  { role: 'partners_admin', label: 'Partners Admin' },
  { role: 'programs_admin', label: 'Programs Admin' },
  { role: 'testimonials_admin', label: 'Testimonials Admin' },
  { role: 'announcements_admin', label: 'Announcements Admin' },
  { role: 'contact_admin', label: 'User Support Admin' },
  { role: 'security_admin', label: 'Security Admin' }
];

let superAdminToken = null;
let regularUserToken = null;
let createdAdminIds = [];

// ==================== AUTHENTICATION TESTS ====================

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.get(`${BACKEND_URL}/api/health`);
  });
  
  if (error) {
    logTest('Health Check', false, `Failed: ${error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 200 && result.data.status === 'healthy') {
    logTest('Health Check', true, 'Backend is healthy', time, 200);
    return true;
  } else {
    logTest('Health Check', false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n📝 Testing User Registration...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(`${BACKEND_URL}/api/auth/register`, testUsers.regular);
  });
  
  if (error) {
    if (error.response?.status === 400 && error.response.data?.message?.includes('already')) {
      logWarning('User Registration', 'User already exists (expected in retry)');
      return true;
    }
    logTest('User Registration', false, `Failed: ${error.response?.data?.message || error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 201 && result.data.success && result.data.token) {
    regularUserToken = result.data.token;
    logTest('User Registration', true, 'User registered successfully', time, 201);
    return true;
  } else {
    logTest('User Registration', false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUsers.regular.email,
      password: testUsers.regular.password
    });
  });
  
  if (error) {
    logTest('User Login', false, `Failed: ${error.response?.data?.message || error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 200 && result.data.token) {
    regularUserToken = result.data.token;
    logTest('User Login', true, 'User logged in successfully', time, 200);
    return true;
  } else {
    logTest('User Login', false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testSuperAdminLogin() {
  console.log('\n👑 Testing Super Admin Login...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUsers.superAdmin.email,
      password: testUsers.superAdmin.password
    });
  });
  
  if (error) {
    logTest('Super Admin Login', false, `Failed: ${error.response?.data?.message || error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 200 && result.data.token) {
    superAdminToken = result.data.token;
    logTest('Super Admin Login', true, 'Super Admin logged in successfully', time, 200);
    return true;
  } else {
    logTest('Super Admin Login', false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testTokenValidation() {
  console.log('\n🔑 Testing Token Validation...');
  if (!regularUserToken) {
    logTest('Token Validation', false, 'No token available');
    return false;
  }
  
  const { result, time, error } = await measureTime(async () => {
    return await axios.get(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
  });
  
  if (error) {
    logTest('Token Validation', false, `Failed: ${error.response?.data?.message || error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 200 && result.data.user) {
    logTest('Token Validation', true, 'Token is valid', time, 200);
    return true;
  } else {
    logTest('Token Validation', false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.get(`${BACKEND_URL}/api/auth/profile`);
  });
  
  if (error && error.response?.status === 401) {
    logTest('Unauthorized Access', true, 'Correctly rejected unauthorized request', time, 401);
    return true;
  } else {
    logTest('Unauthorized Access', false, `Expected 401, got ${error?.response?.status || result?.status}`, time, error?.response?.status || result?.status);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n❌ Testing Invalid Login...');
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    });
  });
  
  if (error && error.response?.status === 401) {
    logTest('Invalid Login', true, 'Correctly rejected invalid credentials', time, 401);
    return true;
  } else {
    logTest('Invalid Login', false, `Expected 401, got ${error?.response?.status || result?.status}`, time, error?.response?.status || result?.status);
    return false;
  }
}

// ==================== ADMIN CREATION TESTS ====================

async function testAdminCreation(role, label) {
  console.log(`\n👤 Testing ${label} Creation...`);
  
  if (!superAdminToken) {
    logTest(`${label} Creation`, false, 'Super Admin token not available');
    return false;
  }
  
  const adminEmail = `test_${role}_${Date.now()}@test.com`;
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(
      `${BACKEND_URL}/api/auth/admin/create-login`,
      {
        email: adminEmail,
        firstName: 'Test',
        lastName: label,
        password: 'TestPassword123!',
        adminRole: role
      },
      {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }
    );
  });
  
  if (error) {
    logTest(`${label} Creation`, false, `Failed: ${error.response?.data?.message || error.message}`, time, error.response?.status);
    return false;
  }
  
  if (result.status === 201 && result.data.success) {
    if (result.data.data?.userId) {
      createdAdminIds.push(result.data.data.userId);
    }
    logTest(`${label} Creation`, true, `${label} created successfully`, time, 201);
    
    // Verify admin profile exists
    if (result.data.data?.adminId) {
      logTest(`${label} Profile`, true, 'Admin profile created automatically');
    } else {
      logWarning(`${label} Profile`, 'Admin profile not created automatically');
    }
    
    return true;
  } else {
    logTest(`${label} Creation`, false, `Unexpected response: ${JSON.stringify(result.data)}`, time, result.status);
    return false;
  }
}

async function testInvalidAdminRole() {
  console.log('\n❌ Testing Invalid Admin Role...');
  
  if (!superAdminToken) {
    logTest('Invalid Admin Role', false, 'Super Admin token not available');
    return false;
  }
  
  const { result, time, error } = await measureTime(async () => {
    return await axios.post(
      `${BACKEND_URL}/api/auth/admin/create-login`,
      {
        email: `test_invalid_${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'Invalid',
        password: 'TestPassword123!',
        adminRole: 'invalid_role_xyz'
      },
      {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }
    );
  });
  
  if (error && error.response?.status === 400) {
    logTest('Invalid Admin Role', true, 'Correctly rejected invalid role', time, 400);
    return true;
  } else {
    logTest('Invalid Admin Role', false, `Expected 400, got ${error?.response?.status || result?.status}`, time, error?.response?.status || result?.status);
    return false;
  }
}

// ==================== CRUD TESTS ====================

async function testEventsCRUD() {
  console.log('\n📅 Testing Events CRUD...');
  
  if (!superAdminToken) {
    logTest('Events CRUD', false, 'Admin token not available');
    return false;
  }
  
  // Create Event
  const eventData = {
    title: `Test Event ${Date.now()}`,
    description: 'This is a test event description',
    shortDescription: 'Test event',
    eventType: 'workshop',
    category: 'leadership',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    location: {
      venue: 'Test Venue',
      address: 'Test Address',
      isVirtual: false
    },
    status: 'draft'
  };
  
  const { result: createResult, time: createTime, error: createError } = await measureTime(async () => {
    return await axios.post(
      `${BACKEND_URL}/api/events`,
      eventData,
      {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }
    );
  });
  
  if (createError) {
    logTest('Events Create', false, `Failed: ${createError.response?.data?.message || createError.message}`, createTime, createError.response?.status);
    return false;
  }
  
  if (createResult.status === 201 && createResult.data.event) {
    const eventId = createResult.data.event._id;
    logTest('Events Create', true, 'Event created successfully', createTime, 201);
    
    // Read Event
    const { result: readResult, time: readTime, error: readError } = await measureTime(async () => {
      return await axios.get(`${BACKEND_URL}/api/events/${eventId}`);
    });
    
    if (readError || readResult.status !== 200) {
      logTest('Events Read', false, `Failed to read event`, readTime, readError?.response?.status);
    } else {
      logTest('Events Read', true, 'Event read successfully', readTime, 200);
    }
    
    // Update Event
    const { result: updateResult, time: updateTime, error: updateError } = await measureTime(async () => {
      return await axios.put(
        `${BACKEND_URL}/api/events/${eventId}`,
        { title: `Updated Test Event ${Date.now()}` },
        {
          headers: { Authorization: `Bearer ${superAdminToken}` }
        }
      );
    });
    
    if (updateError || updateResult.status !== 200) {
      logTest('Events Update', false, `Failed to update event`, updateTime, updateError?.response?.status);
    } else {
      logTest('Events Update', true, 'Event updated successfully', updateTime, 200);
    }
    
    // Delete Event
    const { result: deleteResult, time: deleteTime, error: deleteError } = await measureTime(async () => {
      return await axios.delete(
        `${BACKEND_URL}/api/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${superAdminToken}` }
        }
      );
    });
    
    if (deleteError || deleteResult.status !== 200) {
      logTest('Events Delete', false, `Failed to delete event`, deleteTime, deleteError?.response?.status);
    } else {
      logTest('Events Delete', true, 'Event deleted successfully', deleteTime, 200);
    }
    
    return true;
  } else {
    logTest('Events Create', false, `Unexpected response: ${JSON.stringify(createResult.data)}`, createTime, createResult.status);
    return false;
  }
}

// ==================== PERFORMANCE TESTS ====================

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const endpoints = [
    { name: 'Health Check', url: `${BACKEND_URL}/api/health`, method: 'GET' },
    { name: 'Get Events', url: `${BACKEND_URL}/api/events`, method: 'GET' },
    { name: 'Get Posts', url: `${BACKEND_URL}/api/posts`, method: 'GET' }
  ];
  
  const performanceResults = [];
  
  for (const endpoint of endpoints) {
    const { time, error } = await measureTime(async () => {
      if (endpoint.method === 'GET') {
        return await axios.get(endpoint.url);
      }
    });
    
    if (error) {
      logWarning(endpoint.name, `Failed: ${error.message} (${time}ms)`);
    } else {
      performanceResults.push({ name: endpoint.name, time });
      if (time > 2000) {
        logTest(`${endpoint.name} Performance`, false, `Response time ${time}ms exceeds 2s threshold`, time);
      } else {
        logTest(`${endpoint.name} Performance`, true, `Response time ${time}ms is acceptable`, time);
      }
    }
  }
  
  return performanceResults;
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('🚀 Starting ELC System QA Tests...\n');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);
  
  // Health Check
  await testHealthCheck();
  
  // Authentication Tests
  await testUserRegistration();
  await testUserLogin();
  await testSuperAdminLogin();
  await testTokenValidation();
  await testUnauthorizedAccess();
  await testInvalidLogin();
  
  // Admin Creation Tests
  if (superAdminToken) {
    for (const { role, label } of adminRoles) {
      await testAdminCreation(role, label);
    }
    await testInvalidAdminRole();
  }
  
  // CRUD Tests
  await testEventsCRUD();
  
  // Performance Tests
  await testPerformance();
  
  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`  - ${test.name}: ${test.message} (Status: ${test.statusCode || 'N/A'}, Time: ${test.responseTime || 'N/A'}ms)`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(warning => {
      console.log(`  - ${warning.name}: ${warning.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  return testResults;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testResults };

