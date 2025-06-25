import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  const [loading,setLoading] = useState(false);

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

  const handleOnlineConsultation = async ()=>{
    if(!doc) return;
    const roomId = `room_${Date.now()}`;

    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user'));

    try {
      await axios.post('http://localhost:5000/api/consult-request', {
        roomId,
        patient: user.id,
        doctor: doc._id,
        pName: user.fullname,
        dName: doc.fullname
      });

      navigate(`/video-call/${roomId}`);
    } catch (err) {
      console.error('Failed to send consultation request:', err);
      alert('Unable to initiate online consultation. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>{error}</p>;
  }

  if (!doc) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'gray' }}>Loading doctor details...</p>;
  }

  return (
    <>
      <style>{`
        .doctor-page {
          display: flex;
          flex-direction: column;
          padding: 40px 60px;
          font-family: 'Segoe UI', sans-serif;
          background-color: #fafafa;
          min-height: 100vh;
        }

        .header {
          font-size: 32px;
          font-weight: 700;
          color: #222;
          margin-bottom: 40px;
        }

        .doctor-info {
          display: flex;
          flex-direction: row;
          gap: 40px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .left-panel {
          flex: 1;
          min-width: 280px;
          text-align: center;
        }

        .left-panel img {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          object-fit: cover;
          background-color: #ccc;
        }

        .left-panel h2 {
          margin-top: 20px;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .left-panel p {
          color: #666;
          font-size: 16px;
        }

        .right-panel {
          flex: 2;
          min-width: 300px;
        }

        .info-item {
          margin-bottom: 18px;
        }

        .info-item span {
          font-weight: 600;
          color: #222;
          display: inline-block;
          min-width: 140px;
        }

        .fees-highlight {
          color: #2e7d32;
          font-size: 18px;
          font-weight: 600;
          margin-top: 20px;
        }

        .availability {
          margin-top: 30px;
        }

        .availability h4 {
          font-size: 18px;
          margin-bottom: 10px;
          color: #333;
        }

        .slots {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .slot {
          background-color: #e0f2f1;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #00796b;
        }

        .book-btn {
          margin-top: 40px;
          margin-right: 10px;
          padding: 12px 24px;
          font-size: 16px;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .book-btn:hover {
          background-color: #0d47a1;
        }

        @media (max-width: 768px) {
          .doctor-info {
            flex-direction: column;
            align-items: center;
          }

          .right-panel {
            text-align: center;
          }

          .info-item span {
            display: block;
            margin-bottom: 5px;
          }

          .book-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="doctor-page">
        <div className="header">Doctor Profile</div>
        <div className="doctor-info">
          <div className="left-panel">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Doctor Avatar"
            />
            <h2>{doc.fullname}</h2>
            <p>{doc.specialty || 'General Practitioner'}</p>
          </div>

          <div className="right-panel">
            <div className="info-item">
              <span>Email:</span> {doc.email}
            </div>
            <div className="info-item">
              <span>Role:</span> {doc.role}
            </div>
            <div className="info-item">
              <span>Specialty:</span> {doc.specialty}
            </div>
            <div className="info-item">
              <span>Phone:</span> {doc.phone || 'N/A'}
            </div>
            <div className="fees-highlight">
              Consultation Fee: ₹{doc.fees || 'Not Available'}
            </div>

            {doc.availability && doc.availability.length > 0 && (
              <div className="availability">
                <h4>Available Time Slots:</h4>
                <div className="slots">
                  {doc.availability.map((slot, index) => (
                    <div key={index} className="slot">{slot}</div>
                  ))}
                </div>
              </div>
            )}

            <button className="book-btn" onClick={() => navigate(`/book-appointment/${doc._id}`)}>
              Book Appointment
            </button>
            <button className="book-btn" onClick={handleOnlineConsultation}>
              Online Consultation
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;
