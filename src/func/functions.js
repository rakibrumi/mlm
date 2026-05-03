import { db, firestore } from 'config/firebase.init'

// Firestore imports
import {
  doc,
  setDoc,
  getDocs,
  updateDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  addDoc,
  orderBy,
  increment,
  arrayUnion,
} from 'firebase/firestore'
import firebase from 'firebase/app'
import 'firebase/firestore'
import toast from 'react-hot-toast'

export const createTransaction = async data => {
  try {
    await addDoc(collection(db, 'transactions'), {
      ...data,
      date: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    toast.error(`Transaction Log Failed: ${error.message}`)
  }
}

export const getTransactions = async (userReference) => {
  try {
    // Try with sorting first (requires index)
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userReference', '==', userReference),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const transactions = []
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() })
      })
      return transactions
    } catch (indexError) {
      console.warn('Index missing or query failed, falling back to unsorted query', indexError)
      // Fallback: Query without sorting
      const q = query(
        collection(db, 'transactions'),
        where('userReference', '==', userReference)
      )
      const querySnapshot = await getDocs(q)
      const transactions = []
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() })
      })
      // Sort in memory if needed, or just return unsorted for now
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export const loadStorage = key => {
  try {
    const serializedState = localStorage.getItem(key)
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const handleMakeReferance = async name => {
  const userNameWords = name.split(' ')
  const userInitials = (userNameWords[0] || 'USER').toUpperCase()

  let uniqueId = ''
  let isUnique = false

  while (!isUnique) {
    const random4Digits = Math.floor(1000 + Math.random() * 9000)
    uniqueId = `${userInitials}${random4Digits}`

    // Check if this reference ID already exists in the database
    const existingUser = await getUserByReference(uniqueId)
    if (!existingUser) {
      isUnique = true
    }
  }

  return uniqueId
}

export const addUser = async data => {
  try {
    await setDoc(doc(db, 'user', data.myReference), data)
    return true
  } catch (error) {
    return error
    // console.log(error);
  }
}

export const updatePassword = async (dob, phone, newPassword) => {
  // first check the dob is correct or not. means get the data by the phone number and check the dob is correct or not
  try {
    const userQuery = query(
      collection(db, 'user'),
      where('mobileNumber', '==', phone)
    )
    const querySnapshot = await getDocs(userQuery)

    if (querySnapshot.empty) {
      console.log('User not found')
      return null
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    if (userData.dob !== dob) {
      console.log('Date of birth is incorrect')
      return null
    }

    const userRef = doc(db, 'user', userDoc.id)
    await updateDoc(userRef, { password: newPassword })

    return true
  } catch (error) {
    return error
  }
}

export const updateUser = async (referenceId, newUser) => {
  try {
    const userQuery = query(
      collection(db, 'user'),
      where('myReference', '==', referenceId)
    )
    const querySnapshot = await getDocs(userQuery)

    if (querySnapshot.empty) {
      console.log('User not found')
      return null
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    const userRef = doc(db, 'user', userDoc.id)
    await updateDoc(userRef, { children: arrayUnion(newUser) })

    // Fetch updated user data directly from Firestore
    // await getDoc(userRef).data()

    return true
  } catch (error) {
    console.error('Error updating user:', error)
    return error
  }
}

export const updateUserProfile = async (referenceId, newData) => {
  try {
    const userQuery = query(
      collection(db, 'user'),
      where('myReference', '==', referenceId)
    )
    const querySnapshot = await getDocs(userQuery)

    if (querySnapshot.empty) {
      console.log('User not found')
      return { success: false, error: 'User not found' }
    }

    const userDoc = querySnapshot.docs[0]
    const userRef = doc(db, 'user', userDoc.id)

    // Only allow updating specific fields
    const { name, mobileNumber, avatarUrl, dob, father_name, mother_name, presentAddress, password } = newData
    const updates = {}
    if (name) updates.name = name
    if (mobileNumber) updates.mobileNumber = mobileNumber
    if (avatarUrl) updates.avatarUrl = avatarUrl
    if (dob) updates.dob = dob
    if (father_name) updates.father_name = father_name
    if (mother_name) updates.mother_name = mother_name
    if (presentAddress) updates.presentAddress = presentAddress
    if (password) updates.password = password

    await updateDoc(userRef, updates)
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}

export const getAllUser = async setUsers => {
  const querySnapshot = await getDocs(collection(db, 'user'))
  setUsers([])
  querySnapshot.forEach(doc => {
    const data = doc.data()
    setUsers(oldArray => [...oldArray, data])
  })
}

export const getAllUser2 = async () => {
  const querySnapshot = await getDocs(collection(db, 'user'))
  const userData = []
  querySnapshot.forEach(doc => {
    const data = doc.data()
    userData.push(data)
  })
  return userData
}

export const getUserByReference = async referenceId => {
  const userQuery = query(
    collection(db, 'user'),
    where('myReference', '==', referenceId)
  )
  const querySnapshot = await getDocs(userQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return null
  }

  const userDoc = querySnapshot.docs[0]
  const userData = userDoc.data()
  return userData
}

export const giveMoneyWhileRegistration = async (referenceId, amount) => {
  const userQuery = query(
    collection(db, 'user'),
    where('myReference', '==', referenceId)
  )
  const adminQuery = query(collection(db, 'user'), where('role', '==', 'admin'))

  const querySnapshot = await getDocs(userQuery)
  const adminSnapshot = await getDocs(adminQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return null
  }

  const userDoc = querySnapshot.docs[0]
  const adminDoc = adminSnapshot.docs[0]

  const userData = userDoc.data()
  const adminData = adminDoc.data()

  const userRef = doc(db, 'user', userDoc.id)
  const adminRef = doc(db, 'user', adminDoc.id)

  if (userData.myReference === adminData.myReference) {
    console.log('Admin cannot give money to himself')
    return null
  }

  await updateDoc(userRef, {
    balance: increment(Number(amount)),
  })
  await updateDoc(adminRef, {
    balance: increment(-Number(amount)),
  })

  // const updatedUser = (await getDoc(userRef)).data()
  // const updatedAdmin = (await getDoc(adminRef)).data()

  return true
}

export const moneyAddRemove = async (referenceId, amount, inc) => {
  const userQuery = query(
    collection(db, 'user'),
    where('myReference', '==', referenceId)
  )

  const querySnapshot = await getDocs(userQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return null
  }

  const userDoc = querySnapshot.docs[0]
  const userData = userDoc.data()

  const userRef = doc(db, 'user', userDoc.id)

  if (inc) {
    await updateDoc(userRef, {
      balance: increment(Number(amount)),
    })
  } else {
    await updateDoc(userRef, {
      balance: increment(-Number(amount)),
    })
  }

  return true
}

export const sendMoney = async (ownReferenceId, remoteReferenceId, amount) => {
  const userQuery = query(
    collection(db, 'user'),
    where('myReference', '==', ownReferenceId)
  )
  const remoteUserQuery = query(
    collection(db, 'user'),
    where('myReference', '==', remoteReferenceId)
  )
  const adminUserQuery = query(
    collection(db, 'user'),
    where('myReference', '==', 'GOODHEALTH-8384')
  )

  const querySnapshot = await getDocs(userQuery)
  const remoteQuerySnapshot = await getDocs(remoteUserQuery)
  const adminQuerySnapshot = await getDocs(adminUserQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return { success: false, error: `User (Sender) ${ownReferenceId} not found` }
  }

  if (remoteQuerySnapshot.empty) {
    console.log('Remote user not found')
    return { success: false, error: `Receiver ${remoteReferenceId} not found` }
  }

  if (adminQuerySnapshot.empty) {
    console.log('Admin user not found')
    toast.error('System Admin (GOODHEALTH-8384) not found. Contact Support.')
    return null
  }

  const userDoc = querySnapshot.docs[0]
  const remoteUserDoc = remoteQuerySnapshot.docs[0]
  const adminDoc = adminQuerySnapshot.docs[0]

  const userData = userDoc.data()
  const remoteUserData = remoteUserDoc.data()
  const adminData = adminDoc.data()

  const userRef = doc(db, 'user', userDoc.id)
  const remoteUserRef = doc(db, 'user', remoteUserDoc.id)
  const adminRef = doc(db, 'user', adminDoc.id)

  if (userData.myReference === remoteUserData.myReference) {
    return { success: false, error: 'Cannot send money to yourself' }
  }

  // Check if 5% of the amount is less than the user's balance
  // Check if 5% of the amount is less than the user's balance
  const numAmount = Number(amount)
  const serviceCharge = (5 / 100) * numAmount

  if (userData.balance < numAmount + serviceCharge) {
    console.log('User does not have enough balance')
    return { success: false, error: 'Insufficient balance (including 5% charge)' }
  }

  await updateDoc(userRef, {
    balance: increment(-(numAmount + serviceCharge)),
  })
  await updateDoc(remoteUserRef, {
    balance: increment(numAmount),
  })
  await updateDoc(adminRef, {
    balance: increment(serviceCharge),
  })

  // Create transactions for sender, receiver, and admin
  await createTransaction({
    userReference: ownReferenceId,
    amount: numAmount,
    type: 'debit',
    category: 'send_money',
    relatedUser: remoteReferenceId,
    description: `Sent money to ${remoteReferenceId}`,
  })

  await createTransaction({
    userReference: remoteReferenceId,
    amount: numAmount,
    type: 'credit',
    category: 'receive_money',
    relatedUser: ownReferenceId,
    description: `Received money from ${ownReferenceId}`,
  })

  await createTransaction({
    userReference: 'GOODHEALTH-8384',
    amount: serviceCharge,
    type: 'credit',
    category: 'service_charge',
    relatedUser: ownReferenceId,
    description: `Service charge for transfer from ${ownReferenceId}`,
  })

  return { success: true }
}

export const withdrawMoney = async (ownReferenceId, amount) => {
  const userQuery = query(
    collection(db, 'user'),
    where('myReference', '==', ownReferenceId)
  )
  const adminQuery = query(
    collection(db, 'user'),
    where('myReference', '==', 'GOODHEALTH-8384')
  )

  const querySnapshot = await getDocs(userQuery)
  const adminSnapshot = await getDocs(adminQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return null
  }

  if (adminSnapshot.empty) {
    console.log('Admin user not found')
    toast.error('System Admin (GOODHEALTH-8384) not found. Contact Support.')
    return null
  }

  const userDoc = querySnapshot.docs[0]
  const adminDoc = adminSnapshot.docs[0]

  const userData = userDoc.data()
  const adminData = adminDoc.data()

  const numAmount = Number(amount)
  const serviceCharge = (5 / 100) * numAmount

  const userRef = doc(db, 'user', userDoc.id)
  const adminRef = doc(db, 'user', adminDoc.id)

  if (userData.balance < numAmount + serviceCharge) {
    console.log('User does not have enough balance')
    return false
  }

  await updateDoc(userRef, {
    balance: increment(-(numAmount + serviceCharge)),
  })

  await updateDoc(adminRef, {
    balance: increment(numAmount + serviceCharge),
  })

  // Create transactions for user and admin
  await createTransaction({
    userReference: ownReferenceId,
    amount: numAmount,
    type: 'debit',
    category: 'withdrawal',
    relatedUser: 'Admin',
    description: `Withdrew money`,
  })

  await createTransaction({
    userReference: 'GOODHEALTH-8384',
    amount: serviceCharge,
    type: 'credit',
    category: 'withdrawal_charge',
    relatedUser: ownReferenceId,
    description: `Withdrawal charge from ${ownReferenceId}`,
  })

  await createTransaction({
    userReference: 'GOODHEALTH-8384',
    amount: numAmount,
    type: 'credit',
    category: 'withdrawal_amount',
    relatedUser: ownReferenceId,
    description: `Withdrawal amount from ${ownReferenceId}`,
  })

  return true
}

export const login = async inputData => {
  const querySnapshot = await getDocs(collection(db, 'user'))
  let user = null
  querySnapshot.forEach(doc => {
    const data = doc.data()
    if (
      inputData.mobileNumber === data.mobileNumber &&
      inputData.password === data.password
    ) {
      user = data
    }
  })
  return user
}

export const checkAndPayMatchingBonus = async (newUserId, placeUnderId) => {
  console.log(`Starting Matching Bonus Check for ${newUserId}`)
  try {
    const allUsers = await getAllUser2()
    const userMap = {}
    allUsers.forEach(user => {
      userMap[user.myReference] = user
    })

    let currentId = placeUnderId
    while (currentId && userMap[currentId]) {
      const ancestor = userMap[currentId]
      const children = Array.isArray(ancestor.children) ? ancestor.children : []

      if (children.length >= 1) {
        const leftChildId = children[0]
        const rightChildId = children[1]

        // Total descendants on Left and Right sides
        const leftCount = countAllDescendants(leftChildId, userMap)
        const rightCount = countAllDescendants(rightChildId, userMap)

        const currentMatches = Math.min(leftCount, rightCount)
        const paidMatches = ancestor.paidMatches || 0

        if (currentMatches > paidMatches) {
          const newMatchesToPay = currentMatches - paidMatches
          const amountPerMatch = 500
          const totalAmount = newMatchesToPay * amountPerMatch

          console.log(`MATCH FOUND! Paying ${totalAmount} to ${ancestor.myReference} for ${newMatchesToPay} new matches. Total matches: ${currentMatches}`)

          // Pay the money
          await moneyAddRemove(ancestor.myReference, totalAmount, true)

          // Update paidMatches in DB
          const userQuery = query(
            collection(db, 'user'),
            where('myReference', '==', ancestor.myReference)
          )
          const querySnapshot = await getDocs(userQuery)
          if (!querySnapshot.empty) {
            const userDocRef = doc(db, 'user', querySnapshot.docs[0].id)
            await updateDoc(userDocRef, { paidMatches: currentMatches })
          }

          // Update Transaction log
          await createTransaction({
            userReference: ancestor.myReference,
            amount: totalAmount,
            type: 'credit',
            category: 'matching_bonus',
            relatedUser: newUserId,
            description: `Matching bonus for ${newMatchesToPay} new pair(s). Total matches: ${currentMatches}`,
          })

          // Check for Rank Promotion (Marketing Associate at 20 matches)
          if (currentMatches >= 20 && ancestor.rank !== 'Marketing Associate') {
            const userQueryRank = query(
              collection(db, 'user'),
              where('myReference', '==', ancestor.myReference)
            )
            const snapRank = await getDocs(userQueryRank)
            if (!snapRank.empty) {
              const userDocRef = doc(db, 'user', snapRank.docs[0].id)
              await updateDoc(userDocRef, { rank: 'Marketing Associate' })
              console.log(`User ${ancestor.myReference} promoted to Marketing Associate!`)
            }
          }
        }
      }

      currentId = ancestor.placeUnder
    }
  } catch (error) {
    console.error('Error in checkAndPayMatchingBonus:', error)
  }
}

export const initializeAllUserMatches = async () => {
  console.log('Initializing all user matches...')
  try {
    const allUsers = await getAllUser2()
    const userMap = {}
    allUsers.forEach(user => {
      userMap[user.myReference] = user
    })

    let count = 0
    for (const user of allUsers) {
      const children = Array.isArray(user.children) ? user.children : []
      if (children.length >= 1) {
        const leftCount = countAllDescendants(children[0], userMap)
        const rightCount = countAllDescendants(children[1], userMap)
        const currentMatches = Math.min(leftCount, rightCount)

        // Update in DB (Assuming doc ID is myReference as per addUser)
        const userRef = doc(db, 'user', user.myReference)
        const updates = { paidMatches: currentMatches }

        // Also sync Rank during initialization if they already have 20 matches
        if (currentMatches >= 20) {
          updates.rank = 'Marketing Associate'
        }

        await updateDoc(userRef, updates)
        count++
      }
    }

    console.log(`Successfully initialized matches for ${count} users.`)
    return { success: true, count }
  } catch (error) {
    console.error('Error initializing matches:', error)
    return { success: false, error: error.message }
  }
}

// Helper to count nodes at a specific depth relative to startNode
const countDescendantsAtLevel = (
  node,
  targetDepth,
  userMap,
  currentDepth
) => {
  if (currentDepth === targetDepth) return 1
  if (currentDepth > targetDepth) return 0

  let count = 0
  const children = Array.isArray(node.children) ? node.children : []
  for (const childId of children) {
    const childNode = userMap[childId]
    if (childNode) {
      count += countDescendantsAtLevel(
        childNode,
        targetDepth,
        userMap,
        currentDepth + 1
      )
    }
  }
  return count
}
export const getMonthlyBonusCandidates = async (monthStr) => {
  try {
    const allUsers = await getAllUser2()
    const userMap = {}
    allUsers.forEach(user => {
      userMap[user.myReference] = user
    })

    const candidates = []

    for (const user of allUsers) {
      const children = Array.isArray(user.children) ? user.children : []
      if (children.length < 2) continue

      // Rank check: Must be Marketing Associate
      if (user.rank !== 'Marketing Associate') continue

      const leftTotal = countAllDescendants(children[0], userMap)
      const rightTotal = countAllDescendants(children[1], userMap)

      const leftNew = countNewInMonth(children[0], userMap, monthStr)
      const rightNew = countNewInMonth(children[1], userMap, monthStr)

      // Calculate how many NEW matches were created this month
      const currentMatching = Math.min(leftTotal, rightTotal)
      const previousMatching = Math.min(leftTotal - leftNew, rightTotal - rightNew)

      const monthlyNewMatches = currentMatching - previousMatching

      // Condition: 15+ new matches AND must have been Marketing Associate before this month
      if (monthlyNewMatches >= 15 && previousMatching >= 20) {
        // Check if already paid for this month
        const q = query(
          collection(db, 'monthlyBonuses'),
          where('userId', '==', user.myReference),
          where('month', '==', monthStr)
        )
        const snap = await getDocs(q)

        candidates.push({
          userId: user.myReference,
          name: user.name,
          newMatches: monthlyNewMatches,
          alreadyPaid: !snap.empty
        })
      }
    }
    return candidates
  } catch (error) {
    console.error('Error getting monthly bonus candidates:', error)
    return []
  }
}

const countAllDescendants = (userId, userMap) => {
  if (!userId || !userMap[userId]) return 0
  let count = 1
  const node = userMap[userId]
  const children = Array.isArray(node.children) ? node.children : []
  for (const childId of children) {
    count += countAllDescendants(childId, userMap)
  }
  return count
}

const countNewInMonth = (userId, userMap, monthStr) => {
  if (!userId || !userMap[userId]) return 0
  let count = 0
  const node = userMap[userId]

  if (node.joiningDate && node.joiningDate.startsWith(monthStr)) {
    count = 1
  }

  const children = Array.isArray(node.children) ? node.children : []
  for (const childId of children) {
    count += countNewInMonth(childId, userMap, monthStr)
  }
  return count
}

export const payMonthlyBonus = async (userId, monthStr) => {
  try {
    // Re-verify not already paid
    const q = query(
      collection(db, 'monthlyBonuses'),
      where('userId', '==', userId),
      where('month', '==', monthStr)
    )
    const snap = await getDocs(q)
    if (!snap.empty) return { success: false, error: 'Already paid' }

    // Pay 5000
    await moneyAddRemove(userId, 5000, true)

    // Create Transaction
    await createTransaction({
      userReference: userId,
      amount: 5000,
      type: 'credit',
      category: 'monthly_bonus',
      description: `Monthly performance bonus for ${monthStr} (15+ new matches)`,
    })

    // Record History
    await addDoc(collection(db, 'monthlyBonuses'), {
      userId,
      month: monthStr,
      amount: 5000,
      date: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    console.error('Error paying monthly bonus:', error)
    return { success: false, error: error.message }
  }
}

export const getMonthlyBonusHistory = async () => {
  try {
    const q = query(
      collection(db, 'monthlyBonuses'),
      orderBy('date', 'desc')
    )
    const snap = await getDocs(q)
    const history = []
    snap.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() })
    })
    return history
  } catch (error) {
    console.error('Error getting monthly bonus history:', error)
    return []
  }
}
export const getOldTransactions = async () => {
  try {
    const q = query(
      collection(db, 'old_transactions')
    )
    const querySnapshot = await getDocs(q)
    const transactions = []
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() })
    })
    // Sort in memory by date descending
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error('Error fetching old transactions:', error)
    return []
  }
}
