import React, { useState } from 'react'
import { db } from 'config/firebase.init'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc
} from 'firebase/firestore'
import {
  addUser,
  updateUser,
  checkAndPayLevelBonus,
  moneyAddRemove,
  createTransaction,
  getUserByReference,
  getAllUser2
} from '@/func/functions'

const DebugLevelBonus = () => {
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (msg) => {
    console.log(msg)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  const clearDatabase = async () => {
    addLog('Clearing user and transactions collections...')
    const usersSnap = await getDocs(collection(db, 'user'))
    for (const d of usersSnap.docs) {
      await deleteDoc(doc(db, 'user', d.id))
    }
    const transSnap = await getDocs(collection(db, 'transactions'))
    for (const d of transSnap.docs) {
      await deleteDoc(doc(db, 'transactions', d.id))
    }
    addLog('Database cleared.')
  }

  const createTestUser = async (name, myReference, placeUnder, side = 'left') => {
    const data = {
      name,
      myReference,
      placeUnder: placeUnder || '',
      children: [],
      balance: 100000, // Give them plenty of money for testing
      role: myReference === 'DR-261211' ? 'admin' : 'member',
      mobileNumber: Math.floor(Math.random() * 1000000000).toString(),
      password: 'password123',
      joiningDate: new Date().toISOString(),
    }

    await addUser(data)
    if (placeUnder) {
      await updateUser(placeUnder, myReference)
    }
    addLog(`Created user ${myReference} under ${placeUnder || 'NONE'}`)
    return data
  }

  const [testDepth, setTestDepth] = useState(5)

  const runFullTreeTest = async (maxDepth) => {
    setIsRunning(true)
    setLogs([])
    try {
      await clearDatabase()
      const adminId = 'DR-261211'
      await createTestUser('Main Admin', adminId, null)

      const queue = [{ id: adminId, depth: 0 }]
      let count = 1

      addLog(`Starting Full Tree creation up to level ${maxDepth}...`)
      addLog(`Note: Total nodes will be ${Math.pow(2, maxDepth + 1) - 1}`)

      while (queue.length > 0) {
        const parent = queue.shift()
        if (parent.depth >= maxDepth) continue

        // Create Left
        const leftId = `${parent.id}-L`
        await createTestUser(`User ${leftId}`, leftId, parent.id)
        await checkAndPayLevelBonus(leftId, parent.id)
        queue.push({ id: leftId, depth: parent.depth + 1 })
        count++

        // Create Right
        const rightId = `${parent.id}-R`
        await createTestUser(`User ${rightId}`, rightId, parent.id)
        await checkAndPayLevelBonus(rightId, parent.id)
        queue.push({ id: rightId, depth: parent.depth + 1 })
        count++
        
        // Yield to browser UI
        if (count % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      addLog(`Full Tree Created with ${count} users.`)
      const expectedMatches = Math.pow(2, maxDepth) - 1
      await verifyAdminMatches(adminId, expectedMatches)

    } catch (error) {
      addLog(`ERROR: ${error.message}`)
    }
    setIsRunning(false)
  }

  const verifyAdminMatches = async (adminId, expectedMatches) => {
    const adminData = await getUserByReference(adminId)
    addLog(`Admin Balance: ${adminData.balance}`)
    
    const transSnap = await getDocs(collection(db, 'transactions'))
    let adminBonuses = 0
    transSnap.forEach(d => {
      const t = d.data()
      if (t.userReference === adminId && t.category === 'level_bonus') {
        adminBonuses++
      }
    })
    addLog(`Total Level Matches for Admin: ${adminBonuses}`)
    
    if (adminBonuses === expectedMatches) {
      addLog(`SUCCESS: Admin received all ${expectedMatches} matches!`)
    } else {
      addLog(`FAILURE: Expected ${expectedMatches} matches, got ${adminBonuses}.`)
    }
  }

  const runSparse20Test = async () => {
    setIsRunning(true)
    setLogs([])
    try {
      await clearDatabase()
      const adminId = 'DR-261211'
      await createTestUser('Main Admin', adminId, null)

      let lastUserId = adminId
      for (let i = 1; i <= 20; i++) {
        const userId = `L${i}`
        await createTestUser(`User L${i}`, userId, lastUserId)
        lastUserId = userId
      }

      let lastRightId = adminId
      for (let i = 1; i <= 20; i++) {
        const userId = `R${i}`
        await createTestUser(`User R${i}`, userId, lastRightId)
        await checkAndPayLevelBonus(userId, lastRightId)
        lastRightId = userId
      }

      await verifyAdminMatches(adminId, 20)
    } catch (error) {
      addLog(`ERROR: ${error.message}`)
    }
    setIsRunning(false)
  }

  const runComprehensiveLevel10Test = async () => {
    setIsRunning(true)
    setLogs([])
    try {
      await clearDatabase()
      const adminId = 'DR-261211'
      await createTestUser('Main Admin', adminId, null)

      const allUserIds = [adminId]
      const availableSlots = [adminId]
      const userDepths = { [adminId]: 0 }
      let maxDepthReached = 0

      addLog('Starting Comprehensive Level 10 Test...')
      addLog('Building a random tree with ~1200 nodes to ensure depth 10+')

      // 1. Build the tree
      for (let i = 1; i <= 1200; i++) {
        const parentId = availableSlots[Math.floor(Math.random() * availableSlots.length)]
        const userId = `U-${i}`
        
        await createTestUser(`User ${userId}`, userId, parentId)
        await checkAndPayLevelBonus(userId, parentId)
        
        const currentDepth = userDepths[parentId] + 1
        userDepths[userId] = currentDepth
        if (currentDepth > maxDepthReached) maxDepthReached = currentDepth
        
        allUserIds.push(userId)
        
        // Update slots: if parent now has 2 children, remove from slots
        const parentData = await getUserByReference(parentId)
        if (parentData.children && parentData.children.length >= 2) {
          const idx = availableSlots.indexOf(parentId)
          if (idx > -1) availableSlots.splice(idx, 1)
        }
        availableSlots.push(userId)

        if (i % 100 === 0) {
          addLog(`Added ${i} users... Max Depth so far: ${maxDepthReached}`)
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      addLog(`Tree creation finished. Max Depth: ${maxDepthReached}`)

      // 2. Verification
      addLog('--- VERIFICATION PHASE ---')
      const allUsers = await getAllUser2()
      const userMap = {}
      allUsers.forEach(u => userMap[u.myReference] = u)

      // Pick Admin + 3 random users who have children
      const candidates = allUserIds.filter(id => {
        const u = userMap[id]
        return u && u.children && u.children.length > 0
      })
      
      const testUsers = [adminId]
      while (testUsers.length < 4 && candidates.length > 0) {
        const randId = candidates[Math.floor(Math.random() * candidates.length)]
        if (!testUsers.includes(randId)) testUsers.push(randId)
      }

      for (const uid of testUsers) {
        const user = userMap[uid]
        addLog(`Verifying User: ${uid} (Depth in tree: ${userDepths[uid] || 0})`)
        
        const expected = calculateExpectedBonus(uid, userMap)
        const actual = (user.balance - 100000) / 500
        
        if (actual === expected) {
          addLog(`  ✅ SUCCESS! Actual Matches: ${actual}, Expected Matches: ${expected}`)
        } else {
          addLog(`  ❌ FAILURE! Actual Matches: ${actual}, Expected Matches: ${expected}`)
          // Debug breakdown
          const leftRoot = user.children[0]
          const rightRoot = user.children[1]
          for (let d = 1; d <= 10; d++) {
            const l = countAtRelativeDepth(leftRoot, d - 1, userMap)
            const r = countAtRelativeDepth(rightRoot, d - 1, userMap)
            if (l > 0 || r > 0) {
              addLog(`    Depth ${d}: Left=${l}, Right=${r} -> Match: ${Math.min(l, r)}`)
            }
          }
        }
      }

    } catch (error) {
      addLog(`ERROR: ${error.message}`)
      console.error(error)
    }
    setIsRunning(false)
  }

  const runRandomGrowthTest = async (targetNodes = 100) => {
    setIsRunning(true)
    setLogs([])
    try {
      await clearDatabase()
      const adminId = 'DR-261211'
      await createTestUser('Main Admin', adminId, null)

      const availableSlots = [adminId]
      const allUserIds = [adminId]
      const userDepths = { [adminId]: 0 }

      addLog(`Starting Random Growth Test (${targetNodes} nodes)...`)

      for (let i = 1; i <= targetNodes; i++) {
        const parentId = availableSlots[Math.floor(Math.random() * availableSlots.length)]
        const userId = `U-${i}`
        
        await createTestUser(`User ${userId}`, userId, parentId)
        await checkAndPayLevelBonus(userId, parentId)
        
        userDepths[userId] = userDepths[parentId] + 1
        allUserIds.push(userId)
        
        // Update slots
        const parentData = await getUserByReference(parentId)
        if (parentData.children.length >= 2) {
          const idx = availableSlots.indexOf(parentId)
          if (idx > -1) availableSlots.splice(idx, 1)
        }
        availableSlots.push(userId)

        if (i % 20 === 0) addLog(`Added ${i} users...`)
      }

      addLog('Random Tree Created. Verifying ALL users for correct level bonuses...')
      
      const allUsers = await getAllUser2()
      const userMap = {}
      allUsers.forEach(u => userMap[u.myReference] = u)

      let failCount = 0
      let successCount = 0

      for (const uid of allUserIds) {
        const expected = calculateExpectedBonus(uid, userMap)
        const actualData = userMap[uid]
        const actual = (actualData.balance - 100000) / 500 
        
        if (actual === expected) {
          successCount++
        } else {
          failCount++
          addLog(`User ${uid}: FAILURE! Matches=${actual} (Expected ${expected})`)
        }
      }

      if (failCount === 0) {
        addLog(`SUCCESS: All ${successCount} users have the correct level bonus balance!`)
      } else {
        addLog(`FAILURE: ${failCount} users have incorrect balances.`)
      }

    } catch (error) {
      addLog(`ERROR: ${error.message}`)
    }
    setIsRunning(false)
  }

  const calculateExpectedBonus = (uid, userMap) => {
    const node = userMap[uid]
    if (!node || !node.children || node.children.length < 2) return 0
    
    let totalMatches = 0
    const leftRoot = node.children[0]
    const rightRoot = node.children[1]

    // Check every relative depth
    for (let d = 1; d <= 20; d++) {
      const leftCount = countAtRelativeDepth(leftRoot, d - 1, userMap)
      const rightCount = countAtRelativeDepth(rightRoot, d - 1, userMap)
      totalMatches += Math.min(leftCount, rightCount)
    }
    return totalMatches
  }

  const countAtRelativeDepth = (rootId, targetD, userMap) => {
    if (!rootId || !userMap[rootId]) return 0
    let nodesAtDepth = [rootId]
    for (let i = 0; i < targetD; i++) {
      let nextLevel = []
      nodesAtDepth.forEach(id => {
        const n = userMap[id]
        if (n && n.children) nextLevel.push(...n.children)
      })
      nodesAtDepth = nextLevel
    }
    return nodesAtDepth.length
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Level Bonus Debugger</h1>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={runSparse20Test} disabled={isRunning}>Run Sparse 20-Level Test</button>
        <button onClick={() => runRandomGrowthTest(100)} disabled={isRunning}>Run Random Growth Test (100 nodes)</button>
        <button 
          onClick={runComprehensiveLevel10Test} 
          disabled={isRunning}
          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Run Full Level 10 Random Test
        </button>
        <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '10px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span>Full Tree Depth:</span>
          <input 
            type="number" 
            value={testDepth} 
            onChange={(e) => setTestDepth(parseInt(e.target.value))}
            style={{ width: '50px' }}
            min="1"
            max="20"
          />
          <button onClick={() => runFullTreeTest(testDepth)} disabled={isRunning}>Run Full Tree Test</button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', background: '#000', color: '#0f0', padding: '15px', borderRadius: '5px', height: '500px', overflowY: 'auto' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
        {logs.length === 0 && <div>Ready to test.</div>}
      </div>
    </div>
  )
}

export default DebugLevelBonus
