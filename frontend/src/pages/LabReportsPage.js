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

  // Status label mapping
  const getStatusLabel = (status, reportFile) => {
    if (status?.toLowerCase() === 'completed' && reportFile) return 'REPORT UPLOADED';
    if (status?.toLowerCase() === 'completed') return 'TEST DONE';
    if (status?.toLowerCase() === 'pending') return 'PENDING';
    if (status?.toLowerCase() === 'cancelled') return 'CANCELLED';
    return status?.toUpperCase() || 'UNKNOWN';
  };

  // Status color mapping
  const getStatusColor = (status, reportFile) => {
    if (status?.toLowerCase() === 'completed' && reportFile) return '#007bff';
    if (status?.toLowerCase() === 'completed') return '#28a745';
    if (status?.toLowerCase() === 'pending') return '#ffc107';
    if (status?.toLowerCase() === 'cancelled') return '#dc3545';
    return '#6c757d';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Lab Reports</h1>
        <p style={styles.subtitle}>View and download your medical test reports</p>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading your reports...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div style={styles.emptyContainer}>
          <h3 style={styles.emptyTitle}>No Reports Found</h3>
          <p style={styles.emptyText}>You haven't booked any lab tests yet.</p>
          <button 
            onClick={() => window.history.back()} 
            style={styles.backButton}
          >
            Go Back
          </button>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={styles.reportsGrid}>
          {bookings.map((booking) => (
            <div key={booking._id} style={styles.reportCard}>
              <div style={styles.cardHeader}>
                <div style={styles.testInfo}>
                  <h3 style={styles.testName}>{booking.testName}</h3>
                  <p style={styles.labName}>at {booking.lab?.labName}</p>
                </div>
                <div style={styles.statusContainer}>
                  <span style={{
                    ...styles.status,
                    color: getStatusColor(booking.status, booking.reportFile)
                  }}>
                    {getStatusLabel(booking.status, booking.reportFile)}
                  </span>
                </div>
              </div>

              <div style={styles.cardBody}>
                {booking.message && (
                  <div style={styles.messageContainer}>
                    <p style={styles.messageLabel}>Lab Message:</p>
                    <p style={styles.messageText}>{booking.message}</p>
                  </div>
                )}

                {booking.reportFile && (
                  <div style={styles.downloadContainer}>
                    <a 
                      href={`http://localhost:5000/${booking.reportFile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.downloadButton}
                    >
                      Download Report
                    </a>
                  </div>
                )}

                {!booking.reportFile && booking.status?.toLowerCase() === 'completed' && (
                  <div style={styles.noReportContainer}>
                    <p style={styles.noReportText}>Report not yet uploaded</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px 20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  title: {
    color: '#007bff',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '0 2px 4px rgba(0, 123, 255, 0.1)'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    margin: '0',
    fontWeight: '400'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '1.1rem',
    margin: '0'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#fef2f2',
    borderRadius: '15px',
    border: '1px solid #fecaca',
    margin: '20px 0'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '1.1rem',
    margin: '0',
    textAlign: 'center'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  emptyTitle: {
    color: '#374151',
    fontSize: '1.5rem',
    margin: '0 0 10px 0',
    fontWeight: '600'
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: '0 0 25px 0',
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f1f5f9'
  },
  testInfo: {
    flex: '1'
  },
  testName: {
    color: '#1e293b',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0'
  },
  labName: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: '0',
    fontWeight: '500'
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px',
    minWidth: '120px'
  },
  status: {
    fontSize: '1rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  messageContainer: {
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  messageLabel: {
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 5px 0'
  },
  messageText: {
    color: '#4b5563',
    fontSize: '0.95rem',
    margin: '0',
    lineHeight: '1.5'
  },
  downloadContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px'
  },
  downloadButton: {
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  },
  noReportContainer: {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  noReportText: {
    color: '#6c757d',
    fontSize: '0.95rem',
    margin: '0',
    fontWeight: '500'
  }
};

// Add CSS animation for loading spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default LabReportsPage;












// import React, { useEffect, useState } from 'react';
// import API from '../utils/axios';

// function LabReportsPage() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     setLoading(true);
//     API.get('/api/lab-bookings/my-reports')
//       .then(res => {
//         setBookings(res.data.reports);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to load lab bookings');
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <div style={{ padding: 30, maxWidth: 900, margin: 'auto' }}>
//       <h2>Your Lab Bookings</h2>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {bookings.length === 0 && !loading ? <p>No lab bookings found.</p> : (
//         <ul>
//           {bookings.map(booking => (
//             // <div>
//             //   1
//             // </div>
//             <li key={booking._id} style={{ marginBottom: 10 }}>
//               <b>{booking.testName}</b> at <b>{booking.lab?.labName}</b> <br />
//               <span>Status: {booking.status}</span><br />
//               {booking.message && <span><b>Lab Message:</b> {booking.message}</span>}<br />
//               {booking.reportFile && (
//                 <a href={`http://localhost:5000/${booking.reportFile}`} target="_blank" rel="noopener noreferrer">Download Report</a>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default LabReportsPage; 

