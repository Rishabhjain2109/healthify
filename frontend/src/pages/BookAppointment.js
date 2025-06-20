import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
  const { docId } = useParams();
  const [doctor, setDoc] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const [form, setForm] = useState({
    name: storedUser?.fullname || '',
    email: storedUser?.email || '',
    phone: '',
    message: '',
    paymentMethod: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPopup, setShowPopup] = useState(false); // popup state

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${docId}`);
        setDoc(res.data);
        console.log("Doctor fetched:", res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Unable to fetch doctor details.');
      }
    };

    loadDetails();
  }, [docId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.paymentMethod) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/appointments-req`, {
        ...form,
        doctorId: docId,
        patientId: storedUser?.id
      });

      setSuccess('Appointment booked successfully!');
      setShowPopup(true); // Show popup

      setForm({
        name: storedUser?.fullname || '',
        email: storedUser?.email || '',
        phone: '',
        message: '',
        paymentMethod: ''
      });

      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to book appointment. Try again.');
    }
  };

  if (!doctor) {
    return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading doctor info...</p>;
  }

  return (
    <>
      <style>{`
        .appointment-container {
          max-width: 600px;
          margin: 60px auto;
          padding: 40px;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', sans-serif;
        }

        .appointment-container h2 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 28px;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #444;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          font-size: 15px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .btn {
          width: 100%;
          background: #1976d2;
          color: white;
          border: none;
          padding: 12px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn:hover {
          background: #155fa0;
        }

        .success {
          color: green;
          text-align: center;
          margin-bottom: 16px;
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 16px;
        }

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .popup-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 400px;
        }

        .popup-content h3 {
          margin-bottom: 16px;
        }
      `}</style>

      <div className="appointment-container">
        <h2>Book Appointment with {doctor.fullname}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method *</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
              <option value="">-- Select Payment Method --</option>
              <option value="upi">UPI</option>
              <option value="card">Credit/Debit Card</option>
              <option value="cash">Cash (Pay at Clinic)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Message / Note</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Any symptoms or request..."
            />
          </div>

          <button type="submit" className="btn">Confirm Appointment</button>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>🎉 Appointment Confirmed!</h3>
            <p>Your appointment has been successfully booked.</p>
            <button className="btn" onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookAppointment;
