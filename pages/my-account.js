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
      const user =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('earth_user')
          : false
      const parsedUser = user ? JSON.parse(user) : false

      if (parsedUser) {
        setAllDataView(parsedUser.allData)
      }
    }

    fetchUserAndRedirect()
  }, [])

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
                // sx={{ mt: 5, mb: 1 }}
                onClick={() => router.push('/auth/add-member')}
              >
                Add Member
              </Button>
            </ButtonAnimate>

            <ButtonAnimate>
              <Button
                variant="contained"
                color="primary"
                // sx={{ mb: 1 }}
                onClick={handleAllMemberView}
              >
                {allDataView ? 'View My Member' : 'View All Member'}
              </Button>
            </ButtonAnimate>
          </Box>

        </Container>

        <DynamicOrganizationalChart allDataView={allDataView} />
      </RootStyle>
    </MainLayout>
  )
}

export default MyAccount
