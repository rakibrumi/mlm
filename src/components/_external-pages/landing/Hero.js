import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import flashFill from '@iconify/icons-eva/flash-fill'
// next
import NextLink from 'next/link'
// material
import { styled } from '@mui/material/styles'
import { Box, Stack, Button, Container, Typography } from '@mui/material'
//
import {
  varFadeIn,
  varFadeInUp,
  varWrapEnter,
  varFadeInRight,
} from '../../animate'
import HeroSlider from '@/components/slider/HeroSlider'

// ----------------------------------------------------------------------

const RootStyle = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.grey[400],
  [theme.breakpoints.up('md')]: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    display: 'flex',
    position: 'fixed',
    alignItems: 'center',
  },
}))

const ContentStyle = styled(props => <Stack spacing={5} {...props} />)(
  ({ theme }) => ({
    zIndex: 10,
    maxWidth: 520,
    margin: 'auto',
    textAlign: 'center',
    position: 'relative',
    paddingTop: theme.spacing(30),
    paddingBottom: theme.spacing(15),
    [theme.breakpoints.up('md')]: {
      margin: 'unset',
      textAlign: 'left',
    },
  })
)

const HeroOverlayStyle = styled(motion.img)({
  zIndex: 9,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
})

const HeroImgStyle = styled(motion.img)(({ theme }) => ({
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  width: '100%',
  margin: 'auto',
  position: 'absolute',
  [theme.breakpoints.up('lg')]: {
    right: '8%',
    width: 'auto',
    height: '48vh',
  },
}))

// ----------------------------------------------------------------------

export default function Hero() {
  return (
    <>
      <RootStyle initial="initial" animate="animate" variants={varWrapEnter}>
        <HeroOverlayStyle
          alt="overlay"
          src="/static/overlay.svg"
          variants={varFadeIn}
        />

        <HeroImgStyle
          alt="hero"
          src="/static/tree.png"
          variants={varFadeInUp}
        />

        <Container maxWidth="lg">
          <ContentStyle>
            <motion.div variants={varFadeInRight}>
              <Typography variant="h1" sx={{ color: 'common.white' }}>
                Solution <br />
                of
                <Typography
                  component="span"
                  variant="h1"
                  sx={{ color: 'primary.main' }}
                >
                  &nbsp;Unemployment
                </Typography>
              </Typography>

              <Box
                sx={{
                  mt: 5,
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <HeroSlider />
              </Box>
            </motion.div>

            <motion.div variants={varFadeInRight}>
              <Typography
                sx={{
                  color: 'common.white',
                  backgroundColor: {
                    xs: 'rgba(108, 117, 125, 0.308)',
                    md: 'transparent',
                  },
                  backdropFilter: 'blur(10px)',
                  borderRadius: '10px',
                  padding: {
                    xs: '10px',
                    md: '0px',
                  },
                }}
              >
                Our mission is to provide a platform where people can grow,
                learn and earn. We are here to help you to find the solution of
                Unemployment.
              </Typography>
            </motion.div>

            <motion.div variants={varFadeInRight}>
              <NextLink href={'/products'}>
                <Button
                  size="medium"
                  variant="contained"
                  startIcon={<Icon icon={flashFill} width={20} height={20} />}
                >
                  Our Products
                </Button>
              </NextLink>
            </motion.div>
            <motion.div variants={varFadeInRight}>
              <NextLink href={'https://e-madrasa.vercel.app/'}>
                <Button
                  size="medium"
                  variant="contained"
                  startIcon={<Icon icon={flashFill} width={20} height={20} />}
                  color="warning"
                >
                  E-Madrasa
                </Button>
              </NextLink>
            </motion.div>
          </ContentStyle>
        </Container>
      </RootStyle>
      <Box sx={{ height: { md: '100vh' } }} />
    </>
  )
}
