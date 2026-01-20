import { moneyAddRemove } from '@/func/functions'
import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const AdPopup = ({ setOpen, ad }) => {
  const [countdown, setCountdown] = useState(30)

  const userDataString =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('earth_user')
      : false

  const myReference = userDataString
    ? JSON.parse(userDataString).myReference
    : false

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    const timer = setTimeout(async () => {
      const addMoney = await moneyAddRemove(myReference, Number(ad.taka), 'add')
      if (addMoney) {
        setOpen(false)
        toast.success(`You have earned ${ad.taka} taka!`)
      } else {
        toast.error('Something went wrong! Please try again.')
        setOpen(false)
      }
    }, 29000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [myReference, ad.taka, setOpen])

  return (
    <div className="popup_wrapper">
      <div className="popup_content relative">
        <div className="mt-4">
          <Typography variant="h4" sx={{ mb: 1, textAlign: 'center' }}>
            {ad.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
            You will earn {ad.taka} taka for watching this ad. Please don't
            close this window.
          </Typography>

          {/* Marquee tag */}
          <marquee>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              {ad.description}
            </Typography>
          </marquee>

          {/* Countdown animation */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <AnimatePresence mode="wait">
              <div
                style={{
                  display: 'inline-block',
                  background: '#00AB55',
                  padding: '10px',
                  borderRadius: '50%',
                  height: '50px',
                  width: '50px',
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'inline-block',
                  }}
                >
                  <Typography variant="h6" component="span">
                    {countdown}
                  </Typography>
                </motion.div>
              </div>
            </AnimatePresence>
            <Typography variant="h6" component="span">
              &nbsp;second{countdown > 1 ? 's' : ''} remaining...
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdPopup
