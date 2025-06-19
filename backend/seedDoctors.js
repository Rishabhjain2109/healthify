const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
require('dotenv').config();

// Sample location data for different cities
const sampleLocations = [
  { lat: 40.7128, lon: -74.0060, city: 'New York', state: 'NY' }, // NYC
  { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', state: 'CA' }, // LA
  { lat: 41.8781, lon: -87.6298, city: 'Chicago', state: 'IL' }, // Chicago
  { lat: 29.7604, lon: -95.3698, city: 'Houston', state: 'TX' }, // Houston
  { lat: 33.4484, lon: -112.0740, city: 'Phoenix', state: 'AZ' }, // Phoenix
  { lat: 39.7392, lon: -104.9903, city: 'Denver', state: 'CO' }, // Denver
  { lat: 25.7617, lon: -80.1918, city: 'Miami', state: 'FL' }, // Miami
  { lat: 47.6062, lon: -122.3321, city: 'Seattle', state: 'WA' }, // Seattle
  { lat: 37.7749, lon: -122.4194, city: 'San Francisco', state: 'CA' }, // SF
  { lat: 32.7767, lon: -96.7970, city: 'Dallas', state: 'TX' }, // Dallas
];

const doctors = [
  {
    fullname: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthify.com',
    password: 'password123',
    specialty: 'Cardiologist',
    address: '123 Heart Street, New York, NY 10001',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    fullname: 'Dr. Michael Chen',
    email: 'michael.chen@healthify.com',
    password: 'password123',
    specialty: 'Neurologist',
    address: '456 Brain Avenue, Los Angeles, CA 90210',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    fullname: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@healthify.com',
    password: 'password123',
    specialty: 'Dermatologist',
    address: '789 Skin Road, Chicago, IL 60601',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    latitude: 41.8781,
    longitude: -87.6298
  },
  {
    fullname: 'Dr. David Kim',
    email: 'david.kim@healthify.com',
    password: 'password123',
    specialty: 'Orthopedic',
    address: '321 Bone Boulevard, Houston, TX 77001',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    latitude: 29.7604,
    longitude: -95.3698
  },
  {
    fullname: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@healthify.com',
    password: 'password123',
    specialty: 'Pediatrician',
    address: '654 Child Lane, Phoenix, AZ 85001',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    latitude: 33.4484,
    longitude: -112.0740
  },
  {
    fullname: 'Dr. Robert Wilson',
    email: 'robert.wilson@healthify.com',
    password: 'password123',
    specialty: 'Psychiatrist',
    address: '987 Mind Street, Denver, CO 80201',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    latitude: 39.7392,
    longitude: -104.9903
  },
  {
    fullname: 'Dr. Maria Garcia',
    email: 'maria.garcia@healthify.com',
    password: 'password123',
    specialty: 'Oncologist',
    address: '147 Cancer Court, Miami, FL 33101',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    latitude: 25.7617,
    longitude: -80.1918
  },
  {
    fullname: 'Dr. James Brown',
    email: 'james.brown@healthify.com',
    password: 'password123',
    specialty: 'ENT',
    address: '258 Ear Avenue, Seattle, WA 98101',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    latitude: 47.6062,
    longitude: -122.3321
  },
  {
    fullname: 'Dr. Jennifer Lee',
    email: 'jennifer.lee@healthify.com',
    password: 'password123',
    specialty: 'Cardiologist',
    address: '369 Heart Hill, San Francisco, CA 94101',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94101',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    fullname: 'Dr. Thomas Anderson',
    email: 'thomas.anderson@healthify.com',
    password: 'password123',
    specialty: 'Neurologist',
    address: '741 Brain Bridge, Dallas, TX 75201',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    latitude: 32.7767,
    longitude: -96.7970
  },
  {
    fullname: 'Dr. Asha Verma',
    email: 'asha.verma@healthify.com',
    password: 'password123',
    specialty: 'Dermatologist',
    address: 'MP Nagar, Bhopal, MP 462011',
    city: 'Bhopal',
    state: 'MP',
    zipCode: '462011',
    latitude: 23.2599,
    longitude: 77.4126
  }
];

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
    console.log(`Seeded ${result.length} doctors with location data`);

    // Display sample doctors with their locations
    console.log('\nSample doctors with locations:');
    result.forEach(doctor => {
      console.log(`${doctor.fullname} - ${doctor.specialty} - ${doctor.address} (${doctor.latitude}, ${doctor.longitude})`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
