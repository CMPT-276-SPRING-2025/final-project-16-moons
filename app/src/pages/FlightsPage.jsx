  // Flights page main file

  import { useEffect, useState, useRef } from "react";
  import BackgroundImage from '../assets/flights-background.jpg';
  import '../styles/flights.css';
  import { SearchBar } from "../components/SearchBar";
  import { 
    loadGoogleMapsScript,
    initializeMap, 
    geocodeCity, 
    addMarker, 
    getCurrentLocation,
    getFlightData,
    drawFlightPath
  } from "../services/maps";

function Flights() {
  // state variables
  const [map, setMap] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  // references to map, marker, and path
  const mapRef = useRef(null);
  const homeRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef(null);

  // load google maps script
  useEffect(() => {
    // Load Google Maps script only once
    loadGoogleMapsScript(() => {
      // Map initialization will happen after script loads
      if (!mapRef.current && document.getElementById('map-container')) {
        const newMap = initializeMap('map-container');
        setMap(newMap);
        mapRef.current = newMap;
      }
    });

    // get user's current location
    getCurrentLocation().then((coords) => {
      setCurrentLocation(coords);
    });

    // Cleanup function
    return () => {
      if (homeRef.current) {
        homeRef.current.setMap(null);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (pathRef.current) {
        pathRef.current.setMap(null);
      }
    };
  }, []);

  // handle searching for a city
  const handleSearch = async (cityName) => {
    // show the loading popup
    setIsLoading(true);
    // clear data/errors and set the search to true
    setError(null);
    setFlightData(null);
    
    // set hasSearched to true to ensure the map container is rendered
    setHasSearched(true);
    
    // If we don't have the current location yet, get it first
    if (!currentLocation) {
      try {
        const coords = await getCurrentLocation();
        setCurrentLocation(coords);
      } catch (locationErr) {
        // console.error('Error getting current location:', locationErr);
        // Allow the search to continue with default location
      }
    }
    
    // Use setTimeout to delay map initialization until after the DOM has updated
    setTimeout(async () => {
      try {
        // Now the map container should exist in the DOM
        const mapElement = document.getElementById('map-container');
        
        if (!mapElement) {
          throw new Error('Map container element not found');
        }
        
        // Get existing map or initialize a new one
        let mapInstance = mapRef.current;
        if (!mapInstance) {
          const newMap = initializeMap('map-container');
          setMap(newMap);
          mapRef.current = newMap;
          mapInstance = newMap;
        }
        
        // geocode the city name to get coordinates
        const geoData = await geocodeCity(cityName);

        // set the destination state
        setDestination({
          name: geoData.formattedAddress,
          coordinates: geoData.coordinates
        });

        // Center map on the destination and zoom in
        mapInstance.setCenter(geoData.coordinates);
        mapInstance.setZoom(3);
        
        // Make sure we have currentLocation before adding home marker
        if (currentLocation) {
          // create home marker
          if (homeRef.current) {
            homeRef.current.setMap(null);
          }
          homeRef.current = addMarker(mapInstance, currentLocation, { title: "Home" });
        }

        // remove existing marker if exists
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        // add a new marker to the map
        markerRef.current = addMarker(mapInstance, geoData.coordinates, { title: geoData.formattedAddress });

        // get flight data only if we have current location
        if (currentLocation) {
          const data = await getFlightData(
            currentLocation, 
            geoData.coordinates, 
            geoData.formattedAddress
          );
          
          setFlightData(data);

          // remove existing path if exists
          if (pathRef.current) {
            pathRef.current.setMap(null);
          }

          // draw flight path
          pathRef.current = drawFlightPath(mapInstance, currentLocation, geoData.coordinates);
          
          // Set zoom and center to show the full flight path
          mapInstance.setZoom(7);
          mapInstance.setCenter(geoData.coordinates);
        } else {
          // Handle case where currentLocation is still not available
          // console.warn('Current location not available for flight path');
          setError('Unable to get your current location. Please try again.');
        }
      } catch (err) {
        // handle errors
        // console.error('Error searching for city:', err);
        setError('Failed to find the specified city. Please try again.');
      } finally {
        // hide the loading popup when done
        setIsLoading(false);
      }
    }, 100);
  };

  // format flight details for display
  const formatFlightDetails = (flight) => {
    // convert to strings
    const departureTime = new Date(flight.departureTime).toLocaleString();
    const arrivalTime = new Date(flight.arrivalTime).toLocaleString();
    
    // return the flight details as a div
    return (
      <div className="flight-item" key={flight.flightNumber}>
        <div className="flight-header">
          <h3>{flight.airline} - {flight.flightNumber}</h3>
          <span className="flight-price">${flight.price} CAD</span>
        </div>
        <div className="flight-times">
          <p>Departure: {departureTime}</p>
          <p>Arrival: {arrivalTime}</p>
          <p>Duration: {flight.duration} hours</p>
        </div>
      </div>
    );
  };

  return (
    // main container
    <div className="flights" style={{ backgroundImage: `url(${BackgroundImage})`}}>
      
      {/* only show flights title if no search yet */}
      {!hasSearched && (
        <div className="headerContainer">
          <h1>Flights</h1>
        </div>
      )}
      
      {/* search bar container */}
      <div className={`search-bar-container ${hasSearched && (isLoading || error) ? 'search-bar-top' : ''}`}>
        <SearchBar 
          placeholder="Enter a destination to visit..." 
          onSearch={handleSearch} 
        />
      </div>
      
      {/* loading popup */}
      {isLoading && <div className="loading">Searching...</div>}

      {/* error message */}
      {error && <div className="error">{error}</div>}
      
      {/* only show flight content if search has been made */}
      {hasSearched && (
        // add a transform if loading or error pop ups are shown
        <div className={`flight-content ${isLoading || error ? 'flight-content-transformed' : ''}`}>
          {/* map container */}
          <div id="map-container" className="map-container"></div>
          
          {/* flight results */}
          {flightData && (
            <div className="flight-results">
              <h2>Flights to {destination.name}</h2>
              {flightData.flights.map(formatFlightDetails)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Flights;