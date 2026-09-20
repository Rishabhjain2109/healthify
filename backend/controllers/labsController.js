const Lab = require('../models/Lab');
const LabTest = require('../models/LabTest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { calculateStraightLineDistance } = require('../utils/googleMaps');

// Lab Signup
exports.labSignup = async (req, res) => {
  const {
    managerName,
    labName,
    branchCode,
    email,
    password,
    confirmPassword,
    address,
    city,
    state,
    zipCode,
    latitude,
    longitude
  } = req.body;

  if (!managerName || !labName || !branchCode || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match." });
  }

  try {
    const existing = await Lab.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newLab = new Lab({
      managerName,
      labName,
      branchCode,
      email,
      password: hashed,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude
    });

    await newLab.save();

    const payload = { userId: newLab._id, role: newLab.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      token,
      user: {
        id: newLab._id,
        managerName,
        labName,
        email,
        role: newLab.role
      }
    });
  } catch (err) {
    console.error('Error in lab signup:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Search Labs by Test Name & Distance
exports.searchLabsByTest = async (req, res) => {
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
    console.error('Error searching labs:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get All Labs
exports.getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find().select('-password');
    return res.status(200).json({ labs });
  } catch (err) {
    console.error('Error fetching labs:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};