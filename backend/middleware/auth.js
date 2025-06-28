const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Lab = require('../models/Lab');


module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Fetch user from DB
    let user;
    if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.userId);
    } else if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.userId);
    } else if (decoded.role === 'lab') {
      user = await Lab.findById(decoded.userId);
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach all relevant fields to req.user
    req.user = {
      id: user._id,
      role: user.role,
      fullname: user.fullname || user.managerName || '',
      email: user.email
    };
    if (user.role === 'lab') {
      req.user.labName = user.labName;
      req.user.managerName = user.managerName;
    }
    console.log('User info added to request:', req.user);
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Token is not valid' });
  }
};
