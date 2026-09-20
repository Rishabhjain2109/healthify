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

// Get all doctors (with pagination)
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalDoctors = await Doctor.countDocuments({ role: 'doctor' });

    const doctors = await Doctor.find({ role: 'doctor' })
      .select('-password')
      .skip(skip)
      .limit(limit);

    console.log('Total doctors in database:', totalDoctors);

    return res.status(200).json({
      doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDoctors / limit),
        pageSize: doctors.length,
        totalItems: totalDoctors,
        hasNextPage: skip + doctors.length < totalDoctors,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Search doctors by keyword, specialty, and distance (with pagination)
exports.searchDoctors = async (req, res) => {
  const query = req.query.q?.toLowerCase();
  const userLat = parseFloat(req.query.lat);
  const userLon = parseFloat(req.query.lon);
  const maxDistance = parseFloat(req.query.distance) || 500; // Default 500km
  const useRealTimeDistance = req.query.realTime === 'true';

  // Pagination params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  console.log('Search query:', query);
  console.log('User location:', { lat: userLat, lon: userLon });
  console.log('Max distance:', maxDistance, 'km');
  console.log('Page:', page, 'Limit:', limit);

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const matchedSpecialty = keywordToSpecialty[query];
  console.log('Matched specialty:', matchedSpecialty);

  const searchCriteria = {
    role: 'doctor',
    $or: [
      matchedSpecialty ? { specialty: matchedSpecialty } : null,
      { fullname: { $regex: query,$options: 'i' } },
    ].filter(Boolean),
  };

  try {
    const totalDoctors = await Doctor.countDocuments();

    let doctors = await Doctor.find(searchCriteria).select('-password');
    console.log('Doctors found before distance filter:', doctors.length);

    // Filter and sort by distance if user coordinates exist
    if (!isNaN(userLat) && !isNaN(userLon)) {
      const doctorsWithDistance = [];

      for (const doctor of doctors) {
        if (doctor.latitude && doctor.longitude) {
          let distanceInfo = null;

          if (useRealTimeDistance && process.env.GOOGLE_MAPS_API_KEY) {
            distanceInfo = await calculateRealTimeDistance(
              userLat,
              userLon,
              doctor.latitude,
              doctor.longitude
            );
          }

          if (!distanceInfo) {
            const straightLineDistance = calculateStraightLineDistance(
              userLat,
              userLon,
              doctor.latitude,
              doctor.longitude
            );
            distanceInfo = {
              distance: `${straightLineDistance.toFixed(1)} km`,
              distanceValue: straightLineDistance * 1000,
              duration: 'N/A',
              durationValue: 0,
            };
          }

          const distanceInKm = distanceInfo.distanceValue / 1000;
          if (distanceInKm <= maxDistance) {
            const doctorObj = doctor.toObject();
            doctorObj.distance = distanceInfo.distance;
            doctorObj.distanceValue = distanceInfo.distanceValue;
            doctorObj.duration = distanceInfo.duration;
            doctorsWithDistance.push(doctorObj);
          }
        }
      }

      // Sort by nearest distance first
      doctors = doctorsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    const matchedTotal = doctors.length;

    // Slice array for pagination after distance filter/sorting
    const paginatedDoctors = doctors.slice(skip, skip + limit);

    console.log('Doctors returned for page', page, ':', paginatedDoctors.length);

    return res.status(200).json({
      doctors: paginatedDoctors,
      total: totalDoctors,
      matched: matchedTotal,
      userLocation: !isNaN(userLat) && !isNaN(userLon) ? { lat: userLat, lon: userLon } : null,
      maxDistance: maxDistance,
      realTimeDistance: useRealTimeDistance,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(matchedTotal / limit),
        pageSize: paginatedDoctors.length,
        totalItems: matchedTotal,
        hasNextPage: skip + paginatedDoctors.length < matchedTotal,
        hasPrevPage: page > 1,
      },
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