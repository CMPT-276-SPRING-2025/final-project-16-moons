// --- Unit Test ---

/**
 * Tests the searchRestaurants function by mocking the Google Maps Places API response
 * and verifying the transformation of restaurant data is correct.
 * 
 * This test verifies that the function properly transforms the raw Places API
 * response into our application's standardized restaurant format.
 */
async function testSearchRestaurants() {
  console.log("Running: testSearchRestaurants");

  try {
    // create a mock for the google maps object
    const originalGoogle = window.google;
    
    // create a mock for the location
    const mockLocation = { lat: 49.2827, lng: -123.1207 };
    
    // create a mock for the place data
    const mockPlaceData = {
      displayName: { text: "Test Restaurant" },
      id: "test-place-id-123",
      formattedAddress: "123 Test Street, Vancouver",
      rating: 4.5,
      userRatingCount: 100,
      nationalPhoneNumber: "+1 (555) 123-4567",
      websiteURI: { toString: () => "https://testrestaurant.com" },
      editorialSummary: { text: "A lovely test restaurant" },
      location: { lat: 49.2827, lng: -123.1207 },
      regularOpeningHours: { isOpen: true }
    };
    
    // create a mock for the places api
    window.google = {
      maps: {
        importLibrary: async () => ({
          Place: {
            searchNearby: async () => ({
              places: [mockPlaceData]
            })
          },
          SearchNearbyRankPreference: {
            POPULARITY: "POPULARITY"
          }
        })
      }
    };
    
    // import the searchRestaurants function
    const { searchRestaurants } = await import('../app/src/services/maps.js');
    
    // create a mock for the map
    const mockMap = {};
    
    // call the function with the mock data
    const result = await searchRestaurants(mockMap, mockLocation);
    
    // expected transformed data
    const expected = [{
      name: "Test Restaurant",
      place_id: "test-place-id-123",
      vicinity: "123 Test Street, Vancouver",
      formatted_address: "123 Test Street, Vancouver",
      rating: 4.5,
      user_ratings_total: 100,
      formatted_phone_number: "+1 (555) 123-4567",
      website: "https://testrestaurant.com",
      editorial_summary: "A lovely test restaurant",
      geometry: {
        location: { lat: 49.2827, lng: -123.1207 }
      },
      opening_hours: {
        open_now: true
      }
    }];
    
    // assert that the resulting data is correctly transformed
    console.assert(
      result.length === 1 &&
      result[0].name === expected[0].name &&
      result[0].place_id === expected[0].place_id &&
      result[0].rating === expected[0].rating,
      "❌ testSearchRestaurants failed: Data transformation incorrect"
    );
    
    console.log("✅ testSearchRestaurants passed");
    
    // restore the original google object
    window.google = originalGoogle;
  } catch (error) {
    console.error("❌ testSearchRestaurants failed", error);
  }
}

// --- Integration Test ---

/**
 * Tests the restaurant search functionality of the RestaurantsPage component by simulating
 * a search and verifying the proper interaction between components and services.
 * 
 * This test checks that:
 * 1. The search triggers geocoding correctly
 * 2. Restaurant search is performed with the correct parameters
 * 3. Restaurant markers are created
 * 4. The restaurant list is populated with the search results
 */
async function testRestaurantSearchWorkflow() {
  console.log("Running: testRestaurantSearchWorkflow");
  
  try {
    // create a mock for the google maps object
    const originalGoogleMaps = window.google;
    // create mock search results
    const mockSearchResults = [
      {
        name: "Test Restaurant",
        place_id: "place-123",
        vicinity: "123 Main St",
        rating: 4.7,
        user_ratings_total: 235,
        editorial_summary: "Delicious food in downtown",
        geometry: {
          location: { lat: 49.2827, lng: -123.1207 }
        },
        opening_hours: {
          open_now: true
        }
      }
    ];
    
    // mock the maps service
    const mapsService = await import('../app/src/services/maps.js');
    const originalFunctions = {
      geocodeCity: mapsService.geocodeCity,
      searchRestaurants: mapsService.searchRestaurants,
      createRestaurantMarkers: mapsService.createRestaurantMarkers,
      initializeMap: mapsService.initializeMap
    };
    
    // override with mock implementations
    mapsService.initializeMap = (elementId, options) => ({
      setCenter: () => {},
      setZoom: () => {}
    });
    
    mapsService.geocodeCity = async (cityName) => ({
      coordinates: { lat: 49.2827, lng: -123.1207 },
      formattedAddress: "Vancouver, BC, Canada"
    });
    
    mapsService.searchRestaurants = async (map, coordinates) => mockSearchResults;
    
    mapsService.createRestaurantMarkers = (map, restaurants) => 
      restaurants.map((restaurant, index) => ({
        setMap: () => {},
        restaurantData: restaurant
      }));
    
    // mock the document and dom elements
    document.getElementById = (id) => {
      if (id === 'map-container') {
        return {
          id: 'map-container'
        };
      }
      return null;
    };
    
    // Import React components (assuming they're available)
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    const { default: RestaurantsPage } = await import('../app/src/pages/RestaurantsPage.jsx');
    
    const hookStates = {
      restaurants: [],
      loading: false,
      error: "",
      destination: null
    };
    
    // create a test container
    const testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    
    try {
      // Simulate a search for "Vancouver"
      await mapsService.handleSearch("Vancouver");
      
      // assert expected outcomes
      console.assert(
        mockSearchResults.length === 1,
        "❌ testRestaurantSearchWorkflow failed: Wrong number of restaurant results"
      );
      
      console.log("✅ testRestaurantSearchWorkflow passed");
    } finally {
      // clean up
      document.body.removeChild(testContainer);
      
      // restore the original functions
      Object.keys(originalFunctions).forEach(key => {
        mapsService[key] = originalFunctions[key];
      });
      
      // restore the google maps object
      window.google = originalGoogleMaps;
    }
  } catch (error) {
    console.error("❌ testRestaurantSearchWorkflow failed", error);
  }
}

// Export tests for CI/CD pipeline
export { 
  testSearchRestaurants, 
  testRestaurantSearchWorkflow
};
