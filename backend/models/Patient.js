const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default:'patient' }

}, { timestamps: true });

module.exports = mongoose.model('PatientSchema', PatientSchema);