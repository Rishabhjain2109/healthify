import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/axios';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const [showAppointments, setShowAppointments] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/api/appointments');
      setAppointments(data);
      setShowAppointments(true);
    } catch (err) {
      setError('Failed to fetch appointments.');
      setShowAppointments(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTimeChange = (id, value) => {
    setTimeInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSetTime = async (id) => {
    try {
      const time = timeInputs[id];
      if (!time) {
        alert('Please select a time.');
        return;
      }
      const { data } = await API.put(`/api/appointments/${id}/time`, { time });
      setAppointments(prev => prev.map(a => a._id === id ? data.appointment : a));
      setTimeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });
    } catch (err) {
      alert('Failed to set time.');
      console.error(err);
    }
  };

  const renderPatientAppointments = () => (
    <div>
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? <p>You have no appointments.</p> : (
        <div className="appointment-grid">
          {appointments.map(app => (
            <div key={app._id} className="appointment-card">
              <h4>Dr. {app.doctor.fullname}</h4>
              <p><strong>Fee:</strong> ₹{app.fees}</p>
              <p><strong>Status:</strong> <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
              <p><strong>Time:</strong> {app.time || 'Not set'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDoctorAppointments = () => (
    <div>
      <h2>Patient Appointments</h2>
      {appointments.length === 0 ? <p>You have no appointments.</p> : (
        <div className="appointment-grid">
          {appointments.map(app => (
            <div key={app._id} className="appointment-card">
              <h4>Patient: {app.patient.name}</h4>
              <p><strong>Email:</strong> {app.patient.email}</p>
              <p><strong>Phone:</strong> {app.patient.phone}</p>
              <p><strong>Status:</strong> <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
              <p><strong>Time:</strong> {app.time || 'Not set'}</p>
              {app.status === 'Pending' && (
                <div className="time-setter">
                  <input 
                    type="datetime-local" 
                    value={timeInputs[app._id] || ''} 
                    onChange={e => handleTimeChange(app._id, e.target.value)}
                  />
                  <button onClick={() => handleSetTime(app._id)}>Set Time & Confirm</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        .dashboard-container { padding: 40px; max-width: 1200px; margin: auto; }
        .dashboard-header { margin-bottom: 18px; }
        .dashboard-actions-row {
          margin-bottom: 32px;
        }
        .dashboard-actions-row button {
          margin-right: 12px;
          margin-bottom: 8px;
          padding: 8px 18px;
          font-size: 16px;
          border-radius: 6px;
          border: 1px solid #bbb;
          background: #f7f7f7;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dashboard-actions-row button:hover {
          background: #e0e0e0;
        }
        .appointment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .appointment-card { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .status-pending { color: orange; }
        .status-confirmed { color: green; }
        .time-setter { margin-top: 10px; display: flex; gap: 10px; }
      `}</style>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.fullname || user?.managerName || 'User'}!</h1>
        </div>
        <div className="dashboard-actions-row">
          {user?.role === 'lab' ? (
            <>
              <button onClick={() => navigate('/lab-dashboard')}>Lab Dashboard</button>
              <button onClick={() => navigate('/lab-profile')}>Lab Profile</button>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/profile')}>Update Profile</button>
              {user?.role === 'doctor' && <button onClick={() => navigate('/update-fee')}>Set Fee</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/search')}>Find a Doctor</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/lab-tests')}>Lab Test</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/lab-reports')}>Your Reports</button>}
              <button onClick={fetchAppointments}>Your Appointments</button>
              <button onClick={handleLogout}>Log Out</button>
            </>
          )}
        </div>
        {showAppointments && user?.role !== 'lab' && (
          <div>
            {loading && <p>Loading appointments...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {!loading && !error && (
              user?.role === 'patient' ? renderPatientAppointments() : renderDoctorAppointments()
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;










