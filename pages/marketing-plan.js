import MainLayout from '@/layouts/main'
import { Container, Grid } from '@mui/material'
import React from 'react'
import { styled } from '@mui/material/styles'
import Page from '@/components/Page'

const RootStyle = styled(Page)({
  height: '100%',
})

const MarketingPlan = () => {
  return (
    <MainLayout>
      <RootStyle title="Good Health | Marketing Plan" id="move_top">
        <Container sx={{ paddingTop: '5rem', paddingBottom: '5rem' }} maxWidth="lg">
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <iframe
                src="/marketing_plan.pdf"
                width="100%"
                height="800px"
                style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}
                title="Marketing Plan"
              />
            </Grid>
          </Grid>
        </Container>
      </RootStyle>
    </MainLayout>
  )
}

export default MarketingPlan
