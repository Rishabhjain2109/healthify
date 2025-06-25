import React, { useEffect, useState } from 'react';
import API from '../utils/axios';

function LabProfile() {
  const [form, setForm] = useState({
    labName: '',
    managerName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/api/profile/lab/me');
      setForm({
        labName: data.labName || '',
        managerName: data.managerName || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        latitude: data.latitude || '',
        longitude: data.longitude || ''
      });
    } catch {
      setError('Failed to load lab profile.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/api/profile/lab/update', form);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 1500);
    } catch {
      setError('Failed to update profile.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Update Lab Profile</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Lab Name
          <input name="labName" value={form.labName} onChange={handleChange} required style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Manager Name
          <input name="managerName" value={form.managerName} onChange={handleChange} required style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} required type="email" style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={handleChange} style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          State
          <input name="state" value={form.state} onChange={handleChange} style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Zip Code
          <input name="zipCode" value={form.zipCode} onChange={handleChange} style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Latitude
          <input name="latitude" value={form.latitude} onChange={handleChange} type="number" style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <label>
          Longitude
          <input name="longitude" value={form.longitude} onChange={handleChange} type="number" style={{ padding: 8, borderRadius: 6 }} />
        </label>
        <button type="submit" style={{ padding: '10px 0', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, fontSize: 16 }}>
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default LabProfile; 