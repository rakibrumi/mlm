import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteCollection(collectionName) {
  try {
    console.log(`Fetching documents from collection: ${collectionName}...`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return;
    }

    const docs = querySnapshot.docs;
    console.log(`Found ${docs.length} documents in ${collectionName}. Deleting in parallel...`);

    const batchSize = 100;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await Promise.all(batch.map(d => deleteDoc(doc(db, collectionName, d.id))));
      console.log(`Deleted ${Math.min(i + batchSize, docs.length)} documents...`);
    }

    console.log(`Successfully deleted all documents in ${collectionName}.`);
  } catch (error) {
    console.error(`Error deleting collection ${collectionName}:`, error);
  }
}

async function start() {
  console.log('Starting parallel deletion of old_transactions collection...');
  await deleteCollection('old_transactions');
  console.log('Finished.');
  process.exit(0);
}

start();
