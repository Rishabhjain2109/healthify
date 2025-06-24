const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  labs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  }]
}, { timestamps: true });

module.exports = mongoose.model('LabTest', LabTestSchema); 