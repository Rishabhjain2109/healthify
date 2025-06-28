import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/medicines/myorders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Order fetch error:', err));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 15, marginBottom: 15 }}>
            <p><strong>Ordered on:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} x {item.quantity} — ₹{item.price * item.quantity}</li>
              ))}
            </ul>
            <p><strong>Total:</strong> ₹{order.totalCost}</p>
          </div>
        ))
      )}
    </div>
  );
}
