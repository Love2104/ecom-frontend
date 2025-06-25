import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // In a production app, you might want to log this to a service like Sentry
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">
              We're sorry, but an error occurred while rendering this component.
            </p>
            <details className="text-left mb-4">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <p className="mt-2 p-2 bg-card rounded text-sm overflow-auto">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
            </details>
            <Button onClick={this.resetErrorBoundary}>Try Again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;