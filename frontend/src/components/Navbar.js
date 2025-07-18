import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = ()=> {logout(); navigate('/login');}

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Example toggle handler (replace with real auth logic)
  

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" style={{cursor:'pointer'}} onClick={()=>navigate('/dashboard')}>Healthify</div>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <a href="/dashboard">Home</a>
          <a href="/search">Find Doctors</a>
          <a href="/lab-tests">Lab Test</a>
          <a href="/medicines">Medicines</a>
          <a href="/appointments">Appointments</a>
          
          <a className="login-btn" href='/login' onClick={handleLogout}>
            {localStorage.getItem('user') ? 'Logout' : 'Login'}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
