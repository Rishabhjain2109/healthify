import React, { useState, useContext } from 'react'
import { login as apiLogin } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'patient' }) // ← default role
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const data = await apiLogin(formData)
      if (data.message) {
        setError(data.message)
      } else {
        login(data.user, data.token)
        navigate('/dashboard')
      }
    } catch {
      setError('Login failed.')
    }
  }

  return (
    <div style={{ maxWidth: '350px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        
        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="lab">Lab</option>
        </select>

        <button type="submit">Log In</button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
  )
}
