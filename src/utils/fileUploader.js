import { storage } from 'config/firebase.init'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const fileUploader = async file => {
  const storageRef = ref(storage, `images/${new Date().getTime()}${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(storageRef)
  return downloadUrl
}

export default fileUploader
