// src/api/auth.js
import API from '../utils/axios';

export async function login({ email, password, role }) {
  const res = await API.post('/api/auth/login', { email, password, role });
  return res.data;
}

export async function signup(formData) {
  // Send all fields, including location if present
  const res = await API.post('/api/auth/signup', formData);
  return res.data;
}
