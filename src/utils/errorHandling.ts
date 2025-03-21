/**
 * Comprehensive error handling utility
 * This provides standardized error handling across the application
 */

import { errorTracker } from './errorTracking';
import { supabase } from '@/lib/supabase';

// Error types
export enum ErrorType {
  AUTH = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Error severity
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error interface
export interface AppError {
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  originalError?: any;
  context?: Record<string, any>;
  timestamp: string;
  handled: boolean;
}

// Error handler class
export class ErrorHandler {
  /**
   * Handle an error with standardized logging and tracking
   */
  static handle(
    error: any,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: Record<string, any>
  ): AppError {
    // Create standardized error object
    const appError: AppError = {
      message: error instanceof Error ? error.message : String(error),
      type,
      severity,
      originalError: error,
      context,
      timestamp: new Date().toISOString(),
      handled: true
    };

    // Log error based on severity
    switch (severity) {
      case ErrorSeverity.INFO:
        console.info(`[${type}] ${appError.message}`, context);
        break;
      case ErrorSeverity.WARNING:
        console.warn(`[${type}] ${appError.message}`, context);
        break;
      case ErrorSeverity.ERROR:
        console.error(`[${type}] ${appError.message}`, context);
        break;
      case ErrorSeverity.CRITICAL:
        console.error(`[CRITICAL ${type}] ${appError.message}`, context);
        break;
    }

    // Track error
    errorTracker.captureError({
      message: appError.message,
      stack: error instanceof Error ? error.stack : undefined,
      type: 'error',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        ...context,
        errorType: type,
        severity
      }
    });

    return appError;
  }

  /**
   * Handle a database error
   */
  static handleDatabaseError(error: any, operation: string, context?: Record<string, any>): AppError {
    return this.handle(
      error,
      ErrorType.DATABASE,
      ErrorSeverity.ERROR,
      { operation, ...context }
    );
  }

  /**
   * Handle an authentication error
   */
  static handleAuthError(error: any, operation: string, context?: Record<string, any>): AppError {
    return this.handle(
      error,
      ErrorType.AUTH,
      ErrorSeverity.ERROR,
      { operation, ...context }
    );
  }

  /**
   * Handle a network error
   */
  static handleNetworkError(error: any, endpoint: string, context?: Record<string, any>): AppError {
    return this.handle(
      error,
      ErrorType.NETWORK,
      ErrorSeverity.ERROR,
      { endpoint, ...context }
    );
  }

  /**
   * Handle a validation error
   */
  static handleValidationError(message: string, fields?: Record<string, string>, context?: Record<string, any>): AppError {
    return this.handle(
      new Error(message),
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING,
      { fields, ...context }
    );
  }

  /**
   * Handle a permission error
   */
  static handlePermissionError(message: string, requiredRole?: string, context?: Record<string, any>): AppError {
    return this.handle(
      new Error(message),
      ErrorType.PERMISSION,
      ErrorSeverity.WARNING,
      { requiredRole, ...context }
    );
  }

  /**
   * Check if an error is a specific Supabase error type
   */
  static isSupabaseErrorType(error: any, code: string): boolean {
    return error?.code === code;
  }

  /**
   * Get a user-friendly message for common Supabase errors
   */
  static getSupabaseErrorMessage(error: any): string {
    // Auth errors
    if (this.isSupabaseErrorType(error, 'auth/invalid-email')) {
      return 'The email address is invalid.';
    }
    if (this.isSupabaseErrorType(error, 'auth/user-not-found')) {
      return 'No account found with this email address.';
    }
    if (this.isSupabaseErrorType(error, 'auth/wrong-password')) {
      return 'Incorrect password. Please try again.';
    }
    if (this.isSupabaseErrorType(error, 'auth/email-already-in-use')) {
      return 'An account with this email already exists.';
    }
    if (this.isSupabaseErrorType(error, 'auth/weak-password')) {
      return 'Password is too weak. Please use a stronger password.';
    }
    
    // Database errors
    if (this.isSupabaseErrorType(error, 'PGRST301')) {
      return 'Database error: Resource does not exist.';
    }
    if (this.isSupabaseErrorType(error, 'PGRST302')) {
      return 'Database error: Permission denied.';
    }
    
    // Default message
    return error?.message || 'An unknown error occurred.';
  }
}

// Utility function to safely execute database operations with error handling
export async function safeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  operationName: string,
  context?: Record<string, any>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      const appError = ErrorHandler.handleDatabaseError(error, operationName, context);
      return { data: null, error: appError };
    }
    
    return { data, error: null };
  } catch (error) {
    const appError = ErrorHandler.handleDatabaseError(error, operationName, context);
    return { data: null, error: appError };
  }
}

// Utility function to safely execute authentication operations with error handling
export async function safeAuthOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  operationName: string,
  context?: Record<string, any>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      const appError = ErrorHandler.handleAuthError(error, operationName, context);
      return { data: null, error: appError };
    }
    
    return { data, error: null };
  } catch (error) {
    const appError = ErrorHandler.handleAuthError(error, operationName, context);
    return { data: null, error: appError };
  }
}