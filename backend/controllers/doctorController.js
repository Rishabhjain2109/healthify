const Doctor = require('../models/Doctor');
const { 
  calculateRealTimeDistance, 
  calculateStraightLineDistance,
  getAddressFromCoordinates,
  getCoordinatesFromAddress
} = require('../utils/googleMaps');

// Keyword-to-specialty mapping
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

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    console.log('Total doctors in database:', doctors.length);
    return res.status(200).json({ doctors });
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Search doctors by keyword, specialty, and distance
exports.searchDoctors = async (req, res) => {
  const query = req.query.q?.toLowerCase();
  const userLat = parseFloat(req.query.lat);
  const userLon = parseFloat(req.query.lon);
  const maxDistance = parseFloat(req.query.distance) || 500; // Default 500km
  const useRealTimeDistance = req.query.realTime === 'true';

  console.log('Search query:', query);
  console.log('User location:', { lat: userLat, lon: userLon });
  console.log('Max distance:', maxDistance, 'km');
  console.log('Use real-time distance:', useRealTimeDistance);

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const matchedSpecialty = keywordToSpecialty[query];
  console.log('Matched specialty:', matchedSpecialty);

  const searchCriteria = {
    role: 'doctor',
    $or: [
      matchedSpecialty ? { specialty: matchedSpecialty } : null,
      { fullname: { $regex: query,$options: 'i' } }
    ].filter(Boolean)
  };

  console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

  try {
    const totalDoctors = await Doctor.countDocuments();
    console.log('Total doctors in database:', totalDoctors);

    let doctors = await Doctor.find(searchCriteria).select('-password');
    console.log('Doctors found before distance filter:', doctors.length);

    if (!isNaN(userLat) && !isNaN(userLon)) {
      const doctorsWithDistance = [];

      for (const doctor of doctors) {
        if (doctor.latitude && doctor.longitude) {
          let distanceInfo = null;

          if (useRealTimeDistance && process.env.GOOGLE_MAPS_API_KEY) {
            distanceInfo = await calculateRealTimeDistance(
              userLat, userLon, 
              doctor.latitude, doctor.longitude
            );
          }

          if (!distanceInfo) {
            const straightLineDistance = calculateStraightLineDistance(
              userLat, userLon, 
              doctor.latitude, doctor.longitude
            );
            distanceInfo = {
              distance: `${straightLineDistance.toFixed(1)} km`,
              distanceValue: straightLineDistance * 1000,
              duration: 'N/A',
              durationValue: 0
            };
          }

          const distanceInKm = distanceInfo.distanceValue / 1000;
          if (distanceInKm <= maxDistance) {
            // Convert to lean JS object to set custom fields dynamically
            const doctorObj = doctor.toObject();
            doctorObj.distance = distanceInfo.distance;
            doctorObj.distanceValue = distanceInfo.distanceValue;
            doctorObj.duration = distanceInfo.duration;
            doctorsWithDistance.push(doctorObj);
          }
        }
      }

      doctors = doctorsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    console.log('Doctors found after distance filter:', doctors.length);

    return res.status(200).json({ 
      doctors,
      total: totalDoctors,
      matched: doctors.length,
      userLocation: userLat && userLon ? { lat: userLat, lon: userLon } : null,
      maxDistance: maxDistance,
      realTimeDistance: useRealTimeDistance
    });
  } catch (err) {
    console.error('Error searching doctors:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add or update doctor location
exports.updateDoctorLocation = async (req, res) => {
  const { id } = req.params;
  const { address, latitude, longitude } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (address && !latitude && !longitude) {
      const coords = await getCoordinatesFromAddress(address);
      if (coords) {
        doctor.latitude = coords.latitude;
        doctor.longitude = coords.longitude;
        doctor.address = coords.formattedAddress;
      }
    } else if (latitude && longitude) {
      doctor.latitude = latitude;
      doctor.longitude = longitude;
      
      if (!doctor.address) {
        const fetchedAddress = await getAddressFromCoordinates(latitude, longitude);
        if (fetchedAddress) {
          doctor.address = fetchedAddress;
        }
      }
    }

    await doctor.save();
    return res.status(200).json({ message: 'Doctor location updated successfully', doctor });
  } catch (err) {
    console.error('Error updating doctor location:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get single doctor by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const doc = await Doctor.findById(id).select('-password');
    if (!doc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json(doc);
  } catch (err) {
    console.error('Error fetching doctor:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};