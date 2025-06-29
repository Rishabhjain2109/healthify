
import React from 'react';
import { Link } from 'react-router-dom';
import LandingImage from '../assets/LandingImage.jpg'

export default function Landing() {
  return (
    <div style={{
      display: 'flex',
      height: '90vh',
      alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', marginTop: '60px', width:'50vw', }}>
        <h1>Welcome to Healthify</h1>
        <p>Your health, our priority. Join us as a doctor or patient.</p>
        <div style={{ marginTop: '30px' }}>
          <Link to="/signup" style={styles.btn}>Get Started</Link>
          <br />
          <Link to="/login" style={styles.link}>Already have an account? Log in</Link>
        </div>
      </div>
      <div>
        <img src={LandingImage} alt='Landing'/>
      </div>
      
    </div>
  );
}

const styles = {
  btn: {
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    marginBottom: '10px',
    display: 'inline-block'
  },
  link: {
    textDecoration: 'underline',
    color: '#333',
    marginTop: '10px',
    display: 'block'
  }
};
