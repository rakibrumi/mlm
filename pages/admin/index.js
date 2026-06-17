import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  Autocomplete,
} from '@mui/material'
import {
  People as PeopleIcon,
  ReceiptLong as ReceiptLongIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  PhotoLibrary as PhotoLibraryIcon,
} from '@mui/icons-material'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import {
  getUserByReference,
  getAdminUsers,
  deleteUser,
  getAdminTransactions,
  updateUserProfile,
  uploadImageToImgbb,
  saveGalleryItem,
  getGalleryItems,
  deleteGalleryItem,
} from '@/func/functions'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [role, setRole] = useState(null)
  
  // Navigation
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'transactions'

  // Users State
  const [users, setUsers] = useState([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersLimit, setUsersLimit] = useState(10)
  const [usersSearch, setUsersSearch] = useState('')
  const [usersFilterRole, setUsersFilterRole] = useState('')
  const [usersFilterRank, setUsersFilterRank] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  // Transactions State
  const [transactions, setTransactions] = useState([])
  const [txTotal, setTxTotal] = useState(0)
  const [txPage, setTxPage] = useState(1)
  const [txLimit, setTxLimit] = useState(10)
  const [txSearch, setTxSearch] = useState('')
  const [txLoading, setTxLoading] = useState(false)

  // Edit User Modal State
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
    dob: '',
    father_name: '',
    mother_name: '',
    presentAddress: '',
    password: '',
    email: '',
    role: '',
    rank: '',
    balance: 0,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Gallery State
  const [galleryItems, setGalleryItems] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageTitle, setImageTitle] = useState('')
  const [imageFolder, setImageFolder] = useState('General')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    const verifyAdmin = async () => {
      setCheckingAuth(true)
      try {
        const storedUser = JSON.parse(localStorage.getItem('earth_user') || '{}')
        if (storedUser.myReference) {
          const userData = await getUserByReference(storedUser.myReference)
          if (userData) {
            setRole(userData.role)
          }
        }
      } catch (error) {
        console.error('Authentication verification failed:', error)
      } finally {
        setCheckingAuth(false)
      }
    }
    verifyAdmin()
  }, [])

  // Load Users
  const fetchUsers = async () => {
    if (role !== 'admin') return
    setUsersLoading(true)
    try {
      const data = await getAdminUsers(
        usersPage,
        usersLimit,
        usersSearch,
        usersFilterRole,
        usersFilterRank
      )
      setUsers(data.users || [])
      setUsersTotal(data.total || 0)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

  // Load Transactions
  const fetchTransactions = async () => {
    if (role !== 'admin') return
    setTxLoading(true)
    try {
      const data = await getAdminTransactions(txPage, txLimit, txSearch)
      setTransactions(data.transactions || [])
      setTxTotal(data.total || 0)
    } catch (error) {
      toast.error('Failed to load transactions')
    } finally {
      setTxLoading(false)
    }
  }

  // Load Gallery
  const fetchGallery = async () => {
    if (role !== 'admin') return
    setGalleryLoading(true)
    try {
      const data = await getGalleryItems()
      setGalleryItems(data || [])
    } catch (error) {
      toast.error('Failed to load gallery items')
    } finally {
      setGalleryLoading(false)
    }
  }

  // Handle Gallery Upload
  const handleGalleryUpload = async (e) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error('Please select an image file first')
      return
    }
    setIsUploadingImage(true)
    try {
      const imageUrl = await uploadImageToImgbb(imageFile)
      if (imageUrl) {
        const res = await saveGalleryItem(imageUrl, imageTitle, imageFolder || 'General')
        if (res) {
          setImageFile(null)
          setImageTitle('')
          setImageFolder('General')
          const fileInput = document.getElementById('gallery-file-input')
          if (fileInput) fileInput.value = ''
          fetchGallery()
        }
      }
    } catch (error) {
      toast.error('Failed to upload and save image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle Gallery Delete
  const handleDeleteGallery = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this image from the gallery?')) {
      const success = await deleteGalleryItem(itemId)
      if (success) {
        fetchGallery()
      }
    }
  }

  useEffect(() => {
    if (role === 'admin') {
      if (activeTab === 'users') {
        fetchUsers()
      } else if (activeTab === 'transactions') {
        fetchTransactions()
      } else if (activeTab === 'gallery') {
        fetchGallery()
      }
    }
  }, [
    role,
    activeTab,
    usersPage,
    usersLimit,
    usersFilterRole,
    usersFilterRank,
    txPage,
    txLimit,
  ])

  // Triggers search on input commit or enter
  const handleUserSearchSubmit = (e) => {
    e.preventDefault()
    setUsersPage(1)
    fetchUsers()
  }

  const handleTxSearchSubmit = (e) => {
    e.preventDefault()
    setTxPage(1)
    fetchTransactions()
  }

  // Delete User handler
  const handleDeleteUser = async (refId, userName) => {
    if (window.confirm(`Are you sure you want to delete user ${userName} (${refId})?`)) {
      const success = await deleteUser(refId)
      if (success) {
        fetchUsers()
      }
    }
  }

  // Open Edit User dialog
  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || '',
      mobileNumber: user.mobileNumber || '',
      dob: user.dob || '',
      father_name: user.father_name || '',
      mother_name: user.mother_name || '',
      presentAddress: user.presentAddress || '',
      password: user.password || '',
      email: user.emailAddress || user.email || '',
      role: user.role || 'member',
      rank: user.rank || 'Member',
      balance: user.balance || 0,
    })
    setIsEditDialogOpen(true)
  }

  // Save profile updates
  const handleSaveUpdate = async () => {
    if (!selectedUser) return
    setIsUpdating(true)
    try {
      const res = await updateUserProfile(selectedUser.myReference, editForm)
      if (res.success) {
        toast.success('User updated successfully')
        setIsEditDialogOpen(false)
        fetchUsers()
      } else {
        toast.error(res.error || 'Failed to update user')
      }
    } catch (error) {
      toast.error('An error occurred during update')
    } finally {
      setIsUpdating(false)
    }
  }

  if (checkingAuth) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', mt: 10 }}>
          <CircularProgress size={60} />
        </Box>
      </MainLayout>
    )
  }

  if (role !== 'admin') {
    return (
      <MainLayout>
        <Container sx={{ mt: 15 }}>
          <Alert severity="error" variant="filled">
            Access Denied. You do not have permissions to view this page. (Your role: {role || 'Guest'})
          </Alert>
          <Button sx={{ mt: 3 }} variant="contained" onClick={() => router.push('/my-account')}>
            Go to My Account
          </Button>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Page title="Admin Panel" sx={{ mt: 10, minHeight: '80vh' }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', letterSpacing: -0.5 }}>
            Admin Control Center
          </Typography>

          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <Box sx={{ p: 2.5, bgcolor: 'primary.dark' }}>
                  <Typography variant="h6" color="white" sx={{ fontWeight: 'medium' }}>
                    Navigation Menu
                  </Typography>
                </Box>
                <Divider />
                <List component="nav" sx={{ p: 1 }}>
                  <ListItemButton
                    selected={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="User Management" primaryTypographyProps={{ fontWeight: 'medium' }} />
                  </ListItemButton>

                  <ListItemButton
                    selected={activeTab === 'transactions'}
                    onClick={() => setActiveTab('transactions')}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <ReceiptLongIcon />
                    </ListItemIcon>
                    <ListItemText primary="Transaction Log" primaryTypographyProps={{ fontWeight: 'medium' }} />
                  </ListItemButton>

                  <ListItemButton
                    selected={activeTab === 'gallery'}
                    onClick={() => setActiveTab('gallery')}
                    sx={{
                      borderRadius: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PhotoLibraryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gallery Management" primaryTypographyProps={{ fontWeight: 'medium' }} />
                  </ListItemButton>
                </List>
              </Paper>
            </Grid>

            {/* Content Area */}
            <Grid item xs={12} md={9}>
              {activeTab === 'users' && (
                // USER MANAGEMENT COMPONENT
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Registered Users ({usersTotal})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchUsers}
                      disabled={usersLoading}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {/* Search and Filters */}
                  <Box component="form" onSubmit={handleUserSearchSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <TextField
                      label="Search users..."
                      variant="outlined"
                      size="small"
                      placeholder="Name, ID, or Phone..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      sx={{ flexGrow: 1, minWidth: 200 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton type="submit" size="small">
                            <SearchIcon />
                          </IconButton>
                        ),
                      }}
                    />

                    <TextField
                      select
                      label="Role"
                      size="small"
                      value={usersFilterRole}
                      onChange={(e) => {
                        setUsersFilterRole(e.target.value)
                        setUsersPage(1)
                      }}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="member">Member</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Rank"
                      size="small"
                      value={usersFilterRank}
                      onChange={(e) => {
                        setUsersFilterRank(e.target.value)
                        setUsersPage(1)
                      }}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value="">All Ranks</MenuItem>
                      <MenuItem value="Member">Member</MenuItem>
                      <MenuItem value="Marketing Associate">Marketing Associate</MenuItem>
                      <MenuItem value="Asst. Marketing Executive">Asst. Marketing Executive</MenuItem>
                      <MenuItem value="Senior Marketing Executive">Senior Marketing Executive</MenuItem>
                      <MenuItem value="Asst. Marketing Manager">Asst. Marketing Manager</MenuItem>
                      <MenuItem value="Deputy Marketing Manager">Deputy Marketing Manager</MenuItem>
                      <MenuItem value="Senior Marketing Manager">Senior Marketing Manager</MenuItem>
                      <MenuItem value="Asst. General Manager">Asst. General Manager</MenuItem>
                      <MenuItem value="Deputy General Manager">Deputy General Manager</MenuItem>
                      <MenuItem value="General Manager">General Manager</MenuItem>
                      <MenuItem value="Director">Director</MenuItem>
                    </TextField>
                  </Box>

                  {/* Users Table */}
                  {usersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                      <CircularProgress />
                    </Box>
                  ) : users.length === 0 ? (
                    <Alert severity="info">No users found matching requirements.</Alert>
                  ) : (
                    <>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                        <Table>
                          <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Reference ID</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {users.map((u) => (
                              <TableRow key={u.myReference} hover>
                                <TableCell sx={{ fontWeight: 'medium' }}>{u.myReference}</TableCell>
                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.mobileNumber}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={u.role || 'member'}
                                    color={u.role === 'admin' ? 'secondary' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={u.rank || 'Member'}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>৳{u.balance?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Tooltip title="Edit User">
                                      <IconButton color="info" size="small" onClick={() => handleOpenEdit(u)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete User">
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteUser(u.myReference, u.name)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Custom Pagination */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">Rows per page:</Typography>
                          <TextField
                            select
                            size="small"
                            value={usersLimit}
                            onChange={(e) => {
                              setUsersLimit(Number(e.target.value))
                              setUsersPage(1)
                            }}
                            variant="standard"
                            sx={{ width: 60 }}
                          >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                          </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Page {usersPage} of {Math.ceil(usersTotal / usersLimit) || 1}
                          </Typography>
                          <IconButton
                            disabled={usersPage <= 1}
                            onClick={() => setUsersPage((prev) => prev - 1)}
                            size="small"
                          >
                            <NavigateBeforeIcon />
                          </IconButton>
                          <IconButton
                            disabled={usersPage >= Math.ceil(usersTotal / usersLimit)}
                            onClick={() => setUsersPage((prev) => prev + 1)}
                            size="small"
                          >
                            <NavigateNextIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </>
                  )}
                </Paper>
              )}

              {activeTab === 'transactions' && (
                // TRANSACTION LOG COMPONENT
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      All Transactions ({txTotal})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchTransactions}
                      disabled={txLoading}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {/* Transaction Search */}
                  <Box component="form" onSubmit={handleTxSearchSubmit} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      label="Search transactions..."
                      variant="outlined"
                      size="small"
                      placeholder="User ID, category, or description..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      sx={{ flexGrow: 1 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton type="submit" size="small">
                            <SearchIcon />
                          </IconButton>
                        ),
                      }}
                    />
                  </Box>

                  {/* Transactions Table */}
                  {txLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                      <CircularProgress />
                    </Box>
                  ) : transactions.length === 0 ? (
                    <Alert severity="info">No transactions found.</Alert>
                  ) : (
                    <>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                        <Table>
                          <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Related User</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transactions.map((t) => (
                              <TableRow key={t.id || t._id} hover>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {new Date(t.date).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'medium' }}>{t.userReference}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={t.type?.toUpperCase()}
                                    color={t.type === 'credit' ? 'success' : 'error'}
                                    size="small"
                                    variant="filled"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip label={t.category} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>৳{t.amount?.toFixed(2)}</TableCell>
                                <TableCell>{t.relatedUser || '-'}</TableCell>
                                <TableCell>{t.description || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Transaction Pagination */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">Rows per page:</Typography>
                          <TextField
                            select
                            size="small"
                            value={txLimit}
                            onChange={(e) => {
                              setTxLimit(Number(e.target.value))
                              setTxPage(1)
                            }}
                            variant="standard"
                            sx={{ width: 60 }}
                          >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                          </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Page {txPage} of {Math.ceil(txTotal / txLimit) || 1}
                          </Typography>
                          <IconButton
                            disabled={txPage <= 1}
                            onClick={() => setTxPage((prev) => prev - 1)}
                            size="small"
                          >
                            <NavigateBeforeIcon />
                          </IconButton>
                          <IconButton
                            disabled={txPage >= Math.ceil(txTotal / txLimit)}
                            onClick={() => setTxPage((prev) => prev + 1)}
                            size="small"
                          >
                            <NavigateNextIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </>
                  )}
                </Paper>
              )}

              {activeTab === 'gallery' && (() => {
                const existingFolders = Array.from(
                  new Set(galleryItems.map((item) => item.folder).filter(Boolean))
                )
                if (!existingFolders.includes('General')) {
                  existingFolders.push('General')
                }

                return (
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Gallery Management
                    </Typography>

                    {/* Upload Image Form */}
                    <Box
                      component="form"
                      onSubmit={handleGalleryUpload}
                      sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        border: '1px dashed rgba(255,255,255,0.15)',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Upload New Image to Gallery
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Image Title"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={imageTitle}
                            onChange={(e) => setImageTitle(e.target.value)}
                            placeholder="E.g. Seminar 2026"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Autocomplete
                            freeSolo
                            options={existingFolders}
                            value={imageFolder}
                            onChange={(event, newValue) => {
                              setImageFolder(newValue || '')
                            }}
                            onInputChange={(event, newInputValue) => {
                              setImageFolder(newInputValue)
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Folder Name"
                                variant="outlined"
                                size="small"
                                placeholder="E.g. Seminars, Events"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                              variant="contained"
                              component="label"
                              color="info"
                              size="medium"
                            >
                              Choose File
                              <input
                                type="file"
                                hidden
                                id="gallery-file-input"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                              />
                            </Button>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {imageFile ? imageFile.name : 'No file chosen'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isUploadingImage || !imageFile}
                          >
                            {isUploadingImage ? 'Uploading to imgbb...' : 'Upload Image'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Gallery List */}
                    {galleryLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                        <CircularProgress />
                      </Box>
                    ) : galleryItems.length === 0 ? (
                      <Alert severity="info">No images uploaded in the gallery yet.</Alert>
                    ) : (
                      <Grid container spacing={3}>
                        {galleryItems.map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box>
                                <Box
                                  component="img"
                                  src={item.url}
                                  alt={item.title || 'Gallery Image'}
                                  sx={{
                                    width: '100%',
                                    height: 180,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mb: 1.5,
                                  }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', maxWidth: '60%' }} noWrap>
                                    {item.title || 'Untitled Image'}
                                  </Typography>
                                  <Chip
                                    label={item.folder || 'General'}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Uploaded: {new Date(item.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteGallery(item.id)}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>
                )
              })()}
            </Grid>
          </Grid>
        </Container>
      </Page>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Update User: {selectedUser?.name} ({selectedUser?.myReference})
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                size="small"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Number"
                fullWidth
                size="small"
                value={editForm.mobileNumber}
                onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                fullWidth
                size="small"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                fullWidth
                size="small"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Father Name"
                fullWidth
                size="small"
                value={editForm.father_name}
                onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mother Name"
                fullWidth
                size="small"
                value={editForm.mother_name}
                onChange={(e) => setEditForm({ ...editForm, mother_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Present Address"
                fullWidth
                size="small"
                value={editForm.presentAddress}
                onChange={(e) => setEditForm({ ...editForm, presentAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                fullWidth
                size="small"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wallet Balance (৳)"
                type="number"
                fullWidth
                size="small"
                value={editForm.balance}
                onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="System Role"
                fullWidth
                size="small"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Rank"
                fullWidth
                size="small"
                value={editForm.rank}
                onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
              >
                <MenuItem value="Member">Member</MenuItem>
                <MenuItem value="Marketing Associate">Marketing Associate</MenuItem>
                <MenuItem value="Asst. Marketing Executive">Asst. Marketing Executive</MenuItem>
                <MenuItem value="Senior Marketing Executive">Senior Marketing Executive</MenuItem>
                <MenuItem value="Asst. Marketing Manager">Asst. Marketing Manager</MenuItem>
                <MenuItem value="Deputy Marketing Manager">Deputy Marketing Manager</MenuItem>
                <MenuItem value="Senior Marketing Manager">Senior Marketing Manager</MenuItem>
                <MenuItem value="Asst. General Manager">Asst. General Manager</MenuItem>
                <MenuItem value="Deputy General Manager">Deputy General Manager</MenuItem>
                <MenuItem value="General Manager">General Manager</MenuItem>
                <MenuItem value="Director">Director</MenuItem>
              </TextField>
            </Grid>

            {/* Read-Only System Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                System & Referral Details (Read-only)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Referred By"
                fullWidth
                size="small"
                value={selectedUser?.referenceId ? `${selectedUser.referrerName || 'User'} (${selectedUser.referenceId})` : 'System / Admin'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Referrer Mobile"
                fullWidth
                size="small"
                value={selectedUser?.referenceMobile || 'N/A'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Placed Under Reference"
                fullWidth
                size="small"
                value={selectedUser?.placeUnder || 'N/A'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Direct Placements (Children)"
                fullWidth
                size="small"
                value={selectedUser?.children?.length > 0 ? selectedUser.children.join(', ') : 'None'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Paid Matches"
                fullWidth
                size="small"
                value={selectedUser?.paidMatches || 0}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Joining Date"
                fullWidth
                size="small"
                value={selectedUser?.joiningDate ? new Date(selectedUser.joiningDate).toLocaleString() : 'N/A'}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveUpdate} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  )
}
