const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const profileRoutes = require('./routes/profile');
const labRoutes = require('./routes/labs');
const labTestRoutes = require('./routes/labTests');
const labBookingRoutes = require('./routes/labBookings');
require('dotenv').config({ path: './.env' });
const medicineRoutes = require('./routes/medicine.cjs');



connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctor'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/profile', profileRoutes);
app.use('/api/utils', require('./routes/utils'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/labs', labRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/lab-bookings', labBookingRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/consult-request',require('./routes/consultrequest'));
app.use('/api/getonlinemeetings',require('./routes/onlineMeetings'));
app.use('/api/medicines', medicineRoutes);
app.get('/', (req, res) => {
  res.send('Healthify Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));