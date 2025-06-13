const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Signup route
router.post('/signup', async (req, res) => {
  console.log('Received signup body:', req.body);
  console.log('Specialty received:', req.body.specialty);

  const { fullname, email, password, confirmPassword, role, specialty } = req.body;


  if (!fullname || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (role === 'doctor' && !specialty) {
    return res.status(400).json({ message: 'Specialty is required for doctors.' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match." });
  }

  try {
    // Check if user exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // const newUser = new User({ fullname, email, password: hashed, role });
    const newUser = new User({ 
      fullname,
      email,
      password: hashed,
      role,
      specialty: role === 'doctor' ? specialty : undefined
    });
    
    

    await newUser.save();

    const payload = { userId: newUser._id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: newUser._id, fullname: newUser.fullname, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        fullname: user.fullname, 
        email: user.email, 
        role: user.role,
        specialty: user.specialty 
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;