const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const OnlineAppointments = require('../models/OnlineAppointments');

dotenv.config();

// Get appointments for logged-in user (patient or doctor)
router.get('/', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    const view = req.query.view;

    console.log(req.body);
    let appointments;
    
    if(view === 'online'){
        
        if (role === 'patient') {
            // For patients, find appointments where their ID matches and populate doctor's name and fees
            appointments = await OnlineAppointments.find({ 'patient.id': id }).populate('doctor', 'fullname fees');
        } else if (role === 'doctor') {
        // For doctors, find all their appointments
            appointments = await OnlineAppointments.find({ 'doctor.id': id });
        } else {
            // If the role is neither patient nor doctor, deny access
            return res.status(403).json({ message: 'Forbidden' });
        }
    }else{
        if (role === 'patient') {
            // For patients, find appointments where their ID matches and populate doctor's name and fees
            appointments = await Appointment.find({ 'patient.id': id }).populate('doctor', 'fullname fees');
        } else if (role === 'doctor') {
        // For doctors, find all their appointments
            appointments = await Appointment.find({ 'doctor.id': id });
        } else {
            // If the role is neither patient nor doctor, deny access
            return res.status(403).json({ message: 'Forbidden' });
        }
    }
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

// Route for doctors to set/update appointment time
router.put('/:id/time', auth, async (req, res) => {
    // Check if the user is a doctor
    console.log("Doctor yahan hai : ",req.user.role !== 'doctor');
    
    // if (req.user.role !== 'doctor') {
    //     return res.status(403).json({ message: 'Access denied. Only doctors can perform this action.' });
    // }

    try {
        const { time, view } = req.body;
        console.log("Maine log kiya\n",req.body);
        console.log(req.params.id);
        
        const appointmentId = req.params.id;

        // Find the appointment by ID
        let appointment;

        if(view === 'offline'){
            appointment = await Appointment.findById(appointmentId);
        }else{
            appointment = await OnlineAppointments.findById(appointmentId);
            // console.log(OnlineAppointments);
        }

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Verify that the doctor updating the appointment is the one assigned to it
        // if (appointment.doctor.toString() !== req.user.id.toString()) {
        //     return res.status(403).json({ message: 'You are not authorized to update this appointment.' });
        // }

        // Update the appointment time and status
        appointment.time = time;
        appointment.status = 'Confirmed';
        
        const updatedAppointment = await appointment.save();

        res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });

    } catch (error) {
        console.error('Error updating appointment time:', error);
        res.status(500).json({ message: 'Failed to update appointment time.' });
    }
});

router.post('/',async (req,res)=>{
    console.log(req.body);
    try {
        const 
        {
            name,
            email,
            phone,
            message,
            paymentMethod,
            doctorId,
            patientId
        } = req.body;
        
        const newAppointment = new Appointment({
            doctor: doctorId,
            patient: {
                id: patientId,
                name,
                email,
                phone
            },
            message,
            paymentMethod
        });

        await Doctor.findByIdAndUpdate(doctorId, {
            $push: { appointments: newAppointment._id }
        });

        await Patient.findByIdAndUpdate(patientId, {
            $push: { appointments: newAppointment._id }
        });
        const saved = await newAppointment.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to book appointment." });
    }
});

router.get('/online-appointments', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    let appointments;
    if (role === 'patient') {
      // For patients, find appointments where their ID matches and populate doctor's name and fees
      appointments = await OnlineAppointments.find({ 'patient.id': id }).populate('doctor', 'fullname fees');
    } else if (role === 'doctor') {
      // For doctors, find all their appointments
      appointments = await OnlineAppointments.find({ doctor: id });
    } else {
      // If the role is neither patient nor doctor, deny access
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

module.exports = router;

