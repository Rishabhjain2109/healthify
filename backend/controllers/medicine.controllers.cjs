//import axios from 'axios';
// import MedicineInventory from '../models/Medicine.js';

// export const searchMedicines = async (req, res) => {
//   const { name } = req.query;
//   try {
//     const { data } = await axios.get(`https://api.example.com/medicines?search=${name}`);
//     res.json(data);
//   } catch {
//     res.status(500).json({ error: 'Failed to fetch medicines' });
//   }
// };

// const MedicineInventory = require('../models/Medicine.js');
// const MedicineList = require('../models/MedicineList.js');


// export const searchMedicines = async (req, res) => {
//   const { name } = req.query;
//   try {
//     const query = name
//       ? { name: { $regex: new RegExp(name, 'i') } }
//       : {};

//     const results = await MedicineList.find(query).limit(20);
//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch medicines from internal list' });
//   }
// };




// export const addToInventory = async (req, res) => {
//   const { name, price, quantity } = req.body;
//   try {
//     const item = new MedicineInventory({ user: req.userId, name, price, quantity });
//     await item.save();
//     res.json(item);
//   } catch {
//     res.status(500).json({ error: 'Failed to add to inventory' });
//   }
// };

// export const getInventory = async (req, res) => {
//   const inventory = await MedicineInventory.find({ user: req.userId });
//   res.json(inventory);
// };

// export const placeOrder = async (req, res) => {
//   // Simulate ordering logic
//   await MedicineInventory.deleteMany({ user: req.userId });
//   res.json({ message: 'Order placed successfully' });
// };



const MedicineInventory = require('../models/Medicine.cjs');
const MedicineList = require('../models/MedicineList.cjs');
const Order = require('../models/Order.cjs');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const searchMedicines = async (req, res) => {
  const { name } = req.query;
  try {
    const query = name
      ? { name: { $regex: new RegExp(name, 'i') } }
      : {};

    const results = await MedicineList.find(query).limit(20);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines from internal list' });
  }
};

const addToInventory = async (req, res) => {
  const { name, price, quantity } = req.body;
  
  try {
    const item = new MedicineInventory({ user: req.user.id, name, price, quantity });
    await item.save();
    console.log("Yaha",item);
    
    res.json(item);
  } catch {
    // console.log("Galat");
    
    res.status(500).json({ error: 'Failed to add to inventory' });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await MedicineInventory.find({ user: req.user.id });
    // console.log("Here",inventory);
    
    res.json(inventory);
  } catch {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};



// const placeOrder = async (req, res) => {
//   try {
//     //  Use authenticated user ID from middleware
//     const items = await MedicineInventory.find({ user: req.userId }).lean();

//     if (!items.length) {
//       return res.status(400).json({ error: 'No items to order' });
//     }

//     const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

//     console.log('items:', items);
//     console.log('totalCost:', totalCost);
//     console.log('Creating new order...');
//     const newOrder = new Order({
//       user: req.userId,
//       items,
//       totalCost
//     });
//     console.log('Saving order...');
//     await newOrder.save();
//     console.log('Order saved');


//     //  Update stock in MedicineList
//     for (const item of items) {
//       const med = await MedicineList.findOne({ name: item.name });
//       if (med) {
//         med.stock -= item.quantity;
//         if (med.stock <= 0) {
//           await MedicineList.deleteOne({ _id: med._id }); // Auto-delete if out of stock
//         } else {
//           await med.save();
//         }
//       }
//     }

//     //  Clear user cart
//     await MedicineInventory.deleteMany({ user: req.userId });

//     res.json({ message: 'Order placed successfully' });
//   } catch (err) {
//     console.error('Place order error:', err);
//     res.status(500).json({ error: 'Failed to place order', details: err.message});
//   }
// };

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("idhar hai",req.user.id);
    
    const items = await MedicineInventory.find({ user: userId });
    if (!items.length) return res.status(400).json({ error: 'No items to order' });

    const totalCost = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder = await Order.create({
      user: userId,
      items,
      totalCost,
      status: 'Order Placed'
    });

    await MedicineInventory.deleteMany({ user: userId });

    res.json({ message: 'Order created', order: newOrder });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed placing order', details: err.message });
  }
};


const removeFromInventory = async (req, res) => {
  try {
    const cleanId = req.params.id.trim();
    const userId = req.user.id;

    const item = await MedicineInventory.findOneAndDelete({
      _id: cleanId,
      user: userId
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to remove item', details: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};


//For adding medicines from Admin
const addMedicineToList = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !description || !price || !stock) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMed = new MedicineList({ name, description, price, stock });
    await newMed.save();

    res.json({ message: 'Medicine added to list', medicine: newMed });
  } catch (err) {
    console.error('Add medicine error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const medicines = await MedicineList.find();
    res.json(medicines);
  } catch {
    res.status(500).json({ error: 'Failed to fetch medicine list' });
  }
};


const deleteMedicineFromList = async (req, res) => {
  try {
    await MedicineList.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine removed from list' });
  } catch {
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
};



// Get all unfulfilled orders (for Admin Panel)
const getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ fulfilled: false }).sort({ createdAt: -1 });
    res.json(pendingOrders);
  } catch (err) {
    console.error('Admin fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};


const fulfillOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.fulfilled) {
      return res.status(400).json({ error: 'Order already fulfilled' });
    }

    for (const item of order.items) {
      const med = await MedicineList.findOne({ name: item.name });

      if (!med) {
        console.log(`Medicine not found: ${item.name}`);
        continue;
      }

      if (med.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }

      med.stock -= item.quantity;
      await med.save();
    }

    order.fulfilled = true;
    await order.save();

    res.json({ message: 'Order fulfilled successfully' });
  } catch (err) {
    console.error('Fulfill order error:', err);
    res.status(500).json({ error: 'Failed to fulfill order', details: err.message });
  }
};



const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only deduct stock if accepting for the first time
    if (status === 'Order Accepted' && !order.fulfilled) {
      for (const item of order.items) {
        const med = await MedicineList.findOne({ name: item.name });

        if (med) {
          med.stock -= item.quantity;

          // Don't delete medicine, just set stock = 0
          if (med.stock <= 0) {
            med.stock = 0;
          }

          await med.save(); // <- ensure this is here
        }
      }

      order.fulfilled = true;
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('Stock deduction error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};



const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const createPaymentOrder = async (req, res) => {
  try {
    const items = await MedicineInventory.find({ user: req.user.id }).lean();
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100; // convert to paise

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await instance.orders.create({
      amount: totalCost,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json(order);
  } catch (err) {
    console.error('Payment order creation failed:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};


const verifyAndPlaceOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                                    .update(body.toString())
                                    .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const items = await MedicineInventory.find({ user: req.user.id }).lean();
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      user: req.user.id,
      items,
      totalCost,
      fulfilled: false,
      status: 'Order Placed'
    });

    await newOrder.save();
    await MedicineInventory.deleteMany({ user: req.user.id });

    res.json({ message: 'Order placed after successful payment' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Order failed after payment' });
  }
};











module.exports = {
  searchMedicines,
  addToInventory,
  getInventory,
  placeOrder,
  removeFromInventory,
  getOrders,
  addMedicineToList,
  getAllMedicines,
  deleteMedicineFromList,
  getPendingOrders,
  fulfillOrder,
  updateOrderStatus, 
  getAllOrders,
  createPaymentOrder,
  verifyAndPlaceOrder

};

