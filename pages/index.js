// layouts
import MainLayout from '../src/layouts/main'
// material
import { styled } from '@mui/material/styles'
// components
import Page from '../src/components/Page'
import Hero from '@/components/_external-pages/landing/Hero'
import WorkTimeline from '@/components/_external-pages/landing/WorkTimeline'
import Gallery from '@/components/_external-pages/landing/Gallery'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import News from '@/components/_external-pages/landing/News'

// ----------------------------------------------------------------------

const RootStyle = styled(Page)({
  height: '100%',
})

const ContentStyle = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
}))

// ----------------------------------------------------------------------

export default function LandingPage() {
  const router = useRouter()

  return (
    <MainLayout>
      <RootStyle title="Earth.Co" id="move_top">
        <Hero />
        <ContentStyle>
          {/* Timeline */}
          <WorkTimeline />
          {/* Gallery */}
          <Gallery />
          {/* News */}
          <News />
        </ContentStyle>
      </RootStyle>
    </MainLayout>
  )
}
