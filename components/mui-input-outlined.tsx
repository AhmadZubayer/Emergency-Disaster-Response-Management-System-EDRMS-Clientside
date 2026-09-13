'use client';

import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const MuiInputOutlined = (props: TextFieldProps) => {
  return <TextField variant="outlined" {...props} />;
};

export default MuiInputOutlined;