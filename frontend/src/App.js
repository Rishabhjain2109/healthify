import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './pages/Dashboard'
import DoctorSearch from './pages/DoctorSearch';
import UpdateProfile from './components/UpdateProfile';
import { AuthContext } from './context/AuthContext'
import Landing from './pages/Landing';
import Footer from './components/Footer';

function App() {
  const { user } = React.useContext(AuthContext)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={user && user.role === 'patient' ? <DoctorSearch /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <UpdateProfile /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/" element={<Landing />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
