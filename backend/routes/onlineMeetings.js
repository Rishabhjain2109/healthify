const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

router.get('/',async (req,res)=>{
    const { id, role } = req.query;
    console.log(req.query);
    
    try {
        let onlineAppoint;
    
        if(role === 'patient'){
            const user = await Patient.findById(id);
            console.log(user);
            onlineAppoint = user.onlineAppointment;
        }else if(role === 'doctor'){
            const user = await Doctor.findById(id);
            console.log(user);
            
            onlineAppoint = user.onlineMeetings;
        }
        console.log(onlineAppoint);
        
        res.json(onlineAppoint);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error while fetching appointments' });
    }
});

module.exports = router