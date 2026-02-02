import { forwardRef } from 'react';
import PropTypes from 'prop-types';
// material
import { Box } from '@mui/material';
import Image from 'next/image';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ sx }, ref) => {

  return (
    <Box ref={ref} sx={{ width: 65, height: 65, cursor: 'pointer', ...sx }}>
      <Image
        src='/static/logo.jpeg'
        alt='logo'
        width={65}
        height={65}
      />
    </Box>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
};

export default Logo;
