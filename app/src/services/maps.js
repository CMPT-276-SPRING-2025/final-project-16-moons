// get the api key from the environment variables
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// initialize google map inside an html element
export const initializeMap = (elementId, options = {}) => {
  const defaultOptions = {
    zoom: 2,
    center: { lat: 20, lng: 0 },
    // set default map type to roadmap
    mapTypeId: 'roadmap'
  };
  // merge default options with any additional options
  const mapOptions = { ...defaultOptions, ...options };
  // create new map instance
  return new google.maps.Map(document.getElementById(elementId), mapOptions);
};

// get coordinates from a city name
export const geocodeCity = async (cityName) => {
  try {
    // Create a geocoder instance
    const geocoder = new window.google.maps.Geocoder();
    
    // Use a promise to handle the asynchronous geocoding
    return new Promise((resolve, reject) => {
      // geocode the city name to get coordinates
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          // get the coordinates from the first result
          const { lat, lng } = results[0].geometry.location;
          // resolve the promise with the coordinates and formatted address
          resolve({
            coordinates: { lat: lat(), lng: lng() },
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id
          });
        } else {
          // reject the promise if geocoding fails
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding city:', error);
    throw error;
  }
};

// add a marker to the map
export const addMarker = (map, position, options = {}) => {
  const defaultOptions = {
    title: 'Destination',
    // make marker drop from top
    animation: window.google.maps.Animation.DROP
  };
  
  // merge default options with any custom options
  const markerOptions = { 
    position,
    map,
    ...defaultOptions,
    ...options
  };

  // create a new marker instance
  return new window.google.maps.Marker(markerOptions);
};

// get users current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // check if geolocation is supported on browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          // Default to Vancouver if geolocation fails
          resolve({ lat: 49.2827, lng: -123.1207 });
        }
      );
    } else {
      console.error('Geolocation not supported');
      // Default to Vancouver if geolocation not supported
      resolve({ lat: 49.2827, lng: -123.1207 });
    }
  });
};

// Mock function to get flight data
// In a real app, this would call a flight API
export const getFlightData = async (originCoords, destinationCoords, destinationName) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock flight data
  const distance = calculateDistance(originCoords, destinationCoords);
  const flightTime = Math.round(distance / 800); // Rough estimate: 800 km/hour

  return {
    origin: {
      coordinates: originCoords,
      name: 'Current Location'
    },
    destination: {
      coordinates: destinationCoords,
      name: destinationName
    },
    flights: [
      {
        airline: 'Air Canada',
        flightNumber: 'CNA3989',
        departureTime: new Date(Date.now() + 9600000*3),
        arrivalTime: new Date(Date.now() + 9600000*3 + flightTime * 3600000),
        price: Math.round(100 + distance * 0.1), // Mock price calculation
        duration: flightTime
      },
      {
        airline: 'Delta Airlines',
        flightNumber: 'DLA8972',
        departureTime: new Date(Date.now() + 43200000*3), // Day after tomorrow
        arrivalTime: new Date(Date.now() + 43200000*3 + (flightTime - 0.5) * 3600000),
        price: Math.round(90 + distance * 0.12),
        duration: flightTime
      }
    ],
    distance: distance
  };
};

// helper func
const calculateDistance = (point1, point2) => {
  // earth's radius in km
  const R = 6371;
  // convert degrees to radians
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLng = deg2rad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

// convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// draw a flight path between two points
export const drawFlightPath = (map, originCoords, destinationCoords) => {
  // create a new polyline instance to make a curved red line
  const flightPath = new window.google.maps.Polyline({
    path: [originCoords, destinationCoords],
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  
  // add the polyline to the map
  flightPath.setMap(map);
  // return the polyline instance
  return flightPath;
};

// load google maps script
export const loadGoogleMapsScript = (callback) => {
  // check if already loaded
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  // create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  
  // callback when script loads
  script.onload = callback;
  script.onerror = () => {
    console.error('Error loading Google Maps API');
  };
  
  // add script to document
  document.head.appendChild(script);
};

