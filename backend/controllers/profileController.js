const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Lab = require('../models/Lab');

// Helper to select model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'doctor':
      return Doctor;
    case 'patient':
      return Patient;
    case 'lab':
      return Lab;
    default:
      return null;
  }
};

// Get current user profile (Doctor, Patient, or Lab)
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (!id || !role) {
      return res.status(400).json({ error: 'Invalid user information' });
    }

    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const user = await Model.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
};

// Update user profile (Doctor or Patient)
exports.updateProfile = async (req, res) => {
  const { id, role } = req.user;
  const { currentPassword, ...updateData } = req.body;

  try {
    const Model = getModelByRole(role);
    if (!Model || role === 'lab') {
      return res.status(400).json({ error: 'Invalid role for general update' });
    }

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

    // Check unique email availability
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await Model.findOne({ email: updateData.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Hash new password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove undefined or null attributes
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    if (role === 'doctor' && !updateData.specialty) {
      delete updateData.specialty;
    }

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
};

// Update doctor fee
exports.updateDoctorFee = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Only doctors can update fees.' });
  }

  try {
    const { fees } = req.body;
    if (fees === undefined || fees === null) {
      return res.status(400).json({ error: 'Fee amount is required.' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { $set: { fees: Number(fees) } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    return res.status(200).json({
      message: 'Fee updated successfully',
      user: updatedDoctor,
    });
  } catch (err) {
    console.error('Error updating fee:', err);
    return res.status(500).json({ error: 'Server error updating fee' });
  }
};

// Get current lab profile
exports.getLabProfile = async (req, res) => {
  if (req.user.role !== 'lab') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const lab = await Lab.findById(req.user.id).select('-password');
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    return res.status(200).json(lab);
  } catch (err) {
    console.error('Error fetching lab profile:', err);
    return res.status(500).json({ error: 'Server error fetching lab profile' });
  }
};

// Update lab profile
exports.updateLabProfile = async (req, res) => {
  if (req.user.role !== 'lab') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const updateData = { ...req.body };
    delete updateData.password;

    const updatedLab = await Lab.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedLab) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    return res.status(200).json({
      message: 'Lab profile updated successfully',
      lab: updatedLab,
    });
  } catch (err) {
    console.error('Error updating lab profile:', err);
    return res.status(500).json({ error: 'Server error updating lab profile' });
  }
};