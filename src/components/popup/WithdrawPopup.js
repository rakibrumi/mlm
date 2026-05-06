import React from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import { Button, TextField, Typography } from '@mui/material'
import { ButtonAnimate } from '../animate'
import { sendMoney, withdrawMoney, getUserByReference } from '@/func/functions'
import toast from 'react-hot-toast'

const WithdrawPopup = ({ setOpen }) => {
  const [input, setInput] = React.useState({ sendTo: '', amount: '' })
  const handleChange = e => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const [loading, setLoading] = React.useState(false)

  const user =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('earth_user')
      : false
  const parsedUser = user ? JSON.parse(user) : false

  const handleWithdraw = async () => {
    if (!parsedUser) {
      return toast.error('You need to login first')
    }

    if (loading) return
    setLoading(true)

    try {
      // Fetch fresh user data to get accurate balance
      const dbUser = await getUserByReference(parsedUser.myReference)
      if (!dbUser) {
        setLoading(false)
        return toast.error('User data not found')
      }

      const amount = Number(input.amount)
      const serviceCharge = (5 / 100) * amount
      const totalNeeded = amount + serviceCharge
      const currentBalance = dbUser?.balance || 0

      if (currentBalance < totalNeeded) {
        setLoading(false)
        return toast.error(
          `Insufficient balance. You need ${totalNeeded} (including 5% charge)`
        )
      }

      if (amount < 0) {
        setLoading(false)
        return toast.error('You cannot withdraw negative amount')
      }
      if (amount < 300) {
        setLoading(false)
        return toast.error('You cannot withdraw less than 300')
      }
      if (!amount) {
        setLoading(false)
        return toast.error('Please input amount')
      }

      const send = await withdrawMoney(parsedUser.myReference, amount)
      if (send) {
        toast.success('Money Withdraw successfully')
        window.location.reload()
      } else {
        toast.error(
          'Transaction Failed. Check console for details or try again.'
        )
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
            Withdraw Money
          </Typography>

          {/* marque tag */}
          <marquee>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              Withdraw money will charge 5% service charge.
            </Typography>
          </marquee>

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            variant="outlined"
            onChange={handleChange}
          />

          <ButtonAnimate>
            <Button
              fullWidth
              size="large"
              disabled={loading}
              onClick={handleWithdraw}
              variant="contained"
              sx={{ mt: 2, px: 4 }}
            >
              {loading ? 'Processing...' : 'Withdraw Money'}
            </Button>
          </ButtonAnimate>
        </div>
      </div>
    </div>
  )
}

export default WithdrawPopup
