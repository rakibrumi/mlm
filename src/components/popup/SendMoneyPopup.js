import React from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import { Button, TextField, Typography } from '@mui/material'
import { ButtonAnimate } from '../animate'
import { sendMoney, getUserByReference } from '@/func/functions'
import toast from 'react-hot-toast'

const SendMoneyPopup = ({ setOpen }) => {
  const [input, setInput] = React.useState({ sendTo: '', amount: '', message: '' })
  const handleChange = e => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const [loading, setLoading] = React.useState(false)

  const user =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('earth_user')
      : false
  const parsedUser = user ? JSON.parse(user) : false

  const [dbUser, setDbUser] = React.useState(null)

  React.useEffect(() => {
    if (parsedUser && parsedUser.myReference) {
      getUserByReference(parsedUser.myReference).then(data => {
        if (data) {
          setDbUser(data)
        }
      })
    }
  }, [])

  const handleSendMoney = async () => {
    if (!parsedUser) {
      return toast.error('You need to login first')
    }
    if (loading) return
    setLoading(true)

    try {
      // Fetch latest user data to ensure balance is correct
      const latestUserData = await getUserByReference(parsedUser.myReference)
      if (!latestUserData) {
        setLoading(false)
        return toast.error('User data not found. Please login again.')
      }

      if (latestUserData.myReference === input.sendTo) {
        setLoading(false)
        return toast.error('You cannot send money to yourself')
      }

      const amount = Number(input.amount)
      const serviceCharge = (5 / 100) * amount
      const totalNeeded = amount + serviceCharge
      const currentBalance = latestUserData?.balance || 0

      if (currentBalance < totalNeeded) {
        setLoading(false)
        return toast.error(`Insufficient balance. You need ${totalNeeded} (including 5% charge)`)
      }

      if (amount < 0) {
        setLoading(false)
        return toast.error('You cannot send negative amount')
      }
      if (amount < 300) {
        setLoading(false)
        return toast.error('You cannot send less than 300')
      }
      if (!input.sendTo || !amount) {
        setLoading(false)
        return toast.error('Please fill all the fields')
      }

      const result = await sendMoney(
        latestUserData.myReference,
        input.sendTo,
        amount,
        input.message
      )
      if (result && result.success) {
        toast.success('Money sent successfully')
        window.location.reload()
      } else {
        toast.error(result?.error || 'Something went wrong')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="popup_wrapper">
      <div className="popup_content relative">
        <ClearIcon
          onClick={() => setOpen(false)}
          className="absolute right-0 top-0 mr-4 mt-4 h-4 w-4 cursor-pointer"
        />
        <div className="mt-4">
          <Typography variant="h4" sx={{ mb: 1, textAlign: 'center' }}>
            Send Money
          </Typography>

          {/* marque tag */}
          <marquee>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              For sending money, you need to enter the reference id of the
              receiver. You will be charged 5% of the amount as service charge.
            </Typography>
          </marquee>

          <TextField
            fullWidth
            label="Send to(reference id)"
            name="sendTo"
            type="text"
            variant="outlined"
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            variant="outlined"
            sx={{ mt: 1 }}
            onChange={handleChange}
          />

          {/* {((parsedUser && parsedUser.role === 'admin') || (dbUser && dbUser.role === 'admin')) && (
            <TextField
              fullWidth
              label="Message"
              name="message"
              type="text"
              variant="outlined"
              sx={{ mt: 1 }}
              onChange={handleChange}
            />
          )} */}

          {((parsedUser && parsedUser.role === 'admin') || (dbUser && dbUser.role === 'admin')) && (
            <h1>Coming</h1>
          )}



          <ButtonAnimate>
            <Button
              disabled={loading}
              onClick={handleSendMoney}
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 2, px: 5 }}
            >
              {loading ? 'Processing...' : 'Send Money'}
            </Button>
          </ButtonAnimate>
        </div>
      </div>
    </div>
  )
}

export default SendMoneyPopup
