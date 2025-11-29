const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://embuni-elc-backend.onrender.com';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `testuser${Date.now()}@example.com`,
  password: 'Test123',
  confirmPassword: 'Test123'
};

const testAdmin = {
  email: `testadmin${Date.now()}@example.com`,
  firstName: 'Test',
  lastName: 'Admin',
  password: 'Admin123',
  adminRole: 'events_admin'
};

let userToken = null;
const adminToken = null;
let superAdminToken = null;

async function testRegistration() {
  console.log('\n📝 Testing User Registration...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, testUser);
    if (response.status === 201 && response.data.success) {
      userToken = response.data.token;
      console.log('✅ Registration successful!');
      console.log('   Token:', userToken.substring(0, 20) + '...');
      return true;
    }
  } catch (error) {
    console.log('❌ Registration failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message);
      if (error.response.data?.errors) {
        console.log('   Errors:', JSON.stringify(error.response.data.errors, null, 2));
      } else {
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (response.status === 200 && response.data.success) {
      userToken = response.data.token;
      console.log('✅ Login successful!');
      return true;
    }
  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message);
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

async function testSuperAdminLogin() {
  console.log('\n👑 Testing Super Admin Login...');
  const superAdminCredentials = [
    { email: process.env.SUPERADMIN_EMAIL || 'superadmin@elp.com', password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!' },
    { email: 'superadmin@elp.com', password: 'SuperAdmin123!' },
    { email: 'admin@elp.com', password: 'admin123' }
  ];

  for (const creds of superAdminCredentials) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, creds);
      if (response.status === 200 && response.data.success) {
        superAdminToken = response.data.token;
        console.log('✅ Super Admin login successful!');
        console.log('   Email:', creds.email);
        return true;
      }
    } catch (error) {
      // Try next credentials
      continue;
    }
  }

  console.log('❌ Super Admin login failed - trying to create admin without super admin...');
  return false;
}

async function testCreateAdmin() {
  console.log('\n👤 Testing Admin Creation...');
  if (!superAdminToken) {
    console.log('⚠️  Skipping - No super admin token available');
    return false;
  }

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/admin/create-login`,
      testAdmin,
      {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }
    );
    if (response.status === 201 && response.data.success) {
      console.log('✅ Admin creation successful!');
      console.log('   Admin email:', testAdmin.email);
      return true;
    }
  } catch (error) {
    console.log('❌ Admin creation failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message);
      if (error.response.data?.errors) {
        console.log('   Errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

async function testCreateEvent() {
  console.log('\n📅 Testing Event Creation...');
  if (!superAdminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return false;
  }

  const eventData = {
    title: 'Test Event',
    description: 'This is a test event',
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

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/events`,
      eventData,
      {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }
    );
    if (response.status === 201 && response.data.success) {
      console.log('✅ Event creation successful!');
      return true;
    }
  } catch (error) {
    console.log('❌ Event creation failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message);
      if (error.response.data?.errors) {
        console.log('   Errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Full Flow Test...');
  console.log('Backend URL:', BACKEND_URL);

  const results = {
    registration: await testRegistration(),
    login: await testLogin(),
    superAdminLogin: await testSuperAdminLogin(),
    createAdmin: await testCreateAdmin(),
    createEvent: await testCreateEvent()
  };

  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

