import React from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', className, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-7 w-7 text-xs',
      md: 'h-8 w-8 text-sm',
      lg: 'h-10 w-10 text-base',
    }[size];

    const variantClasses = {
      primary: 'bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)]',
      secondary: 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]',
      outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)]',
    }[variant];

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          sizeClasses,
          variantClasses,
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span aria-hidden="true">{icon}</span>
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
