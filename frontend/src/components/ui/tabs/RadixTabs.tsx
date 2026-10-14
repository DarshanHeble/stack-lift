import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const RadixTabs = TabsPrimitive.Root;

export const RadixTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-subtle)] p-1 text-[var(--text-muted)]',
      className
    )}
    {...props}
  />
));
RadixTabsList.displayName = TabsPrimitive.List.displayName;

export const RadixTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-[var(--surface-card)] data-[state=checked]:text-[var(--text-primary)] data-[state=checked]:shadow-sm cursor-pointer',
      className
    )}
    {...props}
  />
));
RadixTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const RadixTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]', className)}
    {...props}
  />
));
RadixTabsContent.displayName = TabsPrimitive.Content.displayName;
