import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function createAdmin() {
  const adminId = 'RAKIB';
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
    allData: true // Used for tree view in my-account
  };

  try {
    console.log(`Creating admin account with ID: ${adminId}...`);
    await setDoc(doc(db, 'user', adminId), adminData);
    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

createAdmin();
