const express = require('express');
const router = express.Router();
const { reverseGeocode } = require('../controllers/utilController');

// POST /api/utils/reverse-geocode
router.post('/reverse-geocode', reverseGeocode);

module.exports = router;