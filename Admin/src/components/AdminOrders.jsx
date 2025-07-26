// import { useEffect, useState } from 'react';
// import axios from '../utils/axios';

// export default function AdminOrders() {
//   const [orders, setOrders] = useState([]);

//   const fetchOrders = async () => {
//   try {
//     const res = await axios.get('/medicines/pending-orders');
//     setOrders(res.data);
//   } catch (err) {
//     console.error('Admin fetch error:', err);
//     setError('Failed to fetch orders');
//   }
// };

//   const fulfillOrder = async (orderId) => {
//     try {
//       await axios.put(`/medicines/orders/${orderId}/fulfill`);
//       fetchOrders(); // refresh list
//     } catch (err) {
//       alert('Failed to fulfill order');
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   return (
//     <div>
//       <h2>Pending Orders</h2>
//       {orders.length === 0 ? (
//         <p>No orders found.</p>
//       ) : (
//         <ul>
//           {orders.map(order => (
//             <li key={order._id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: 6 }}>
//               <strong>Order ID:</strong> {order._id} <br />
//               <strong>Patient:</strong> {order.user.fullname} ({order.user.email})<br />
//               <strong>Items:</strong>
//               <ul>
//                 {order.items.map((item, i) => (
//                   <li key={i}>
//                     {item.name} — ₹{item.price} × {item.quantity}
//                   </li>
//                 ))}
//               </ul>
//               <strong>Total:</strong> ₹{order.totalCost}<br />
//               <strong>Status:</strong> {order.fulfilled ? '✅ Fulfilled' : '❌ Pending'}<br />
//               {!order.fulfilled && (
//                 <button
//                   style={{ marginTop: '10px', backgroundColor: 'green', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }}
//                   onClick={() => fulfillOrder(order._id)}
//                 >
//                   Accept Order
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/medicines/order/all');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/medicines/order/${id}/status`, { status });
      fetchOrders(); // Refresh
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Pending Orders</h2>
      {orders.filter(order => order.status !== 'Delivered').length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <ul>
          {orders
            .filter(order => order.status !== 'Delivered')
            .map(order => (
              <li key={order._id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <strong>Patient ID:</strong> {order.user} <br />
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>{item.name} × {item.quantity} – ₹{item.price}</li>
                  ))}
                </ul>
                <strong>Total:</strong> ₹{order.totalCost}<br />
                <strong>Status:</strong> {order.status} <br />
                <div style={{ marginTop: '10px' }}>
                  {['Order Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order._id, status)}
                      style={{
                        marginRight: '8px',
                        padding: '6px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
