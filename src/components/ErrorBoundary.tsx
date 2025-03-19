import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">
                Something went wrong
              </h2>
              <div className="text-left mb-4">
                <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                  <strong>Error:</strong> {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-red-700 dark:text-red-400">
                      View technical details
                    </summary>
                    <pre className="mt-2 text-xs bg-red-50 dark:bg-red-950 p-2 rounded overflow-auto max-h-40 text-red-700 dark:text-red-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={this.handleResetError} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>Reload Page</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;