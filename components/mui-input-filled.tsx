'use client';

import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const MuiInputFilled = (props: TextFieldProps) => {
  return <TextField variant="filled" {...props} />;
};

export default MuiInputFilled;