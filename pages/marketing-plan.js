import MainLayout from '@/layouts/main'
import { Button, Container, Grid, Typography } from '@mui/material'
import React from 'react'
import { styled } from '@mui/material/styles'
import Page from '@/components/Page'

const RootStyle = styled(Page)({
  height: '100%',
})

const plans = [
  {
    title: 'Marketing Plan one',
    image: '/static/m/one.jpg',
  },
  {
    title: 'Marketing Plan two',
    image: '/static/m/two.jpg',
  },
]

const MarketingPlan = () => {
  return (
    <MainLayout>
      <RootStyle title="Earth.Co | Marketing Plan" id="move_top">
        <Container sx={{ paddingTop: '5rem' }} maxWidth="lg">
          {/* <Typography
            variant="h3"
            sx={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            Marketing Plan
          </Typography> */}

          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            {plans.map((plan, index) => (
              <Grid
                item
                key={index}
                xs={12}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ textAlign: 'center', marginBottom: '5px' }}
                >
                  {plan.title}
                </Button>

                <img src={plan.image} alt="" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </RootStyle>
    </MainLayout>
  )
}

export default MarketingPlan
