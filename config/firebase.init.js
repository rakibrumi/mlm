import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
// import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDG7R8WlaKk8_Q8x2oZUtvOpAxPdMJ1ZXk',
  authDomain: 'earthco-ecad3.firebaseapp.com',
  projectId: 'earthco-ecad3',
  storageBucket: 'earthco-ecad3.appspot.com',
  messagingSenderId: '1031853299242',
  appId: '1:1031853299242:web:d7dc3bd030b07a362c5553',
}

// const firebaseConfig = {
//   apiKey: "AIzaSyDgCq_FrQ5uMf8tvbJB6bP2YuxOpN2TLbY",
//   authDomain: "madrassa-3d986.firebaseapp.com",
//   databaseURL: "https://madrassa-3d986-default-rtdb.firebaseio.com",
//   projectId: "madrassa-3d986",
//   storageBucket: "madrassa-3d986.appspot.com",
//   messagingSenderId: "357816431577",
//   appId: "1:357816431577:web:574cafa5a8f2e91cc51fc8"
// }

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage(app)
const db = getFirestore(app)

export { auth, db, storage }
