import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: 'AIzaSyDG7R8WlaKk8_Q8x2oZUtvOpAxPdMJ1ZXk',
  authDomain: 'earthco-ecad3.firebaseapp.com',
  projectId: 'earthco-ecad3',
  storageBucket: 'earthco-ecad3.appspot.com',
  messagingSenderId: '1031853299242',
  appId: '1:1031853299242:web:d7dc3bd030b07a362c5553',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportTransactions() {
  console.log('Fetching transactions...');
  try {
    const querySnapshot = await getDocs(collection(db, 'transactions'));
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));
    console.log(`Successfully exported ${transactions.length} transactions to transactions.json`);
  } catch (error) {
    console.error('Error exporting transactions:', error);
  }
}

exportTransactions();
