import React, { useState } from 'react';
import { signup } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    specialty: '',
    managerName: '',
    labName: '',
    branchCode: ''
  });
  
  // Location state for doctors
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Detect location for doctors
  const detectLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          // Call backend to get address, city, state, zip
          try {
            const res = await axios.post('/api/utils/reverse-geocode', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },{timeout:5000});
            setAddress(res.data.address);
            setCity(res.data.city);
            setState(res.data.state);
            setZipCode(res.data.zipCode);
          } catch (err) {
            setAddress('');
            setCity('');
            setState('');
            setZipCode('');
          }
          setLocationLoading(false);
        },
        (error) => {
          alert('Location access denied or unavailable');
          setLocationLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Add location fields for doctor or lab
      let submitData = { ...formData };
      if (formData.role === 'doctor' || formData.role === 'lab') {
        submitData.latitude = latitude;
        submitData.longitude = longitude;
        submitData.address = address;
        submitData.city = city;
        submitData.state = state;
        submitData.zipCode = zipCode;
      }
      if (formData.role === 'lab') {
        submitData.managerName = formData.fullname;
      }
      //console.log('Submitting form data:', submitData);
      const data = await signup(submitData);
      if (data.message) {
        setError(data.message);
      } else {
        // store JWT + user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Signup failed.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>{formData.role === 'lab' ? 'Manager Name' : 'Full Name'}</label>
        <input name="fullname" value={formData.fullname} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="" disabled>Select role</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="lab">Lab</option>
        </select>

{formData.role === 'doctor' && (
  <>
    <label>Specialty</label>
    <select name="specialty" value={formData.specialty} onChange={handleChange} required>
      <option value="" disabled>Select specialty</option>
      <option value="Cardiologist">Cardiologist</option>
      <option value="Neurologist">Neurologist</option>
      <option value="Dermatologist">Dermatologist</option>
      <option value="Orthopedic">Orthopedic</option>
      <option value="Pediatrician">Pediatrician</option>
      <option value="Psychiatrist">Psychiatrist</option>
      <option value="Oncologist">Oncologist</option>
      <option value="ENT">ENT</option>
    </select>
      {/* location for doctors */}
    <button type="button" onClick={detectLocation} disabled={locationLoading}>
      {locationLoading ? 'Detecting...' : 'Detect My Location'}
    </button>
    {latitude && longitude && (
      <div>
        <p>Latitude: {latitude}</p>
        <p>Longitude: {longitude}</p>
        {address && <p>Address: {address}</p>}
      </div>
    )}
  </>
)}

{formData.role === 'lab' && (
  <>
    <label>Lab Name</label>
    <input name="labName" value={formData.labName || ''} onChange={handleChange} required />
    <label>Branch Code</label>
    <input name="branchCode" value={formData.branchCode || ''} onChange={handleChange} required />
    <button type="button" onClick={detectLocation} disabled={locationLoading}>
      {locationLoading ? 'Detecting...' : 'Detect My Location'}
    </button>
    {latitude && longitude && (
      <div>
        <p>Latitude: {latitude}</p>
        <p>Longitude: {longitude}</p>
        {address && <p>Address: {address}</p>}
      </div>
    )}
  </>
)}

  <button type="submit">Create Account</button>
  {error && <p style={styles.error}>{error}</p>}
</form>

      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '350px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' },
  form: { display: 'flex', flexDirection: 'column' },
  error: { color: 'red', marginTop: '10px' }
};

export default Signup;