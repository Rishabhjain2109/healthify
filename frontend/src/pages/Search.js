import React, { useState } from 'react';
import axios from '../utils/axios';

export default function Search() {
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/api/doctors?specialty=${specialty}`);
      setDoctors(res.data || []);
    } catch {
      setDoctors([]);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Search for Doctors</h2>
      <select
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        style={{ padding: '8px', marginRight: '10px' }}
      >
        <option value="">Select Specialty</option>
        <option value="Cardiologist">Cardiologist</option>
        <option value="Dermatologist">Dermatologist</option>
        <option value="Neurologist">Neurologist</option>
        
      </select>
      <button onClick={handleSearch}>Search</button>

      {doctors.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Results:</h3>
          <ul>
            {doctors.map((doc) => (
              <li key={doc._id}>
                {doc.fullname} — <em>{doc.specialty}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
