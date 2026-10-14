import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface UnderlineTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const UnderlineTabs: React.FC<UnderlineTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextTab = tabs[(index + 1) % tabs.length];
      onChange(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      const prevTab = tabs[(index - 1 + tabs.length) % tabs.length];
      onChange(prevTab.id);
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn('flex items-center gap-6 border-b border-[var(--border-default)]', className)}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'pb-3 text-xs font-medium transition-all relative flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-sm)] cursor-pointer',
              isActive
                ? 'text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive
                    ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                )}
                aria-label={`${tab.count} items`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-t-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
