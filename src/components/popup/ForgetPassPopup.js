import { Button, TextField, Typography, CircularProgress, Box } from '@mui/material'
import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { sendOTP, verifyOTP } from '@/func/functions'

const ForgetPassPopup = ({ setShowPopup }) => {
  const [step, setStep] = useState(1)
  const [input, setInput] = useState({
    emailAddress: '',
    password: '',
  })
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [timer, setTimer] = useState(0)
  
  const timerRef = useRef(null)

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timer])

  const handleChange = e => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    })
  }

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otpValues]
    // Handle paste or multi-character input
    if (value.length > 1) {
      const pasteValues = value.split('').slice(0, 6 - index)
      pasteValues.forEach((val, i) => {
        newOtp[index + i] = val
      })
      setOtpValues(newOtp)
      // Focus last pasted element or next
      const nextIdx = Math.min(index + pasteValues.length, 5)
      const nextInput = document.getElementById(`otp-input-${nextIdx}`)
      if (nextInput) nextInput.focus()
      return
    }

    newOtp[index] = value
    setOtpValues(newOtp)

    // Move focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`)
        if (prevInput) {
          prevInput.focus()
          const newOtp = [...otpValues]
          newOtp[index - 1] = ''
          setOtpValues(newOtp)
        }
      } else {
        const newOtp = [...otpValues]
        newOtp[index] = ''
        setOtpValues(newOtp)
      }
    }
  }

  const handleSendOTP = async () => {
    if (!input.emailAddress || !input.password) {
      toast.error('Email and New Password are required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.emailAddress)) {
      toast.error('Invalid email address')
      return
    }

    setSending(true)
    const res = await sendOTP(input.emailAddress, input.password)
    setSending(false)

    if (res.success) {
      toast.success('OTP sent to your email successfully')
      setTimer(60) // 1 minute countdown
      setStep(2)
    } else {
      toast.error(res.error || 'Failed to send OTP')
    }
  }

  const handleResendOTP = async () => {
    if (timer > 0) return
    setSending(true)
    const res = await sendOTP(input.emailAddress, input.password)
    setSending(false)

    if (res.success) {
      toast.success('OTP resent successfully')
      setTimer(60) // Reset countdown
    } else {
      toast.error(res.error || 'Failed to resend OTP')
    }
  }

  const handleVerifyOTP = async () => {
    const otp = otpValues.join('')
    if (otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setVerifying(true)
    const res = await verifyOTP(input.emailAddress, otp)
    setVerifying(false)

    if (res.success) {
      toast.success('Password updated successfully')
      setShowPopup(false)
    } else {
      toast.error(res.error || 'Invalid OTP code')
    }
  }

  return (
    <div className="popup_wrapper">
      <div className="popup_content relative">
        <div className="mt-4">
          <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Forget Password
          </Typography>

          {step === 1 ? (
            <>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                name="emailAddress"
                type="email"
                variant="outlined"
                value={input.emailAddress}
                onChange={handleChange}
                disabled={sending}
              />

              <TextField
                fullWidth
                label="New Password"
                margin="normal"
                name="password"
                type="password"
                variant="outlined"
                value={input.password}
                onChange={handleChange}
                disabled={sending}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  size="medium"
                  variant="contained"
                  onClick={handleSendOTP}
                  disabled={sending}
                  startIcon={sending ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ flex: 1 }}
                >
                  {sending ? 'Sending...' : 'Send OTP'}
                </Button>
                <Button
                  size="medium"
                  variant="contained"
                  color="error"
                  onClick={() => setShowPopup(false)}
                  disabled={sending}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                We have sent a 6-digit OTP to <strong>{input.emailAddress}</strong>. Please check your inbox.
              </Typography>

              {/* 6-digit OTP Inputs */}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', my: 3 }}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={val}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={verifying}
                    style={{
                      width: '45px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 'bold',
                      border: '1px solid rgba(0, 178, 255, 0.2)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: verifying ? '#0c1833' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: val ? '#00B2FF' : 'rgba(0, 178, 255, 0.2)',
                      transition: 'border-color 0.2s',
                      color: '#fff',
                    }}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </Box>

              {/* Resend Timer section */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {timer > 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Resend OTP in <strong>{timer}s</strong>
                  </Typography>
                ) : (
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={handleResendOTP} 
                    disabled={sending}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {sending ? 'Resending...' : 'Resend OTP'}
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  size="medium"
                  variant="contained"
                  onClick={handleVerifyOTP}
                  disabled={verifying}
                  startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ flex: 1 }}
                >
                  {verifying ? 'Verifying...' : 'Verify & Update'}
                </Button>
                <Button
                  size="medium"
                  variant="contained"
                  color="warning"
                  onClick={() => setStep(1)}
                  disabled={verifying}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
              </Box>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgetPassPopup
