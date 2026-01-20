import React, { useEffect, useState } from 'react'
// next
import NextLink from 'next/link'
import { useRouter } from 'next/router'
// material
import { styled } from '@mui/material/styles'
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  Container,
  Typography,
} from '@mui/material'
// hooks
import useOffSetTop from '../../hooks/useOffSetTop'
// components
import Logo from '../../components/Logo'
import { ButtonAnimate } from '../../../src/components/animate'
import { MHidden } from '@/components/@material-extend'
import MenuMobile from './MenuMobile'
import MenuDesktop from './MenuDesktop'
import navConfig from './MenuConfig'
import { getUserByReference, loadStorage } from '@/func/functions'
import AccountPopover from '../dashboard/AccountPopover'

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64
const APP_BAR_DESKTOP = 88

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  height: APP_BAR_MOBILE,
  transition: theme.transitions.create(['height', 'background-color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up('md')]: {
    height: APP_BAR_DESKTOP,
  },
}))

const ToolbarShadowStyle = styled('div')(({ theme }) => ({
  left: 0,
  right: 0,
  bottom: 0,
  height: 24,
  zIndex: -1,
  margin: 'auto',
  borderRadius: '50%',
  position: 'absolute',
  width: `calc(100% - 48px)`,
  boxShadow: theme.customShadows.z8,
}))

// ----------------------------------------------------------------------

export default function MainNavbar() {
  const [user, setUser] = useState(null)
  const isOffset = useOffSetTop(100)
  const { pathname } = useRouter()
  const isHome = pathname === '/'

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      const user =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('earth_user')
          : false
      const parsedUser = user ? JSON.parse(user) : false

      if (parsedUser) {
        const userData = await getUserByReference(parsedUser.myReference)
        setUser(userData)
      }
    }

    fetchUserAndRedirect()
  }, [])

  return (
    <AppBar sx={{ boxShadow: 0, bgcolor: 'transparent' }}>
      <ToolbarStyle
        disableGutters
        sx={{
          ...(isOffset && {
            bgcolor: 'background.default',
            height: { md: APP_BAR_DESKTOP - 16 },
          }),
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <NextLink href="/">
            <Logo sx={{ marginBottom: '-8px' }} />
          </NextLink>
          <Box sx={{ flexGrow: 1 }} />

          <MHidden width="mdDown">
            <MenuDesktop
              isOffset={isOffset}
              isHome={isHome}
              navConfig={navConfig}
            />
          </MHidden>

          {user ? (
            // <Typography
            //   variant="h6"
            //   dangerouslySetInnerHTML={{ __html: user.name }}
            // />
            <AccountPopover user={user} />
          ) : (
            <ButtonAnimate>
              <Button
                variant="contained"
                color="primary"
                href="/auth/login"
                rel="noopener noreferrer"
              >
                Login
              </Button>
            </ButtonAnimate>
          )}

          <MHidden width="mdUp">
            <MenuMobile
              isOffset={isOffset}
              isHome={isHome}
              navConfig={navConfig}
            />
          </MHidden>
        </Container>
      </ToolbarStyle>

      {isOffset && <ToolbarShadowStyle />}
    </AppBar>
  )
}
