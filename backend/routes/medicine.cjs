const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { searchMedicines, addToInventory, getInventory, placeOrder, removeFromInventory, getOrders, addMedicineToList, getAllMedicines, deleteMedicineFromList, getPendingOrders, fulfillOrder, updateOrderStatus, getAllOrders, createPaymentOrder,verifyAndPlaceOrder} = require('../controllers/medicine.controllers.cjs');

const router = express.Router();

router.get('/search', searchMedicines); // public search
router.get('/inventory1', authMiddleware, getInventory);
router.post('/inventory', authMiddleware, addToInventory);
router.post('/order', authMiddleware, placeOrder);
router.delete('/inventory/:id', authMiddleware, removeFromInventory);
router.get('/myorders', authMiddleware, getOrders);
router.post('/list', addMedicineToList);      
router.get('/list', getAllMedicines);
router.delete('/list/:id', deleteMedicineFromList); // DELETE /api/medicines/list/:id


router.get('/pending-orders', getPendingOrders);  // ✅ New route
router.put('/orders/:id/fulfill', fulfillOrder); // ✅ Add this line at the bottom
router.patch('/order/:id/status', updateOrderStatus);
router.get('/order/all', getAllOrders);


//payment
router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment-order', authMiddleware, verifyAndPlaceOrder);




module.exports = router;
