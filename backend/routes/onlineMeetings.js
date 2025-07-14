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

// Add route to set time for an online meeting by roomId
router.put('/setonlinemeetingtime/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { time } = req.body;
    try {
        // Find the doctor who has this meeting
        const doctor = await Doctor.findOne({ 'onlineMeetings.roomId': roomId });
        if (!doctor) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        // Update the time for the correct meeting
        const meeting = doctor.onlineMeetings.find(m => m.roomId === roomId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found in doctor record' });
        }
        meeting.time = time;
        meeting.status = 'Confirmed';
        await doctor.save();
        res.json({ updatedMeeting: meeting });
    } catch (error) {
        console.error('Error setting online meeting time:', error);
        res.status(500).json({ message: 'Server error while setting meeting time' });
    }
});

module.exports = router