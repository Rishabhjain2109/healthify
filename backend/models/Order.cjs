const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  totalCost: Number,
  fulfilled: { type: Boolean, default: false }, // ✅ NEW FIELD
  status: {
    type: String,
    enum: ['Order Placed', 'Order Accepted', 'Shipped', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
