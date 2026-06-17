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

const API_BASE_URL = 'https://goodhealth-backend.onrender.com'
// const API_BASE_URL = 'http://127.0.0.1:8000'


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
    const response = await fetch(`${API_BASE_URL}/api/users/${userReference}/transactions`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const transactions = await response.json()
    return transactions
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

export const addUser = async (data, creatorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users?creatorId=${creatorId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Failed to add user')
    }

    return true
  } catch (error) {
    console.error('Error adding user:', error)
    toast.error(error.message)
    return false
  }
}

export const updatePassword = async (dob, phone, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dob,
        phone: String(phone),
        newPassword,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Failed to update password')
    }

    return true
  } catch (error) {
    console.error('Error updating password:', error)
    return false
  }
}

export const sendOTP = async (emailAddress, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forget-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailAddress,
        newPassword,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Failed to send OTP')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: error.message }
  }
}

export const verifyOTP = async (emailAddress, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailAddress,
        otp,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Failed to verify OTP')
    }

    return { success: true }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: error.message }
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
    const response = await fetch(`${API_BASE_URL}/api/users/${referenceId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.detail || 'Failed to update profile' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}

export const getAllUser = async setUsers => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`)
    const data = await response.json()
    setUsers(data)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

export const getAllUser2 = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in getAllUser2:', error)
    return []
  }
}

export const getUserByReference = async referenceId => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${referenceId}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('User not found')
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const userData = await response.json()
    return userData
  } catch (error) {
    console.error('Error fetching user by reference:', error)
    return null
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/send-money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId: ownReferenceId,
        receiverId: remoteReferenceId,
        amount: Number(amount),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.detail || 'Transfer failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending money:', error)
    return { success: false, error: error.message }
  }
}

export const withdrawMoney = async (ownReferenceId, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/withdraw-money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: ownReferenceId,
        amount: Number(amount),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return false
    }

    return true
  } catch (error) {
    console.error('Error withdrawing money:', error)
    return false
  }
}

export const login = async inputData => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: String(inputData.mobileNumber),
        password: String(inputData.password),
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      console.error('Login failed:', errData.detail)
      return null
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error in login call:', error)
    return null
  }
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
    const response = await fetch(`${API_BASE_URL}/api/admin/monthly-bonus/candidates?month=${monthStr}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting monthly bonus candidates:', error)
    return []
  }
}

export const payMonthlyBonus = async (userId, monthStr) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/monthly-bonus/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        month: monthStr,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.detail || 'Failed to pay monthly bonus' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error paying monthly bonus:', error)
    return { success: false, error: error.message }
  }
}

export const getMonthlyBonusHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/monthly-bonus/history`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
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

export const getAdminUsers = async (page = 1, limit = 10, search = '', role = '', rank = '') => {
  try {
    let url = `${API_BASE_URL}/api/admin/users?page=${page}&limit=${limit}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (role) url += `&role=${encodeURIComponent(role)}`
    if (rank) url += `&rank=${encodeURIComponent(rank)}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return { users: [], total: 0, page: 1, pages: 1 }
  }
}

export const deleteUser = async (referenceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${referenceId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Failed to delete user')
    }
    toast.success('User deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error(error.message)
    return false
  }
}

export const getAdminTransactions = async (page = 1, limit = 10, search = '') => {
  try {
    let url = `${API_BASE_URL}/api/admin/transactions?page=${page}&limit=${limit}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching admin transactions:', error)
    return { transactions: [], total: 0, page: 1, pages: 1 }
  }
}

export const uploadImageToImgbb = async (file) => {
  const apiKey = '0ca5c9cdb23add3ecfaff014d8e4ad9c'
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Imgbb upload failed with status ${response.status}`)
    }
    
    const resData = await response.json()
    if (resData.success) {
      return resData.data.url
    } else {
      throw new Error(resData.error?.message || 'Failed to upload to Imgbb')
    }
  } catch (error) {
    console.error('Imgbb upload error:', error)
    toast.error(`Image Upload Failed: ${error.message}`)
    return null
  }
}

export const saveGalleryItem = async (url, title, folder) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, title, folder }),
    })
    if (!response.ok) {
      throw new Error(`Failed to save gallery item: ${response.status}`)
    }
    const data = await response.json()
    toast.success('Image saved to gallery')
    return data
  } catch (error) {
    console.error('Save gallery item error:', error)
    toast.error(error.message)
    return null
  }
}

export const getGalleryItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gallery`)
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch gallery error:', error)
    return []
  }
}

export const deleteGalleryItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gallery/${itemId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to delete gallery item: ${response.status}`)
    }
    toast.success('Image removed from gallery')
    return true
  } catch (error) {
    console.error('Delete gallery item error:', error)
    toast.error(error.message)
    return false
  }
}


