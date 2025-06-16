// backend/routes/profile.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/auth'); // we'll create this
const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('Profile request received. User:', req.user);
    const { id, role } = req.user;
    
    if (!id || !role) {
      console.error('Missing user ID or role:', req.user);
      return res.status(400).json({ error: 'Invalid user information' });
    }

    const Model = role === 'doctor' ? Doctor : Patient;
    console.log('Looking up user with ID:', id);
    
    const user = await Model.findById(id).select('-password');
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/update', authMiddleware, async (req, res) => {
  const { id, role } = req.user;
  const { currentPassword, ...updateData } = req.body;

  try {
    const Model = role === 'doctor' ? Doctor : Patient;
    const user = await Model.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

// Require current password
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to update profile' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

// If email is being updated and is different from current, check if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await Model.findOne({ email: updateData.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

// Handle password update separately
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

// Remove any undefined or null values from updateData
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

// For doctors, ensure specialty is only updated if provided
    if (role === 'doctor' && !updateData.specialty) {
      delete updateData.specialty;
    }

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
