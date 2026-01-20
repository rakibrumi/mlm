import MainLayout from '@/layouts/main'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Typography, Container } from '@mui/material'
import Page from '@/components/Page'
import { Grid } from '@mui/material'
import { Card } from '@mui/material'
import AdPopup from '@/components/popup/AdPopup'

const RootStyle = styled(Page)({
  height: '100%',
})

const adData = [
  {
    id: 1,
    title: 'Ad 1',
    description: 'Ad 1 description',
    image: '/static/images/ads/ad1.jpg',
    taka: 5,
  },
  {
    id: 2,
    title: 'Ad 2',
    description: 'Ad 2 description',
    image: '/static/images/ads/ad2.jpg',
    taka: 7,
  },
  {
    id: 3,
    title: 'Ad 3',
    description: 'Ad 3 description',
    image: '/static/images/ads/ad3.jpg',
    taka: 3,
  },
  {
    id: 4,
    title: 'Ad 4',
    description: 'Ad 4 description',
    image: '/static/images/ads/ad4.jpg',
    taka: 2,
  },
  {
    id: 5,
    title: 'Ad 5',
    description: 'Ad 5 description',
    image: '/static/images/ads/ad5.jpg',
    taka: 10,
  },
  {
    id: 6,
    title: 'Ad 6',
    description: 'Ad 6 description',
    image: '/static/images/ads/ad6.jpg',
    taka: 8,
  },
  {
    id: 7,
    title: 'Ad 7',
    description: 'Ad 7 description',
    image: '/static/images/ads/ad7.jpg',
    taka: 6,
  },
  {
    id: 8,
    title: 'Ad 8',
    description: 'Ad 8 description',
    image: '/static/images/ads/ad8.jpg',
    taka: 4,
  },
]

const Ads = () => {
  const [open, setOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState({})

  return (
    <>
      <MainLayout>
        <RootStyle title="Earth.Co | Products" id="move_top">
          <Container sx={{ paddingTop: '5rem' }} maxWidth="lg">
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" align="center">
                Available Ads
              </Typography>

              <Grid container spacing={2} sx={{ mt: 4 }}>
                {adData.map((ad, index) => (
                  <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                    <Card
                      onClick={() => {
                        setSelectedAd(ad)
                        setOpen(true)
                      }}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        marginBottom: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={ad.image}
                        alt={ad.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                        }}
                      />
                      <Typography variant="h6" align="center">
                        {ad.title}
                      </Typography>
                      <Typography variant="body1" align="center">
                        {ad.description}
                      </Typography>
                      <Typography variant="h6" align="center">
                        {ad.taka} Taka
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </RootStyle>
      </MainLayout>

      {open && <AdPopup setOpen={setOpen} ad={selectedAd} />}
    </>
  )
}

export default Ads
