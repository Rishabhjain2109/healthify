import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UpdateFee = () => {
    const { user } = useContext(AuthContext);
    const [fee, setFee] = useState(user?.fees || '');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/api/profile/doctor/fee',
                { fees: fee },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Fee updated successfully!');
        } catch (error) {
            setMessage('Failed to update fee. Please try again.');
            console.error('Error updating fee:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Update Your Consultation Fee</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="fee">Fee (INR)</label>
                    <input
                        type="number"
                        id="fee"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Save Fee
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
};

export default UpdateFee; 