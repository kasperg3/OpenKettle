import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  expanded: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, expanded: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error, expanded } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg space-y-4">
          {/* Icon + headline */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <span className="text-destructive text-lg font-bold">!</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                The app encountered an unexpected error.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm font-medium"
            >
              Reload page
            </button>
            <button
              onClick={() => this.setState(s => ({ expanded: !s.expanded }))}
              className="px-4 py-2 border rounded-md hover:bg-muted text-sm"
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {/* Expandable details */}
          {expanded && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-xs font-mono break-all">
              <div className="font-semibold text-destructive">{error.message}</div>
              {error.stack && (
                <pre className="text-muted-foreground whitespace-pre-wrap overflow-auto max-h-64 text-[11px]">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
