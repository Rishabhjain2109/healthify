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
import DoctorProfile from './components/DoctorProfile'
import BookAppointment from './pages/BookAppointment'
import UpdateFee from './pages/UpdateFee';
import LabTestPage from './pages/LabTestPage';
import LabReportsPage from './pages/LabReportsPage';
import LabDashboard from './pages/LabDashboard';
import LabProfile from './pages/LabProfile';
import VideoCallPage from './pages/VideocallPage'
import Medicine from './pages/Medicine';
import MyOrders from './pages/MyOrders'
import Navbar from './components/Navbar'
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorOnlineAppointments from './pages/DoctorOnlineAppointments';


function App() {
  const { user } = React.useContext(AuthContext)

  return (
    <BrowserRouter>
      {user?.role === 'patient' && <Navbar/>}
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
        <Route path="/doctors/:id" element={<DoctorProfile/>}/>
        <Route path="/book-appointment/:docId" element={<BookAppointment/>}/>
        <Route
          path="/update-fee"
          element={user && user.role === 'doctor' ? <UpdateFee /> : <Navigate to="/login" />}
        />
        <Route
          path="/lab-tests"
          element={user && user.role === 'patient' ? <LabTestPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/lab-reports"
          element={user && user.role === 'patient' ? <LabReportsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/lab-dashboard"
          element={user && user.role === 'lab' ? <LabDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/lab-profile"
          element={user && user.role === 'lab' ? <LabProfile /> : <Navigate to="/login" />}
        />

        <Route path="/video-call/:roomId" element={<VideoCallPage/>}/>

        <Route
          path="/medicines"
          element={user && user.role === 'patient' ? <Medicine /> : <Navigate to="/login" />}
        />

        <Route
          path="/my-orders"
          element={user && user.role === 'patient' ? <MyOrders /> : <Navigate to="/login" />}
        />

        <Route
          path="/doctor/appointments"
          element={user && user.role === 'doctor' ? <DoctorAppointments /> : <Navigate to="/login" />}
        />
        <Route
          path="/doctor/online-appointments"
          element={user && user.role === 'doctor' ? <DoctorOnlineAppointments /> : <Navigate to="/login" />}
        />

      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
