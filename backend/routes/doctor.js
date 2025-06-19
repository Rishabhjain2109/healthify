const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { 
  calculateRealTimeDistance, 
  calculateStraightLineDistance,
  getAddressFromCoordinates 
} = require('../utils/googleMaps');

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
  const userLat = parseFloat(req.query.lat);
  const userLon = parseFloat(req.query.lon);
  const maxDistance = parseFloat(req.query.distance) || 50; // Default 50km
  const useRealTimeDistance = req.query.realTime === 'true'; // Only toggle
  
  console.log('Search query:', query);
  console.log('User location:', { lat: userLat, lon: userLon });
  console.log('Max distance:', maxDistance, 'km');
  console.log('Use real-time distance:', useRealTimeDistance);

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
    let doctors = await Doctor.find(searchCriteria).select('-password');
    console.log('Doctors found before distance filter:', doctors.length);

    // Apply distance filtering if user location is provided
    if (userLat && userLon && !isNaN(userLat) && !isNaN(userLon)) {
      const doctorsWithDistance = [];

      for (const doctor of doctors) {
        if (doctor.latitude && doctor.longitude) {
          let distanceInfo = null;

          if (useRealTimeDistance && process.env.GOOGLE_MAPS_API_KEY) {
            // Use Google Maps API for real-time distance
            distanceInfo = await calculateRealTimeDistance(
              userLat, userLon, 
              doctor.latitude, doctor.longitude
            );
          }

          if (!distanceInfo) {
            // Fallback to straight-line distance
            const straightLineDistance = calculateStraightLineDistance(
              userLat, userLon, 
              doctor.latitude, doctor.longitude
            );
            distanceInfo = {
              distance: `${straightLineDistance.toFixed(1)} km`,
              distanceValue: straightLineDistance * 1000, // Convert to meters
              duration: 'N/A',
              durationValue: 0
            };
          }

          // Check if doctor is within max distance
          const distanceInKm = distanceInfo.distanceValue / 1000;
          if (distanceInKm <= maxDistance) {
            doctor.distance = distanceInfo.distance;
            doctor.distanceValue = distanceInfo.distanceValue;
            doctor.duration = distanceInfo.duration;
            doctorsWithDistance.push(doctor);
          }
        }
      }

      // Always sort by distanceValue (closest first)
      doctors = doctorsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    console.log('Doctors found after distance filter:', doctors.length);

    res.json({ 
      doctors,
      total: totalDoctors,
      matched: doctors.length,
      userLocation: userLat && userLon ? { lat: userLat, lon: userLon } : null,
      maxDistance: maxDistance,
      realTimeDistance: useRealTimeDistance
    });
  } catch (err) {
    console.error('Error searching doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to add/update doctor location
router.post('/:id/location', async (req, res) => {
  const { id } = req.params;
  const { address, latitude, longitude } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // If address is provided, geocode it to get coordinates
    if (address && !latitude && !longitude) {
      const { getCoordinatesFromAddress } = require('../utils/googleMaps');
      const coords = await getCoordinatesFromAddress(address);
      if (coords) {
        doctor.latitude = coords.latitude;
        doctor.longitude = coords.longitude;
        doctor.address = coords.formattedAddress;
      }
    } else if (latitude && longitude) {
      // If coordinates are provided, reverse geocode to get address
      doctor.latitude = latitude;
      doctor.longitude = longitude;
      
      if (!doctor.address) {
        const { getAddressFromCoordinates } = require('../utils/googleMaps');
        const address = await getAddressFromCoordinates(latitude, longitude);
        if (address) {
          doctor.address = address;
        }
      }
    }

    await doctor.save();
    res.json({ message: 'Doctor location updated successfully', doctor });
  } catch (err) {
    console.error('Error updating doctor location:', err);
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
