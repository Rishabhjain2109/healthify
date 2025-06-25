const express = require('express');
const router = express.Router();
const LabBooking = require('../models/LabBooking');
const Lab = require('../models/Lab');
const LabTest = require('../models/LabTest');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Book a lab test
router.post('/book', auth, async (req, res) => {
  try {
    const { labId, testName, price, phone } = req.body;
    const patient = req.user;
    if (!patient.phone && !phone) {
      return res.status(400).json({ message: 'Phone number is required to book a lab test.' });
    }
    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
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
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed' });
  }
});

// Upload lab report -- only pdf 
router.post('/upload-report/:bookingId', auth, upload.single('report'), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await LabBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'lab' || booking.lab.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    booking.reportFile = req.file.path;
    booking.status = 'Report Uploaded';
    await booking.save();
    res.json({ message: 'Report uploaded', booking });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get all bookings for patient
router.get('/my-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Forbidden' });
    const bookings = await LabBooking.find({ 'patient.id': req.user.id }).populate('lab');
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching my-bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get all reports for patient
router.get('/my-reports', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Forbidden' });
    const reports = await LabBooking.find({
      'patient.id': req.user.id,
      $or: [
        { reportFile: { $ne: '' } },
        { message: { $ne: '' } }
      ]
    }).populate('lab');
    res.json({ reports });
  } catch (err) {
    console.error('Error fetching my-reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Agent updates message/status
router.put('/update-status/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, message } = req.body;
    const booking = await LabBooking.findById(bookingId);
    console.log('--- Update Status Debug ---');
    console.log('bookingId:', bookingId);
    console.log('req.user.id:', req.user.id);
    console.log('req.user.role:', req.user.role);
    console.log('booking.lab:', booking ? booking.lab : 'Booking not found');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'lab' || booking.lab.toString() !== req.user.id.toString()) {
      console.log('403 Forbidden: Role or lab mismatch');
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (status) booking.status = status;
    if (message !== undefined) booking.message = message;
    await booking.save();
    res.json({ message: 'Status/message updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Get all bookings for lab
router.get('/lab-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab') return res.status(403).json({ message: 'Forbidden' });
    const bookings = await LabBooking.find({ lab: req.user.id }).populate('patient');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lab bookings' });
  }
});

module.exports = router; 