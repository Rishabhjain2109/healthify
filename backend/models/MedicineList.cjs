
const mongoose = require('mongoose');


const medicineListSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: { type: Number, default: 0 }

});

module.exports = mongoose.model('MedicineList', medicineListSchema);