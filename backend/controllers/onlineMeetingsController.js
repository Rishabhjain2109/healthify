const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
// Kept for consistency if referenced elsewhere
const Meeting = require('../models/Meeting');

// Get online appointments/meetings based on user role and ID
exports.getOnlineMeetings = async (req, res) => {
  const { id, role } = req.query;

  if (!id || !role) {
    return res.status(400).json({ message: 'User ID and role are required.' });
  }

  try {
    let onlineAppoint = [];

    if (role === 'patient') {
      const user = await Patient.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      onlineAppoint = user.onlineAppointment || [];
    } else if (role === 'doctor') {
      const user = await Doctor.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      onlineAppoint = user.onlineMeetings || [];
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    return res.status(200).json(onlineAppoint);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Set time for an online meeting by roomId
exports.setOnlineMeetingTime = async (req, res) => {
  const { roomId } = req.params;
  const { time } = req.body;

  if (!time) {
    return res.status(400).json({ message: 'Time is required' });
  }

  try {
    const doctor = await Doctor.findOne({ 'onlineMeetings.roomId': roomId });
    if (!doctor) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const meeting = doctor.onlineMeetings.find((m) => m.roomId === roomId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found in doctor record' });
    }

    meeting.time = time;
    meeting.status = 'Confirmed';
    await doctor.save();

    return res.status(200).json({ updatedMeeting: meeting });
  } catch (error) {
    console.error('Error setting online meeting time:', error);
    return res.status(500).json({ message: 'Server error while setting meeting time' });
  }
};