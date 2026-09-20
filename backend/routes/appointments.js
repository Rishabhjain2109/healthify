const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAppointments,
    updateAppointmentTime,
    createAppointment,
    getOnlineAppointments
} = require('../controllers/appointmentController');

// Get appointments for logged-in user
router.get('/', auth, getAppointments);

// Route for doctors to set/update appointment time
router.put('/:id/time', auth, updateAppointmentTime);

// Route to book a new appointment
router.post('/', createAppointment);

// Route to get online appointments specifically
router.get('/online-appointments', auth, getOnlineAppointments);

module.exports = router;