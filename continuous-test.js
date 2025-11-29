const { runAllTests } = require('./comprehensive-test');
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://embuni-elc-backend.onrender.com';
const TEST_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const TEST_INTERVAL = 5 * 60 * 1000; // Run tests every 5 minutes

let testCount = 0;
const startTime = Date.now();

async function runContinuousTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 Starting Continuous Testing (3 hours)');
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('='.repeat(80) + '\n');

  while (Date.now() - startTime < TEST_DURATION) {
    testCount++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    const remaining = Math.floor((TEST_DURATION - (Date.now() - startTime)) / 1000 / 60); // minutes

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Test Run #${testCount} | Elapsed: ${elapsed}min | Remaining: ${remaining}min`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    try {
      await runAllTests();
    } catch (error) {
      console.error(`❌ Test run #${testCount} failed with error:`, error.message);
    }

    // Wait before next test run
    if (Date.now() - startTime < TEST_DURATION) {
      console.log(`\n⏳ Waiting ${TEST_INTERVAL / 1000 / 60} minutes before next test run...`);
      await new Promise(resolve => setTimeout(resolve, TEST_INTERVAL));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Continuous Testing Complete');
  console.log(`Total Test Runs: ${testCount}`);
  console.log(`Duration: ${TEST_DURATION / 1000 / 60} minutes`);
  console.log(`End Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');
}

// Run continuous tests
runContinuousTests().catch(error => {
  console.error('Fatal error in continuous testing:', error);
  process.exit(1);
});


