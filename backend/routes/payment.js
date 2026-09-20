const express = require('express');
const router = express.Router();
const {
  createDoctorOrder,
  verifyDoctorPayment,
  createLabOrder,
  verifyLabPayment,
} = require('../controllers/paymentController');

// Doctor appointment payments
router.post('/create-order', createDoctorOrder);
router.post('/verify-payment', verifyDoctorPayment);

// Lab test payments
router.post('/create-lab-order', createLabOrder);
router.post('/verify-lab-payment', verifyLabPayment);

module.exports = router;