import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  TextField,
  Dialog,
  IconButton,
  Alert,
  Chip,
  Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import { getGalleryItems } from '@/func/functions'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true)
      try {
        const data = await getGalleryItems()
        setItems(data || [])
      } catch (error) {
        console.error('Failed to load gallery items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  // Group items by folder
  const foldersMap = {}
  items.forEach((item) => {
    const folderName = item.folder || 'General'
    if (!foldersMap[folderName]) {
      foldersMap[folderName] = []
    }
    foldersMap[folderName].push(item)
  })

  const folderNames = Object.keys(foldersMap)

  // Handle back to folder grid
  const handleBack = () => {
    setSelectedFolder(null)
  }

  return (
    <MainLayout>
      <Page title="Gallery | Good Health" sx={{ mt: 10, minHeight: '80vh', pb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlignment: 'center', mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, letterSpacing: -0.5 }}>
              Our Gallery
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, textAlign: 'center' }}>
              Browse through our memories, seminars, events, and highlights from around our community.
            </Typography>
            <TextField
              placeholder="Search images by title..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: '100%',
                maxWidth: 450,
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
              <CircularProgress size={50} />
            </Box>
          ) : items.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No images found in the gallery.
            </Alert>
          ) : searchQuery ? (
            // Search View: search globally across all images
            (() => {
              const matchedItems = items.filter((item) =>
                (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
              return (
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Search Results
                  </Typography>
                  {matchedItems.length === 0 ? (
                    <Alert severity="info">No images match your search query.</Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {matchedItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              cursor: 'pointer',
                              borderRadius: 2.5,
                              overflow: 'hidden',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: (theme) => theme.customShadows?.z12 || 12,
                              },
                            }}
                            onClick={() => setSelectedImage(item)}
                          >
                            <CardMedia
                              component="img"
                              image={item.url}
                              alt={item.title || 'Gallery Image'}
                              sx={{ height: 240, objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem', maxWidth: '60%' }}>
                                  {item.title || 'Untitled Image'}
                                </Typography>
                                <Chip label={item.folder || 'General'} size="small" variant="outlined" color="primary" />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.date).toLocaleDateString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )
            })()
          ) : selectedFolder ? (
            // Folder Detail View: show images in the selected folder
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Back to Folders
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {selectedFolder}
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {foldersMap[selectedFolder]?.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.customShadows?.z12 || 12,
                        },
                      }}
                      onClick={() => setSelectedImage(item)}
                    >
                      <CardMedia
                        component="img"
                        image={item.url}
                        alt={item.title || 'Gallery Image'}
                        sx={{ height: 240, objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}>
                          {item.title || 'Untitled Image'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            // Folder Grid View (Default)
            <Grid container spacing={4}>
              {folderNames.map((folderName) => {
                const folderItems = foldersMap[folderName]
                const coverImage = folderItems && folderItems.length > 0 ? folderItems[0].url : ''
                return (
                  <Grid item xs={12} sm={6} md={4} key={folderName}>
                    <Box
                      onClick={() => setSelectedFolder(folderName)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 220,
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                          bgcolor: 'action.hover',
                        }}
                      >
                        {coverImage ? (
                          <Box
                            component="img"
                            src={coverImage}
                            alt={folderName}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
                            No Images
                          </Box>
                        )}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mt: 1.5,
                          fontWeight: 'bold',
                          textAlign: 'left',
                          fontSize: '1.05rem',
                          color: 'text.primary',
                          pl: 0.5,
                        }}
                      >
                        {folderName}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Container>
      </Page>

      {/* Lightbox Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        {selectedImage && (
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={selectedImage.url}
              alt={selectedImage.title || 'Enlarged view'}
              sx={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 1,
                bgcolor: 'black',
              }}
            />
            {selectedImage.title && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0, 0, 0, 0.75)',
                  color: 'white',
                  width: 'fit-content',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedImage.title}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Dialog>
    </MainLayout>
  )
}
