
const mongoose = require('mongoose');


const medicineListSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

module.exports = mongoose.model('MedicineList', medicineListSchema);