const express = require('express');
const router = express.Router()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor')

dotenv.config();


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
})

module.exports = router;

