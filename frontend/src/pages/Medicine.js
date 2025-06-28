


import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

export default function Medicine() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const {user} = useContext(AuthContext);

  const searchMedicine = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/medicines/search?name=${searchTerm}`);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };



  const addToInventory = async (med, quantity = 1) => {
  try {
    await axios.post('/api/medicines/inventory', {
      name: med.name,
      price: med.price,
      quantity
    });
    fetchInventory();
  } catch (err) {
    console.error('Error adding to inventory:', err);
  }
};


  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/medicines/inventory');
      setInventory(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const removeFromInventory = async (id) => {
    try {
      console.log(id);
      await axios.delete(`/api/medicines/inventory/${id}`);
      fetchInventory();
    }  catch (err) {
      console.error('Remove error:', err.response?.data || err.message);
      alert('Failed to remove medicine');
    }
  };


  const placeOrder = async () => {
    try {
      console.log(user.id);
      
      await axios.post('/api/medicines/order',{
        userId:user.id,
      });
      fetchInventory();
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Order error:', err);
    }
  };

  const totalCost = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0);


  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Search Medicines</h2>
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Enter medicine name..."
        />
        <button onClick={searchMedicine} style={styles.button} disabled={!searchTerm.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <h3>Search Results</h3>
      {results.length === 0 && !loading && <p>No medicines found.</p>}
      <ul style={styles.list}>
        {results.map((med, i) => (
          <li key={i} style={styles.item}>
            <strong>{med.name}</strong> — ₹{med.price * (quantities[med.name] || 1)}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                value={quantities[med.name] || 1}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [med.name]: parseInt(e.target.value),
                  }))
                }
                style={{ width: '60px', marginLeft: '10px', marginRight: '10px' }}
              />
              <button
                style={styles.addButton}
                onClick={() => addToInventory(med, quantities[med.name] || 1)}
              >
                Add
              </button>
            </div>
          </li>
        ))}

      </ul>

      <h3>Your Cart</h3>
      {inventory.length === 0 ? (
        <p>No medicines in inventory yet.</p>
      ) : (
        <>
          <ul style={styles.list}>
            {inventory.map(item => (
              <li key={item._id} style={styles.item}>
                {item.name} x {item.quantity} — ₹{item.price * item.quantity}
                <button
                  style={styles.removeButton}
                  onClick={() => removeFromInventory(item._id)}
                >
                  Remove
                </button>
              </li>

            ))}
          </ul>
          <li style={styles.item}>
            <strong>Total Cost:</strong> ₹{totalCost}
            <button style={styles.placeOrderButton} onClick={placeOrder}>
              Place Order
            </button>
          </li>

          
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: '40px auto', padding: 20 },
  searchBar: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px', fontSize: '16px' },
  button: { padding: '10px 20px', fontSize: '16px', cursor: 'pointer' },
  list: { listStyle: 'none', padding: 0 },
  item: {
    marginBottom: 10,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addButton: {
    marginLeft: '10px',
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  placeOrderButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },

  removeButton: {
  marginLeft: '10px',
  padding: '6px 12px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
}

};
