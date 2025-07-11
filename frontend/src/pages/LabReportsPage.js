import React, { useEffect, useState } from 'react';
import API from '../utils/axios';

function LabReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/api/lab-bookings/my-reports')
      .then(res => {
        setBookings(res.data.reports);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load lab bookings');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: 'auto' }}>
      <h2>Your Lab Bookings</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.length === 0 && !loading ? <p>No lab bookings found.</p> : (
        <ul>
          {bookings.map(booking => (
            // <div>
            //   1
            // </div>
            <li key={booking._id} style={{ marginBottom: 10 }}>
              <b>{booking.testName}</b> at <b>{booking.lab?.labName}</b> <br />
              <span>Status: {booking.status}</span><br />
              {booking.message && <span><b>Lab Message:</b> {booking.message}</span>}<br />
              {booking.reportFile && (
                <a href={`http://localhost:5000/${booking.reportFile}`} target="_blank" rel="noopener noreferrer">Download Report</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LabReportsPage; 