import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StackLift Uncaught UI Boundary Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[var(--surface-canvas)] p-6">
          <div className="max-w-md w-full p-6 rounded-[var(--radius-lg)] border border-[var(--state-error-border)] bg-[var(--surface-card)] shadow-xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--state-error-subtle)] text-[var(--state-error-fg)] flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {this.props.fallbackTitle || 'Application Error Detected'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                An unexpected interface rendering exception occurred. Your local session state has been protected.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] text-left break-words max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <Button
              variant="primary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={this.handleReset}
              className="w-full"
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
