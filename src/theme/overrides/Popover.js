// ----------------------------------------------------------------------

export default function Popover(theme) {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(to bottom, #0a162f 0%, #08000C 100%)',
          border: '1px solid rgba(0, 178, 255, 0.2)',
          boxShadow: '0 12px 40px 0 rgba(0, 178, 255, 0.15)',
        }
      }
    }
  };
}
