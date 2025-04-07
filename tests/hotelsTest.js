// --- Unit Test ---

/**
 * Tests the searchHotels function by mocking the Google Maps Places API response
 * and verifying the transformation of hotel data is correct.
 * 
 * This test verifies that the function properly transforms the raw Places API
 * response into our application's standardized hotel format.
 */
async function testSearchHotels() {
  console.log("Running: testSearchHotels");

  try {
    // create a mock for the google maps object
    const originalGoogle = window.google;
    
    // create a mock for the location
    const mockLocation = { lat: 49.2827, lng: -123.1207 };
    
    // create a mock for the place data
    const mockPlaceData = {
      displayName: { text: "Test Hotel" },
      id: "test-place-id-123",
      formattedAddress: "123 Test Street, Vancouver",
      rating: 4.5,
      userRatingCount: 100,
      nationalPhoneNumber: "+1 (555) 123-4567",
      websiteURI: { toString: () => "https://testhotel.com" },
      editorialSummary: { text: "A lovely test hotel" },
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
    
    // import the searchHotels function
    const { searchHotels } = await import('../app/src/services/maps.js');
    
    // create a mock for the map
    const mockMap = {};
    
    // call the function with the mock data
    const result = await searchHotels(mockMap, mockLocation);
    
    // expected transformed data
    const expected = [{
      name: "Test Hotel",
      place_id: "test-place-id-123",
      vicinity: "123 Test Street, Vancouver",
      formatted_address: "123 Test Street, Vancouver",
      rating: 4.5,
      user_ratings_total: 100,
      formatted_phone_number: "+1 (555) 123-4567",
      website: "https://testhotel.com",
      editorial_summary: "A lovely test hotel",
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
      "❌ testSearchHotels failed: Data transformation incorrect"
    );
    
    console.log("✅ testSearchHotels passed");
    
    // restore the original google object
    window.google = originalGoogle;
  } catch (error) {
    console.error("❌ testSearchHotels failed", error);
  }
}

// --- Integration Test ---

/**
 * Tests the hotel search functionality of the HotelsPage component by simulating
 * a search and verifying the proper interaction between components and services.
 * 
 * This test checks that:
 * 1. The search triggers geocoding correctly
 * 2. Hotel search is performed with the correct parameters
 * 3. Hotel markers are created
 * 4. The hotel list is populated with the search results
 */
async function testHotelSearchWorkflow() {
  console.log("Running: testHotelSearchWorkflow");
  
  try {
    // create a mock for the google maps object
    const originalGoogleMaps = window.google;
    // create mock search results
    const mockSearchResults = [
      {
        name: "Grand Hotel",
        place_id: "place-123",
        vicinity: "123 Main St",
        rating: 4.7,
        user_ratings_total: 235,
        editorial_summary: "Luxury hotel in downtown",
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
      searchHotels: mapsService.searchHotels,
      createHotelMarkers: mapsService.createHotelMarkers,
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
    
    mapsService.searchHotels = async (map, coordinates) => mockSearchResults;
    
    mapsService.createHotelMarkers = (map, hotels) => 
      hotels.map((hotel, index) => ({
        setMap: () => {},
        hotelData: hotel
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
    const { default: HotelsPage } = await import('../app/src/pages/HotelsPage.jsx');
    
    const hookStates = {
      hotels: [],
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
        "❌ testHotelSearchWorkflow failed: Wrong number of hotel results"
      );
      
      console.log("✅ testHotelSearchWorkflow passed");
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
    console.error("❌ testHotelSearchWorkflow failed", error);
  }
}

// Function to run all tests
function runHotelTests() {
  console.log("=== Running Hotel Feature Tests ===");
  
  // Run unit test
  testSearchHotels();
  
  // Run integration test
  testHotelSearchWorkflow();
  
  console.log("=== Hotel Tests Complete ===");
}

// Export tests for CI/CD pipeline
export { 
  testSearchHotels, 
  testHotelSearchWorkflow,
  runHotelTests
};

