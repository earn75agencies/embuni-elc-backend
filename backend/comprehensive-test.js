const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://embuni-elc-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://embuni-elc-frontend.vercel.app';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logPass(test, message) {
  testResults.passed.push({ test, message });
  console.log(`${colors.green}✅ PASS${colors.reset}: ${test} - ${message}`);
}

function logFail(test, message, error = null) {
  testResults.failed.push({ test, message, error });
  console.log(`${colors.red}❌ FAIL${colors.reset}: ${test} - ${message}`);
  if (error) {console.log(`${colors.red}   Error: ${error}${colors.reset}`);}
}

function logWarning(test, message) {
  testResults.warnings.push({ test, message });
  console.log(`${colors.yellow}⚠️  WARN${colors.reset}: ${test} - ${message}`);
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️  INFO${colors.reset}: ${message}`);
}

// Test data
const testUsers = {
  regular: {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${Date.now()}@example.com`,
    password: 'Test123',
    confirmPassword: 'Test123'
  },
  superAdmin: {
    email: process.env.SUPERADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'superadmin@elp.com',
    password: process.env.SUPERADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024!'
  }
};

const tokens = {
  regular: null,
  superAdmin: null,
  admins: {}
};

// ==================== HELPER FUNCTIONS ====================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// ==================== AUTHENTICATION TESTS ====================

async function testHealthCheck() {
  logInfo('Testing health check endpoint...');
  const result = await makeRequest('GET', `${BACKEND_URL}/api/health`);

  if (result.success && result.status === 200) {
    logPass('Health Check', 'Backend is responding');
    return true;
  } else {
    logFail('Health Check', `Backend not responding: ${result.error}`);
    return false;
  }
}

async function testUserRegistration() {
  logInfo('Testing user registration...');
  const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/register`, testUsers.regular);

  if (result.success && result.status === 201 && result.data.token) {
    tokens.regular = result.data.token;
    logPass('User Registration', 'User registered successfully');
    return true;
  } else {
    logFail('User Registration', `Registration failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testUserLogin() {
  logInfo('Testing user login...');
  const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/login`, {
    email: testUsers.regular.email,
    password: testUsers.regular.password
  });

  if (result.success && result.status === 200 && result.data.token) {
    tokens.regular = result.data.token;
    logPass('User Login', 'User logged in successfully');
    return true;
  } else {
    logFail('User Login', `Login failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSuperAdminLogin() {
  logInfo('Testing super admin login...');
  const credentials = [
    testUsers.superAdmin,
    { email: 'superadmin@elp.com', password: 'SuperAdmin@2024!' },
    { email: 'superadmin@elp.com', password: 'SuperAdmin123!' }
  ];

  for (const creds of credentials) {
    const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/login`, creds);

    if (result.success && result.status === 200 && result.data.token) {
      tokens.superAdmin = result.data.token;
      logPass('Super Admin Login', `Logged in with ${creds.email}`);
      return true;
    }
  }

  logWarning('Super Admin Login', 'Could not login - may need to seed super admin');
  return false;
}

async function testGetUserProfile() {
  if (!tokens.regular) {
    logWarning('Get User Profile', 'Skipped - no user token');
    return false;
  }

  logInfo('Testing get user profile...');
  const result = await makeRequest('GET', `${BACKEND_URL}/api/auth/profile`, null, tokens.regular);

  if (result.success && result.status === 200 && result.data.user) {
    logPass('Get User Profile', 'Profile retrieved successfully');
    return true;
  } else {
    logFail('Get User Profile', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

// ==================== ADMIN CREATION TESTS ====================

const ADMIN_ROLES = [
  'events_admin',
  'gallery_admin',
  'content_admin',
  'membership_admin',
  'partners_admin',
  'programs_admin',
  'testimonials_admin',
  'announcements_admin',
  'contact_admin',
  'security_admin'
];

async function testAdminCreation(role) {
  if (!tokens.superAdmin) {
    logWarning(`Admin Creation (${role})`, 'Skipped - no super admin token');
    return false;
  }

  logInfo(`Testing admin creation for ${role}...`);
  const adminData = {
    email: `test_${role}_${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: role.replace('_admin', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    password: 'Admin123!',
    adminRole: role
  };

  const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/admin/create-login`, adminData, tokens.superAdmin);

  if (result.success && result.status === 201) {
    if (result.data.data?.adminId) {
      tokens.admins[role] = result.data.data.token;
      logPass(`Admin Creation (${role})`, 'Admin created with profile');
      return true;
    } else {
      logWarning(`Admin Creation (${role})`, 'Admin created but no profile ID');
      return true;
    }
  } else {
    logFail(`Admin Creation (${role})`, `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testAllAdminCreations() {
  logInfo('Testing creation of all admin roles...');
  let passed = 0;
  let failed = 0;

  for (const role of ADMIN_ROLES) {
    const result = await testAdminCreation(role);
    if (result) {passed++;}
    else {failed++;}
    await sleep(500); // Small delay between requests
  }

  logInfo(`Admin Creation Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// ==================== ADMIN FUNCTIONALITY TESTS ====================

async function testAdminDashboard() {
  if (!tokens.superAdmin) {
    logWarning('Admin Dashboard', 'Skipped - no super admin token');
    return false;
  }

  logInfo('Testing admin dashboard stats...');
  const result = await makeRequest('GET', `${BACKEND_URL}/api/admin/dashboard/stats`, null, tokens.superAdmin);

  if (result.success && result.status === 200) {
    logPass('Admin Dashboard', 'Dashboard stats retrieved');
    return true;
  } else {
    logFail('Admin Dashboard', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetAllAdminLogins() {
  if (!tokens.superAdmin) {
    logWarning('Get All Admin Logins', 'Skipped - no super admin token');
    return false;
  }

  logInfo('Testing get all admin logins...');
  const result = await makeRequest('GET', `${BACKEND_URL}/api/auth/admin/all-logins`, null, tokens.superAdmin);

  if (result.success && result.status === 200) {
    logPass('Get All Admin Logins', `Retrieved ${result.data.data?.length || 0} admin accounts`);
    return true;
  } else {
    logFail('Get All Admin Logins', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

// ==================== CONTENT CREATION TESTS ====================

async function testEventCreation() {
  if (!tokens.superAdmin) {
    logWarning('Event Creation', 'Skipped - no admin token');
    return false;
  }

  logInfo('Testing event creation...');
  const eventData = {
    title: 'Test Event',
    description: 'This is a test event for comprehensive testing',
    shortDescription: 'Test event',
    eventType: 'workshop',
    category: 'leadership',
    startDate: '2025-12-01',
    startTime: '10:00',
    endTime: '12:00',
    location: {
      venue: 'Test Venue',
      address: 'Test Address',
      isVirtual: false
    },
    status: 'draft'
  };

  const result = await makeRequest('POST', `${BACKEND_URL}/api/events`, eventData, tokens.superAdmin);

  if (result.success && result.status === 201) {
    logPass('Event Creation', 'Event created successfully');
    return true;
  } else {
    logFail('Event Creation', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetEvents() {
  logInfo('Testing get events...');
  const result = await makeRequest('GET', `${BACKEND_URL}/api/events?limit=10`);

  if (result.success && result.status === 200) {
    logPass('Get Events', `Retrieved ${result.data.data?.length || 0} events`);
    return true;
  } else {
    logFail('Get Events', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testPostCreation() {
  if (!tokens.superAdmin) {
    logWarning('Post Creation', 'Skipped - no admin token');
    return false;
  }

  logInfo('Testing post creation...');
  const postData = {
    title: 'Test Post',
    content: 'This is a test post for comprehensive testing',
    excerpt: 'Test post excerpt',
    status: 'draft'
  };

  const result = await makeRequest('POST', `${BACKEND_URL}/api/posts`, postData, tokens.superAdmin);

  if (result.success && result.status === 201) {
    logPass('Post Creation', 'Post created successfully');
    return true;
  } else {
    logFail('Post Creation', `Failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

// ==================== VALIDATION TESTS ====================

async function testInvalidRegistration() {
  logInfo('Testing invalid registration (missing fields)...');
  const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/register`, {
    firstName: 'Test'
    // Missing required fields
  });

  if (!result.success && result.status === 400) {
    logPass('Invalid Registration Validation', 'Correctly rejected invalid data');
    return true;
  } else {
    logFail('Invalid Registration Validation', 'Should have rejected invalid data');
    return false;
  }
}

async function testInvalidLogin() {
  logInfo('Testing invalid login...');
  const result = await makeRequest('POST', `${BACKEND_URL}/api/auth/login`, {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123'
  });

  if (!result.success && result.status === 401) {
    logPass('Invalid Login Validation', 'Correctly rejected invalid credentials');
    return true;
  } else {
    logFail('Invalid Login Validation', 'Should have rejected invalid credentials');
    return false;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}🚀 Starting Comprehensive Project Testing${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Start Time: ${new Date().toISOString()}\n`);

  const testSuites = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get User Profile', fn: testGetUserProfile },
    { name: 'Super Admin Login', fn: testSuperAdminLogin },
    { name: 'Admin Dashboard', fn: testAdminDashboard },
    { name: 'Get All Admin Logins', fn: testGetAllAdminLogins },
    { name: 'All Admin Creations', fn: testAllAdminCreations },
    { name: 'Event Creation', fn: testEventCreation },
    { name: 'Get Events', fn: testGetEvents },
    { name: 'Post Creation', fn: testPostCreation },
    { name: 'Invalid Registration', fn: testInvalidRegistration },
    { name: 'Invalid Login', fn: testInvalidLogin }
  ];

  for (const suite of testSuites) {
    try {
      await suite.fn();
      await sleep(1000); // Delay between test suites
    } catch (error) {
      logFail(suite.name, `Unexpected error: ${error.message}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Passed: ${testResults.passed.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings.length}${colors.reset}`);

  if (testResults.failed.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.failed.forEach(({ test, message }) => {
      console.log(`  - ${test}: ${message}`);
    });
  }

  console.log(`\nEnd Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');

  return testResults.failed.length === 0;
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testResults };

