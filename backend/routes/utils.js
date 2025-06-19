const express = require('express');
const router = express.Router();
const { getAddressFromCoordinates } = require('../utils/googleMaps');

// POST /api/utils/reverse-geocode
router.post('/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const addressData = await getAddressFromCoordinates(latitude, longitude);
    // addressData should include: formattedAddress, city, state, zipCode
    res.json(addressData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get address' });
  }
});

module.exports = router; 