const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'doctor' },
  specialty: { 
    type: String,
    required: true
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  ],
  onlineMeetings: [
    {
          doctor: {
            type: String,
            ref: 'Doctor',
          },
          patient: {
            type: String,
            ref: 'Patient',
            required: true,
          },
          roomId: {
            type: String,
            required: true,
          }
        }
  ],
  fees: {type: Number},
  // Location fields for distance filtering
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);