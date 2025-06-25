const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient')


router.post('/',async (req,res)=>{
    try {
        console.log(req.body);
        
        const {roomId , patient, doctor, pName, dName} = req.body;
    
        if(!roomId || !patient || !doctor){
            return res.status(400).json({message: "Missing required fields"});
        }

        await Doctor.findByIdAndUpdate(doctor,{
            $push:  {onlineMeetings: {roomId,doctor:dName,patient:pName}}
        });

        await Patient.findByIdAndUpdate(patient,{
            $push: {onlineAppointment: {roomId,doctor:dName,patient:pName}}
        });
    
        res.status(201).json({message:"Meeting created successfully"});
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;