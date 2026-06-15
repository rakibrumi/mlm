const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

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

async function exportCollection(collectionName, fileName) {
  console.log(`Fetching ${collectionName}...`);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved ${data.length} docs to ${fileName}`);
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
  }
}

async function main() {
  await exportCollection('user', '../backend/users.json');
  await exportCollection('transactions', '../backend/transactions.json');
  await exportCollection('monthlyBonuses', '../backend/monthly_bonuses.json');
  process.exit(0);
}

main();
