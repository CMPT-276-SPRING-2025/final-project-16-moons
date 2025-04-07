  // Hotels page main file

  import BackgroundImage from '../assets/hotels-background.jpg';
  import '../styles/hotels.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState, useEffect, useRef } from "react";
  import { 
    loadGoogleMapsScript, 
    initializeMap, 
    geocodeCity, 
    searchHotels, 
    createHotelMarkers,
    clearMarkers
  } from '../services/maps';

// Render the hotels list component
const renderHotelsList = (props) => {
  const { 
    hotels, 
    destination, 
    selectedHotel, 
    selectedHotelRef, 
    handleHotelClick, 
    formatAddress 
  } = props;

  return (
    <div className="hotels-results-container">
      <div className="hotels-list">
        <h2>Hotels in {destination ? destination.name : 'this location'}</h2>
        <p>Found {hotels.length} hotels</p>
        <ul className="hotel-results">
          {hotels.map((hotel, index) => (
            <li 
              key={hotel.place_id} 
              className={`hotel-item ${selectedHotel && selectedHotel.place_id === hotel.place_id ? 'selected' : ''}`}
              onClick={() => handleHotelClick(hotel, index)}
              ref={selectedHotel && selectedHotel.place_id === hotel.place_id ? selectedHotelRef : null}
            >
              <div className="hotel-list-header">
                <div className="hotel-name-container">
                  <div className="hotel-marker">{String.fromCharCode(65 + (index % 26))}</div>
                  <h3 className="hotel-name">{hotel.name}</h3>
                </div>
                <div className="hotel-rating-container">
                  {hotel.rating ? (
                    <div className="hotel-rating">
                      {hotel.rating} ⭐
                      <span className="hotel-reviews">
                        ({hotel.user_ratings_total || 0} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="hotel-rating">
                      No ratings yet
                      <span className="hotel-reviews">
                        (0 reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="hotel-details">
                <div className="hotel-info-main">
                  <p className="hotel-address">{formatAddress(hotel)}</p>
                  
                  <div className="hotel-summary">
                    <span className="info-label">Description: </span> {hotel.editorial_summary}
                  </div>
                  
                  {hotel.opening_hours ? (
                    <div className="hotel-open">
                      <span className="info-label">Status: </span> 
                      {hotel.opening_hours.open_now ? 
                        <span className="open">Open Now</span> : 
                        <span className="closed">Closed</span>}
                    </div>
                  ) : (
                    <div className="hotel-open">
                      <span className="info-label">Status: </span> 
                      <span className="unknown">Hours not available</span>
                    </div>
                  )}
                </div>
                
                <div className="hotel-contact-info">
                  {hotel.formatted_phone_number && (
                    <p className="hotel-phone">
                      <span className="info-label">Phone: </span> {hotel.formatted_phone_number}
                    </p>
                  )}
                  
                  {hotel.website && (
                    <p className="hotel-website">
                      <a className="info-label" href={hotel.website} target="_blank" onClick={(e) => e.stopPropagation()}>
                        Visit Website
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function Hotels() {
  const [searchValue, setSearchValue] = useState("");
  const [map, setMap] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [destination, setDestination] = useState(null);
  const mapRef = useRef(null);
  const selectedHotelRef = useRef(null);

  // Load Google Maps script on component mount
  useEffect(() => {
    try {
      loadGoogleMapsScript(() => {
        console.log("Google Maps API loaded in HotelsPage");
        setMapsLoaded(true);
      });
    } catch (err) {
      console.error("Error loading Google Maps:", err);
      setError("Failed to load Google Maps. Please try refreshing the page.");
    }
    
    // Cleanup function
    return () => {
      if (markers.length) {
        clearMarkers(markers);
      }
    };
  }, []);

  // Scroll to selected hotel in the list
  useEffect(() => {
    if (selectedHotel && selectedHotelRef.current) {
      selectedHotelRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedHotel]);

  // Initialize map if not already initialized
  const getMapInstance = () => {
    // Get map instance or initialize a new one
    let mapInstance = mapRef.current;
    if (!mapInstance) {
      console.log("Initializing new map");
      const mapElement = document.getElementById('map-container');
      if (!mapElement) {
        throw new Error('Map container element not found');
      }
      
      const newMap = initializeMap('map-container', {
        zoom: 3,
        center: { lat: 37.0902, lng: -95.7129 } // Center on US by default
      });
      
      setMap(newMap);
      mapRef.current = newMap;
      mapInstance = newMap;
    }
    return mapInstance;
  };

  // Handle search submission
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) return;
    
    console.log("Searching for:", searchTerm);
    setSearchValue(searchTerm);
    setLoading(true);
    setError("");
    setHasSearched(true);
    
    // Clear previous hotels and markers
    setHotels([]);
    if (markers.length) {
      clearMarkers(markers);
      setMarkers([]);
    }
    setSelectedHotel(null);
    
    try {
      console.log("Maps loaded state:", mapsLoaded);
      
      // Get or initialize map
      let mapInstance;
      try {
        mapInstance = getMapInstance();
      } catch (mapErr) {
        throw new Error(`Map initialization error: ${mapErr.message}`);
      }
      
      // Geocode the city to get coordinates
      console.log("Geocoding city:", searchTerm);
      let geocodeResult;
      try {
        geocodeResult = await geocodeCity(searchTerm);
      } catch (geoErr) {
        throw new Error(`Location not found: ${geoErr.message}`);
      }
      
      const { coordinates, formattedAddress } = geocodeResult;
      console.log("Geocoded coordinates:", coordinates);
      
      // Set destination with formatted address
      setDestination({
        name: formattedAddress,
        coordinates: coordinates
      });
      
      // Center map on the city
      mapInstance.setCenter(coordinates);
      mapInstance.setZoom(13);
      
      // Search for hotels near this location
      console.log("Searching for hotels at coordinates:", coordinates);
      let hotelsData;
      try {
        hotelsData = await searchHotels(mapInstance, coordinates);
        console.log("Hotels found:", hotelsData.length);
      } catch (hotelsErr) {
        console.error("Error in hotel search:", hotelsErr);
        // Show a more user-friendly error but continue with empty results
        setError("We encountered an issue finding hotels in this area. The results might be incomplete.");
        hotelsData = [];
      }
      
      // Set hotels state regardless
      setHotels(hotelsData);
      
      // Only proceed with markers if we found hotels
      if (hotelsData.length > 0) {
        try {
          // Create markers for each hotel
          const newMarkers = createHotelMarkers(mapInstance, hotelsData);
          setMarkers(newMarkers);
        } catch (markerErr) {
          console.error("Error creating markers:", markerErr);
          // Don't fail completely if markers can't be created
          setError("There was an issue displaying hotel markers on the map.");
        }
      }
      
    } catch (error) {
      console.error('Error searching hotels:', error);
      setError(error.message || "Failed to find hotels. Please try another location.");
      setHotels([]);
    } finally {
      console.log("Search completed");
      setLoading(false);
    }
  };

  // Format hotel address
  const formatAddress = (hotel) => {
    return hotel.vicinity || hotel.formatted_address || "Address not available";
  };

  // Handle hotel item click
  const handleHotelClick = (hotel, index) => {
    if (!mapRef.current) return;
    
    setSelectedHotel(hotel);
    
    // Trigger marker click to show info window
    if (markers[index]) {
      try {
        // Center map on this hotel
        mapRef.current.setCenter(hotel.geometry.location);
        mapRef.current.setZoom(16);
      } catch (error) {
        console.error("Error handling hotel click:", error);
      }
    }
  };

  

  return (
    <div className="hotels" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      {/* Only show title if no search yet */}
      {!hasSearched && (
        <div className="headerContainer">
          <h1>Hotels</h1>
        </div>
      )}
      
      {/* Search bar container */}
      <div className={`search-bar-container ${hasSearched && (loading || error) ? 'search-bar-top' : ''}`}>
        <SearchBar 
          placeholder="Search for a city to find hotels..." 
          onSearch={handleSearch}
        />
      </div>
      
      {/* Loading popup */}
      {loading && <div className="loading">Searching for hotels...</div>}
      
      {/* Error message */}
      {error && <div className="error">{error}</div>}
      
      {/* Only show hotel content if search has been made */}
      {hasSearched && (
        <div className={`hotel-content ${loading || error ? 'hotel-content-transformed' : ''}`}>
          {/* Map Container */}
          <div id="map-container" className="map-container"></div>
          
          {/* Hotels List */}
          {hotels.length > 0 ? (
            renderHotelsList({
              hotels,
              destination,
              selectedHotel,
              selectedHotelRef,
              handleHotelClick,
              formatAddress
            })
          ) : !loading && (
            <div className="no-results">No hotels found. Try another location.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Hotels
