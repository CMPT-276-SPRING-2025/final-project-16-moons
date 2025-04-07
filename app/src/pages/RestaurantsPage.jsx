  // Restaurants page main file

  import BackgroundImage from '../assets/restaurants-background.jpeg';
  import '../styles/restaurants.css';
  import { SearchBar } from "../components/SearchBar";
  import { useState } from "react";
  import { 
    loadGoogleMapsScript, 
    initializeMap, 
    geocodeCity, 
    searchRestaurants, 
    createRestaurantMarkers,
    clearMarkers,
  } from '../services/maps';

// Render the restaurants list component
const createRestaurantList = (props) => {
  const { 
    restaurants, 
    destination, 
    selectedRestaurant, 
    selectedRestaurantRef, 
    handleRestaurantClick, 
    formatAddress 
  } = props;
  
  return (
    // container for the restaurants/stores list
    <div className="restaurants-results-container">
      <div className="restaurants-list">
        {/* title and count of restaurants */}
        <h2>Restaurants and Foods shops in {destination ? destination.name : 'this location'}</h2>
        <p>Found <span className="restaurant-count">{restaurants.length}</span> restaurants and food shops</p>
        
        {/* list of restaurants */}
        <ul className="restaurant-results">
          {restaurants.map((restaurant, index) => (
            // create a list item for each restaurant/store
            <li 
              key={restaurant.place_id} 
              // add a class to the list item if a restaurant/store is selected
              className={`restaurant-item ${selectedRestaurant && selectedRestaurant.place_id === restaurant.place_id ? 'selected' : ''}`}
              onClick={() => handleRestaurantClick(restaurant, index)}
              ref={selectedRestaurant && selectedRestaurant.place_id === restaurant.place_id ? selectedRestaurantRef : null}
            >

              <div className="restaurant-list-header">
                {/* restaurant/store name and rating container */}
                <div className="restaurant-name-container">
                  {/* restaurant/store marker */}
                  <div className="restaurant-marker">{String.fromCharCode(65 + (index % 26))}</div>
                  {/* restaurant/store name */}
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                </div>
                {/* restaurant/store rating container */}
                <div className="restaurant-rating-container">
                  {/* if a rating exists display it */}
                  {restaurant.rating ? (
                    <div className="restaurant-rating">
                      {restaurant.rating} ⭐
                      <span className="restaurant-reviews">
                        ({restaurant.user_ratings_total || 0} reviews)
                      </span>
                    </div>
                  ) : (
                    // if no rating exists display this
                    <div className="restaurant-rating">
                      No ratings yet
                      <span className="restaurant-reviews">
                        (0 reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* restaurant/store details container */}
              <div className="restaurant-details">
                <div className="restaurant-info-main">
                  {/* address */}
                  <p className="restaurant-address">{formatAddress(restaurant)}</p>
                  {/* description */}
                  <div className="restaurant-summary">
                    <span className="info-label">Description: </span> {restaurant.editorial_summary}
                  </div>
                  {/* if restaurant's/store's opening hours exist display it */}
                  {restaurant.opening_hours ? (
                    <div className="restaurant-open">
                      <span className="info-label">Status: </span> 
                      {/* if restaurant/store is open now displays open */}
                      {restaurant.opening_hours.open_now ? 
                        <span className="open">Open Now</span> : 
                        // if restaurant/store is closed display closed
                        <span className="closed">Closed</span>}
                    </div>
                  ) : (
                    // if no opening hours exist display this
                    <div className="restaurant-open">
                      <span className="info-label">Status: </span> 
                      <span className="unknown">Hours not available</span>
                    </div>
                  )}
                </div>
                {/* contact info container */}
                <div className="restaurant-contact-info">
                  {restaurant.formatted_phone_number && (
                    <p className="restaurant-phone">
                      <span className="info-label">Phone: </span> {restaurant.formatted_phone_number}
                    </p>
                  )}
                  {/* display the website link */}
                  {restaurant.website && (
                    <p className="restaurant-website">
                      <a className="info-label" href={restaurant.website} target="_blank" onClick={(e) => e.stopPropagation()}>
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
  


function Restaurants() {
  const [searchValue, setSearchValue] = useState("");
  const [map, setMap] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [destination, setDestination] = useState(null);
  const mapRef = useRef(null);
  const selectedRestaurantRef = useRef(null);

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
    
    // clear current restaurants and markers
    setRestaurants([]);
    if (markers.length) {
      clearMarkers(markers);
      setMarkers([]);
    }
    setSelectedRestaurant(null);
    
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
        
        // call the searchRestaurants function
        let restaurantsData;
        try {
          restaurantsData = await searchRestaurants(mapInstance, coordinates);
        } catch (restaurantsErr) {
          console.error("Error in restaurant search:", restaurantsErr);
          setError("We encountered an issue finding restaurants or food shops in this area. The results might be incomplete.");
          restaurantsData = [];
        }
        // set the restaurants data
        setRestaurants(restaurantsData);
        // add markers to map if there are restaurants
        if (restaurantsData.length > 0) {
          try {
            // create markers for each restaurant/store
            const newMarkers = createRestaurantMarkers(mapInstance, restaurantsData);
            setMarkers(newMarkers);
          } catch (markerErr) {
            console.error("Error creating markers:", markerErr);
            setError("There was an issue displaying restaurant and food shop markers on the map.");
          }
        }
        // show an error if the search fails
      } catch (error) {
        console.error('Error searching restaurants:', error);
        setError(error.message || "Failed to find restaurants and food shops. Please try another location.");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // format restaurant/store address
  const formatAddress = (restaurant) => {
    return restaurant.vicinity || restaurant.formatted_address || "Address not available";
  };

  // when a user clicks on a restaurant/store in the list
  const handleRestaurantClick = (restaurant, index) => {
    if (!mapRef.current) return;
    // set the selected restaurant/store
    setSelectedRestaurant(rstaurant);
    if (markers[index]) {
      try {
        // center and zoom in on the set restaurant/store
        mapRef.current.setCenter(restaurant.geometry.location);
        mapRef.current.setZoom(16);
      } catch (error) {
        console.error("Error handling restaurant click:", error);
      }
    }
  };

  

  return (
    <div className="restaurants" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      {/* only show title if no search yet */}
      {!hasSearched && (
        <div className="headerContainer">
          <h1>Restaurants</h1>
        </div>
      )}
      
      {/* search bar container */}
      <div className={`search-bar-container ${hasSearched && (loading || error) ? 'search-bar-top' : ''}`}>
        <SearchBar 
          placeholder="Search for a city to find restaurants/stores..." 
          onSearch={handleSearch}
        />
      </div>
      
      {/* loading popup */}
      {loading && <div className="loading">Searching for restaurants...</div>}
      
      {/* error message */}
      {error && <div className="error">{error}</div>}
      
      {/* only show restaurant/store content if search has been made */}
      {hasSearched && (
        // if loading or error popups are shown, transform moves restaurant/store content down
        <div className={`restaurant-content ${loading || error ? 'restaurant-content-transformed' : ''}`}>
          <div id="map-container" className="map-container"></div>
          
          {/* call the createRestaurantList function */}
          {restaurants.length > 0 ? (
            createRestaurantList({
              restaurants,
              destination,
              selectedRestaurant,
              selectedRestaurantRef,
              handleRestaurantClick,
              formatAddress
            })
          ) : !loading && (
            // if search was completed but no restaurants/stores exist in the area
            <div className="no-results">No restaurants/food shops found. Please try another location.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Restaurants
