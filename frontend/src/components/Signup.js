import React, { useState } from 'react';
import { signup } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    specialty: ''
  });
  
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Submitting form data:', formData);
      const data = await signup(formData);
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
        <label>Full Name</label>
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