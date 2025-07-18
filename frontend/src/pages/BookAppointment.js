import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
  const { docId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const [form, setForm] = useState({
    name: storedUser?.fullname || '',
    email: storedUser?.email || '',
    phone: '',
    message: '',
    appointmentType: 'offline' // default type
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${docId}`);
        setDoctor(res.data);
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

  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post('http://localhost:5000/api/payment/create-order', {
        doctorId: docId
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Healthify',
        description: `Appointment with ${doctor.fullname}`,
        order_id: order.id,
        handler: async (response) => {
          await axios.post('http://localhost:5000/api/payment/verify-payment', {
            ...response,
            doctorId: docId,
            patientId: storedUser?.id,
            appointmentType: form.appointmentType,
            ...form
          });

          setSuccess('Appointment booked successfully!');
          setShowPopup(true);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#1976d2',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
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

        input, textarea {
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

        .success, .error {
          text-align: center;
          margin-bottom: 16px;
        }

        .success {
          color: green;
        }

        .error {
          color: red;
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

        .fees-display {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 25px;
        }
      `}</style>

      <div className="appointment-container">
        <h2>Book Appointment with {doctor.fullname}</h2>
        <div className="fees-display">Appointment Fee: ₹{doctor.fees}</div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
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
            <label>Appointment Type *</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="appointmentType"
                  value="offline"
                  checked={form.appointmentType === 'offline'}
                  onChange={handleChange}
                />{' '}
                Offline
              </label>
              <label>
                <input
                  type="radio"
                  name="appointmentType"
                  value="online"
                  checked={form.appointmentType === 'online'}
                  onChange={handleChange}
                />{' '}
                Online
              </label>
            </div>
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

          <button type="submit" className="btn">Pay & Confirm Appointment</button>
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
