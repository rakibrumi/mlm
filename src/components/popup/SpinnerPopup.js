import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'

const SpinnerPopup = () => {
  return (
    <div className="popup_wrapper">
      <div className="popup_content popup_bg">
        {/* <ImCross
          onClick={() => {
            setOpenPopup(false)
          }}
          className="cross_icon"
        /> */}
        <div className="margin_top">
          <Box
            sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}
          >
            <CircularProgress />
          </Box>
          <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 5 }}>
            Please Wait
          </Typography>
          {/* <Typography variant="body1" sx={{ textAlign: 'center' }}>
            We are processing your request
          </Typography> */}
          <div className="text-center"></div>
        </div>
      </div>
    </div>
  )
}

export default SpinnerPopup
