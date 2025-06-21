const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
console.log("Razorpay key:", process.env.RAZORPAY_KEY_ID); // should print your key

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
    try {
        const { doctorId } = req.body;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const options = {
            amount: doctor.fees * 100,
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            doctorId,
            patientId,
            name,
            email,
            phone,
            message
        } = req.body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const newAppointment = new Appointment({
            doctor: doctorId,
            patient: {
                id: patientId,
                name,
                email,
                phone
            },
            message,
            fees: doctor.fees,
            paymentStatus: 'Paid',
            razorpay: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            },
            status: 'Pending'
        });
        
        await newAppointment.save();

        await Doctor.findByIdAndUpdate(doctorId, { $push: { appointments: newAppointment._id } });
        await Patient.findByIdAndUpdate(patientId, { $push: { appointments: newAppointment._id } });
        
        res.status(201).json(newAppointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Payment verification failed" });
    }
});

module.exports = router; 