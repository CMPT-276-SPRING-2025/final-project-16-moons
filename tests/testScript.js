// Test script for CI/CD pipeline

// Import tests
import { testSearchHotels, testHotelSearchWorkflow } from './hotelsTest.js';
import { testGeocodeCity, testGetCurrentLocation, testFlightSearchWorkflow } from './flightsTest.js';

async function runTests() {
  console.log('===== Starting Feature Tests =====');
  
  let allTestsPassed = true;
  
  // Run Hotel Tests
  console.log('\n===== Running Hotel Tests =====');
  
  try {
    // Run hotel unit test
    console.log('\nRunning unit test: testSearchHotels');
    await testSearchHotels();
    console.log('✅ Hotel unit test passed');
  } catch (error) {
    console.error('❌ Hotel unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // Run hotel integration test
    console.log('\nRunning integration test: testHotelSearchWorkflow');
    await testHotelSearchWorkflow();
    console.log('✅ Hotel integration test passed');
  } catch (error) {
    console.error('❌ Hotel integration test failed:', error);
    allTestsPassed = false;
  }
  
  // Run Flight Tests
  console.log('\n===== Running Flight Tests =====');
  
  try {
    // Run geocodeCity unit test
    console.log('\nRunning unit test: testGeocodeCity');
    await testGeocodeCity();
    console.log('✅ GeocodeCity unit test passed');
  } catch (error) {
    console.error('❌ GeocodeCity unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // Run getCurrentLocation unit test
    console.log('\nRunning unit test: testGetCurrentLocation');
    await testGetCurrentLocation();
    console.log('✅ GetCurrentLocation unit test passed');
  } catch (error) {
    console.error('❌ GetCurrentLocation unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // Run flight integration test
    console.log('\nRunning integration test: testFlightSearchWorkflow');
    await testFlightSearchWorkflow();
    console.log('✅ Flight integration test passed');
  } catch (error) {
    console.error('❌ Flight integration test failed:', error);
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