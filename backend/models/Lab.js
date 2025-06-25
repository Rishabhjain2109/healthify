const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
  managerName: { type: String, required: true, trim: true },
  labName: { type: String, required: true, trim: true },
  branchCode: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'lab' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Lab', LabSchema); 