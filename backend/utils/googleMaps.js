const { Client } = require('@googlemaps/google-maps-services-js');

// Initialize Google Maps client
const client = new Client({});

// Your Google Maps API key - you'll need to set this in your .env file
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Function to get coordinates from address (geocoding)
async function getCoordinatesFromAddress(address) {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

// Function to get address from coordinates (reverse geocoding)
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat: latitude, lng: longitude },
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;
      let city = '', state = '', zipCode = '';

      addressComponents.forEach(component => {
        if (component.types.includes('locality')) city = component.long_name;
        if (component.types.includes('administrative_area_level_1')) state = component.long_name;
        if (component.types.includes('postal_code')) zipCode = component.long_name;
      });

      return {
        address: result.formatted_address,
        city,
        state,
        zipCode
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    return null;
  }
}

// Function to calculate real-time distance using Google Maps Distance Matrix API
async function calculateRealTimeDistance(originLat, originLon, destinationLat, destinationLon) {
  try {
    const response = await client.distancematrix({
      params: {
        origins: `${originLat},${originLon}`,
        destinations: `${destinationLat},${destinationLon}`,
        mode: 'driving', // You can change this to 'walking', 'bicycling', or 'transit'
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.rows.length > 0 && response.data.rows[0].elements.length > 0) {
      const element = response.data.rows[0].elements[0];
      if (element.status === 'OK') {
        return {
          distance: element.distance.text, // e.g., "5.2 km"
          distanceValue: element.distance.value, // Distance in meters
          duration: element.duration.text, // e.g., "12 mins"
          durationValue: element.duration.value // Duration in seconds
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
}

// Function to calculate straight-line distance (Haversine formula) as fallback
function calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

module.exports = {
  getCoordinatesFromAddress,
  getAddressFromCoordinates,
  calculateRealTimeDistance,
  calculateStraightLineDistance
}; 