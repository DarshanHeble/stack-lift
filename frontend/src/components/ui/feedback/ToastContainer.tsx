import React from 'react';
import { useNotificationStore } from '@/store';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismiss } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notif) => {
        const isError = notif.type === 'error';
        const isWarning = notif.type === 'warning';
        const isSuccess = notif.type === 'success';

        return (
          <div
            key={notif.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isError
                ? 'bg-[var(--state-error-subtle)] border-[var(--state-error-border)] text-[var(--state-error-fg)]'
                : isWarning
                ? 'bg-[var(--state-warning-subtle)] border-[var(--state-warning-border)] text-[var(--state-warning-fg)]'
                : isSuccess
                ? 'bg-[var(--state-success-subtle)] border-[var(--state-success-border)] text-[var(--state-success-fg)]'
                : 'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-primary)]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="h-4 w-4" />}
              {isWarning && <AlertTriangle className="h-4 w-4" />}
              {isSuccess && <CheckCircle className="h-4 w-4" />}
              {!isError && !isWarning && !isSuccess && <Info className="h-4 w-4" />}
            </div>

            <div className="flex-1 min-w-0">
              {notif.title && (
                <div className="text-xs font-semibold tracking-tight">{notif.title}</div>
              )}
              <div className="text-xs leading-relaxed opacity-90 break-words">
                {notif.message}
              </div>
            </div>

            <button
              onClick={() => dismiss(notif.id)}
              className="shrink-0 p-0.5 rounded-[var(--radius-sm)] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
