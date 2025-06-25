import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/axios';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const [view, setView] = useState('');

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
      const updateList = (list) => list.map(a => a._id === id ? data.appointment : a);

      if (view === 'online') {
        setOnlineAppointments(prev => updateList(prev));
      } else {
        setAppointments(prev => updateList(prev));
      }

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

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    setView('regular');
    try {
      const { data } = await API.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      setError('Failed to fetch appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineAppointments = async () => {
    setLoading(true);
    setError('');
    setView('online');
    try {
      const { data } = await API.get('/api/getonlinemeetings', {
        params: {
          id: user.id,
          role: user.role
        }
      });
      console.log(data);
      
      setOnlineAppointments(data);
    } catch (err) {
      setError('Failed to fetch online appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetOnlineTime = async (roomId) => {
    try {
      const time = timeInputs[roomId];
      if (!time) {
        alert('Please select a time.');
        return;
      }

      const { data } = await API.put(`/api/setonlinemeetingtime/${roomId}`, { time });

      setOnlineAppointments(prev =>
        prev.map(m => m.roomId === roomId ? data.updatedMeeting : m)
      );

      setTimeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[roomId];
        return newInputs;
      });

    } catch (err) {
      alert('Failed to set online meeting time.');
      console.error(err);
    }
  };


  const renderAppointments = (data) => {
    if(view === 'online') return null;

    return (
    <div>
      <h2>{user.role === 'patient' ? 'Your' : 'Patient'} {view === 'online' ? 'Online ' : ''}Appointments</h2>
      {data.length === 0 ? <p>No appointments found.</p> : (
        <div className="appointment-grid">
          {data.map(app => (
            <div key={app._id} className="appointment-card">
              {user.role === 'patient' ? (
                <>
                  <h4>Dr. {app.doctor.fullname}</h4>
                  <p><strong>Fee:</strong> ₹{app.fees}</p>
                </>
              ) : (
                <>
                  <h4>Patient: {app.patient.name}</h4>
                  <p><strong>Email:</strong> {app.patient.email}</p>
                  <p><strong>Phone:</strong> {app.patient.phone}</p>
                </>
              )}
              <p><strong>Status:</strong> <span className={`status-${app.status}`}>{app.status}</span></p>
              <p><strong>Time:</strong> {app.time || 'Not set'}</p>
              {user.role === 'doctor' && app.status === 'Pending' && (
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
  )};

  const renderVideoCallCards = (data) => (
    <div>
      <h2>Join Your Scheduled Video Calls</h2>
      {data.length === 0 ? <p>No video calls scheduled.</p> : (
        <div className="video-call-cards">
          {data.map((meeting, index) => (
            <div key={index} className="card">
              <p><strong>Room ID:</strong> {meeting.roomId}</p>
              {user.role === 'doctor' && <p><strong>Patient:</strong> {meeting.patient}</p>}
              {user.role === 'patient' && <p><strong>Doctor:</strong> {meeting.doctor}</p>}
              <p><strong>Status:</strong> <span className={`status-${meeting.status}`}>{meeting.status}</span></p>
              <p><strong>Time:</strong> {meeting.time || 'Not set'}</p>

              {/* Time input for doctor if pending */}
              {user.role === 'doctor' && (
                <div className="time-setter">
                  <input
                    type="datetime-local"
                    value={timeInputs[meeting.roomId] || ''}
                    onChange={e => handleTimeChange(meeting.roomId, e.target.value)}
                  />
                  <button onClick={() => handleSetOnlineTime(meeting.roomId)}>Set Time & Confirm</button>
                </div>
              )}

              <button onClick={() => navigate(`/video-call/${meeting.roomId}`)}>Join Call</button>
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
        .appointment-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 20px; 
        }
        .appointment-card { 
          background: #f9f9f9; 
          border: 1px solid #ddd; 
          padding: 20px; 
          border-radius: 8px; 
        }
        .status-pending { color: orange; }
        .status-confirmed { color: green; }
        .time-setter { 
          margin-top: 10px; 
          display: flex; 
          gap: 10px; 
        }
        .video-call-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .card {
          border: 1px solid #ccc;
          padding: 16px;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        .card button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .card button:hover {
          background-color: #0056b3;
        }
      `}</style>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.fullname || 'User'}!</h1>
        </div>
        <div className="dashboard-actions-row">
          <button onClick={() => navigate('/profile')}>Update Profile</button>
          {user?.role === 'doctor' && <button onClick={() => navigate('/update-fee')}>Set Fee</button>}
          {user?.role === 'patient' && <button onClick={() => navigate('/search')}>Find a Doctor</button>}
          <button onClick={fetchAppointments}>Your Appointments</button>
          <button onClick={fetchOnlineAppointments}>Your Online Appointments</button>
          <button onClick={handleLogout}>Log Out</button>
        </div>

        {view && (
          <div>
            {loading && <p>Loading appointments...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
              <>
                {renderAppointments(view === 'online' ? onlineAppointments : appointments)}
                {view === 'online' && renderVideoCallCards(onlineAppointments)}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
