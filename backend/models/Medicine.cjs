const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  name: String,
  price: Number,
  quantity: Number,
});


module.exports = mongoose.model('MedicineInventory', medicineSchema);