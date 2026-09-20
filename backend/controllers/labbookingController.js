const LabBooking = require('../models/LabBooking');
const Lab = require('../models/Lab');

// Book a lab test
exports.bookLabTest = async (req, res) => {
  try {
    const { labId, testName, price, phone } = req.body;
    const patient = req.user;

    if (!patient.phone && !phone) {
      return res.status(400).json({ message: 'Phone number is required to book a lab test.' });
    }

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const booking = new LabBooking({
      patient: {
        id: patient.id,
        name: patient.fullname,
        email: patient.email,
        phone: patient.phone || phone || ''
      },
      lab: labId,
      testName,
      price,
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    await booking.save();
    return res.status(201).json(booking);
  } catch (err) {
    console.error('Error booking lab test:', err);
    return res.status(500).json({ message: 'Booking failed' });
  }
};

// Upload lab report (PDF only)
exports.uploadReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a PDF report file.' });
    }

    const booking = await LabBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'lab' || booking.lab.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.reportFile = req.file.path;
    booking.status = 'Report Uploaded';
    await booking.save();

    return res.status(200).json({ message: 'Report uploaded', booking });
  } catch (err) {
    console.error('Error uploading report:', err);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

// Get all bookings for patient
exports.getMyBookings = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const bookings = await LabBooking.find({ 'patient.id': req.user.id }).populate('lab');
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error('Error fetching my-bookings:', err);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get all reports for patient
exports.getMyReports = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const reports = await LabBooking.find({
      'patient.id': req.user.id,
      $or: [
        { reportFile: { $ne: '' } },
        { message: { $ne: '' } }
      ]
    }).populate('lab');

    return res.status(200).json({ reports });
  } catch (err) {
    console.error('Error fetching my-reports:', err);
    return res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// Agent updates message/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, message } = req.body;

    const booking = await LabBooking.findById(bookingId);
    console.log('--- Update Status Debug ---');
    console.log('bookingId:', bookingId);
    console.log('req.user.id:', req.user.id);
    console.log('req.user.role:', req.user.role);
    console.log('booking.lab:', booking ? booking.lab : 'Booking not found');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'lab' || booking.lab.toString() !== req.user.id.toString()) {
      console.log('403 Forbidden: Role or lab mismatch');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (status) booking.status = status;
    if (message !== undefined) booking.message = message;

    await booking.save();
    return res.status(200).json({ message: 'Status/message updated', booking });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ message: 'Update failed' });
  }
};

// Get all bookings for lab
exports.getLabBookings = async (req, res) => {
  try {
    if (req.user.role !== 'lab') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const bookings = await LabBooking.find({ lab: req.user.id }).populate('patient');
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error('Error fetching lab bookings:', err);
    return res.status(500).json({ message: 'Failed to fetch lab bookings' });
  }
};