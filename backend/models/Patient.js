const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  ],
  onlineAppointment: [
    {
      doctor: {
        type: String,
        ref: 'Doctor',
        required: true,
      },
      patient: {
        type: String,
        ref: 'Patient',
      },
      roomId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
      },
      
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);