import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorOnlineAppointments() {
  const { user } = useContext(AuthContext);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOnlineAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get('/api/getonlinemeetings', {
          params: {
            id: user.id,
            role: user.role
          }
        });
        setOnlineAppointments(data);
      } catch (err) {
        setError('Failed to fetch online appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOnlineAppointments();
  }, [user]);

  const handleTimeChange = (roomId, value) => {
    setTimeInputs(prev => ({ ...prev, [roomId]: value }));
  };

  const handleSetOnlineTime = async (roomId) => {
    try {
      const time = timeInputs[roomId];
      if (!time) {
        alert('Please select a time.');
        return;
      }
      const { data } = await API.put(`/api/getonlinemeetings/setonlinemeetingtime/${roomId}`, { time });
      setOnlineAppointments(prev => prev.map(m => m.roomId === roomId ? data.updatedMeeting : m));
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

  return (
    <div className="doctor-appt-root-premium">
      <style>{`
        body {
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        .doctor-appt-root-premium {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(120deg, #e0f7fa 0%, #e3f0ff 40%, #e6f7ff 100%);
          background-repeat: no-repeat;
          background-attachment: fixed;
          padding: 0;
        }
        .doctor-appt-premium-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 16px 64px 16px;
        }
        .doctor-appt-title-premium {
          font-size: 2.5em;
          font-weight: 800;
          color: #007bff;
          margin-bottom: 48px;
          text-align: center;
          letter-spacing: 1px;
        }
        .doctor-appt-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 36px;
        }
        .doctor-appt-card-premium {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 123, 255, 0.10);
          padding: 36px 32px 28px 0;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          position: relative;
          min-height: 210px;
          overflow: hidden;
        }
        .doctor-appt-card-accent {
          width: 10px;
          height: 100%;
          background: #007bff;
          border-radius: 20px 0 0 20px;
          position: absolute;
          left: 0;
          top: 0;
        }
        .doctor-appt-card-content {
          margin-left: 28px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .doctor-appt-patient-premium {
          font-size: 1.25em;
          font-weight: 700;
          color: #222;
          margin-bottom: 2px;
        }
        .doctor-appt-label-premium {
          color: #007bff;
          font-weight: 600;
        }
        .doctor-appt-status-premium {
          display: inline-block;
          font-size: 1em;
          font-weight: 700;
          padding: 4px 18px;
          border-radius: 16px;
          margin-left: 8px;
          letter-spacing: 0.5px;
        }
        .doctor-appt-status-premium.pending {
          background: #e3f0ff;
          color: #007bff;
          border: 1.5px solid #b3d1ff;
        }
        .doctor-appt-status-premium.confirmed {
          background: #e6f0ff;
          color: #007bff;
          border: 1.5px solid #b3d1ff;
        }
        .doctor-appt-time-premium {
          color: #333;
          font-size: 1.08em;
        }
        .doctor-appt-actions-premium {
          margin-top: 18px;
          display: flex;
          gap: 14px;
        }
        .doctor-appt-actions-premium input[type="datetime-local"] {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid #b3d1ff;
          font-size: 1em;
          outline: none;
          transition: border 0.2s;
          background: #f7fbff;
        }
        .doctor-appt-actions-premium input[type="datetime-local"]:focus {
          border: 2px solid #007bff;
        }
        .doctor-appt-actions-premium button {
          background: #007bff;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 28px;
          font-size: 1.08em;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,123,255,0.10);
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }
        .doctor-appt-actions-premium button:hover {
          background: #0056b3;
          box-shadow: 0 6px 18px rgba(0,123,255,0.13);
          transform: translateY(-2px) scale(1.03);
        }
        .doctor-appt-empty-premium, .doctor-appt-loading-premium, .doctor-appt-error-premium {
          text-align: center;
          color: #888;
          font-size: 1.18em;
          margin-top: 60px;
        }
        .doctor-appt-error-premium { color: #e53935; }
      `}</style>
      <div className="doctor-appt-premium-container">
        <div className="doctor-appt-title-premium">Your Online Appointments</div>
        {loading && <div className="doctor-appt-loading-premium">Loading online appointments...</div>}
        {error && <div className="doctor-appt-error-premium">{error}</div>}
        {!loading && !error && onlineAppointments.length === 0 && (
          <div className="doctor-appt-empty-premium">No online appointments found.</div>
        )}
        {!loading && !error && onlineAppointments.length > 0 && (
          <div className="doctor-appt-grid-premium">
            {onlineAppointments.map((meeting, index) => (
              <div key={index} className="doctor-appt-card-premium">
                <div className="doctor-appt-card-accent"></div>
                <div className="doctor-appt-card-content">
                  <div className="doctor-appt-patient-premium">Patient: {meeting.patient?.name || meeting.patient}</div>
                  <div><span className="doctor-appt-label-premium">Room ID:</span> {meeting.roomId}</div>
                  <div>
                    <span className="doctor-appt-label-premium">Status:</span>{' '}
                    <span className={`doctor-appt-status-premium ${meeting.status === 'Pending' ? 'pending' : 'confirmed'}`}>{meeting.status || 'No status'}</span>
                  </div>
                  <div className="doctor-appt-time-premium"><span className="doctor-appt-label-premium">Time:</span> {meeting.time || 'Not set'}</div>
                  <div className="doctor-appt-actions-premium">
                    <input
                      type="datetime-local"
                      value={timeInputs[meeting.roomId] || ''}
                      onChange={e => handleTimeChange(meeting.roomId, e.target.value)}
                    />
                    <button onClick={() => handleSetOnlineTime(meeting.roomId)}>Set Time & Confirm</button>
                  </div>
                  <div className="doctor-appt-actions-premium">
                    <button
                      onClick={() => navigate(`/video-call/${meeting.roomId}`)}
                    >
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 