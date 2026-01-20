import MainLayout from '@/layouts/main'
import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Page from '@/components/Page'
import { Box, Container, Grid, Typography } from '@mui/material'

const RootStyle = styled(Page)({
  height: '100%',
})

const ProductCard = ({ image, name, details, sp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: sp ? '100%' : '17rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        height: sp ? '30rem' : '20rem',
      }}
    >
      <motion.img
        src={image}
        alt={name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px 8px 0 0',
        }}
      />
      {!sp && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            padding: '1.5rem',
            borderRadius: '0 0 8px 8px',
            textAlign: 'center',
            width: '100%',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            marginTop: '-1rem',
            height: '8rem',
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'justify' }}>
            {details}
          </Typography>
        </motion.div>
      )}
    </motion.div>
  )
}

const ProductsPage = () => {
  const productList = [
    {
      name: 'Potato',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/cleaner.jpg',
    },
    {
      name: 'Rice',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/ata.jpg',
    },
    {
      name: 'Potato',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/caul.jpg',
    },
    {
      name: 'Rice',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/daul.jpg',
    },
    {
      name: 'Potato',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/dishWashing.jpg',
    },
    {
      name: 'Rice',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/holud.jpg',
    },
    {
      name: 'Potato',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/oil.jpg',
    },
    {
      name: 'Rice',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/semai.jpg',
    },
    {
      name: 'Potato',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/serf.jpg',
    },
    {
      name: 'Rice',
      details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit amet',
      image: '/static/product/sugar.jpg',
    },
  ]

  const special = [
    // {
    //   name: 'Potato',
    //   details: 'Best quality potato with no preservatives',
    //   image: '/static/product/2.jpg',
    // },
    // {
    //   name: 'Rice',
    //   details: 'Freshly harvested rice from the farm',
    //   image: '/static/product/1.jpg',
    // },
    {
      name: 'Potato',
      details: 'Best quality potato with no preservatives',
      image: '/static/product/mash.jpg',
    },
  ]

  return (
    <MainLayout>
      <RootStyle title="Earth.Co | Products" id="move_top">
        <Container sx={{ paddingTop: '5rem' }} maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            Our Products
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <img src="/static/product/11.jpg" alt="" style={{ maxWidth: '100%', height: 'auto' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <img src="/static/product/22.jpg" alt="" style={{ maxWidth: '100%', height: 'auto' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <img src="/static/product/33.jpg" alt="" style={{ maxWidth: '100%', height: 'auto' }} />
              </Box>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            {productList.map((product, index) => (
              <Grid
                item
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <ProductCard
                  name={product.name}
                  details={product.details}
                  image={product.image}
                />
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              marginBottom: '2rem',
              marginTop: '5rem',
            }}
          >
            Special Product
          </Typography>
          <Grid container spacing={4}>
            {special.map((product, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <ProductCard
                  sp={true}
                  name={product.name}
                  details={product.details}
                  image={product.image}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </RootStyle>
    </MainLayout>
  )
}

export default ProductsPage
