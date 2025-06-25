const mongoose = require('mongoose');

const LabBookingSchema = new mongoose.Schema({
  patient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  testName: { type: String, required: true },
  price: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'On The Way', 'Test Done', 'Report Uploaded', 'Cancelled'],
    default: 'Pending'
  },
  message: { type: String, default: '' },
  reportFile: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', LabBookingSchema); 