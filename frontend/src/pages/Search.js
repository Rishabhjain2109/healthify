import React, { useState } from 'react';
import axios from '../utils/axios';

export default function Search() {
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch search results with page param
  const fetchDoctors = async (page = 1) => {
    if (!query) return;

    setLoading(true);
    try {
      const res = await axios.get('/api/doctors/search', {
        params: {
          q: query,
          page: page,
          limit: 10,
        },
      });

      setDoctors(res.data.doctors || []);
      setPagination(res.data.pagination || null);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to search doctors:', err);
      setDoctors([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    fetchDoctors(1); // Reset to page 1 on fresh search
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    fetchDoctors(newPage);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Search for Doctors</h2>

      {/* Search Input Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        >
          <option value="">Select Specialty / Keyword</option>
          <option value="cardiologist">Cardiologist</option>
          <option value="dermatologist">Dermatologist</option>
          <option value="neurologist">Neurologist</option>
        </select>

        <button
          onClick={handleSearchClick}
          disabled={!query || loading}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results List */}
      {doctors.length > 0 && (
        <div>
          <h3>Results ({pagination?.totalItems || doctors.length} Found):</h3>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {doctors.map((doc) => (
              <li
                key={doc._id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {doc.fullname}
                </div>
                <div style={{ color: '#555', margin: '4px 0' }}>
                  Specialty: <em>{doc.specialty}</em>
                </div>
                {doc.distance && (
                  <div style={{ fontSize: '0.9rem', color: '#0070f3' }}>
                    Distance: {doc.distance} {doc.duration !== 'N/A' && `(${doc.duration})`}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Page Navigation Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginTop: '25px',
                paddingTop: '15px',
                borderTop: '1px solid #eee',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  style={{
                    padding: '6px 12px',
                    cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                  }}
                >
                  &larr; Prev
                </button>

                {/* Numbered Page Buttons */}
                {Array.from({ length: pagination.totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: isActive ? 'bold' : 'normal',
                        backgroundColor: isActive ? '#0070f3' : '#f0f0f0',
                        color: isActive ? '#fff' : '#000',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  style={{
                    padding: '6px 12px',
                    cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                  }}
                >
                  Next &rarr;
                </button>
              </div>

              {/* Status Text */}
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Showing page <strong>{pagination.currentPage}</strong> of{' '}
                <strong>{pagination.totalPages}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {!loading && doctors.length === 0 && query && (
        <p style={{ color: '#888' }}>No doctors found matching your query.</p>
      )}
    </div>
  );
}