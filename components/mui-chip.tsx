'use client';

import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';

export interface MuiChipProps extends Omit<ChipProps, 'color'> {
  selected?: boolean;
}

const MuiChip = ({
  label,
  selected = false,
  onClick,
  variant,
  sx,
  ...props
}: MuiChipProps) => {
  return (
    <Chip
      label={label}
      onClick={onClick}
      variant={selected ? 'filled' : variant || 'outlined'}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        borderRadius: '8px',
        height: '32px',
        px: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        ...(selected
          ? {
              backgroundColor: '#059669',
              color: '#ffffff',
              borderColor: '#059669',
              '&:hover': {
                backgroundColor: '#047857',
              },
            }
          : {
              backgroundColor: 'transparent',
              borderColor: 'rgba(226, 232, 240, 0.9)',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(5, 150, 105, 0.08)',
                borderColor: '#059669',
              },
            }),
        ...sx,
      }}
      {...props}
    />
  );
};

export default MuiChip;
