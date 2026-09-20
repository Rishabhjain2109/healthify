const express = require('express');
const router = express.Router();
const {
  getOnlineMeetings,
  setOnlineMeetingTime
} = require('../controllers/onlineMeetingsController');

// Get online meetings for a patient or doctor
router.get('/', getOnlineMeetings);

// Set or update time for an online meeting by roomId
router.put('/setonlinemeetingtime/:roomId', setOnlineMeetingTime);

module.exports = router;