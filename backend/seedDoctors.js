const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const specialties = [
  'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic',
  'Pediatrician', 'Psychiatrist', 'Oncologist', 'ENT'
];

function getRandomName() {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Peyton', 'Quinn'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Martinez', 'Lee'];
  return `Dr. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getRandomEmail(i) {
  return `doctor${i}@health.com`;
}

function getRandomSpecialty() {
  return specialties[Math.floor(Math.random() * specialties.length)];
}

function getRandomExperience() {
  return Math.floor(Math.random() * 20) + 1; // 1-20 years
}

async function seedDoctors() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthify';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing doctors
    console.log('Clearing existing doctors...');
    await Doctor.deleteMany({});
    console.log('Existing doctors cleared');

    // Create new doctors
    console.log('Creating new doctors...');
    const doctors = [];
    for (let i = 1; i <= 100; i++) {
      const password = await bcrypt.hash('password123', 10);
      doctors.push({
        fullname: getRandomName(),
        email: getRandomEmail(i),
        password,
        role: 'doctor',
        specialty: getRandomSpecialty()
      });
    }

    // Insert doctors
    console.log('Inserting doctors into database...');
    await Doctor.insertMany(doctors);
    console.log('100 doctors seeded successfully!');

    // Verify the seeding
    const count = await Doctor.countDocuments();
    console.log(`Total doctors in database: ${count}`);

    // Sample of doctors
    const sample = await Doctor.find().limit(3).select('-password');
    console.log('Sample of seeded doctors:', sample.map(d => ({
      fullname: d.fullname,
      specialty: d.specialty,
      experience: d.experience
    })));

  } catch (err) {
    console.error('Error seeding doctors:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
seedDoctors();
