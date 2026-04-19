const fileUploader = async file => {
  const apiKey = '0ca5c9cdb23add3ecfaff014d8e4ad9c'
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()
    if (data.success) {
      return data.data.url
    } else {
      console.error('IMGBB Upload Error:', data)
      return null
    }
  } catch (error) {
    console.error('IMGBB Upload Fetch Error:', error)
    return null
  }
}

export default fileUploader

