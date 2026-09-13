'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
} from '@mui/material';

export interface SelectOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface MuiSelectProps {
  label?: string;
  value: string | number | '';
  onChange: (value: string) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

export const MuiSelect = ({
  label,
  value,
  onChange,
  options,
  children,
  placeholder,
  disabled = false,
  required = false,
  name,
  id,
  error = false,
  helperText,
  size = 'small',
  fullWidth = true,
  className,
  sx,
}: MuiSelectProps) => {
  const labelId = id
    ? `${id}-label`
    : label
    ? `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-label`
    : undefined;

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '0.75rem',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontSize: '0.875rem',
          minHeight: '2.5rem',
          '& fieldset': {
            borderColor: '#e2e8f0',
          },
          '&:hover fieldset': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0f172a',
            borderWidth: '1.5px',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#64748b',
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: '#0f172a',
          },
        },
        '& .MuiSelect-icon': {
          color: '#64748b',
        },
        ...sx,
      }}
    >
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        id={id}
        name={name}
        value={value !== undefined && value !== null ? String(value) : ''}
        label={label}
        onChange={(event: any) => {
          onChange(String(event.target.value ?? ''));
        }}
        displayEmpty={!!placeholder}
        renderValue={(selected) => {
          if (selected === '' || selected === undefined || selected === null) {
            return placeholder ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              ''
            );
          }
          if (options) {
            const found = options.find(
              (opt) => String(opt.value) === String(selected)
            );
            return found ? found.label : (selected as React.ReactNode);
          }
          return selected as React.ReactNode;
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                backgroundColor: '#ffffff !important',
                color: '#0f172a',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                mt: 0.5,
                maxHeight: 280,
                zIndex: 9999,
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  margin: '2px 6px',
                  padding: '8px 12px',
                  color: '#0f172a',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#f1f5f9',
                    color: '#0f172a',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#e2e8f0',
                    },
                  },
                },
              },
            },
          },
          sx: {
            zIndex: 9999,
            '& .MuiPaper-root': {
              backgroundColor: '#ffffff !important',
              color: '#0f172a',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              maxHeight: 280,
            },
          },
        }}
      >
        {options
          ? options.map((opt) => (
              <MenuItem
                key={String(opt.value)}
                value={String(opt.value)}
                disabled={opt.disabled}
              >
                {opt.label}
              </MenuItem>
            ))
          : children}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiSelect;
