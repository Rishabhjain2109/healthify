const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Simple keyword to specialty mapping
const keywordToSpecialty = {
  heart: 'Cardiologist',
  brain: 'Neurologist',
  skin: 'Dermatologist',
  bones: 'Orthopedic',
  child: 'Pediatrician',
  mind: 'Psychiatrist',
  cancer: 'Oncologist',
  ear: 'ENT',
  nose: 'ENT',
  throat: 'ENT'
};

router.get('/search', async (req, res) => {
  const query = req.query.q?.toLowerCase();

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const matchedSpecialty = keywordToSpecialty[query];

  // Build search criteria
  const searchCriteria = {
    role: 'doctor',
    $or: [
      matchedSpecialty ? { specialty: matchedSpecialty } : null,
      { fullname: { $regex: query, $options: 'i' } }
    ].filter(Boolean)
  };

  console.log('Doctor search criteria:', JSON.stringify(searchCriteria, null, 2));

  try {
    const doctors = await Doctor.find(searchCriteria).select('-password');
    console.log('Doctors found:', doctors.length);
    res.json({ doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
