import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  let baseStyles =
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring';

  let variantStyles = '';
  switch (variant) {
    case 'secondary':
      variantStyles = 'border-transparent bg-secondary text-secondary-foreground';
      break;
    case 'destructive':
      variantStyles = 'border-transparent bg-red-500/15 text-red-600 border-red-200';
      break;
    case 'outline':
      variantStyles = 'text-foreground border-border';
      break;
    default:
      variantStyles = 'border-transparent bg-emerald-500/15 text-emerald-600 border-emerald-200';
      break;
  }

  return <div className={`${baseStyles} ${variantStyles} ${className}`.trim()} {...props} />;
}
