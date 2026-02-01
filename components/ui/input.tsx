import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconPosition = 'start', ...props }, ref) => {
    const hasIcon = !!icon;

    return (
      <div className="relative">
        {hasIcon && iconPosition === 'start' && (
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error-500 focus-visible:ring-error-500'
              : 'border-border hover:border-muted-foreground/50',
            hasIcon && iconPosition === 'start' && 'ps-10',
            hasIcon && iconPosition === 'end' && 'pe-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {hasIcon && iconPosition === 'end' && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
