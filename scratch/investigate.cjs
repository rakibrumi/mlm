
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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
  const targetMobile = '01924111258';
  const newMobiles = ['01410553511', '01710120450', '01944181596', '01944184596'];
  
  const allUsersSnap = await getDocs(collection(db, 'user'));
  const allUsers = {};
  allUsersSnap.forEach(doc => {
    const data = doc.data();
    allUsers[data.myReference] = data;
  });

  const targetUser = Object.values(allUsers).find(u => u.mobileNumber === targetMobile);
  if (!targetUser) {
    console.log(`Target user ${targetMobile} not found.`);
    return;
  }
  const targetRef = targetUser.myReference;
  console.log(`Target User: ${targetUser.name} (${targetRef}), Balance: ${targetUser.balance}`);

  for (const mobile of newMobiles) {
    const user = Object.values(allUsers).find(u => u.mobileNumber === mobile);
    if (!user) {
      console.log(`\nUser ${mobile}: NOT FOUND`);
      continue;
    }

    console.log(`\nInvestigating ${mobile} (${user.name}, ${user.myReference}):`);
    
    // Check if descendant
    let current = user;
    let lineage = [];
    while (current && current.placeUnder) {
      lineage.push({ id: current.myReference, parent: current.placeUnder });
      if (current.placeUnder === targetRef) break;
      current = allUsers[current.placeUnder];
    }

    if (current && current.placeUnder === targetRef) {
      const depth = lineage.length;
      const immediateChildOfTarget = lineage[lineage.length - 1].id;
      const targetChildren = targetUser.children || [];
      const side = targetChildren[0] === immediateChildOfTarget ? 'Left' : 'Right';
      
      console.log(`  Position: ${side} branch of ${targetRef} at relative depth ${depth}`);
      
      // Calculate counts at this depth
      const leftCount = countAtRelativeDepth(targetChildren[0], depth - 1, allUsers);
      const rightCount = countAtRelativeDepth(targetChildren[1], depth - 1, allUsers);
      
      console.log(`  Counts at depth ${depth}: Left=${leftCount}, Right=${rightCount}`);
      
      let match = false;
      if (side === 'Left' && leftCount > 0 && leftCount <= rightCount) match = true;
      if (side === 'Right' && rightCount > 0 && rightCount <= leftCount) match = true;
      
      console.log(`  Bonus should trigger? ${match}`);
      if (!match) {
        console.log(`  Reason: ${side} side (${side === 'Left' ? leftCount : rightCount}) is already larger than or equal to the other side (${side === 'Left' ? rightCount : leftCount}) OR other side is 0.`);
        console.log(`  Actually, the logic is: trigger if (currentSideCount <= otherSideCount).`);
        console.log(`  If currentSideCount > otherSideCount, it means this user is an "extra" on this side and doesn't complete a new pair.`);
      }
    } else {
      console.log(`  Not a descendant of ${targetRef}.`);
    }
  }

  console.log('\n--- Bonus Transactions for Level matching ---');
  const transSnap = await getDocs(query(collection(db, 'transactions'), where('userReference', '==', targetRef), where('category', '==', 'level_bonus')));
  const bonusesByDepth = {};
  transSnap.forEach(doc => {
    const t = doc.data();
    const depthMatch = t.description.match(/depth (\d+)/);
    const depth = depthMatch ? depthMatch[1] : 'unknown';
    if (!bonusesByDepth[depth]) bonusesByDepth[depth] = [];
    bonusesByDepth[depth].push(t);
  });

  Object.keys(bonusesByDepth).sort((a,b) => a-b).forEach(d => {
    console.log(`Depth ${d}: ${bonusesByDepth[d].length} bonuses`);
  });
}

function countAtRelativeDepth(rootId, targetD, userMap) {
  if (!rootId || !userMap[rootId]) return 0;
  if (targetD === 0) return 1;
  
  let nodesAtDepth = [rootId];
  for (let i = 0; i < targetD; i++) {
    let nextLevel = [];
    nodesAtDepth.forEach(id => {
      const n = userMap[id];
      if (n && n.children) {
        nextLevel.push(...n.children.filter(c => c));
      }
    });
    nodesAtDepth = nextLevel;
  }
  return nodesAtDepth.length;
}

investigate().catch(console.error);
