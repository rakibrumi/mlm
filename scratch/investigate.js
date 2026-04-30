
import { db } from '../config/firebase.init.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function investigate() {
  const mobileNumbers = ['01924111258', '01410553511', '01710120450', '01944181596'];
  const userMap = {};

  console.log('--- Fetching User Data ---');
  for (const mobile of mobileNumbers) {
    const q = query(collection(db, 'user'), where('mobileNumber', '==', mobile));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      userMap[mobile] = data;
      console.log(`Mobile: ${mobile} -> Reference: ${data.myReference}, Name: ${data.name}, Balance: ${data.balance}`);
    } else {
      console.log(`Mobile: ${mobile} -> NOT FOUND`);
    }
  }

  const targetRef = userMap['01924111258']?.myReference;
  if (!targetRef) {
    console.log('Target user 01924111258 not found.');
    return;
  }

  // Fetch all users to build the tree for analysis
  console.log('\n--- Building Global Tree ---');
  const allUsersSnap = await getDocs(collection(db, 'user'));
  const allUsers = {};
  allUsersSnap.forEach(doc => {
    const data = doc.data();
    allUsers[data.myReference] = data;
  });

  const checkUsers = ['01410553511', '01710120450', '01944181596'];

  for (const mobile of checkUsers) {
    const user = userMap[mobile];
    if (!user) continue;

    console.log(`\nInvestigating ${mobile} (${user.myReference}):`);
    
    // Trace lineage up to target
    let path = [];
    let current = user;
    let foundTarget = false;
    let depthFromTarget = 0;

    while (current && current.placeUnder) {
      path.push({ id: current.myReference, side: current.placeUnderSide || 'unknown' });
      if (current.placeUnder === targetRef) {
        foundTarget = true;
        depthFromTarget = path.length;
        break;
      }
      current = allUsers[current.placeUnder];
    }

    if (foundTarget) {
      console.log(`  Path to 01924111258: ${path.map(p => p.id).join(' -> ')} (Target)`);
      console.log(`  Depth from 01924111258: ${depthFromTarget}`);
      
      // Analyze the sibling branches at each level up to the target
      // The logic in functions.js:
      // A bonus is paid if the addition of the user completes a pair at that depth.
      
      let walkId = user.myReference;
      let walkParentId = user.placeUnder;
      let d = 1;

      while (walkParentId) {
        const parent = allUsers[walkParentId];
        if (!parent) break;

        const children = parent.children || [];
        const isLeft = children[0] === walkId;
        const isRight = children[1] === walkId;

        // Calculate counts at this depth for both branches of the parent
        const leftCount = countAtRelativeDepth(children[0], d - 1, allUsers);
        const rightCount = countAtRelativeDepth(children[1], d - 1, allUsers);

        console.log(`  Level ${d} up (Parent: ${walkParentId}): LeftCount=${leftCount}, RightCount=${rightCount}, AddedSide=${isLeft ? 'Left' : (isRight ? 'Right' : 'Unknown')}`);

        if (walkParentId === targetRef) {
          // This is the target we care about
          console.log(`  >>> THIS IS THE TARGET USER'S LEVEL ${d} <<<`);
          let match = false;
          if (isLeft && leftCount > 0 && leftCount <= rightCount) match = true;
          if (isRight && rightCount > 0 && rightCount <= leftCount) match = true;
          
          console.log(`  Bonus Condition met for 01924111258? ${match}`);
        }

        if (walkParentId === targetRef) break;
        walkId = walkParentId;
        walkParentId = parent.placeUnder;
        d++;
      }

    } else {
      console.log(`  User ${mobile} is NOT a descendant of 01924111258.`);
    }
  }

  // Check transactions for the target user
  console.log('\n--- Checking Transactions for 01924111258 ---');
  const transQ = query(collection(db, 'transactions'), where('userReference', '==', targetRef), where('category', '==', 'level_bonus'));
  const transSnap = await getDocs(transQ);
  if (transSnap.empty) {
    console.log('  No level bonus transactions found.');
  } else {
    transSnap.forEach(doc => {
      const t = doc.data();
      console.log(`  Bonus: ${t.amount} for related user ${t.relatedUser} at ${t.date} (${t.description})`);
    });
  }
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
