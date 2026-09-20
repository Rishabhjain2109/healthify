const express = require('express');
const router = express.Router();
const {
  labSignup,
  searchLabsByTest,
  getAllLabs
} = require('../controllers/labsController');

// Lab Signup
router.post('/signup', labSignup);

// Search labs offering a specific test
router.get('/search', searchLabsByTest);

// Get all labs
router.get('/', getAllLabs);

module.exports = router;