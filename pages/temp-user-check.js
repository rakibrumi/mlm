import { useEffect, useState } from 'react';
import { getAllUser2 } from '../src/func/functions';
import { db } from '../config/firebase.init';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

export default function TempCheck() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getAllUser2();
      setUsers(userData);
      
      const transQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(50));
      const transSnap = await getDocs(transQuery);
      const transList = [];
      transSnap.forEach(doc => transList.push(doc.data()));
      setTransactions(transList);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading data...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Database Recovery Analysis</h1>
      <p>Total Users: {users.length}</p>
      <p>Total Transactions: {transactions.length} (last 50 shown)</p>
      
      <h3>Recent Transactions</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>User</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Related User</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i}>
              <td>{t.userReference}</td>
              <td>{t.category}</td>
              <td>{t.amount}</td>
              <td>{t.relatedUser}</td>
              <td>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
