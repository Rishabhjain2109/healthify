import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

function DoctorSearch() {
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, matched: 0 });
  const [userLocation, setUserLocation] = useState(null);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [useRealTimeDistance, setUseRealTimeDistance] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

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
      
      // Build search URL with location parameters
      let searchUrl = `/api/doctors/search?q=${encodeURIComponent(query)}`;
      if (userLocation && showDistanceFilter) {
        searchUrl += `&lat=${userLocation.lat}&lon=${userLocation.lon}&distance=${maxDistance}`;
        if (useRealTimeDistance) {
          searchUrl += '&realTime=true';
        }
      }
      
      const res = await axios.get(searchUrl);//this line sends the get request to backend
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

  const toggleDistanceFilter = () => {
    setShowDistanceFilter(!showDistanceFilter);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Find a Doctor</h2>
      <p style={styles.subtitle}>Search for doctors based on your symptoms or condition</p>
      
      <div style={styles.searchContainer}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

      {/* Distance Filter Section */}
      <div style={styles.filterSection}>
        <button 
          onClick={toggleDistanceFilter}
          style={styles.filterToggleButton}
        >
          {showDistanceFilter ? 'Hide' : 'Show'} Distance Filter
        </button>
        
        {showDistanceFilter && (
          <div style={styles.filterOptions}>
            <div style={styles.locationStatus}>
              {locationLoading ? (
                <p>Getting your location...</p>
              ) : userLocation ? (
                <p style={styles.locationText}>
                  📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                </p>
              ) : (
                <div>
                  <p>Location not available</p>
                  <button onClick={getCurrentLocation} style={styles.locationButton}>
                    Enable Location
                  </button>
                </div>
              )}
            </div>
            
            {userLocation && (
              <div style={styles.distanceControls}>
                <label style={styles.label}>
                  Maximum Distance: {maxDistance} km
                  <input
                    type="range"
                    min="5"
                    max="500"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    style={styles.rangeInput}
                  />
                </label>
                
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={useRealTimeDistance}
                      onChange={(e) => setUseRealTimeDistance(e.target.checked)}
                      style={styles.checkbox}
                    />
                    Use real-time distance (Google Maps)
                  </label>
                </div>
                
                {useRealTimeDistance && (
                  <p style={styles.infoText}>
                    ℹ️ Real-time distance uses Google Maps API to calculate actual driving distance and time
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.stats}>
        <p>Total doctors in system: {stats.total}</p>
        {stats.matched > 0 && <p>Doctors found: {stats.matched}</p>}
        {showDistanceFilter && userLocation && (
          <p>Searching within {maxDistance}km of your location</p>
        )}
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
                {doc.distance && (
                  <div style={styles.distanceInfo}>
                    <p style={styles.distance}>📍 {doc.distance}</p>
                    {doc.duration && doc.duration !== 'N/A' && (
                      <p style={styles.duration}>⏱️ {doc.duration}</p>
                    )}
                  </div>
                )}
                {doc.address && (
                  <p style={styles.address}>🏥 {doc.address}</p>
                )}
                <button style={styles.bookButton}>Book Appointment</button>
                {/* Get Directions Button - now a real button */}
                {userLocation && doc.latitude && doc.longitude && (
                  <button
                    style={styles.directionsButton}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${doc.latitude},${doc.longitude}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Get Directions
                  </button>
                )}
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
  filterSection: {
    marginBottom: '30px',
  },
  filterToggleButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filterOptions: {
    marginTop: '10px',
  },
  locationStatus: {
    marginBottom: '10px',
  },
  locationText: {
    marginBottom: '10px',
  },
  locationButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  distanceControls: {
    marginTop: '10px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
  },
  rangeInput: {
    width: '100%',
  },
  checkboxLabel: {
    marginLeft: '10px',
  },
  checkbox: {
    marginRight: '5px',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px',
  },
  distance: {
    color: '#7f8c8d',
    marginBottom: '15px',
  },
  address: {
    color: '#7f8c8d',
    marginBottom: '15px',
  },
  distanceInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  duration: {
    color: '#7f8c8d',
    marginLeft: '10px',
  },
  infoText: {
    color: '#7f8c8d',
    marginTop: '10px',
  },
  directionsButton: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default DoctorSearch;
