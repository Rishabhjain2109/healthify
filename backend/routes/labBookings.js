const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadReport = require('../middleware/upload');
const {
  bookLabTest,
  uploadReport: uploadReportHandler,
  getMyBookings,
  getMyReports,
  updateBookingStatus,
  getLabBookings
} = require('../controllers/labbookingController');

// Book a lab test
router.post('/book', auth, bookLabTest);

// Upload lab report (only PDF)
router.post('/upload-report/:bookingId', auth, uploadReport.single('report'), uploadReportHandler);

// Get all bookings for patient
router.get('/my-bookings', auth, getMyBookings);

// Get all reports for patient
router.get('/my-reports', auth, getMyReports);

// Agent updates message/status
router.put('/update-status/:bookingId', auth, updateBookingStatus);

// Get all bookings for lab
router.get('/lab-bookings', auth, getLabBookings);

module.exports = router;