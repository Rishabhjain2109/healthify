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
    const item = new MedicineInventory({ user: req.userId, name, price, quantity });
    await item.save();
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to add to inventory' });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await MedicineInventory.find({ user: req.userId });
    res.json(inventory);
  } catch {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};



const placeOrder = async (req, res) => {
  try {
    
    const items = await MedicineInventory.find({ user: req.body.userId }).lean();
    console.log("user id",items);
    

    if (!items.length) {
       return res.status(400).json({ error: 'No items to order' });
    }

   
    const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    
    const newOrder = new Order({
      user: req.body.userId,
      items,
      totalCost
    });

    ;
    // console.log('Saving order:', newOrder);
    await newOrder.save();

    // Reduce stock in MedicineList
  for (const item of items) {
    const med = await MedicineList.findOne({ name: item.name });
    if (med) {
      med.stock -= item.quantity;
      if (med.stock <= 0) {
        await MedicineList.deleteOne({ _id: med._id }); // auto delete if out of stock
      } else {
        await med.save();
      }
    }
  }


    
    await MedicineInventory.deleteMany({ user: req.body.userId });

    res.json({ message: 'Order placed successfully'});

  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};



const removeFromInventory = async (req, res) => {
  try {
    const cleanId = req.params.id.trim();
    const userId = req.userId;

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
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
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









module.exports = {
  searchMedicines,
  addToInventory,
  getInventory,
  placeOrder,
  removeFromInventory,
  getOrders,
  addMedicineToList,
  getAllMedicines,
  deleteMedicineFromList
};

