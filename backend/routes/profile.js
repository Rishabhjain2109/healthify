const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updateDoctorFee,
  getLabProfile,
  updateLabProfile,
} = require('../controllers/profileController');

// Standard profile routes (Doctor / Patient)
router.get('/me', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

// Specific Doctor route
router.put('/doctor/fee', authMiddleware, updateDoctorFee);

// Specific Lab profile routes
router.get('/lab/me', authMiddleware, getLabProfile);
router.put('/lab/update', authMiddleware, updateLabProfile);

module.exports = router;