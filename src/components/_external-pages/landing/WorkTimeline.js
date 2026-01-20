import React from 'react'
import { Grid, Typography, Paper } from '@mui/material'
// material
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import VaccinesIcon from '@mui/icons-material/Vaccines'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'

import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineOppositeContent,
} from '@mui/lab'
import { Block } from './Block'

const WorkTimeline = () => {
  const TIMELINES = [
    {
      key: 2,
      title: 'Treatment & Medication',
      des: 'We provide treatment and medication for all types of diseases',
      time: 'Medical ',
      color: 'primary',
      icon: <MedicalInformationIcon />,
    },
    {
      key: 3,
      title: 'Products in low price',
      des: 'We provide products in low price than market',
      time: 'Products',
      color: 'secondary',
      icon: <ShoppingCartIcon />,
    },
    {
      key: 4,
      title: 'Solving unemployment',
      des: 'We provide jobs to unemployed people',
      time: 'Jobs',
      color: 'info',
      icon: <WorkHistoryIcon />,
    },
    {
      key: 5,
      title: 'Medical Support',
      des: 'We provide medical support to poor people',
      time: 'Support',
      color: 'success',
      icon: <VaccinesIcon />,
    },
    {
      key: 6,
      title: 'Learning & Education',
      des: 'We provide the best courses for learning to solve unemployment',
      time: 'Courses',
      color: 'warning',
      icon: <LocalLibraryIcon />,
    },
    // {
    //   key: 7,
    //   title: 'Error',
    //   des: 'Morbi mattis ullamcorper',
    //   time: '12:00 am',
    //   color: 'error',
    //   icon: <FastfoodIcon />,
    // },
  ]
  return (
    <>
      <Typography variant="h3" sx={{ py: 5, textAlign: 'center' }}>
        We are working on
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Block>
            <Timeline position="alternate">
              {TIMELINES.map(item => (
                <TimelineItem key={item.key}>
                  <TimelineOppositeContent>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {item.time}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={item.color}>{item.icon}</TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper
                      sx={{
                        p: {
                          xs: 1,
                          md: 2,
                          lg: 3,
                        },
                        bgcolor: 'grey.50012',
                      }}
                    >
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {item.des}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Block>
        </Grid>
      </Grid>
    </>
  )
}

export default WorkTimeline
