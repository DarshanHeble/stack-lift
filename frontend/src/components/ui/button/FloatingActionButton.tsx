import React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  'aria-label': string;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon, label, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] text-[var(--text-inverse)] px-4 py-3 shadow-[var(--shadow-dropdown)] hover:bg-[var(--brand-primary-hover)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span aria-hidden="true" className="h-5 w-5">{icon}</span>
        {label && <span className="text-xs font-semibold">{label}</span>}
      </button>
    );
  }
);
FloatingActionButton.displayName = 'FloatingActionButton';
