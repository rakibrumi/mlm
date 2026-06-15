import PropTypes from 'prop-types'
import { Link as ScrollLink } from 'react-scroll'
// material
import { Box, Link, Container, Typography } from '@mui/material'
// components
import MainNavbar from './MainNavbar'
import Logo from '@/components/Logo'

// ----------------------------------------------------------------------

MainLayout.propTypes = {
  children: PropTypes.node,
}

export default function MainLayout({ children }) {
  

  return (
    <>
      <MainNavbar />
      <Box sx={{ pt: { xs: 12, md: 16 }, minHeight: '100vh' }}>{children}</Box>

      <Box
        sx={{
          py: 5,
          textAlign: 'center',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <ScrollLink to="move_top" spy smooth>
            <Logo sx={{ mb: 1, mx: 'auto', cursor: 'pointer' }} />
          </ScrollLink>

          <Typography variant="caption" component="p">
            © All rights reserved
            {/* <br /> Developed by &nbsp;
            <Link href="https://www.linkedin.com/in/ayon-jodder">
              Ayon Jodder
            </Link> */}
          </Typography>
        </Container>
      </Box>
    </>
  )
}
