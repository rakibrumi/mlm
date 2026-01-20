// import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles'
import {
  Box,
  Card,
  Stack,
  Alert,
  Container,
  Typography,
  Button,
  TextField,
} from '@mui/material'
import AuthLayout from '@/layouts/AuthLayout'
import Page from '@/components/Page'
import { MHidden } from '@/components/@material-extend'
import { useState } from 'react'
import { login } from '@/func/functions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import ForgetPassPopup from '@/components/popup/ForgetPassPopup'

// layouts

// components

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}))

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}))

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}))

// ----------------------------------------------------------------------

export default function Login() {
  const [input, setInput] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndRedirect = () => {
      const user =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('earth_user')
          : null

      if (user) {
        try {
          const userRole = JSON.parse(user)

          if (userRole) {
            // Redirect to login page if userRole is not available
            router.push('/')
          }
        } catch (error) {
          console.error('Error parsing user information:', error)
        }
      }
    }

    // Call the function to fetch user information and redirect
    fetchUserAndRedirect()
  }, [router])

  const handleChange = e => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    })
  }

  const handleLoginAuth0 = async () => {
    if (!input.mobileNumber || !input.password) {
      toast.error('Please fill all the fields')
      return
    }
    try {
      const user = await login(input)
      if (!user) {
        toast.error('Invalid credentials')
        return
      }

      toast.success('Login successful')
      localStorage.setItem(
        'earth_user',
        JSON.stringify({ allData: false, myReference: user.myReference })
      )
      router.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <RootStyle title="Login | Earth.Co">
      <AuthLayout>
        {/* Don’t have an account? &nbsp;
        <Link underline="none" variant="subtitle2"  to={'/register'}>
          Get started
        </Link> */}
      </AuthLayout>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Hi, Welcome Back
          </Typography>
          <img src="/static/illustrations/illustration_login.png" alt="login" />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Sign in to Earth.Co
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Enter your details below.
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ mb: 3 }}>
            Don't have an account? Please contact with the admin of{' '}
            <strong>Earth.Co</strong>
          </Alert>

          {/* <LoginForm /> */}
          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            name="mobileNumber"
            type="numberThe"
            variant="outlined"
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            name="password"
            type="password"
            variant="outlined"
            onChange={handleChange}
          />

          <Typography
            variant="subtitle2"
            align="right"
            sx={{ my: 1, cursor: 'pointer', color: 'blue' }}
            onClick={() => setShowPopup(true)}
          >
            Forget Password
          </Typography>

          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            onClick={handleLoginAuth0}
          >
            Login
          </Button>

          {/* <MHidden width="smUp">
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Don’t have an account?&nbsp;
              <Link variant="subtitle2" to={'/register'}>
                Get started
              </Link>
            </Typography>
          </MHidden> */}
        </ContentStyle>
      </Container>

      {showPopup && <ForgetPassPopup setShowPopup={setShowPopup} />}
    </RootStyle>
  )
}
