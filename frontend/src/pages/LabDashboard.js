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

  // Status color mapping
  const getStatusColor = (status) => {
    if (!status) return '#6c757d';
    const s = status.toLowerCase();
    if (s === 'report uploaded') return '#007bff';
    if (s === 'test done') return '#28a745';
    if (s === 'pending' || s === 'on the way') return '#ff9800';
    if (s === 'cancelled') return '#dc3545';
    return '#6c757d';
  };

  return (
    <div style={styles.page}>
      <style>{`
        .lab-bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(370px, 1fr));
          gap: 28px;
        }
        .lab-booking-card input[type="file"]::-webkit-file-upload-button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 7px 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .lab-booking-card input[type="file"]::-ms-browse {
          background: #007bff;
          color: white;
        }
      `}</style>
      <h2 style={styles.title}>Lab Bookings</h2>
      {loading && <div style={styles.loading}>Loading...</div>}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      {!loading && bookings.length === 0 && <div style={styles.empty}>No bookings found.</div>}
      <div className="lab-bookings-grid">
        {bookings.map((b) => (
          <div key={b._id} className="lab-booking-card" style={styles.card}>
            <div style={styles.row}><span style={styles.label}>Patient:</span> {b.patient?.name} <span style={styles.subtle}>({b.patient?.email}, {b.patient?.phone})</span></div>
            <div style={styles.row}><span style={styles.label}>Test:</span> {b.testName} <span style={styles.label}>Price:</span> ₹{b.price}</div>
            <div style={styles.row}><span style={styles.label}>Status:</span> <span style={{...styles.status, color: getStatusColor(b.status)}}>{b.status}</span></div>
            <div style={styles.row}><span style={styles.label}>Lab Message:</span> {b.message || <span style={styles.subtle}>None</span>}</div>
            <div style={styles.actionRow}>
              <select
                value={statusInputs[b._id] || b.status}
                onChange={e => handleStatusChange(b._id, e.target.value)}
                style={styles.select}
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
                style={styles.input}
              />
              <button
                onClick={() => handleUpdate(b._id)}
                style={styles.updateBtn}
              >
                Update
              </button>
            </div>
            <div style={styles.actionRow}>
              <input 
                type="file" 
                onChange={e => handleFileChange(b._id, e.target.files[0])}
                style={styles.fileInput}
              />
              <button 
                onClick={() => handleUpload(b._id)}
                style={styles.uploadBtn}
              >
                Upload Report
              </button>
            </div>
            {b.reportFile && (
              <div style={styles.reportLinkRow}>
                <span style={styles.label}>Report:</span> <a href={`http://localhost:5000/${b.reportFile}`} target="_blank" rel="noopener noreferrer" style={styles.reportLink}>View Report</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '40px 0',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    color: '#007bff',
    fontSize: '2.3rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: '0.5px',
  },
  loading: {
    textAlign: 'center',
    color: '#007bff',
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '30px 0',
  },
  error: {
    textAlign: 'center',
    color: '#dc3545',
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '30px 0',
  },
  success: {
    textAlign: 'center',
    color: '#28a745',
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '30px 0',
  },
  empty: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '1.1rem',
    margin: '30px 0',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,123,255,0.07)',
    border: '1px solid #e3eafc',
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
  },
  row: {
    marginBottom: 4,
    fontSize: '1.08rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    color: '#007bff',
    fontWeight: 600,
    marginRight: 4,
  },
  subtle: {
    color: '#6c757d',
    fontWeight: 400,
    fontSize: '0.98rem',
  },
  status: {
    fontWeight: 700,
    fontSize: '1.08rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  actionRow: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #b6c6e3',
    fontSize: '1rem',
    background: '#f8fafc',
    color: '#222',
    fontWeight: 500,
    outline: 'none',
  },
  input: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #b6c6e3',
    fontSize: '1rem',
    background: '#f8fafc',
    color: '#222',
    fontWeight: 500,
    outline: 'none',
    flex: 1,
  },
  fileInput: {
    fontSize: '1rem',
    borderRadius: 8,
    background: '#f8fafc',
    border: 'none',
    outline: 'none',
  },
  updateBtn: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  uploadBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  reportLinkRow: {
    marginTop: 10,
    fontSize: '1.05rem',
  },
  reportLink: {
    color: '#007bff',
    fontWeight: 600,
    textDecoration: 'underline',
    marginLeft: 6,
  },
};

export default LabDashboard; 