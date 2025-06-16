const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'doctor' },
  specialty: { 
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);