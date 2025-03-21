/**
 * Error tracking utility for the application
 * This helps with debugging and troubleshooting by capturing and logging errors
 */

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  type: 'error' | 'unhandledrejection' | 'react' | 'api' | 'database';
  context?: Record<string, any>;
  url: string;
  userAgent: string;
}

// Maximum number of errors to store
const MAX_ERRORS = 50;

class ErrorTracker {
  private errors: ErrorDetails[] = [];
  private initialized = false;
  
  /**
   * Initialize the error tracker
   */
  init() {
    if (this.initialized) return;
    
    // Track global errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        type: 'error',
        url: window.location.href,
        userAgent: navigator.userAgent,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || String(event.reason) || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'unhandledrejection',
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
    
    // Override console.error to capture errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);
      
      // Extract error message
      const message = args
        .map(arg => {
          if (arg instanceof Error) return arg.message;
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        })
        .join(' ');
      
      // Extract stack trace if available
      const errorArg = args.find(arg => arg instanceof Error);
      const stack = errorArg instanceof Error ? errorArg.stack : undefined;
      
      this.captureError({
        message,
        stack,
        type: 'error',
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    };
    
    // Make errors available globally for debugging
    window.__diagnostics_errors = this.errors;
    
    this.initialized = true;
    console.log('🔍 Error tracking initialized');
  }
  
  /**
   * Capture an error
   */
  captureError(details: Omit<ErrorDetails, 'timestamp'>) {
    const errorDetails: ErrorDetails = {
      ...details,
      timestamp: new Date().toISOString()
    };
    
    // Add to errors array
    this.errors.unshift(errorDetails);
    
    // Limit array size
    if (this.errors.length > MAX_ERRORS) {
      this.errors.pop();
    }
    
    // Update global reference
    window.__diagnostics_errors = this.errors;
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error captured');
      console.log('Message:', errorDetails.message);
      console.log('Type:', errorDetails.type);
      console.log('Timestamp:', errorDetails.timestamp);
      if (errorDetails.stack) console.log('Stack:', errorDetails.stack);
      if (errorDetails.context) console.log('Context:', errorDetails.context);
      console.groupEnd();
    }
  }
  
  /**
   * Capture a React error
   */
  captureReactError(error: Error, componentStack: string) {
    this.captureError({
      message: error.message,
      stack: error.stack,
      componentStack,
      type: 'react',
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }
  
  /**
   * Capture an API error
   */
  captureApiError(error: any, endpoint: string, method: string) {
    this.captureError({
      message: error.message || 'API Error',
      stack: error.stack,
      type: 'api',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        endpoint,
        method,
        status: error.status,
        statusText: error.statusText,
        data: error.data
      }
    });
  }
  
  /**
   * Capture a database error
   */
  captureDatabaseError(error: any, operation: string) {
    this.captureError({
      message: error.message || 'Database Error',
      stack: error.stack,
      type: 'database',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        operation,
        code: error.code,
        details: error.details
      }
    });
  }
  
  /**
   * Get all captured errors
   */
  getErrors() {
    return [...this.errors];
  }
  
  /**
   * Clear all captured errors
   */
  clearErrors() {
    this.errors = [];
    window.__diagnostics_errors = this.errors;
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Add global type for error tracking
declare global {
  interface Window {
    __diagnostics_errors: ErrorDetails[];
  }
}