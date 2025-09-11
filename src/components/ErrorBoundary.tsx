import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReload?: boolean;
  showHome?: boolean;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try reloading the page or contact support if the problem persists.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="font-medium text-sm text-foreground mb-2">Error Details:</p>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>

              {this.props.showReload !== false && (
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reload Page
                </Button>
              )}

              {this.props.showHome !== false && (
                <Button 
                  onClick={this.handleHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              )}
            </div>

            {this.props.showDetails !== false && this.state.errorInfo && (
              <div className="space-y-3">
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Bug className="w-4 h-4" />
                  {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>

                {this.state.showDetails && (
                  <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <details className="space-y-2">
                      <summary className="font-medium text-sm cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap bg-background/50 p-3 rounded border">
                        {this.state.error?.stack}
                      </pre>
                    </details>
                    
                    {this.state.errorInfo.componentStack && (
                      <details className="space-y-2 mt-4">
                        <summary className="font-medium text-sm cursor-pointer">Component Stack</summary>
                        <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap bg-background/50 p-3 rounded border">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for throwing errors to test error boundary
export function useThrowError() {
  return (error: string | Error) => {
    throw error instanceof Error ? error : new Error(error);
  };
}

export default ErrorBoundary;