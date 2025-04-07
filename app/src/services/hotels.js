
// ----- Hotel Search Functionality -----

// search for hotels in a specific area using the newer Place API
export const searchHotels = async (map, location) => {
    try {
      console.log('Searching for hotels near:', location);
      
      // Check if the required Place API is available
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not available');
        throw new Error('Google Maps API not available');
      }
      
      // Import the places library using the newer API approach
      const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
      
      // Define search parameters using the newer API format
      const request = {
        // Required parameters
        fields: ["displayName", "formattedAddress", "location", "rating", "userRatingCount", "businessStatus", "regularOpeningHours", "photos", "id"],
        locationRestriction: {
          center: location,
          radius: 5000, // 5km radius
        },
        // Optional parameters
        includedPrimaryTypes: ["lodging"], // Search for lodging/hotels
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.DISTANCE,
      };
      
      // Perform the search using the newer API
      const { places } = await Place.searchNearby(request);
      
      console.log('Found hotels:', places.length);
      
      // Transform the results to match the format expected by the rest of the application
      const transformedResults = places.map(place => ({
        name: place.displayName?.text || place.name,
        place_id: place.id,
        vicinity: place.formattedAddress,
        formatted_address: place.formattedAddress,
        rating: place.rating,
        user_ratings_total: place.userRatingCount,
        geometry: {
          location: place.location
        },
        opening_hours: place.regularOpeningHours ? {
          open_now: place.regularOpeningHours.isOpen
        } : undefined,
        photos: place.photos
      }));
      
      return transformedResults;
    } catch (error) {
      console.error('Error searching for hotels:', error);
      throw error;
    }
  };
  
  // Get detailed information about a specific hotel
  export const getHotelDetails = async (map, placeId) => {
    try {
      // Create a PlacesService instance for older API compatibility
      const service = new google.maps.places.Places(map);
      
      return new Promise((resolve, reject) => {
        // Define request for place details
        const request = {
          placeId: placeId,
          fields: [
            'name', 
            'rating', 
            'formatted_address', 
            'formatted_phone_number', 
            'website', 
            'photos', 
            'price_level', 
            'reviews', 
            'url',
            'vicinity',
            'opening_hours'
          ]
        };
        
        // Get place details
        service.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServicesStatus.OK) {
            resolve(place);
          } else {
            console.error('Failed to get hotel details with status:', status);
            reject(new Error(`Failed to get hotel details: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  };
  
  // Create hotel markers on the map
  export const createHotelMarkers = (map, hotels) => {
    const markers = [];
    
    hotels.forEach((hotel, index) => {
      // Create marker for each hotel
      const marker = new window.google.maps.Marker({
        position: hotel.geometry.location,
        map: map,
        title: hotel.name,
        animation: window.google.maps.Animation.DROP,
        // Optional: Use custom marker with lettering
        label: {
          text: String.fromCharCode(65 + (index % 26)),
          color: 'white'
        }
      });
      
      // Store the hotel data with the marker
      marker.hotelData = hotel;
      
      markers.push(marker);
    });
    
    return markers;
  };
  
  // Show info window when marker is clicked
  export const addInfoWindowToMarker = (map, marker, hotel, callback) => {
    const infoWindow = new window.google.maps.InfoWindow();
    
    // Add click listener to marker
    marker.addListener('click', async () => {
      try {
        // Get hotel details using the updated method
        const details = await getHotelDetails(map, hotel.place_id);
        
        // Create content for info window
        const content = `
          <div class="info-window">
            <h3>${details.name}</h3>
            <p>${details.vicinity || details.formatted_address}</p>
            ${details.rating ? `<p>Rating: ${details.rating} ⭐</p>` : ''}
            ${details.formatted_phone_number ? `<p>Phone: ${details.formatted_phone_number}</p>` : ''}
            ${details.website ? `<p><a href="${details.website}" target="_blank">Website</a></p>` : ''}
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open({
          anchor: marker,
          map,
        });
        
        // Execute callback if provided (e.g., to highlight hotel in list)
        if (callback && typeof callback === 'function') {
          callback(hotel);
        }
      } catch (error) {
        console.error('Error showing info window:', error);
        infoWindow.setContent(`<div>Error loading details</div>`);
        infoWindow.open({
          anchor: marker,
          map,
        });
      }
    });
    
    return infoWindow;
  };
  
  // Clear all markers from the map
  export const clearMarkers = (markers) => {
    if (markers && markers.length) {
      markers.forEach(marker => {
        marker.setMap(null);
      });
    }
    return [];
  };
  