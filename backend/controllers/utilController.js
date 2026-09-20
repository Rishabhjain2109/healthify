const { getAddressFromCoordinates } = require('../utils/googleMaps');

// Reverse geocode latitude and longitude into address data
exports.reverseGeocode = async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    // addressData includes: formattedAddress, city, state, zipCode
    const addressData = await getAddressFromCoordinates(latitude, longitude);
    
    return res.status(200).json(addressData);
  } catch (err) {
    console.error('Error during reverse geocoding:', err);
    return res.status(500).json({ message: 'Failed to get address' });
  }
};