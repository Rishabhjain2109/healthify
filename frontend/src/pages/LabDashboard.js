import React, { useEffect, useState } from 'react';
import API from '../utils/axios';

function LabDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusInputs, setStatusInputs] = useState({});
  const [messageInputs, setMessageInputs] = useState({});
  const [fileInputs, setFileInputs] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/api/lab-bookings/lab-bookings');
      setBookings(data.bookings);
    } catch (err) {
      setError('Failed to fetch lab bookings.');
    }
    setLoading(false);
  };

  const handleStatusChange = (id, value) => {
    setStatusInputs((prev) => ({ ...prev, [id]: value }));
  };
  const handleMessageChange = (id, value) => {
    setMessageInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (id, file) => {
    setFileInputs((prev) => ({ ...prev, [id]: file }));
  };

  const handleUpdate = async (bookingId) => {
    try {
      await API.put(`/api/lab-bookings/update-status/${bookingId}`, {
        status: statusInputs[bookingId],
        message: messageInputs[bookingId],
      });
      setSuccess('Status/message updated!');
      fetchBookings();
      setTimeout(() => setSuccess(''), 1500);
    } catch {
      setError('Failed to update status/message.');
    }
  };

  const handleUpload = async (bookingId) => {
    const file = fileInputs[bookingId];
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('report', file);

    try {
      await API.post(`/api/lab-bookings/upload-report/${bookingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Report uploaded successfully!');
      fetchBookings(); // Refresh bookings to show new status/file
      setTimeout(() => setSuccess(''), 1500);
    } catch (err) {
      setError('Failed to upload report.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Lab Bookings</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {!loading && bookings.length === 0 && <p>No bookings found.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        {bookings.map((b) => (
          <div key={b._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 18, background: '#fafcff' }}>
            <div style={{ marginBottom: 8 }}><b>Patient:</b> {b.patient?.name} ({b.patient?.email}, {b.patient?.phone})</div>
            <div style={{ marginBottom: 8 }}><b>Test:</b> {b.testName} <b>Price:</b> ₹{b.price}</div>
            <div style={{ marginBottom: 8 }}><b>Status:</b> {b.status}</div>
            <div style={{ marginBottom: 8 }}><b>Lab Message:</b> {b.message || <span style={{ color: '#888' }}>None</span>}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
              <select
                value={statusInputs[b._id] || b.status}
                onChange={e => handleStatusChange(b._id, e.target.value)}
                style={{ padding: 6, borderRadius: 6 }}
              >
                <option value="Pending">Pending</option>
                <option value="On The Way">On The Way</option>
                <option value="Test Done">Test Done</option>
                <option value="Report Uploaded">Report Uploaded</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="text"
                placeholder="Message to patient"
                value={messageInputs[b._id] || ''}
                onChange={e => handleMessageChange(b._id, e.target.value)}
                style={{ padding: 6, borderRadius: 6, flex: 1 }}
              />
              <button
                onClick={() => handleUpdate(b._id)}
                style={{ padding: '7px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6 }}
              >
                Update
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
              <input 
                type="file" 
                onChange={e => handleFileChange(b._id, e.target.files[0])}
              />
              <button 
                onClick={() => handleUpload(b._id)}
                style={{ padding: '7px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6 }}
              >
                Upload Report
              </button>
            </div>
            {b.reportFile && (
              <div style={{ marginTop: 10 }}>
                <b>Report:</b> <a href={`http://localhost:5000/${b.reportFile}`} target="_blank" rel="noopener noreferrer">View Report</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LabDashboard; 