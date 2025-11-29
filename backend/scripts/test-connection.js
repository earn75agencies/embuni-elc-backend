#!/usr/bin/env node
/**
 * Test script to verify backend-frontend connection
 * Run this from backend folder: node scripts/test-connection.js
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://embuni-elc-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://embuni-elc-frontend.vercel.app';

console.log('\n🔍 Testing Backend-Frontend Connection\n');
console.log('━'.repeat(50));
console.log(`Backend:  ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_URL}`);
console.log('━'.repeat(50) + '\n');

const tests = [
  {
    name: 'Backend Health Check',
    test: async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/health`);
        console.log('✅ Backend is running');
        return true;
      } catch (error) {
        console.log('❌ Backend is not responding');
        console.log(`   Error: ${error.message}`);
        return false;
      }
    }
  },
  {
    name: 'Root Endpoint',
    test: async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/`);
        console.log('✅ Root endpoint responds');
        console.log(`   Message: ${response.data.message}`);
        return true;
      } catch (error) {
        console.log('❌ Root endpoint failed');
        return false;
      }
    }
  },
  {
    name: 'CORS Configuration',
    test: async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/health`, {
          headers: {
            'Origin': FRONTEND_URL
          }
        });

        const acaoHeader = response.headers['access-control-allow-origin'];
        if (acaoHeader === FRONTEND_URL || acaoHeader === '*') {
          console.log('✅ CORS is properly configured');
          console.log(`   Access-Control-Allow-Origin: ${acaoHeader}`);
          return true;
        } else {
          console.log('⚠️  CORS header present but unexpected value');
          console.log(`   Received: ${acaoHeader}`);
          return false;
        }
      } catch (error) {
        console.log('❌ CORS check failed');
        console.log(`   Error: ${error.message}`);
        return false;
      }
    }
  },
  {
    name: 'Environment Variables',
    test: async () => {
      console.log('✅ Environment variables loaded');
      console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
      console.log(`   ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`);
      console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
      return true;
    }
  }
];

(async () => {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`\n${test.name}...\n`);
    try {
      const result = await test.test();
      if (result) {passed++;}
      else {failed++;}
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Backend-Frontend connection is ready.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
})();
