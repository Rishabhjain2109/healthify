// src/api/auth.js
import API from '../utils/axios';

export async function login({ email, password, role }) {
  const res = await API.post('/api/auth/login', { email, password, role });
  return res.data;
}

export async function signup({ fullname, email, password, confirmPassword, role, specialty }) {
  console.log("SIGNUP REQUEST BODY:", { fullname, email, password, confirmPassword, role, specialty });
  const res = await API.post('/api/auth/signup', { fullname, email, password, confirmPassword, role, specialty });
  return res.data;
}
