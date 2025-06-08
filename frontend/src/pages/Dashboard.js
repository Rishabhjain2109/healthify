// src/pages/Dashboard.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

 function Dashboard() {
   const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

   const handleLogout = () => {
    logout();
    navigate('/login');
   };

   return (
     <div style={{ padding: '20px' }}>
      <h1>Welcome, {user?.fullname || 'User'}!</h1>
      <p>Your role: {user?.role || 'N/A'}</p>
       <p>This is your dashboard. Implement appointment features here.</p>
       <button onClick={handleLogout}>Log Out</button>
     </div>
   );
 }

 export default Dashboard;






