const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
// Unused Meeting model kept in case you extend this controller later
const Meeting = require('../models/Meeting');

/**
 * @desc    Create a new online meeting and link it to doctor & patient models
 * @route   POST /api/meetings
 * @access  Private/Public (depends on your middleware setup)
 */
exports.createMeeting = async (req, res) => {
  try {
    const { roomId, patient, doctor, pName, dName } = req.body;

    if (!roomId || !patient || !doctor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Push meeting details to Doctor model
    await Doctor.findByIdAndUpdate(doctor, {
      $push: { onlineMeetings: { roomId, doctor: dName, patient: pName } },
    });

    // Push meeting details to Patient model
    await Patient.findByIdAndUpdate(patient, {
      $push: { onlineAppointment: { roomId, doctor: dName, patient: pName } },
    });

    return res.status(201).json({ message: 'Meeting created successfully' });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};