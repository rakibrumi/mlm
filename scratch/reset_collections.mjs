import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

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
  console.log(`Fetching documents from collection: ${collectionName}...`);
  const querySnapshot = await getDocs(collection(db, collectionName));
  console.log(`Found ${querySnapshot.size} documents in ${collectionName}. Deleting...`);

  const deletePromises = [];
  querySnapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
  });

  await Promise.all(deletePromises);
  console.log(`Successfully deleted all documents in ${collectionName}.`);
}

async function resetDatabase() {
  try {
    // Delete collections
    await deleteCollection('user');
    await deleteCollection('transactions');
    await deleteCollection('monthlyBonuses');

    // Re-create Admin
    const adminId = 'GOODHEALTH-8384';
    const adminData = {
      name: 'Rakib Rumi',
      mobileNumber: '01637222737',
      password: '123456',
      role: 'admin',
      myReference: adminId,
      referenceId: '',
      placeUnder: '',
      balance: 1000000,
      children: [],
      joiningDate: new Date().toISOString().split('T')[0],
      paidMatches: 0,
      rank: 'Admin',
      avatarUrl: '',
      allData: true
    };

    console.log(`Re-creating admin account with ID: ${adminId}...`);
    await setDoc(doc(db, 'user', adminId), adminData);
    console.log('Admin account created successfully.');

    console.log('Database reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
