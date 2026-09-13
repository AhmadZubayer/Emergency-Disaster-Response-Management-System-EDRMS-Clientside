import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  render?: React.ReactElement<any>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', render, children, ...props }, ref) => {
    let baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-md';

    let variantStyles = '';
    switch (variant) {
      case 'destructive':
        variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-xs';
        break;
      case 'outline':
        variantStyles = 'border border-input bg-background hover:bg-muted hover:text-foreground shadow-xs';
        break;
      case 'secondary':
        variantStyles = 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
        break;
      case 'ghost':
        variantStyles = 'hover:bg-muted hover:text-foreground';
        break;
      case 'link':
        variantStyles = 'text-primary underline-offset-4 hover:underline';
        break;
      default:
        variantStyles = 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs';
        break;
    }

    let sizeStyles = '';
    switch (size) {
      case 'sm':
        sizeStyles = 'h-8 rounded-md px-3 text-xs';
        break;
      case 'lg':
        sizeStyles = 'h-10 rounded-md px-6 text-sm';
        break;
      case 'icon':
        sizeStyles = 'h-9 w-9';
        break;
      default:
        sizeStyles = 'h-9 px-4 py-2 text-sm';
        break;
    }

    const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`.trim();

    if (render) {
      return React.cloneElement(render, {
        className: `${combinedClassName} ${render.props.className || ''}`.trim(),
        children: children || render.props.children,
        ...props,
      });
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
