const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

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

async function seedDoctors() {
  await mongoose.connect('mongodb+srv://healthify:K4NnGWZiwvcXBm5D@cluster0.jbx8jbu.mongodb.net/healthify?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const doctors = [];
  for (let i = 1; i <= 100; i++) {
    const password = await bcrypt.hash('password123', 10);
    doctors.push({
      fullname: getRandomName(),
      email: getRandomEmail(i),
      password,
      role: 'doctor',
      specialty: getRandomSpecialty(),
    });
  }

  await User.insertMany(doctors);
  console.log('100 fake doctors seeded!');
  mongoose.disconnect();
}

seedDoctors().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
