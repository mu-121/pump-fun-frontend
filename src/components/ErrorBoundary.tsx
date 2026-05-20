import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

/**
 * App-root error boundary. Catches render-phase exceptions, logs them to the
 * console, hands them off to a Sentry hook if one is wired up via
 * `window.__pumpClone.reportError`, and shows a friendly fallback with a
 * reload button so the user isn't left with a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] render-phase error:', error, info.componentStack);
    const reporter = (
      window as unknown as {
        __pumpClone?: { reportError?: (e: Error, info: ErrorInfo) => void };
      }
    ).__pumpClone?.reportError;
    if (reporter) {
      try {
        reporter(error, info);
      } catch {
        /* swallow — don't loop on the reporter itself */
      }
    }
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-xl border border-border bg-surface shadow-glow p-6 text-center">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Error</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-1 text-xs text-text-muted">
            We've logged the error. Reload to try again — your wallet stays connected.
          </p>
          {this.state.error.message ? (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-border bg-surface-elevated p-3 text-left text-[11px] text-text-muted whitespace-pre-wrap break-words">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="mt-5 flex justify-center gap-2">
            <Button
              variant="primary"
              leftIcon={<RefreshCcw className="h-4 w-4" />}
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
            <Button variant="ghost" onClick={() => this.setState({ error: null })}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
