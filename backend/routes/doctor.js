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

// Get all doctors (for testing)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    console.log('Total doctors in database:', doctors.length);
    res.json({ doctors });
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  console.log('Search query:', query);

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const matchedSpecialty = keywordToSpecialty[query];
  console.log('Matched specialty:', matchedSpecialty);

  // Build search criteria
  const searchCriteria = {
    role: 'doctor',
    $or: [
      matchedSpecialty ? { specialty: matchedSpecialty } : null,
      { fullname: { $regex: query, $options: 'i' } }
    ].filter(Boolean)
  };

  console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

  try {
    // First, get total count of doctors
    const totalDoctors = await Doctor.countDocuments();
    console.log('Total doctors in database:', totalDoctors);

    // Then perform the search
    const doctors = await Doctor.find(searchCriteria).select('-password');
    console.log('Doctors found:', doctors.length);
    console.log('First doctor found:', doctors[0] ? {
      fullname: doctors[0].fullname,
      specialty: doctors[0].specialty
    } : 'No doctors found');

    res.json({ 
      doctors,
      total: totalDoctors,
      matched: doctors.length
    });
  } catch (err) {
    console.error('Error searching doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id',async (req,res)=>{
  const {id} = req.params;
  
  try {
    const doc = await Doctor.findById(id);
    console.log("doc");
    if(!doc){
      return res.status(404).json({message:'Doctor not found'});
    }

    res.json(doc);

  } catch (err) {
    console.error('error fetching doctor',err);
    res.status(500).json({message:'Server error'});
  }
});


module.exports = router;
