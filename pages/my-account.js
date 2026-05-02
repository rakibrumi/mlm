import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import { Box, Button, Container, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { ButtonAnimate } from '@/components/animate'
import { useRouter } from 'next/router'
import { getUserByReference } from '@/func/functions'

const DynamicOrganizationalChart = dynamic(
  () => import('@/components/OrgChartComponent'),
  {
    ssr: false, // Disable server-side rendering
  }
)

const RootStyle = styled(Page)({
  height: '100%',
})

const MyAccount = () => {
  const router = useRouter()
  const [allDataView, setAllDataView] = useState(false)
  const [role, setRole] = useState(null)

  const handleAllMemberView = () => {
    // Retrieve the user data from localStorage
    const userDataString =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('earth_user')
        : false

    if (userDataString) {
      try {
        // Parse the JSON string to get the user object
        const userData = JSON.parse(userDataString)

        // Update the allData property to true
        userData.allData = !userData.allData

        // Stringify the updated user object
        const updatedUserDataString = JSON.stringify(userData)

        // Store the updated user object back in localStorage
        window.localStorage.setItem('earth_user', updatedUserDataString)

        window.location.reload()
      } catch (error) {
        console.error('Error parsing or updating user information:', error)
      }
    }
  }

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      try {
        const user =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('earth_user')
            : false
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        const parsedUser = JSON.parse(user)

        if (parsedUser && parsedUser.myReference) {
          setAllDataView(parsedUser.allData)
          // Fetch full user data to get the role
          const userData = await getUserByReference(parsedUser.myReference)
          if (userData) {
            setRole(userData.role)
          } else {
            // User exists in localStorage but not in DB
            console.error('User not found in database')
            window.localStorage.removeItem('earth_user')
            router.push('/auth/login')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error in MyAccount authentication check:', error)
        window.localStorage.removeItem('earth_user')
        router.push('/auth/login')
      }
    }

    fetchUserAndRedirect()
  }, [router])

  return (
    <MainLayout>
      <RootStyle title="Good Health | My Account" id="move_top">
        <Container sx={{ mt: 10 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              gap: 1,
              // flexDirection: 'column',
              flexWrap: 'wrap',
              marginBottom: 2,
            }}
          >
            <ButtonAnimate>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/marketing-plan')}
              >
                Marketing plan
              </Button>
            </ButtonAnimate>

            <ButtonAnimate>
              <Button
                variant="contained"
                color="primary"
                // sx={{ mt: 5, mb: 1 }}
                onClick={() => router.push('/auth/add-member')}
              >
                Add Member
              </Button>
            </ButtonAnimate>

            {role === 'admin' && (
              <>
                <ButtonAnimate>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/admin/monthly-bonus')}
                  >
                    Monthly Bonus
                  </Button>
                </ButtonAnimate>
                <ButtonAnimate>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/old-transactions')}
                  >
                    Old Transactions
                  </Button>
                </ButtonAnimate>
                <ButtonAnimate>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      window.open(
                        'https://console.firebase.google.com/u/1/project/earthco-ecad3/firestore/databases/-default-/data',
                        '_blank'
                      )
                    }
                  >
                    Admin Panel
                  </Button>
                </ButtonAnimate>
              </>
            )}
          </Box>
        </Container>

        <DynamicOrganizationalChart allDataView={allDataView} />
      </RootStyle>
    </MainLayout>
  )
}

export default MyAccount
