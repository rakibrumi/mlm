import Page from '@/components/Page'
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Box,
  FormHelperText,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useState, useEffect, useCallback } from 'react'
import { DatePicker } from '@mui/x-date-pickers'
import MainLayout from '@/layouts/main'
import {
  addUser,
  getAllUser,
  getUserByReference,
  checkAndPayLevelBonus,
  giveMoneyWhileRegistration,
  handleMakeReferance,
  moneyAddRemove,
  updateUser,
  createTransaction,
} from '@/func/functions'
import toast from 'react-hot-toast'
import UploadAvatar from '@/components/@material-extend/UploadAvatar'
import { fData } from '@/utils/formatNumber'
import { useFormik } from 'formik'
import fileUploader from '@/utils/fileUploader'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import SpinnerPopup from '@/components/popup/SpinnerPopup'
import { formatDate } from '@/helper/helper'

const ContentStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(15),
  width: '100%',
}))

const CardStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
}))

const AddMember = () => {
  const router = useRouter()
  const [isSpinner, setIsSpinner] = useState(false)
  const [user, setUser] = useState([])
  const [dob, setDob] = useState(new Date())
  const [input, setInput] = useState({
    role: 'member',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHvZ2JK-oa1Hcq0hCVxF-PDwfMQY09ocJ3A&usqp=CAU',
    children: [],
  })
  const [currentUser, setCurrentUser] = useState(null)

  const handleChange = e => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const handleSelect = (event, value) => {
    if (value) {
      setInput({
        ...input,
        placeUnder: value.myReference,
      })
    } else {
      setInput({
        ...input,
        placeUnder: '',
      })
    }
  }

  useEffect(() => {
    const retriveUser = async () => {
      await getAllUser(setUser)
    }
    retriveUser()
  }, [])

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      const user =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('earth_user')
          : false
      const parsedUser = user ? JSON.parse(user) : false

      if (!parsedUser) {
        // Redirect to login page if userRole is not available
        router.push('/auth/login')
      }

      const userData = await getUserByReference(parsedUser.myReference)
      if (!userData) {
        router.push('/auth/login')
      }
      setCurrentUser(userData)
    }

    // Call the function to fetch user information and redirect
    fetchUserAndRedirect()
  }, [router])

  const handleAddMember = async () => {
    if (currentUser?.balance < 5000) {
      toast.error('You do not have enough balance to add a member (Required: 5000)')
      return
    }

    // First check if the selected under user has two children or not. If 2 then return
    if (!input.placeUnder) {
      toast.error('Please select a user to place under')
      return
    }
    setIsSpinner(true)
    const myReference = handleMakeReferance(input.name)
    const data = {
      ...input,
      dob: formatDate(dob),
      myReference,
      balance: 0,
    }

    const placeUnderUser = await getUserByReference(input.placeUnder)
    if (placeUnderUser.children.length >= 2) {
      toast.error('This user already has 2 referrals. Please select another')
      setIsSpinner(false)
      return
    }

    const success = await addUser(data)
    // const update = await updateUser(input.referenceId, myReference)
    const update = await updateUser(input.placeUnder, myReference) // It will add the new user to the selected user's children array

    if (success) {
      // 1. Deduct 5000 from Current User (The one performing the add)
      await moneyAddRemove(currentUser.myReference, 5000, false)
      await createTransaction({
        userReference: currentUser.myReference,
        amount: 5000,
        type: 'debit',
        category: 'registration_fee',
        relatedUser: myReference,
        description: `Registration fee for adding ${myReference}`,
      })

      // 2. Add 5000 to Admin (DR-261211)
      await moneyAddRemove('DR-261211', 5000, true)
      await createTransaction({
        userReference: 'DR-261211',
        amount: 5000,
        type: 'credit',
        category: 'registration_fee',
        relatedUser: myReference,
        description: `Registration fee from ${currentUser.myReference}`,
      })

      // 3. Add 500 to Referrer (input.referenceId)
      await moneyAddRemove(input.referenceId, 500, true)
      await createTransaction({
        userReference: input.referenceId,
        amount: 500,
        type: 'credit',
        category: 'referral_bonus',
        relatedUser: myReference,
        description: `Referral bonus for ${myReference}`,
      })

      // 4. Check and pay multi-level bonuses
      await checkAndPayLevelBonus(myReference, input.placeUnder)

      setIsSpinner(false)
      Swal.fire({
        title: `Member added successfully. Your reference id is ${myReference}`,
        width: 600,
        padding: '1rem',
        color: '#716add',
        background: '#fff url(/images/second_bg_popup.png)',
        backdrop: `
          rgba(0,0,123,0.4)
          url("https://sweetalert2.github.io/images/nyan-cat.gif")
          left top
          no-repeat
        `,
        zIndex: 9999,
        customClass: {
          title: 'my-swal-title',
        },
      })

      window.location.reload()
    } else {
      setIsSpinner(false)
      Swal.fire({
        title: 'Something went wrong',
        width: 600,
        padding: '1rem',
        color: '#716add',
        background: '#fff url(/images/second_bg_popup.png)',
        backdrop: `
          rgba(0,0,123,0.4)
          url("https://sweetalert2.github.io/images/nyan-cat.gif")
          left top
          no-repeat
        `,
        zIndex: 9999,
        customClass: {
          title: 'my-swal-title',
        },
      })
    }
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      avatarUrl: user?.avatarUrl || null,
    },
  })

  const { errors, values, touched, setFieldValue } = formik

  const handleDrop = useCallback(
    acceptedFiles => {
      const file = acceptedFiles[0]
      if (file) {
        setFieldValue('avatarUrl', {
          ...file,
          preview: URL.createObjectURL(file),
        })
      }
      retriveFileUrl(file)
    },
    [setFieldValue]
  )

  const retriveFileUrl = async file => {
    if (file) {
      const url = await fileUploader(file)
      setInput({ ...input, avatarUrl: url })
    }
  }

  return (
    <>
      <MainLayout>
        <Page title="Add Member">
          <Container maxWidth="lg">
            <ContentStyle>
              <CardStyle>
                <Typography variant="h5" sx={{ mb: 5, textAlign: 'center' }}>
                  Add New Member
                </Typography>

                <Box sx={{ mb: 5 }}>
                  <UploadAvatar
                    accept="image/*"
                    file={values?.avatarUrl || input?.avatarUrl}
                    maxSize={3145728}
                    onDrop={handleDrop}
                    error={Boolean(touched.avatarUrl && errors.avatarUrl)}
                    caption={
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 2,
                          mx: 'auto',
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        Allowed *.jpeg, *.jpg, *.png, *.gif
                        <br /> max size of {fData(3145728)}
                      </Typography>
                    }
                  />
                  <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                    {touched.avatarUrl && errors.avatarUrl}
                  </FormHelperText>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Name"
                      name="name"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Father's Name"
                      name="father_name"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Mother's Name"
                      name="mother_name"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DatePicker
                      required
                      fullWidth
                      label="Date of Birth *"
                      value={dob}
                      maxDate={new Date()}
                      onChange={newValue => {
                        setDob(newValue)
                      }}
                      sx={{ width: '100%' }}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          required
                          {...params}
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Nid/Birth Certificate"
                      name="nidOrBirthCertificate"
                      type="number"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Mobile Number"
                      name="mobileNumber"
                      type="number"
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Present Address"
                      name="presentAddress"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Parmanent Address"
                      name="parmanentAddress"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      options={user}
                      getOptionLabel={option => option.name}
                      onChange={handleSelect}
                      renderInput={params => (
                        <TextField
                          style={{ position: 'relative', zIndex: 1000 }}
                          {...params}
                          label="Place Under *"
                          name="placeUnder"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Make Password"
                      name="password"
                      type="password"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="emailAddress"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Reference ID"
                      name="referenceId"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Reference Mobile"
                      name="referenceMobile"
                      type="text"
                      variant="outlined"
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <Button
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={handleAddMember}
                >
                  Register
                </Button>
              </CardStyle>
            </ContentStyle>
          </Container>
        </Page>
      </MainLayout>
      {isSpinner && <SpinnerPopup />}
    </>
  )
}

export default AddMember

const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: 'Pulp Fiction', year: 1994 },
  { title: 'The Lord of the Rings: The Return of the King', year: 2003 },
  { title: 'The Good, the Bad and the Ugly', year: 1966 },
  { title: 'Fight Club', year: 1999 },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
  { title: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980 },
  { title: 'Forrest Gump', year: 1994 },
  { title: 'Inception', year: 2010 },
  { title: 'The Lord of the Rings: The Two Towers', year: 2002 },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { title: 'Goodfellas', year: 1990 },
  { title: 'The Matrix', year: 1999 },
  { title: 'Seven Samurai', year: 1954 },
  { title: 'Star Wars: Episode IV - A New Hope', year: 1977 },
  { title: 'City of God', year: 2002 },
  { title: 'Se7en', year: 1995 },
  { title: 'The Silence of the Lambs', year: 1991 },
  { title: "It's a Wonderful Life", year: 1946 },
  { title: 'Life Is Beautiful', year: 1997 },
  { title: 'The Usual Suspects', year: 1995 },
  { title: 'Léon: The Professional', year: 1994 },
  { title: 'Spirited Away', year: 2001 },
  { title: 'Saving Private Ryan', year: 1998 },
  { title: 'Once Upon a Time in the West', year: 1968 },
  { title: 'American History X', year: 1998 },
  { title: 'Interstellar', year: 2014 },
  { title: 'Casablanca', year: 1942 },
  { title: 'City Lights', year: 1931 },
  { title: 'Psycho', year: 1960 },
  { title: 'The Green Mile', year: 1999 },
  { title: 'The Intouchables', year: 2011 },
  { title: 'Modern Times', year: 1936 },
  { title: 'Raiders of the Lost Ark', year: 1981 },
  { title: 'Rear Window', year: 1954 },
  { title: 'The Pianist', year: 2002 },
  { title: 'The Departed', year: 2006 },
  { title: 'Terminator 2: Judgment Day', year: 1991 },
  { title: 'Back to the Future', year: 1985 },
  { title: 'Whiplash', year: 2014 },
  { title: 'Gladiator', year: 2000 },
  { title: 'Memento', year: 2000 },
  { title: 'The Prestige', year: 2006 },
  { title: 'The Lion King', year: 1994 },
  { title: 'Apocalypse Now', year: 1979 },
  { title: 'Alien', year: 1979 },
  { title: 'Sunset Boulevard', year: 1950 },
  {
    title:
      'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    year: 1964,
  },
  { title: 'The Great Dictator', year: 1940 },
  { title: 'Cinema Paradiso', year: 1988 },
  { title: 'The Lives of Others', year: 2006 },
  { title: 'Grave of the Fireflies', year: 1988 },
  { title: 'Paths of Glory', year: 1957 },
  { title: 'Django Unchained', year: 2012 },
  { title: 'The Shining', year: 1980 },
  { title: 'WALL·E', year: 2008 },
  { title: 'American Beauty', year: 1999 },
  { title: 'The Dark Knight Rises', year: 2012 },
  { title: 'Princess Mononoke', year: 1997 },
  { title: 'Aliens', year: 1986 },
  { title: 'Oldboy', year: 2003 },
  { title: 'Once Upon a Time in America', year: 1984 },
  { title: 'Witness for the Prosecution', year: 1957 },
  { title: 'Das Boot', year: 1981 },
  { title: 'Citizen Kane', year: 1941 },
  { title: 'North by Northwest', year: 1959 },
  { title: 'Vertigo', year: 1958 },
  { title: 'Star Wars: Episode VI - Return of the Jedi', year: 1983 },
  { title: 'Reservoir Dogs', year: 1992 },
  { title: 'Braveheart', year: 1995 },
  { title: 'M', year: 1931 },
  { title: 'Requiem for a Dream', year: 2000 },
  { title: 'Amélie', year: 2001 },
  { title: 'A Clockwork Orange', year: 1971 },
  { title: 'Like Stars on Earth', year: 2007 },
  { title: 'Taxi Driver', year: 1976 },
  { title: 'Lawrence of Arabia', year: 1962 },
  { title: 'Double Indemnity', year: 1944 },
  { title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
  { title: 'Amadeus', year: 1984 },
  { title: 'To Kill a Mockingbird', year: 1962 },
  { title: 'Toy Story 3', year: 2010 },
  { title: 'Logan', year: 2017 },
  { title: 'Full Metal Jacket', year: 1987 },
  { title: 'Dangal', year: 2016 },
  { title: 'The Sting', year: 1973 },
  { title: '2001: A Space Odyssey', year: 1968 },
  { title: "Singin' in the Rain", year: 1952 },
  { title: 'Toy Story', year: 1995 },
  { title: 'Bicycle Thieves', year: 1948 },
  { title: 'The Kid', year: 1921 },
  { title: 'Inglourious Basterds', year: 2009 },
  { title: 'Snatch', year: 2000 },
  { title: '3 Idiots', year: 2009 },
  { title: 'Monty Python and the Holy Grail', year: 1975 },
]
