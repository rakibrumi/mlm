import { motion, AnimatePresence } from 'framer-motion'
import { Container, Grid, Paper, Typography } from '@mui/material'
import { useState } from 'react'

const Gallery = () => {
  const images = [
    'https://i.ibb.co/2vJBRs3/service-two.jpg',
    'https://i.ibb.co/x70G0Dv/service-eight.jpg',
    'https://i.ibb.co/b7b8mqC/service-one.jpg',
    'https://i.ibb.co/XSNLyww/service-seven.jpg',
    'https://i.ibb.co/zNKsBrr/service-six.jpg',
    'https://i.ibb.co/pv5jSsD/service-five.jpg',
    'https://i.ibb.co/rFQzyc1/service-four.jpg',
    'https://i.ibb.co/gZ3TzSx/service-three.jpg',
  ]
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = index => {
    setSelectedImage(index)
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h3" sx={{ py: 5, textAlign: 'center' }}>
        Our Work Gallery
      </Typography>
      <Grid container spacing={2}>
        {images.map((imageUrl, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <motion.div>
              <Paper
                sx={{ overflow: 'hidden', width: '100%', height: '100%' }}
                elevation={3}
                onClick={() => handleImageClick(index)}
              >
                <motion.img
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.3, ease: 'easeInOut' },
                  }}
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
            }}
            onClick={handleClose}
          >
            <motion.img
              src={images[selectedImage]}
              alt={`Image ${selectedImage + 1}`}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
              }}
              whileHover={{ scale: 1.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default Gallery
