import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function investigate() {
  const querySnapshot = await getDocs(collection(db, 'user'));
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  console.log(`Total users found: ${users.length}`);

  const targetMobileNumbers = ['01924111258', '01617869364', '01978547974', '01989307376'];
  const foundUsers = users.filter(u => targetMobileNumbers.includes(u.mobileNumber));

  console.log('--- Targeted Users ---');
  foundUsers.forEach(u => {
    console.log(`Name: ${u.name}, Reference: ${u.myReference}, Mobile: ${u.mobileNumber}, Balance: ${u.balance}, PlaceUnder: ${u.placeUnder}, Children: ${JSON.stringify(u.children)}`);
  });

  const userMap = {};
  users.forEach(u => userMap[u.myReference] = u);

  const sumaiya = users.find(u => u.mobileNumber === '01924111258');
  if (sumaiya) {
    console.log(`\nFound Sumaiya: ${sumaiya.myReference}`);
    
    const others = foundUsers.filter(u => u.mobileNumber !== '01924111258');
    others.forEach(other => {
        let current = other;
        let path = [other.myReference];
        let depth = 0;
        while (current && current.placeUnder && current.placeUnder !== sumaiya.myReference) {
            current = userMap[current.placeUnder];
            if (current) path.push(current.myReference);
            depth++;
            if (depth > 20) break;
        }
        if (current && current.placeUnder === sumaiya.myReference) {
            path.push(sumaiya.myReference);
            console.log(`User ${other.myReference} is under Sumaiya. Path: ${path.reverse().join(' -> ')}`);
        } else {
            console.log(`User ${other.myReference} is NOT under Sumaiya in ancestor chain.`);
        }
    });
  } else {
    console.log('Sumaiya not found!');
  }
}

investigate().catch(console.error);
