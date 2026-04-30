
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkDepth8() {
  const allUsersSnap = await getDocs(collection(db, 'user'));
  const allUsers = {};
  allUsersSnap.forEach(doc => {
    const data = doc.data();
    allUsers[data.myReference] = data;
  });

  const targetRef = 'SUMAIYA-100200';
  const target = allUsers[targetRef];
  const leftRoot = target.children[0];
  const rightRoot = target.children[1];

  console.log(`Target: ${targetRef}`);
  console.log(`Left Root: ${leftRoot}`);
  console.log(`Right Root: ${rightRoot}`);

  function getAtDepth(rootId, targetD) {
    if (!rootId || !allUsers[rootId]) return [];
    let nodes = [rootId];
    for (let i = 0; i < targetD; i++) {
      let next = [];
      nodes.forEach(id => {
        const n = allUsers[id];
        if (n && n.children) next.push(...n.children.filter(c => c));
      });
      nodes = next;
    }
    return nodes;
  }

  const leftNodes = getAtDepth(leftRoot, 7);
  const rightNodes = getAtDepth(rightRoot, 7);

  console.log(`\nLeft Nodes at Depth 8 (count ${leftNodes.length}):`);
  leftNodes.forEach(id => console.log(` - ${id} (${allUsers[id]?.name})`));

  console.log(`\nRight Nodes at Depth 8 (count ${rightNodes.length}):`);
  rightNodes.forEach(id => console.log(` - ${id} (${allUsers[id]?.name})`));
}

checkDepth8().catch(console.error);
