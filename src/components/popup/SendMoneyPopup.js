import React from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import { Button, TextField, Typography } from '@mui/material'
import { ButtonAnimate } from '../animate'
import { sendMoney } from '@/func/functions'
import toast from 'react-hot-toast'

const SendMoneyPopup = ({ setOpen }) => {
  const [input, setInput] = React.useState({ sendTo: '', amount: '' })
  const handleChange = e => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const user =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('earth_user')
      : false
  const parsedUser = user ? JSON.parse(user) : false

  const handleSendMoney = async () => {
    if (!parsedUser) {
      return toast.error('You need to login first')
    }
    if (parsedUser.myReference === input.sendTo) {
      return toast.error('You cannot send money to yourself')
    }
    if (parsedUser.balance < input.amount) {
      return toast.error('You do not have enough balance')
    }
    if (input.amount < 0) {
      return toast.error('You cannot send negative amount')
    }
    // if (input.amount < 100) {
    //   return toast.error('You cannot send less than 100')
    // }
    if (!input.sendTo || !input.amount) {
      return toast.error('Please fill all the fields')
    }

    const send = await sendMoney(
      parsedUser.myReference,
      input.sendTo,
      input.amount
    )
    if (send) {
      toast.success('Money sent successfully')
      window.location.reload()
    } else {
      toast.error('Something went wrong')
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

          <ButtonAnimate>
            <Button
              onClick={handleSendMoney}
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 2, px: 5 }}
            >
              Send Money
            </Button>
          </ButtonAnimate>
        </div>
      </div>
    </div>
  )
}

export default SendMoneyPopup
