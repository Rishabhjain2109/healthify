import { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);

  const fetch = async () => {
    try {
      const res = await axios.get('/medicines/list');
      setMedicines(res.data);
    } catch {
      setMedicines([]);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/medicines/list/${id}`);
      fetch(); // refresh list
    } catch {
      alert('Failed to delete medicine.');
    }
  };

  return (
    <div>
      <h2>All Medicines</h2>
      {medicines.length === 0 ? (
        <p>No medicines available.</p>
      ) : (
        <ul>
          {medicines.map(med => (
            <li key={med._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: 6 }}>
              <strong>{med.name}</strong> — ₹{med.price}  
              <br />
              <small>{med.description}</small>
              <br />
              <em>Stock left:</em> {med.stock}
              <br />
              <button onClick={() => handleDelete(med._id)} style={{ marginTop: '8px', color: 'white', backgroundColor: 'red', border: 'none', padding: '6px 10px', borderRadius: 4 }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
