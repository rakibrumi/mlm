import { bigNewsData, smallNewsData } from '@/utils/newsData'
import { Box, Card, Container, Grid, Typography } from '@mui/material'
import React from 'react'

const News = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h3" sx={{ py: 5, textAlign: 'center' }}>
        News of Earth.co
      </Typography>

      <Card sx={{ px: 4, py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              {bigNewsData.map(newsItem => (
                <Grid item key={newsItem.id} xs={12}>
                  <BigNewsCard newsItem={newsItem} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={4}>
              {smallNewsData.map(newsItem => (
                <Grid item key={newsItem.id} xs={12}>
                  <SmallNewsCard newsItem={newsItem} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Container>
  )
}

const BigNewsCard = ({ newsItem }) => {
  const { image, author, postedAt, heading, details } = newsItem
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4 }}>
        {heading}
      </Typography>
      <img style={{ width: '100%' }} src={image} alt="" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
        }}
      >
        {/* author */}
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            fontWeight: {
              xs: 'normal',
              md: 'bold',
            },
          }}
        >
          Writer: {author}
        </Typography>
        {/* date */}
        <Typography
          variant="body2"
          sx={{
            mb: {
              xs: 2,
              md: 0,
            },
            mt: {
              xs: 0,
              md: 2,
            },
            fontWeight: {
              xs: 'normal',
              md: 'bold',
            },
          }}
        >
          Published: {postedAt}
        </Typography>
      </Box>
      {/* Details */}
      <Typography
        variant="body1"
        sx={{
          my: {
            xs: 2,
            md: 4,
          },
          textAlign: 'justify',
        }}
      >
        {details}
      </Typography>
    </Box>
  )
}
const SmallNewsCard = ({ newsItem }) => {
  const { image, author, postedAt, heading, details } = newsItem
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 4 }}>
        {heading}
      </Typography>
      <img style={{ width: '100%' }} src={image} alt="" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        {/* author */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Writer: {author}
        </Typography>
        {/* date */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Published: {postedAt}
        </Typography>
      </Box>
      {/* Details */}
      <Typography variant="body2" sx={{ my: 2, textAlign: 'justify' }}>
        {details}
      </Typography>
    </Box>
  )
}

export default News
