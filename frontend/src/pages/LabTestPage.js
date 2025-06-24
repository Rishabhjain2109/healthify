import React, { useState, useEffect } from 'react';
import API from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const COMMON_TESTS = [
  'Blood Test',
  'Thyroid Test',
  'Liver Function Test',
  'Kidney Function Test',
  'Diabetes Test',
  'Vitamin D Test',
  'COVID-19 Test',
];

function LabTestPage() {
  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [labs, setLabs] = useState([]);
  const [allTests, setAllTests] = useState(COMMON_TESTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [bookingLab, setBookingLab] = useState(null);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => setUserLocation(null)
      );
    }
  }, []);

  // Fetch user info on mount to prefill phone if available
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.phone) setPhone(user.phone);
  }, []);

  // Search for labs offering the selected test
  const handleSearch = async (testName) => {
    setLoading(true);
    setError('');
    setLabs([]);
    setSelectedTest(null);
    setSuccess('');
    try {
      // In a real app, fetch tests from backend. Here, we use static list.
      const test = allTests.find(
        (t) => t.toLowerCase().includes((testName || search).toLowerCase())
      );
      if (!test) {
        setError('Test not found.');
        setLoading(false);
        return;
      }
      setSelectedTest(test);
      // Fetch labs from backend
      const res = await API.get('/api/labs');
      let labsWithDistance = res.data.labs.map((lab) => {
        if (lab.latitude && lab.longitude && userLocation) {
          const R = 6371; // km
          const dLat = (userLocation.lat - lab.latitude) * Math.PI / 180;
          const dLon = (userLocation.lon - lab.longitude) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lab.latitude * Math.PI / 180) *
              Math.cos(userLocation.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          lab.distance = R * c;
        } else {
          lab.distance = null;
        }
        return lab;
      });
      labsWithDistance.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
      setLabs(labsWithDistance);
    } catch (err) {
      setError('Failed to load labs.');
    }
    setLoading(false);
  };

  // Book a test at a lab
  const handleBook = (lab) => {
    setBookingLab(lab);
    setShowPayment(true);
    setError('');
    setSuccess('');
  };

  // Confirm payment and booking (with Razorpay)
  const handleConfirmPayment = async () => {
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    setBooking(true);
    setError('');
    setSuccess('');
    try {
      // 1. Create Razorpay order
      const { data: order } = await API.post('/api/payment/create-lab-order', {
        labId: bookingLab._id,
        testName: selectedTest,
        price: getTestPrice(selectedTest)
      });
      // 2. Open Razorpay modal
      const user = JSON.parse(localStorage.getItem('user'));
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Healthify',
        description: `Lab Test: ${selectedTest} at ${bookingLab.labName}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await API.post('/api/payment/verify-lab-payment', {
              ...response,
              labId: bookingLab._id,
              testName: selectedTest,
              price: getTestPrice(selectedTest),
              patientId: user?.id,
              name: user?.fullname,
              email: user?.email,
              phone
            });
            setSuccess('Booking successful!');
            setTimeout(() => {
              setBooking(false);
              setBookingLab(null);
              setShowPayment(false);
              navigate('/lab-reports');
            }, 1200);
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            setBooking(false);
            setBookingLab(null);
            setShowPayment(false);
          }
        },
        prefill: {
          name: user?.fullname,
          email: user?.email,
          contact: phone,
        },
        theme: {
          color: '#1976d2',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setBooking(false); // Reset booking state after opening modal
    } catch (err) {
      setError('Payment failed. Please try again.');
      setBooking(false);
      setBookingLab(null);
      setShowPayment(false);
    }
  };

  // Helper to get price for a test
  function getTestPrice(testName) {
    // You can fetch from backend or use a static map
    const prices = {
      'Blood Test': 300,
      'Thyroid Test': 500,
      'Liver Function Test': 700,
      'Kidney Function Test': 650,
      'Diabetes Test': 400,
      'Vitamin D Test': 800,
      'COVID-19 Test': 1200,
    };
    return prices[testName] || 500;
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>🔬 Lab Test Search</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search for a test (e.g. Blood, Thyroid)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #bbb', minWidth: 220 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={() => handleSearch()}
          style={{ padding: '10px 22px', fontSize: 16, borderRadius: 8, background: '#1976d2', color: 'white', border: 'none' }}
        >
          Search
        </button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <span style={{ fontWeight: 500 }}>Popular Tests: </span>
        {COMMON_TESTS.map((test) => (
          <button
            key={test}
            onClick={() => {
              setSearch(test);
              handleSearch(test);
            }}
            style={{ margin: '0 6px', padding: '6px 14px', borderRadius: 6, border: '1px solid #bbb', background: '#f7f7f7', cursor: 'pointer' }}
          >
            {test}
          </button>
        ))}
      </div>
      {loading && <p style={{ textAlign: 'center', color: '#1976d2' }}>Loading...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
      {success && <p style={{ textAlign: 'center', color: 'green' }}>{success}</p>}
      {selectedTest && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 18 }}>{selectedTest} <span style={{ color: '#1976d2' }}>₹{getTestPrice(selectedTest)}</span></h3>
          <h4 style={{ marginBottom: 18, textAlign: 'center' }}>Available Labs (nearest first):</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {labs.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>No labs found for this test.</p>
            ) : (
              labs.map((lab) => (
                <div key={lab._id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h4 style={{ marginBottom: 8 }}>{lab.labName}</h4>
                  <div style={{ color: '#555', marginBottom: 6 }}>{lab.address}</div>
                  {lab.distance !== null && (
                    <div style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>📍 {lab.distance.toFixed(2)} km away</div>
                  )}
                  <button
                    onClick={() => handleBook(lab)}
                    disabled={booking && bookingLab && bookingLab._id === lab._id}
                    style={{ marginTop: 10, padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
                  >
                    {booking && bookingLab && bookingLab._id === lab._id ? 'Booking...' : 'Book & Pay'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showPayment && bookingLab && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 18 }}>Payment for {selectedTest}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 500 }}>Phone Number:</label><br />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{ padding: 8, fontSize: 16, borderRadius: 6, border: '1px solid #bbb', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Amount:</b> ₹{getTestPrice(selectedTest)}
            </div>
            <button
              onClick={handleConfirmPayment}
              style={{ padding: '10px 22px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, width: '100%' }}
              disabled={booking}
            >
              {booking ? 'Processing...' : 'Pay & Book'}
            </button>
            <button
              onClick={() => { setShowPayment(false); setBookingLab(null); }}
              style={{ marginTop: 10, padding: '8px 18px', background: '#eee', border: 'none', borderRadius: 8, fontSize: 15, width: '100%' }}
              disabled={booking}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabTestPage; 