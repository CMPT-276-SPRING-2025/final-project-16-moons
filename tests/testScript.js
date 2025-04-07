// Test script for CI/CD pipeline

import { testSearchHotels, testHotelSearchWorkflow } from './hotelsTest.js';

async function runTests() {
  console.log('Starting hotel feature tests...');
  
  let allTestsPassed = true;
  
  try {
    // Run unit test
    console.log('\nRunning unit test: testSearchHotels');
    await testSearchHotels();
    console.log('✅ Unit test passed');
  } catch (error) {
    console.error('❌ Unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // Run integration test
    console.log('\nRunning integration test: testHotelSearchWorkflow');
    await testHotelSearchWorkflow();
    console.log('✅ Integration test passed');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    allTestsPassed = false;
  }
  
  // Exit with appropriate status code
  if (!allTestsPassed) {
    console.error('\n❌ Some tests failed');
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed successfully');
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner crashed:', error);
  process.exit(1);
}); 