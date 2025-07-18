const mongoose = require('mongoose');

const onlineAppointmentSchema = new mongoose.Schema({
    doctor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
          },
          name: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String },
          specialiazation: {type: String}
      },
      patient: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
          },
          name: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String, required: true }
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
      message: {
        type: String,
        default: ''
      },
      fees: {
        type: Number,
        required: true
      },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
      },
      razorpay: {
        orderId: String,
        paymentId: String,
        signature: String
      },
      time: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
}, {timestamps:true});

module.exports = mongoose.model('OnlineAppointments',onlineAppointmentSchema)