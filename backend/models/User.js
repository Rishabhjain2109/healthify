const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  specialty:{ 
    type: String,
    required:function(){ return this.role==='doctor';}
   }, // optional for patients

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);