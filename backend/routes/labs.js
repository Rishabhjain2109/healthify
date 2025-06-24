const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAddressFromCoordinates } = require('../utils/googleMaps');

// Lab signup
router.post('/signup', async (req, res) => {
  const { managerName, labName, branchCode, email, password, confirmPassword, address, city, state, zipCode, latitude, longitude } = req.body;
  if (!managerName || !labName || !branchCode || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match." });
  }
  try {
    let existing = await Lab.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newLab = new Lab({
      managerName, labName, branchCode, email, password: hashed, address, city, state, zipCode, latitude, longitude
    });
    await newLab.save();
    const payload = { userId: newLab._id, role: newLab.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newLab._id, managerName, labName, email, role: newLab.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all labs
router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find().select('-password');
    res.json({ labs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 