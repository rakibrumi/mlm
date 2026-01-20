import { Button, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers'
import toast from 'react-hot-toast'
import { updatePassword } from '@/func/functions'
import { formatDate } from '@/helper/helper'

const ForgetPassPopup = ({ setShowPopup }) => {
  const [input, setInput] = useState({
    phone: '',
    password: '',
  })
  const [dob, setDob] = useState(new Date())
  const handleChange = e => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    })
  }

  const handleForgetPass = async () => {
    if (!input.password || !input.phone) {
      toast.error('All fields are required')
      return
    }
    if (!dob) {
      toast.error('Please enter your date of birth')
      return
    }
    const convertedDob = formatDate(dob)
    const updatePass = await updatePassword(
      convertedDob,
      input.phone,
      input.password
    )

    if (updatePass) {
      toast.success('Password updated successfully')
      setShowPopup(false)
    } else {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="popup_wrapper">
      <div className="popup_content relative">
        <div className="mt-4">
          <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
            Forget Password
          </Typography>

          <DatePicker
            required
            fullWidth
            label="Date of Birth *"
            value={dob}
            maxDate={new Date()}
            onChange={newValue => {
              setDob(newValue)
            }}
            sx={{ width: '100%' }}
            renderInput={params => (
              <TextField fullWidth required {...params} margin="normal" />
            )}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            name="phone"
            type="phone"
            variant="outlined"
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Password"
            margin="normal"
            name="password"
            type="password"
            variant="outlined"
            onChange={handleChange}
          />

          <Button
            size="medium"
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleForgetPass}
          >
            Update Password
          </Button>
          <Button
            size="medium"
            type="submit"
            variant="contained"
            color="error"
            sx={{ mt: 3, ml: 2 }}
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ForgetPassPopup
