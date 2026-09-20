const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const OnlineAppointments = require('../models/OnlineAppointments');

// Get appointments for logged-in user (handles both online and offline based on query)
exports.getAppointments = async (req, res) => {
    try {
        const { id, role } = req.user;
        const view = req.query.view;

        if (role !== 'patient' && role !== 'doctor') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const AppointmentModel = view === 'online' ? OnlineAppointments : Appointment;
        let appointments;

        if (role === 'patient') {
            appointments = await AppointmentModel.find({ 'patient.id': id }).populate('doctor', 'fullname fees');
        } else if (role === 'doctor') {
            const query = view === 'online' ? { doctor: id } : { 'doctor.id': id };
            appointments = await AppointmentModel.find(query);
        }

        return res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ message: 'Server error while fetching appointments' });
    }
};

// Update appointment time and status (Doctors only)
exports.updateAppointmentTime = async (req, res) => {
    try {
        const { role, id: userId } = req.user;

        // Verify user is a doctor
        if (role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Only doctors can perform this action.' });
        }

        const { time, view } = req.body;
        const appointmentId = req.params.id;

        const AppointmentModel = view === 'offline' ? Appointment : OnlineAppointments;
        const appointment = await AppointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Verify the doctor belongs to this appointment
        const doctorId = appointment.doctor?.id || appointment.doctor;
        if (doctorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this appointment.' });
        }

        appointment.time = time;
        appointment.status = 'Confirmed';

        const updatedAppointment = await appointment.save();

        return res.status(200).json({ 
            message: 'Appointment updated successfully', 
            appointment: updatedAppointment 
        });

    } catch (error) {
        console.error('Error updating appointment time:', error);
        return res.status(500).json({ message: 'Failed to update appointment time.' });
    }
};

// Create a new offline appointment
exports.createAppointment = async (req, res) => {
    try {
        const {
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
        return res.status(201).json(saved);
    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ message: "Failed to book appointment." });
    }
};

// Fetch online appointments specifically
exports.getOnlineAppointments = async (req, res) => {
    try {
        const { id, role } = req.user;
        let appointments;

        if (role === 'patient') {
            appointments = await OnlineAppointments.find({ 'patient.id': id }).populate('doctor', 'fullname fees');
        } else if (role === 'doctor') {
            appointments = await OnlineAppointments.find({ doctor: id });
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching online appointments:', error);
        return res.status(500).json({ message: 'Server error while fetching appointments' });
    }
};