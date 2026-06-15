// ----------------------------------------------------------------------

export default function Paper(theme) {
  const isDark = theme.palette.mode === 'dark';
  return {
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },

      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(isDark && {
            backgroundColor: '#091124',
            border: '1px solid rgba(0, 178, 255, 0.12)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          })
        }
      }
    }
  };
}
