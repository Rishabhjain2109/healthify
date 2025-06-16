import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axios';
import './UpdateProfile.css';

export default function UpdateProfile() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    specialty: '',
    currentPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [original, setOriginal] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile/me');
        console.log('Profile data:', response.data);
        
        setForm({
          fullname: response.data.fullname || '',
          email: response.data.email || '',
          specialty: response.data.specialty || '',
          password: '', // Don't load password
          currentPassword: ''
        });
        setOriginal({
          fullname: response.data.fullname || '',
          email: response.data.email || '',
          specialty: response.data.specialty || ''
        });
      } catch (err) {
        console.error('Profile loading error:', err);
        setMessage({ 
          text: 'Failed to load profile data. Please try again.', 
          type: 'error' 
        });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.currentPassword) {
      setMessage({ text: 'Current password is required to update profile.', type: 'error' });
      return;
    }
    // Only send changed fields + currentPassword
    const updateData = { currentPassword: form.currentPassword };
    if (form.fullname !== original.fullname) updateData.fullname = form.fullname;
    if (form.email !== original.email) updateData.email = form.email;
    if (user?.role === 'doctor' && form.specialty !== original.specialty) updateData.specialty = form.specialty;
    if (form.password) updateData.password = form.password;
    if (Object.keys(updateData).length === 1) { // only currentPassword
      setMessage({ text: 'No changes to update.', type: 'error' });
      return;
    }
    try {
      const response = await axios.put('/api/profile/update', updateData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setForm(prev => ({ ...prev, password: '', currentPassword: '' }));
      // Update original to new values
      setOriginal(orig => ({
        ...orig,
        ...updateData,
        password: undefined,
        currentPassword: undefined
      }));
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || 'Update failed. Please try again.', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="update-profile-container">
      <h2>Update Profile</h2>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="update-profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {user?.role === 'doctor' && (
          <div className="form-group">
            <label>Specialty</label>
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        )}

        <div className="form-group">
          <label>New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Current Password <span style={{color: 'red'}}>*</span></label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="update-button">
          Update Profile
        </button>
      </form>
    </div>
  );
}
