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
const createHotelsList = (props) => {
  const { 
    hotels, 
    destination, 
    selectedHotel, 
    selectedHotelRef, 
    handleHotelClick, 
    formatAddress 
  } = props;
  
  const now = new Date();
  const curHour = now.getHours();
  const isBusinessHours = curHour >= 9 && curHour <= 17;

  return (
    // container for the hotels list
    <div className="hotels-results-container">
      <div className="hotels-list">
        {/* title and count of hotels */}
        <h2>Hotels in {destination ? destination.name : 'this location'}</h2>
        <p>Found <span className="hotel-count">{hotels.length}</span> hotels</p>
        
        {/* list of hotels */}
        <ul className="hotel-results">
          {hotels.map((hotel, index) => (
            // create a list item for each hotel
            <li 
              key={hotel.place_id} 
              // add a class to the list item if a hotel is selected
              className={`hotel-item ${selectedHotel && selectedHotel.place_id === hotel.place_id ? 'selected' : ''}`}
              onClick={() => handleHotelClick(hotel, index)}
              ref={selectedHotel && selectedHotel.place_id === hotel.place_id ? selectedHotelRef : null}
            >

              <div className="hotel-list-header">
                {/* hotel name and rating container */}
                <div className="hotel-name-container">
                  {/* hotel marker */}
                  <div className="hotel-marker">{String.fromCharCode(65 + (index % 26))}</div>
                  {/* hotel name */}
                  <h3 className="hotel-name">{hotel.name}</h3>
                </div>
                {/* hotel rating container */}
                <div className="hotel-rating-container">
                  {/* if a rating exists display it */}
                  {hotel.rating ? (
                    <div className="hotel-rating">
                      {hotel.rating} ⭐
                      <span className="hotel-reviews">
                        ({hotel.user_ratings_total || 0} reviews)
                      </span>
                    </div>
                  ) : (
                    // if no rating exists display this
                    <div className="hotel-rating">
                      No ratings yet
                      <span className="hotel-reviews">
                        (0 reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* hotel details container */}
              <div className="hotel-details">
                <div className="hotel-info-main">
                  {/* address */}
                  <p className="hotel-address">{formatAddress(hotel)}</p>
                  {/* description */}
                  <div className="hotel-summary">
                    <span className="info-label">Description: </span> {hotel.editorial_summary}
                  </div>
                  {/* if hotel opening hours exist display it */}
                  {hotel.opening_hours ? (
                    <div className="hotel-open">
                      <span className="info-label">Status: </span> 
                      {/* if hotel open now display open */}
                      {isBusinessHours? 
                        <span className="open">Open Now</span> : 
                        // if hotel is closed display closed
                        <span className="closed">Closed</span>}
                    </div>
                  ) : (
                    // if no opening hours exist display this
                    <div className="hotel-open">
                      <span className="info-label">Status: </span> 
                      <span className="unknown">Hours not available</span>
                    </div>
                  )}
                </div>
                {/* contact info container */}
                <div className="hotel-contact-info">
                  {hotel.formatted_phone_number && (
                    <p className="hotel-phone">
                      <span className="info-label">Phone: </span> {hotel.formatted_phone_number}
                    </p>
                  )}
                  {/* display the website link */}
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

  // load google maps script
  useEffect(() => {
    try {
      loadGoogleMapsScript(() => {
        setMapsLoaded(true);
      });
    } catch (err) {
      console.error("Error loading Google Maps:", err);
      setError("Failed to load Google Maps. Please try refreshing the page.");
    }
    
    // cleanup
    return () => {
      if (markers.length) {
        clearMarkers(markers);
      }
    };
  }, []);

  // process the user input search
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) return;
    
    setSearchValue(searchTerm);
    setLoading(true);
    setError("");
    setHasSearched(true);
    
    // clear current hotels and markers
    setHotels([]);
    if (markers.length) {
      clearMarkers(markers);
      setMarkers([]);
    }
    setSelectedHotel(null);
    
    // delay map initialization until DOM is updated
    setTimeout(async () => {
      try {
        
        // get map element
        const mapElement = document.getElementById('map-container');
        if (!mapElement) {
          throw new Error('Map container element not found');
        }
        
        // initialize map
        let mapInstance = map;
        if (!mapInstance) {
          const newMap = initializeMap('map-container', {
            zoom: 3,
            center: { lat: 37.0902, lng: -95.7129 }
          });
          
          setMap(newMap);
          mapRef.current = newMap;
          mapInstance = newMap;
        }
        
        // geocode the city to get coordinates
        let geocodeResult;
        try {
          geocodeResult = await geocodeCity(searchTerm);
        } catch (geoErr) {
          throw new Error(`Location not found... Please try again.`);
        }
        
        const { coordinates, formattedAddress } = geocodeResult;
        
        // set destination with formatted address from geocoding
        setDestination({
          name: formattedAddress,
          coordinates: coordinates
        });
        
        // center map on the city
        mapInstance.setCenter(coordinates);
        mapInstance.setZoom(13);
        
        // call the searchHotels function
        let hotelsData;
        try {
          hotelsData = await searchHotels(mapInstance, coordinates);
        } catch (hotelsErr) {
          console.error("Error in hotel search:", hotelsErr);
          setError("We encountered an issue finding hotels in this area. The results might be incomplete.");
          hotelsData = [];
        }
        // set the hotels data
        setHotels(hotelsData);
        // add markers to map if there are hotels
        if (hotelsData.length > 0) {
          try {
            // create markers for each hotel
            const newMarkers = createHotelMarkers(mapInstance, hotelsData);
            setMarkers(newMarkers);
          } catch (markerErr) {
            console.error("Error creating markers:", markerErr);
            setError("There was an issue displaying hotel markers on the map.");
          }
        }
        // show an error if the search fails
      } catch (error) {
        console.error('Error searching hotels:', error);
        setError(error.message || "Failed to find hotels. Please try another location.");
        setHotels([]);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // format hotel address
  const formatAddress = (hotel) => {
    return hotel.vicinity || hotel.formatted_address || "Address not available";
  };

  // when a user clicks on a hotel in the list
  const handleHotelClick = (hotel, index) => {
    if (!mapRef.current) return;
    // set the selected hotel
    setSelectedHotel(hotel);
    if (markers[index]) {
      try {
        // center and zoom in on the set hotel
        mapRef.current.setCenter(hotel.geometry.location);
        mapRef.current.setZoom(16);
      } catch (error) {
        console.error("Error handling hotel click:", error);
      }
    }
  };

  

  return (
    <div className="hotels" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      {/* only show title if no search yet */}
      {!hasSearched && (
        <div className="headerContainer">
          <h1>Hotels</h1>
        </div>
      )}
      
      {/* search bar container */}
      <div className={`search-bar-container ${hasSearched && (loading || error) ? 'search-bar-top' : ''}`}>
        <SearchBar 
          placeholder="Search for a city to find hotels..." 
          onSearch={handleSearch}
        />
      </div>
      
      {/* loading popup */}
      {loading && <div className="loading">Searching for hotels...</div>}
      
      {/* error message */}
      {error && <div className="error">{error}</div>}
      
      {/* only show hotel content if search has been made */}
      {hasSearched && (
        // if loading or error popups are shown, transform moves hotel content down
        <div className={`hotel-content ${loading || error ? 'hotel-content-transformed' : ''}`}>
          <div id="map-container" className="map-container"></div>
          
          {/* call the createHotelsList function */}
          {hotels.length > 0 ? (
            createHotelsList({
              hotels,
              destination,
              selectedHotel,
              selectedHotelRef,
              handleHotelClick,
              formatAddress
            })
          ) : !loading && (
            // if search was completed but no hotels exist in the area
            <div className="no-results">No hotels found. Please try another location.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Hotels
