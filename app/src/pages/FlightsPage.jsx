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
    loadGoogleMapsScript(() => {
      console.log("Google Maps API loaded");
    });

    // get user's current location
    getCurrentLocation().then((coords) => {
      setCurrentLocation(coords);
    });

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (pathRef.current) {
        pathRef.current.setMap(null);
      }
    };
  }, []);

  // initialize the map
  const initMap = () => {
    // only initialize map if it doesn't exist
    if (!mapRef.current) {
      // create new google map instance in mapcontainer
      const newMap = initializeMap('map-container');
      // update the map state
      setMap(newMap);
      mapRef.current = newMap;
      return newMap;
    }
    // return existing map instance if exists
    return mapRef.current;
  };

  // handle searching for a city
  const handleSearch = async (cityName) => {
    // show the loading popup
    setIsLoading(true);
    // clear data/errors and set the search to true
    setError(null);
    setFlightData(null);
    setHasSearched(true);

    // initialize map if it's the first search
    try {
      // get exisiting map or make new one
      const mapInstance = mapRef.current || initMap();
      
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
      // create home marker
      homeRef.current = addMarker(mapInstance, currentLocation, { title: "Home" });

      // remove existing marker if exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      // add a new marker to the map
      markerRef.current = addMarker(mapInstance, geoData.coordinates, { title: geoData.formattedAddress });

      // get flight data
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
      }
    } catch (err) {
      // handle errors
      console.error('Error searching for city:', err);
      setError('Failed to find the specified city. Please try again.');
    } finally {
      // hide the loading popup when done
      setIsLoading(false);
    }
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
          <span className="flight-price">${flight.price}</span>
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
              {/* <p>Distance: {flightData.distance} km</p> */}
              {flightData.flights.map(formatFlightDetails)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Flights;