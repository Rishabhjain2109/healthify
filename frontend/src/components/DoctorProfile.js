import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);  // Start with null for loading state
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        setDoc(res.data);
        console.log("Doctor fetched:", res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Unable to fetch doctor details.');
      }
    };

    loadDetails();
  }, [id]);

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>{error}</p>;
  }

  if (!doc) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'gray' }}>Loading doctor details...</p>;
  }

  return (
    <>
      <style>
        {`
          .doctor-card {
            max-width: 400px;
            margin: 50px auto;
            padding: 24px;
            border: 1px solid #ddd;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            background-color: #fff;
            font-family: Arial, sans-serif;
          }

          .title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            color: #333;
          }

          .info p {
            font-size: 16px;
            margin: 8px 0;
            color: #444;
          }
        `}
      </style>

      <div className="doctor-card">
        <h2 className="title">Doctor Profile</h2>
        <div className="info">
          <p><strong>Full Name:</strong> {doc.fullname}</p>
          <p><strong>Email:</strong> {doc.email}</p>
          <p><strong>Role:</strong> {doc.role}</p>
          <p><strong>Specialty:</strong> {doc.specialty}</p>
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;
