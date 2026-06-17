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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import { getGalleryItems } from '@/func/functions'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

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

  // Filter items by search query
  const filteredItems = items.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          ) : filteredItems.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No images found in the gallery.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.customShadows?.z12 || 12,
                      },
                    }}
                    onClick={() => setSelectedImage(item)}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={item.url}
                        alt={item.title || 'Gallery Image'}
                        sx={{
                          height: 240,
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.03)',
                          },
                        }}
                      />
                    </Box>
                    {item.title && (
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" component="h2" noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                </Grid>
              ))}
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
