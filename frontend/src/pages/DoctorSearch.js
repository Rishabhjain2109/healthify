import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

function DoctorSearch() {
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, matched: 0 });

  const commonSymptoms = [
    { keyword: 'heart', label: 'Heart Problems' },
    { keyword: 'brain', label: 'Brain/Nervous System' },
    { keyword: 'skin', label: 'Skin Issues' },
    { keyword: 'bones', label: 'Bone/Joint Problems' },
    { keyword: 'child', label: 'Child Health' },
    { keyword: 'mind', label: 'Mental Health' },
    { keyword: 'cancer', label: 'Cancer' },
    { keyword: 'ear', label: 'Ear/Nose/Throat' }
  ];

  // Load all doctors on component mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await axios.get('/api/doctors');
        console.log('All doctors:', res.data);
        setStats({ total: res.data.doctors.length, matched: 0 });
      } catch (err) {
        console.error('Error loading doctors:', err);
      }
    };
    loadDoctors();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a symptom or disease');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      console.log('Making search request for query:', query);
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const res = await axios.get(`/api/doctors/search?q=${encodeURIComponent(query)}`);
      console.log('Search response:', res.data);
      
      if (!res.data || !Array.isArray(res.data.doctors)) {
        throw new Error('Invalid response format from server');
      }
      
      setDoctors(res.data.doctors);
      setStats({ total: res.data.total, matched: res.data.matched });
      
      if (res.data.doctors.length === 0) {
        setError('No doctors found for this condition. Please try a different search term.');
      }
    } catch (err) {
      console.error('Search error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Search failed. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomClick = (keyword) => {
    setQuery(keyword);
    handleSearch();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Find a Doctor</h2>
      <p style={styles.subtitle}>Search for doctors based on your symptoms or condition</p>
      
      <div style={styles.searchContainer}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter your symptoms or condition (e.g., heart, skin, brain)"
          style={styles.input}
        />
        <button 
          onClick={handleSearch} 
          style={styles.searchButton}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div style={styles.stats}>
        <p>Total doctors in system: {stats.total}</p>
        {stats.matched > 0 && <p>Doctors found: {stats.matched}</p>}
      </div>

      <div style={styles.commonSymptoms}>
        <h3>Common Symptoms:</h3>
        <div style={styles.symptomButtons}>
          {commonSymptoms.map((symptom) => (
            <button
              key={symptom.keyword}
              onClick={() => handleSymptomClick(symptom.keyword)}
              style={styles.symptomButton}
            >
              {symptom.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      
      {doctors.length > 0 && (
        <div style={styles.results}>
          <h3>Available Doctors:</h3>
          <div style={styles.doctorList}>
            {doctors.map((doc) => (
              <Link to={`/doctors/${doc._id}`} key={doc._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={styles.doctorCard}>
                <h4 style={styles.doctorName}>{doc.fullname}</h4>
                <p style={styles.specialty}>Specialty: {doc.specialty}</p>
                <button style={styles.bookButton}>Book Appointment</button>
              </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: '30px',
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  stats: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#7f8c8d',
  },
  commonSymptoms: {
    marginBottom: '30px',
  },
  symptomButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
  },
  symptomButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    margin: '20px 0',
  },
  results: {
    marginTop: '30px',
  },
  doctorList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  doctorCard: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  doctorName: {
    margin: '0 0 10px 0',
    color: '#2c3e50',
  },
  specialty: {
    color: '#7f8c8d',
    marginBottom: '15px',
  },
  bookButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default DoctorSearch;
