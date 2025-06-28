import { useState } from 'react';
import axios from '../utils/axios';

export default function AddMedicineForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });

  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/medicines/list', {
        ...form,
        price: parseFloat(form.price)
      });
      setMessage('Medicine added successfully!');
      setForm({ name: '', description: '', price: '' });
      onAdd && onAdd(); // trigger refresh in parent
    } catch (err) {
      setMessage('Failed to add medicine.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h2>Add Medicine</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required /><br />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required /><br />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required /><br />
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required /><br />

      <button type="submit">Add</button>
      {message && <p>{message}</p>}
    </form>
  );
}
