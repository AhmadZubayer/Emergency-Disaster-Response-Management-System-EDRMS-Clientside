'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface MuiSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options?: SelectOption[];
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
}

export const MuiSelect = ({
  label, value, onChange, options = [], placeholder, disabled = false,
  required = false, name, id, error = false, helperText,
  fullWidth = true, className,
}: MuiSelectProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const selected = options.find((option) => String(option.value) === String(value));

  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
      {label && <Label htmlFor={inputId}>{label}{required && ' *'}</Label>}
      <Select
        value={value === '' ? null : String(value)}
        onValueChange={(nextValue) => onChange(nextValue ?? '')}
        disabled={disabled}
        required={required}
        name={name}
      >
        <SelectTrigger
          id={inputId}
          className={fullWidth ? 'w-full' : undefined}
          aria-invalid={error}
          aria-describedby={helperText ? `${inputId}-help` : undefined}
        >
          <SelectValue placeholder={placeholder}>{selected?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && (
        <p id={`${inputId}-help`} className={cn('text-xs/relaxed', error ? 'text-destructive' : 'text-muted-foreground')}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default MuiSelect;
