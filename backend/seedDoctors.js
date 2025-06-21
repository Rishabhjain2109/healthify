const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
require('dotenv').config();

// Sample Indian location data for different cities
const sampleLocations = [
  { lat: 19.0760, lon: 72.8777, city: 'Mumbai', state: 'MH', zipCode: '400001' },
  { lat: 28.7041, lon: 77.1025, city: 'Delhi', state: 'DL', zipCode: '110001' },
  { lat: 12.9716, lon: 77.5946, city: 'Bengaluru', state: 'KA', zipCode: '560001' },
  { lat: 17.3850, lon: 78.4867, city: 'Hyderabad', state: 'TG', zipCode: '500001' },
  { lat: 23.0225, lon: 72.5714, city: 'Ahmedabad', state: 'GJ', zipCode: '380001' },
  { lat: 13.0827, lon: 80.2707, city: 'Chennai', state: 'TN', zipCode: '600001' },
  { lat: 22.5726, lon: 88.3639, city: 'Kolkata', state: 'WB', zipCode: '700001' },
  { lat: 18.5204, lon: 73.8567, city: 'Pune', state: 'MH', zipCode: '411001' },
  { lat: 26.9124, lon: 75.7873, city: 'Jaipur', state: 'RJ', zipCode: '302001' },
  { lat: 26.8467, lon: 80.9462, city: 'Lucknow', state: 'UP', zipCode: '226001' },
  { lat: 23.2599, lon: 77.4126, city: 'Bhopal', state: 'MP', zipCode: '462001' },
  { lat: 30.7333, lon: 76.7794, city: 'Chandigarh', state: 'CH', zipCode: '160017' },
  { lat: 9.9312, lon: 76.2673, city: 'Kochi', state: 'KL', zipCode: '682001' },
  { lat: 25.5941, lon: 85.1376, city: 'Patna', state: 'BR', zipCode: '800001' },
  { lat: 22.7196, lon: 75.8577, city: 'Indore', state: 'MP', zipCode: '452001' },
  { lat: 21.1702, lon: 72.8311, city: 'Surat', state: 'GJ', zipCode: '395003' },
  { lat: 26.4499, lon: 80.3319, city: 'Kanpur', state: 'UP', zipCode: '208001' },
  { lat: 21.1458, lon: 79.0882, city: 'Nagpur', state: 'MH', zipCode: '440001' },
  { lat: 17.6868, lon: 83.2185, city: 'Visakhapatnam', state: 'AP', zipCode: '530001' },
  { lat: 22.3072, lon: 73.1812, city: 'Vadodara', state: 'GJ', zipCode: '390001' },
];

const specialties = [
  'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician',
  'Psychiatrist', 'Oncologist', 'ENT'
];

const getRandomFee = () => Math.floor(Math.random() * 801) + 200; // 200 to 1000
const getRandomSpecialty = () => specialties[Math.floor(Math.random() * specialties.length)];

// Generate doctors with Indian locations and random fees
const doctors = sampleLocations.map((loc, idx) => ({
  fullname: `Dr. ${['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Neha', 'Suresh', 'Pooja', 'Arjun', 'Meera', 'Karan', 'Divya', 'Manish'][idx % 15]} ${['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Das', 'Kumar', 'Jain', 'Joshi', 'Chopra', 'Kapoor', 'Bose', 'Mehta'][idx % 15]}`,
  email: `doctor${idx + 1}@healthify.com`,
  password: 'password123',
  specialty: getRandomSpecialty(),
  address: `${Math.floor(Math.random() * 1000) + 1} Clinic Road, ${loc.city}, ${loc.state} ${loc.zipCode}`,
  city: loc.city,
  state: loc.state,
  zipCode: loc.zipCode,
  latitude: loc.lat,
  longitude: loc.lon,
  fees: getRandomFee()
}));

async function seedDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Hash passwords and create doctors
    const hashedDoctors = await Promise.all(
      doctors.map(async (doctor) => ({
        ...doctor,
        password: await bcrypt.hash(doctor.password, 10)
      }))
    );

    // Insert doctors
    const result = await Doctor.insertMany(hashedDoctors);
    console.log(`Seeded ${result.length} doctors with Indian location data and random fees`);

    // Display sample doctors with their locations and fees
    console.log('\nSample doctors with locations and fees:');
    result.forEach(doctor => {
      console.log(`${doctor.fullname} - ${doctor.specialty} - ${doctor.address} (${doctor.latitude}, ${doctor.longitude}) - Fee: ₹${doctor.fees}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
