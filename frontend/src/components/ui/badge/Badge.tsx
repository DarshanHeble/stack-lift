import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'success'
  | 'progress'
  | 'purple'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = false,
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot?: string }> = {
    success: {
      container: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]',
      dot: 'bg-[var(--status-success-dot)]',
    },
    progress: {
      container: 'bg-[var(--status-progress-bg)] text-[var(--status-progress-text)] border-[var(--status-progress-border)]',
      dot: 'bg-[var(--status-progress-dot)]',
    },
    purple: {
      container: 'bg-[var(--status-purple-bg)] text-[var(--status-purple-text)] border-[var(--status-purple-border)]',
      dot: 'bg-[var(--status-purple-dot)]',
    },
    warning: {
      container: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]',
      dot: 'bg-[var(--status-warning-accent)]',
    },
    danger: {
      container: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]',
      dot: 'bg-[var(--status-danger-dot)]',
    },
    neutral: {
      container: 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)] border-[var(--status-neutral-border)]',
      dot: 'bg-[var(--status-neutral-dot)]',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        style.container,
        className
      )}
      {...props}
    >
      {withDot && (
        <span aria-hidden="true" className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
      )}
      {children}
    </span>
  );
};
