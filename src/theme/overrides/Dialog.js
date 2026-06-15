// ----------------------------------------------------------------------

export default function Dialog(theme) {
  return {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(to bottom, #0a162f 0%, #08000C 100%)',
          border: '1px solid rgba(0, 178, 255, 0.2)',
          boxShadow: '0 12px 40px 0 rgba(0, 178, 255, 0.15)',
          '&.MuiPaper-rounded': {
            borderRadius: theme.shape.borderRadiusMd
          },
          '&.MuiDialog-paperFullScreen': {
            borderRadius: 0,
            border: 'none',
            backgroundImage: 'none',
            backgroundColor: '#08000C',
          },
          '&.MuiDialog-paper .MuiDialogActions-root': {
            padding: theme.spacing(3)
          },
          '@media (max-width: 600px)': {
            margin: theme.spacing(2)
          },
          '@media (max-width: 663.95px)': {
            '&.MuiDialog-paperWidthSm.MuiDialog-paperScrollBody': {
              maxWidth: '100%'
            }
          }
        },
        paperFullWidth: {
          width: '100%'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0)
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          borderTop: 0,
          borderBottom: 0,
          padding: theme.spacing(3)
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          '& > :not(:first-of-type)': {
            marginLeft: theme.spacing(1.5)
          }
        }
      }
    }
  };
}
