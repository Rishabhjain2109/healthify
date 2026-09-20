const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const OnlineAppointments = require('../models/OnlineAppointments');
const LabBooking = require('../models/LabBooking');
const Lab = require('../models/Lab');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for doctor appointment
exports.createDoctorOrder = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const options = {
      amount: doctor.fees * 100,
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating doctor order:', error);
    return res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Verify payment and book doctor appointment (online/offline)
exports.verifyDoctorPayment = async (req, res) => {
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
      message,
      appointmentType,
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
      return res.status(404).json({ message: 'Doctor not found' });
    }

    let newAppointment;

    if (appointmentType === 'offline') {
      newAppointment = new Appointment({
        doctor: {
          id: doctorId,
          name: doctor.fullname,
          email: doctor.email,
          phone: doctor.phone,
          specialiazation: doctor.specialty,
        },
        patient: {
          id: patientId,
          name,
          email,
          phone,
        },
        message,
        fees: doctor.fees,
        paymentStatus: 'Paid',
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
        status: 'Pending',
      });

      await newAppointment.save();
      await Doctor.findByIdAndUpdate(doctorId, { $push: { appointments: newAppointment._id } });
      await Patient.findByIdAndUpdate(patientId, { $push: { appointments: newAppointment._id } });
    } else {
      newAppointment = new OnlineAppointments({
        doctor: {
          id: doctorId,
          name: doctor.fullname,
          email: doctor.email,
          phone: doctor.phone,
          specialiazation: doctor.specialty,
        },
        patient: {
          id: patientId,
          name,
          email,
          phone,
        },
        roomId: `room_${Date.now()}`,
        status: 'Pending',
        message,
        fees: doctor.fees,
        paymentStatus: 'Paid',
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });

      await newAppointment.save();
      await Doctor.findByIdAndUpdate(doctorId, { $push: { onlineMeetings: newAppointment._id } });
      await Patient.findByIdAndUpdate(patientId, { $push: { onlineAppointment: newAppointment._id } });
    }

    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error verifying doctor payment:', error);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
};

// Create Razorpay order for lab test
exports.createLabOrder = async (req, res) => {
  try {
    const { labId, testName, price } = req.body;

    if (!labId || !testName || !price) {
      return res.status(400).json({ message: 'Missing labId, testName, or price' });
    }

    const options = {
      amount: price * 100,
      currency: 'INR',
      receipt: `receipt_lab_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating lab order:', error);
    return res.status(500).json({ message: 'Server error while creating lab order' });
  }
};

// Verify Razorpay payment for lab test and create booking
exports.verifyLabPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      labId,
      testName,
      price,
      patientId,
      name,
      email,
      phone,
    } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const newBooking = new LabBooking({
      patient: {
        id: patientId,
        name,
        email,
        phone,
      },
      lab: labId,
      testName,
      price,
      paymentStatus: 'Paid',
      status: 'Pending',
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    await newBooking.save();
    await Patient.findByIdAndUpdate(patientId, { $push: { appointments: newBooking._id } });

    return res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error verifying lab payment:', error);
    return res.status(500).json({ message: 'Lab payment verification failed' });
  }
};