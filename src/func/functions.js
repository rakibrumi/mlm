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

export const handleMakeReferance = name => {
  const currentDate = new Date()
  // const year = currentDate.getFullYear().toString().substr(-2)
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentDate.getDate().toString().padStart(2, '0')
  // const hour = currentDate.getHours().toString().padStart(2, '0')
  const minute = currentDate.getMinutes().toString().padStart(2, '0')
  const formattedDate = day + month + minute

  const userNameWords = name.split(' ')

  const userInitials = `${userNameWords[0]}-`.toUpperCase()

  const uniqueId = userInitials + formattedDate

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

    // Ensure userData.children is an array
    const currentChildren = Array.isArray(userData.children)
      ? userData.children
      : []
    const newChildren = [...currentChildren, newUser]

    const userRef = doc(db, 'user', userDoc.id)
    await updateDoc(userRef, { children: newChildren })

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
    balance: Number(userData?.balance) + Number(amount),
  })
  await updateDoc(adminRef, {
    balance: Number(adminData?.balance) - Number(amount),
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
      balance: Number(userData?.balance) + Number(amount),
    })
  } else {
    const user = await updateDoc(userRef, {
      balance: Number(userData?.balance) - Number(amount),
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
    where('myReference', '==', 'DR-261211')
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
    toast.error('System Admin (DR-261211) not found. Contact Support.')
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
    balance: Number(userData?.balance) - Number(amount),
  })
  await updateDoc(remoteUserRef, {
    balance: Number(remoteUserData?.balance) + Number(amount),
  })
  await updateDoc(adminRef, {
    balance: Number(adminData?.balance) + Number(serviceCharge),
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
    userReference: 'DR-261211',
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
    where('myReference', '==', 'DR-261211')
  )

  const querySnapshot = await getDocs(userQuery)
  const adminSnapshot = await getDocs(adminQuery)

  if (querySnapshot.empty) {
    console.log('User not found')
    return null
  }

  if (adminSnapshot.empty) {
    console.log('Admin user not found')
    toast.error('System Admin (DR-261211) not found. Contact Support.')
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
    balance: Number(userData?.balance) - (numAmount + serviceCharge),
  })

  await updateDoc(adminRef, {
    balance: Number(adminData?.balance) + Number(serviceCharge) + Number(numAmount),
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
    userReference: 'DR-261211',
    amount: serviceCharge,
    type: 'credit',
    category: 'withdrawal_charge',
    relatedUser: ownReferenceId,
    description: `Withdrawal charge from ${ownReferenceId}`,
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

export const checkAndPayLevelBonus = async (newUserId, placeUnderId) => {
  try {
    // 1. Fetch all users to build an in-memory map for efficient traversal
    const allUsers = await getAllUser2()
    const userMap = {}
    allUsers.forEach(user => {
      userMap[user.myReference] = user
    })

    const newUser = userMap[newUserId]
    if (!newUser) return

    // 2. Traverse up the ancestors
    let currentAncestorId = placeUnderId
    let relativeDepth = 1 // Depth of newUser relative to currentAncestor

    while (currentAncestorId) {
      const ancestor = userMap[currentAncestorId]
      if (!ancestor) break

      // 3. Count descendants of 'ancestor' at 'relativeDepth'
      const count = countDescendantsAtLevel(
        ancestor,
        relativeDepth,
        userMap,
        0
      )

      // 4. Check if pair completed (even number)
      // We assume the new user is already in the tree (reflected in userMap/children),
      // or we account for it.
      // Since 'getAllUser2' might be called *after* the new user is added to DB (which we should ensure),
      // the count includes the new user.
      if (count > 0 && count % 2 === 0) {
        // Pay 500 to ancestor
        const amount = 500
        await moneyAddRemove(currentAncestorId, amount, true)

        await createTransaction({
          userReference: currentAncestorId,
          amount: amount,
          type: 'credit',
          category: 'level_bonus',
          relatedUser: newUserId, // The new user who triggered this
          description: `Level bonus for pair at depth ${relativeDepth}`,
        })

        console.log(
          `Paid ${amount} to ${currentAncestorId} for completing a pair at level ${relativeDepth} (Count: ${count})`
        )
      }

      // Move up
      currentAncestorId = ancestor.placeUnder
      relativeDepth++
    }
  } catch (error) {
    console.error('Error in checkAndPayLevelBonus:', error)
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
  if (node.children && Array.isArray(node.children)) {
    for (const childId of node.children) {
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
  }
  return count
}
