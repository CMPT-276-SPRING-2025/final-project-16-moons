// Test script for CI/CD pipeline

// import test functions
import { testSearchHotels, testHotelSearchWorkflow } from './hotelsTest.js';
import { testGeocodeCity, testGetCurrentLocation, testFlightSearchWorkflow } from './flightsTest.js';
import { testSearchRestaurants, testRestaurantSearchWorkflow } from './restaurantsTest.js';

async function runTests() {
  console.log('===== Starting API Feature Tests =====');
  
  let allTestsPassed = true;
  
  // run Hotel Tests
  console.log('\n===== Running Hotel Feature Tests =====');
  
  try {
    // run hotel unit test
    console.log('\nRunning unit test: testSearchHotels');
    await testSearchHotels();
    console.log('✅ Hotel unit test passed');
  } catch (error) {
    console.error('❌ Hotel unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // run hotel integration test
    console.log('\nRunning integration test: testHotelSearchWorkflow');
    await testHotelSearchWorkflow();
    console.log('✅ Hotel integration test passed');
  } catch (error) {
    console.error('❌ Hotel integration test failed:', error);
    allTestsPassed = false;
  }
  
  // run Flight Tests
  console.log('\n===== Running Flight Feature Tests =====');
  
  try {
    // run geocodeCity unit test
    console.log('\nRunning unit test: testGeocodeCity');
    await testGeocodeCity();
    console.log('✅ GeocodeCity unit test passed');
  } catch (error) {
    console.error('❌ GeocodeCity unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // run getCurrentLocation unit test
    console.log('\nRunning unit test: testGetCurrentLocation');
    await testGetCurrentLocation();
    console.log('✅ GetCurrentLocation unit test passed');
  } catch (error) {
    console.error('❌ GetCurrentLocation unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // run flight integration test
    console.log('\nRunning integration test: testFlightSearchWorkflow');
    await testFlightSearchWorkflow();
    console.log('✅ Flight integration test passed');
  } catch (error) {
    console.error('❌ Flight integration test failed:', error);
    allTestsPassed = false;
  }
  
  // run Restaurant Tests
  console.log('\n===== Running Restaurant Feature Tests =====');
  
  try {
    // run restaurant unit test
    console.log('\nRunning unit test: testSearchRestaurants');
    await testSearchRestaurants();
    console.log('✅ Restaurant unit test passed');
  } catch (error) {
    console.error('❌ Restaurant unit test failed:', error);
    allTestsPassed = false;
  }
  
  try {
    // run restaurant integration test
    console.log('\nRunning integration test: testRestaurantSearchWorkflow');
    await testRestaurantSearchWorkflow();
    console.log('✅ Restaurant integration test passed');
  } catch (error) {
    console.error('❌ Restaurant integration test failed:', error);
    allTestsPassed = false;
  }
  
  // exit with appropriate status code
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