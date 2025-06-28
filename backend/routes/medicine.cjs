const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { searchMedicines, addToInventory, getInventory, placeOrder, removeFromInventory } = require('../controllers/medicine.controllers.cjs');

const router = express.Router();

router.get('/search', searchMedicines); // public search
router.get('/inventory', authMiddleware, getInventory);
router.post('/inventory', authMiddleware, addToInventory);
router.post('/order', authMiddleware, placeOrder);
router.delete('/inventory/:id', authMiddleware, removeFromInventory);


module.exports = router;
