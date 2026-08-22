const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const Lab = require('../models/Lab');
const { calculateStraightLineDistance } = require('../utils/googleMaps');

// Get all lab tests
router.get('/', async (req, res) => {
  try {
    const tests = await LabTest.find().populate('labs', '-password');
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search labs by test name and nearest distance


module.exports = router; 