
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.fullname}!</h2>
      <p>You are logged in as a <strong>{user.role}</strong>.</p>

      {user.role === 'doctor' && (
        <div style={styles.card}>
          <p><strong>Specialty:</strong> {user.specialty || 'Not specified'}</p>
          <Link to="/profile" style={styles.link}>Update Your Profile</Link>
        </div>
      )}

      {user.role === 'patient' && (
        <div style={styles.card}>
          <p>Need medical help?</p>
          <Link to="/search" style={styles.link}>Search for Doctors</Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  card: { border: '1px solid #ddd', padding: '16px', borderRadius: '6px', marginTop: '20px' },
  link: { color: 'blue', textDecoration: 'underline' }
};
