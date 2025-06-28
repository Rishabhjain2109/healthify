const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { searchMedicines, addToInventory, getInventory, placeOrder, removeFromInventory, getOrders, addMedicineToList, getAllMedicines, deleteMedicineFromList } = require('../controllers/medicine.controllers.cjs');

const router = express.Router();

router.get('/search', searchMedicines); // public search
router.get('/inventory', authMiddleware, getInventory);
router.post('/inventory', authMiddleware, addToInventory);
router.post('/order', authMiddleware, placeOrder);
router.delete('/inventory/:id', authMiddleware, removeFromInventory);
router.get('/myorders', authMiddleware, getOrders);
router.post('/list', addMedicineToList);      
router.get('/list', getAllMedicines);
router.delete('/list/:id', deleteMedicineFromList); // DELETE /api/medicines/list/:id



module.exports = router;
