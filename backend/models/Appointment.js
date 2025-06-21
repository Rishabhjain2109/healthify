// models/Appointment.js

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
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
  message: {
    type: String,
    default: ''
  },
  fees: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  time: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
