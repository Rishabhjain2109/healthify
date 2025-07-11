import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/axios';
import heroDoctor from '../assets/Doctor.png'
import Calendar1 from '../components/Calendar1';


function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const [view, setView] = useState('');
  const [text,setText] = useState('View More');
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = () => {
    setText('View More >');
  };

  const handleMouseLeave = () => {
    setText('View More');
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

  useEffect(() => {
    
    const fetchData = async ()=>{
      try {
        const { data } = await API.get('/api/appointments');
        
        const sortedData = [...data].sort((a, b) => {
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        });

        setAppointments(sortedData);
        console.log(sortedData[0],"Here");
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Unable to fetch appointments details.');
      }
    }
  
    fetchData();

  }, []);
  


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
        .main-page {
          width:100%;
          height: 100vh;
          display:flex;
        }
        
        .sidebar {
          width: 20%;
          display:flex;
          flex-direction:column;
          gap: 1em;
          padding: 1vw;
          border-right: 1px solid rgba(0, 0, 0, 0.44);
        }

        .sidebar button{
          width: 20em;
          height: 3em;
          background: white;
          border: none;
          transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
          margin-left: 1vw;
        }
        
        .sidebar button:hover{
          background: gray;
          color: white;
          cursor: pointer;
        }
        .contents{
          width: 60%;
          padding: 1em;
          background-color: #e3f3ff;
        }
        .contents h1{
          margin-bottom:0;
          margin-top:0;
        }
        .namehead{
          font-size: 1.3em;
          color: gray;
          font-weight: 500;
        }
        .rightBar{
          width: 20%
        }
        .banner{
          height: 40%;
          width: 90%;
          border-radius: 1em;
          background-color:rgb(73, 176, 255);
          display:flex;
          margin-left: 5%;
          margin-top: 2%;
          transition: all ease 0.3s;
        }
        .banner .text{
          width:50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .banner .text h3{
          width: fit-content;
          color: white;
          font-size: 2em;
        }
        .banner:hover{
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .buttons button{
          height: 6vh;
          width: 18vh;
          background-color: rgb(73, 176, 255);
          color:white;
          font-weight:600; 
          border: 1px solid white;
          border-radius: 0.5em;
          box-shadow: none;
          appearance: none;
          cursor: pointer; 
          transition: all ease 0.3s;
        }
        .buttons button:hover{
          background-color: white;
          color: rgb(73, 176, 255);
        }
        .secDiv{
          width: 90%;
          display: grid;
          grid-template-rows: repeat(2,1fr);
          grid-template-columns: repeat(3,1fr);
          gap: 1em;
          margin-left: 5%;
          margin-top: 2%;
        }
        .secDiv div{
          height:7em;
          width: auto;
          background-color: rgb(255, 255, 255);
          border-radius: 1em;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          display:flex;
          justify-content: center;
          align-items:center;
        }
        .secDiv div:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          cursor:pointer;
        }
        .rightBar .insuranceBalance{
          background-color: white;
          height: 2em;
          width: 1em;
        }
      `}</style>

      <div className='main-page'>
        <div className='sidebar'>
            SideBar

            {user?.role === 'doctor' && <button onClick={() => navigate('/update-fee')}>Set Fee</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/search')}>Find a Doctor &nbsp;&nbsp;🔎︎</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/lab-tests')}>Lab Test &nbsp;&nbsp;☤</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/lab-reports')}>Your Reports &nbsp;&nbsp;📄</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/medicines')}>My Medicines &nbsp;&nbsp;⚗</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/my-orders')}>My Orders &nbsp;&nbsp;📦︎</button>}

        </div>
        <div className='contents'>
            <h1 className='namehead'>Hii, {user?.fullname || user?.managerName || 'User'} </h1>
            <h1>Welcome Back !</h1>

            <div className='banner'>
              <div className='text'>
                <h3>Have You Had a <br/> Routine Health Check <br/> this Month ?</h3>
                <div className='buttons' style={{display:'flex', gap:'3vw'}}>
                  <button>Check Now</button>
                  <button>View Report</button>
                </div>
              </div>
              <div className='heroDoctor' style={{width:'50%',display:'flex', justifyContent:'center', alignItems: 'center'}}>
                <img style={{height:'40vh'}} src={heroDoctor}/>
              </div>
            </div>

            <div className='secDiv'>
              <div>Orthopedic</div>
              <div>Cardiologist</div>
              <div>Oncologist</div>
              <div>Neurologist</div>
              <div>Pediatrician</div>
              <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <span className={`fade-text ${hovered ? 'visible' : ''}`}>
                  {hovered ? 'View More >' : 'View More'}
                </span>
              </div>
            </div>

        </div>
        <div className='rightBar' style={{backgroundColor: 'rgb(152, 211, 255)',display:'flex',flexDirection:'column'}}>
            <h3 style={{fontSize:'1em', color:'rgb(30, 30, 30)', width:'fit-content',marginLeft:'2vh'}}>Upcoming Check Up</h3>
            <div className='calendar' style={{height:'35%',width:'90%',backgroundColor:'white',marginLeft:'2vh',borderRadius:'2vh'}}>
              
              {appointments.length > 0 && <Calendar1 data={appointments[0].time} />}
            </div>

            <div className='insuranceBalance' style={{height:'10%',width:'90%',backgroundColor:'white',marginLeft:'2vh',borderRadius:'2vh',marginTop: '2vh',display:'flex',justifyContent:'center',alignItems:'center',gap:'2%'}}>
              <div>
                Insurance Balance
              </div>
              <div>
                ₹24,000
              </div>
            </div>
        </div>
      </div>
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
              {user?.role === 'patient' && <button onClick={() => navigate('/medicines')}>My Medicines</button>}
              {user?.role === 'patient' && <button onClick={() => navigate('/my-orders')}>My Orders</button>}

              <button onClick={fetchAppointments}>Your Appointments</button>
              <button onClick={fetchOnlineAppointments}>Your Online Appointments</button>
          <button onClick={handleLogout}>Log Out</button>
            </>
          )}
        </div>

        {view && user?.role !== 'lab' && (
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