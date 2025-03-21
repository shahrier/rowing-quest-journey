import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracker } from '@/utils/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error tracking system
    errorTracker.captureReactError(error, errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
    
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <div className="mb-4 text-muted-foreground">
              <p>An error occurred in the application.</p>
            </div>
            
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-blue-500 hover:text-blue-700">
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto max-h-40">
                <p className="font-bold">{this.state.error?.toString()}</p>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack || 'No component stack available'}
                </pre>
              </div>
            </details>
            
            <div className="flex gap-3">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;