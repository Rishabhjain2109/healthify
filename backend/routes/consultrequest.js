const express = require('express');
const router = express.Router();
const { createMeeting } = require('../controllers/consultrequestController');

// Create a new meeting
router.post('/', createMeeting);

module.exports = router;