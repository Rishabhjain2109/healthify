const express = require('express');
const router = express.Router();
const {
  getAllLabTests,
  searchLabsByTestAndDistance
} = require('../controllers/labtestsController');

// Get all lab tests
router.get('/', getAllLabTests);

// Search labs by test name and nearest distance
router.get('/search', searchLabsByTestAndDistance);

module.exports = router;