// import React, { useEffect, useState } from 'react';
// import axios from '../utils/axios';

// export default function MyOrders() {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     axios.get('/api/medicines/myorders')
//       .then(res => setOrders(res.data))
//       .catch(err => console.error('Order fetch error:', err));
//   }, []);

//   return (
//     <div style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
//       <h2>My Orders</h2>
//       {orders.length === 0 ? (
//         <p>No orders yet.</p>
//       ) : (
//         orders.map(order => (
//           <div key={order._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 15, marginBottom: 15 }}>
//             <p><strong>Ordered on:</strong> {new Date(order.createdAt).toLocaleString()}</p>
//             <ul>
//               {order.items.map((item, i) => (
//                 <li key={i}>{item.name} x {item.quantity} — ₹{item.price * item.quantity}</li>
//               ))}
//             </ul>
//             <p><strong>Total:</strong> ₹{order.totalCost}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState, useContext } from 'react';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/medicines/myorders');
        setOrders(res.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={styles.container}>
      <h2>My Medicine Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul style={styles.list}>
          {orders.map((order, index) => (
            <li key={order._id || index} style={styles.order}>
              <strong>Order #{index + 1}</strong> - {new Date(order.createdAt).toLocaleString()}
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} — ₹{item.price * item.quantity}
                  </li>
                ))}
              </ul>
              <strong>Total:</strong> ₹{order.totalCost}
              <p><strong>Status:</strong> {order.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '40px auto', padding: '20px' },
  list: { listStyle: 'none', padding: 0 },
  order: {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
};
