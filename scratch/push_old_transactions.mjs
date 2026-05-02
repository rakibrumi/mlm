import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, collection } from 'firebase/firestore';
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

async function pushOldTransactions() {
  console.log('Reading transactions.json...');
  const data = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));
  console.log(`Loaded ${data.length} transactions.`);

  const collectionName = 'old_transactions';
  const batchSize = 500;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    const batch = writeBatch(db);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
    
    chunk.forEach((item) => {
      const { id, ...rest } = item;
      // Use the same ID if it exists, otherwise Firestore generates one
      const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
      batch.set(docRef, rest);
    });

    await batch.commit();
    console.log(`Batch ${Math.floor(i / batchSize) + 1} committed.`);
  }

  console.log('All transactions pushed to old_transactions collection successfully.');
}

pushOldTransactions().catch(console.error);
