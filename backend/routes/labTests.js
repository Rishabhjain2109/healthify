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
router.get('/search', async (req, res) => {
  const { testName, lat, lon, maxDistance } = req.query;
  if (!testName) return res.status(400).json({ message: 'Test name required' });
  try {
    const test = await LabTest.findOne({ testName: { $regex: testName, $options: 'i' } }).populate('labs', '-password');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    let labs = test.labs;
    if (lat && lon) {
      labs = labs.map(lab => {
        if (lab.latitude && lab.longitude) {
          lab = lab.toObject();
          lab.distance = calculateStraightLineDistance(parseFloat(lat), parseFloat(lon), lab.latitude, lab.longitude);
        }
        return lab;
      });
      labs = labs.filter(lab => lab.distance !== undefined && lab.distance <= (parseFloat(maxDistance) || 100));
      labs.sort((a, b) => a.distance - b.distance);
    }
    res.json({ test: test.testName, price: test.price, labs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 