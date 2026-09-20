const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllDoctors,
  searchDoctors,
  updateDoctorLocation,
  getDoctorById
} = require('../controllers/doctorController');

// Get all doctors (for testing)
router.get('/', getAllDoctors);

// Search doctors by specialty, keyword, and location
router.get('/search', searchDoctors);

// Add or update doctor location
router.post('/:id/location', authMiddleware, updateDoctorLocation);

// Get single doctor by ID
router.get('/:id', getDoctorById);

module.exports = router;