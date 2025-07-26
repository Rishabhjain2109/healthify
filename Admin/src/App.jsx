// import AddMedicineForm from './components/AddMedicineForm';
// import MedicineList from './components/MedicineList';
// import AdminOrders from './components/AdminOrders';
// import { useState } from 'react';

// export default function App() {
//   const [refresh, setRefresh] = useState(false);

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//       <h1>Medicine Seller Admin</h1>
//       <AddMedicineForm onAdd={() => setRefresh(prev => !prev)} />
//       <MedicineList key={refresh} />
//       <hr />
//       <AdminOrders />
//     </div>
//   );
// }


import AddMedicineForm from './components/AddMedicineForm';
import MedicineList from './components/MedicineList';
import AdminOrders from './components/AdminOrders'; // ✅ New
import { useState } from 'react';

export default function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Medicine Seller Admin</h1>
      <AddMedicineForm onAdd={() => setRefresh(prev => !prev)} />
      <MedicineList key={refresh} />
      <hr />
      <AdminOrders /> {/* ✅ Add here */}
    </div>
  );
}
