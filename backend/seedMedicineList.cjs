// seedMedicineList.js
const mongoose = require('mongoose');
const MedicineList = require('./models/MedicineList.cjs');
require('dotenv').config();

//dotenv.config();

const medicines = [
  { name: 'Paracetamol', description: 'Pain reliever and fever reducer', price: 20 },
  { name: 'Amoxicillin', description: 'Antibiotic for bacterial infections', price: 90 },
  { name: 'Cetirizine', description: 'Allergy relief', price: 15 },
  { name: 'Metformin', description: 'Diabetes control', price: 35 },
  { name: 'Ibuprofen', description: 'Anti-inflammatory', price: 30 },
  { name: 'Losartan', description: 'Blood pressure control', price: 48 },
  { name: 'Pantoprazole', description: 'Acid reducer', price: 40 },
  { name: 'Dolo 650', description: 'Painkiller', price: 18 },
];

async function seedMedicineList() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await MedicineList.deleteMany({});
    console.log('Cleared MedicineList');

    const result = await MedicineList.insertMany(medicines);
    console.log(`Seeded ${result.length} medicines into MedicineList`);

    console.log('\nSample Medicines:');
    result.forEach(medicine => {
      console.log(`${medicine.name} - ${medicine.description} - ${medicine.price}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMedicineList();
