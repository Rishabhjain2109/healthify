const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
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
    let existing1 = await Doctor.findOne({ email });
    let existing2 = await Patient.findOne({ email });
    if (existing1 || existing2) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // const newUser = new User({ fullname, email, password: hashed, role });

    if(role === 'doctor'){
      const newDoctor = new Doctor({
        fullname,
        email,
        password: hashed,
        specialty,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        address: req.body.address || '',
        city: req.body.city || '',
        state: req.body.state || '',
        zipCode: req.body.zipCode || ''
      })
      console.log(newDoctor);

      await newDoctor.save();

      const payload = { userId: newDoctor._id, role: newDoctor.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ token, user: { id: newDoctor._id, fullname: newDoctor.fullname, email: newDoctor.email, role: newDoctor.role } });
    }else{
      const newPatient = new Patient({
        fullname,
        email,
        password: hashed,
      })
      console.log(newPatient);
      
      await newPatient.save();

      const payload = { userId: newPatient._id, role: newPatient.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ token, user: { id: newPatient._id, fullname: newPatient.fullname, email: newPatient.email, role: newPatient.role } });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    let user;
    
    if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        ...(user.specialty && { specialty: user.specialty }) // Only include if exists
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;