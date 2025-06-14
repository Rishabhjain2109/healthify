// src/api/auth.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export async function login({ email, password, role }) {
  const res = await API.post('/auth/login', { email, password, role });
  return res.data;
}

export async function signup({ fullname, email, password, confirmPassword, role, specialty }) {
  console.log("SIGNUP REQUEST BODY:", { fullname, email, password, confirmPassword, role, specialty });
  const res = await API.post('/auth/signup', { fullname, email, password, confirmPassword, role, specialty });
  return res.data;
}
