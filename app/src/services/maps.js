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
          console.log('Geocoding successful:', results[0].formatted_address);
        } else {
          // reject the promise if geocoding fails
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.log('Error geocoding city:', error);
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
  return new Promise((resolve) => {
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
          console.log('Error getting current location:', error);
          // Default to Vancouver if geolocation fails
          resolve({ lat: 49.2827, lng: -123.1207 });
        }
      );
    } else {
      console.log('Default location set to Vancouver, BC');
      // Default to Vancouver if geolocation not supported
      resolve({ lat: 49.2827, lng: -123.1207 });
    }
  });
};

// mock data
export const getFlightData = async (originCoords, destinationCoords, destinationName) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const distance = calculateDistance(originCoords, destinationCoords);
  const flightTime = Math.round(distance / 800);
  const departureTime = new Date(Date.now() + Math.floor(Math.random() * 86400000*3));
  const arrivalTime = new Date(departureTime.getTime() + flightTime * 3600000);
  const departureTime2 = new Date(Date.now() + Math.floor(Math.random() * 86400000*3));
  const arrivalTime2 = new Date(departureTime2.getTime() + flightTime * 3600000);
  const departureTime3 = new Date(Date.now() + Math.floor(Math.random() * 86400000*3));
  const arrivalTime3 = new Date(departureTime3.getTime() + flightTime * 3600000);
  const departureTime4 = new Date(Date.now() + Math.floor(Math.random() * 86400000*3));
  const arrivalTime4 = new Date(departureTime4.getTime() + flightTime * 3600000);

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
        flightNumber: 'AC' + Math.floor(Math.random() * 10000),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        price: Math.round(100 + distance * 0.1),
        duration: flightTime
      },
      {
        airline: 'Delta Airlines',
        flightNumber: 'DL' + Math.floor(Math.random() * 10000),
        departureTime: departureTime2,
        arrivalTime: arrivalTime2,
        price: Math.round(90 + distance * 0.12),
        duration: flightTime
      },
      {
        airline: 'United Airlines',
        flightNumber: 'UA' + Math.floor(Math.random() * 10000),
        departureTime: departureTime3,
        arrivalTime: arrivalTime3,
        price: Math.round(85 + distance * 0.11),
        duration: flightTime
      },
      {
        airline: 'WestJet',
        flightNumber: 'WS' + Math.floor(Math.random() * 10000),
        departureTime: departureTime4,
        arrivalTime: arrivalTime4,
        price: Math.round(80 + distance * 0.13),
        duration: flightTime
      }
    ],
    distance: distance
  };
};

// helper func (haversine formula)
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
  // Check if the script is being loaded
  if (window.googleMapsScriptLoading) {
    console.log("Google Maps API script is loading...");
    // If already loading, add this callback to be executed when loaded
    if (typeof callback === 'function') {
      window.googleMapsCallbacks = window.googleMapsCallbacks || [];
      window.googleMapsCallbacks.push(callback);
    }
    return;
  }
  
  // Check if already loaded
  if (window.google && window.google.maps) {
    if (typeof callback === 'function') {
      callback();
    }
    return;
  }

  // Set flag that we're loading the script
  window.googleMapsScriptLoading = true;
  window.googleMapsCallbacks = window.googleMapsCallbacks || [];
  if (typeof callback === 'function') {
    window.googleMapsCallbacks.push(callback);
  }

  // Create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places,marker&loading=async`;
  script.async = true;
  script.defer = true;
  
  // Callback when script loads
  script.onload = () => {
    window.googleMapsScriptLoading = false;
    console.log("Google Maps API loaded");
    
    // Execute all callbacks
    if (window.googleMapsCallbacks && window.googleMapsCallbacks.length) {
      window.googleMapsCallbacks.forEach(cb => {
        if (typeof cb === 'function') {
          cb();
        }
      });
      window.googleMapsCallbacks = [];
    }
  };

  // add script to document
  document.head.appendChild(script);
};

