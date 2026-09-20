const LabTest = require('../models/LabTest');
const Lab = require('../models/Lab');
const { calculateStraightLineDistance } = require('../utils/googleMaps');

// Get all lab tests with populated lab details
exports.getAllLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find().populate('labs', '-password');
    return res.status(200).json({ tests });
  } catch (err) {
    console.error('Error fetching lab tests:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Search labs by test name and nearest distance
exports.searchLabsByTestAndDistance = async (req, res) => {
  const { testName, lat, lon, maxDistance } = req.query;

  if (!testName) {
    return res.status(400).json({ message: 'Test name required' });
  }

  try {
    const test = await LabTest.findOne({
      testName: { $regex: testName, $options: 'i' }
    }).populate('labs', '-password');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let labs = test.labs;

    if (lat && lon) {
      labs = labs
        .map((lab) => {
          if (lab.latitude && lab.longitude) {
            const labObj = lab.toObject();
            labObj.distance = calculateStraightLineDistance(
              parseFloat(lat),
              parseFloat(lon),
              lab.latitude,
              lab.longitude
            );
            return labObj;
          }
          return lab;
        })
        .filter(
          (lab) =>
            lab.distance !== undefined &&
            lab.distance <= (parseFloat(maxDistance) || 100)
        )
        .sort((a, b) => a.distance - b.distance);
    }

    return res.status(200).json({
      test: test.testName,
      price: test.price,
      labs
    });
  } catch (err) {
    console.error('Error searching labs by test and distance:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};