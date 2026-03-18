/**
 * Error Handler Utility
 * Provides user-friendly error messages for different error types
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorDetails {
  type: ErrorType;
  title: string;
  message: string;
  shouldRetry: boolean;
}

export class ErrorHandler {
  /**
   * Parse an error and return user-friendly error details
   */
  static parseError(error: any): ErrorDetails {
    // Network errors
    if (
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('Failed to fetch') ||
      error?.code === 'NETWORK_ERROR'
    ) {
      return {
        type: ErrorType.NETWORK,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        shouldRetry: true,
      };
    }

    // Unauthorized (401)
    if (
      error?.status === 401 ||
      error?.message?.includes('Unauthorized') ||
      error?.message?.includes('401')
    ) {
      return {
        type: ErrorType.UNAUTHORIZED,
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again.',
        shouldRetry: false,
      };
    }

    // Forbidden (403)
    if (
      error?.status === 403 ||
      error?.message?.includes('Forbidden') ||
      error?.message?.includes('403')
    ) {
      return {
        type: ErrorType.FORBIDDEN,
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        shouldRetry: false,
      };
    }

    // Not Found (404)
    if (
      error?.status === 404 ||
      error?.message?.includes('Not Found') ||
      error?.message?.includes('404')
    ) {
      return {
        type: ErrorType.NOT_FOUND,
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        shouldRetry: false,
      };
    }

    // Server errors (500+)
    if (
      error?.status >= 500 ||
      error?.message?.includes('Internal Server Error') ||
      error?.message?.includes('500')
    ) {
      return {
        type: ErrorType.SERVER,
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        shouldRetry: true,
      };
    }

    // Timeout errors
    if (
      error?.message?.includes('timeout') ||
      error?.code === 'ETIMEDOUT'
    ) {
      return {
        type: ErrorType.TIMEOUT,
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        shouldRetry: true,
      };
    }

    // Validation errors
    if (
      error?.status === 400 ||
      error?.message?.includes('validation') ||
      error?.message?.includes('invalid')
    ) {
      return {
        type: ErrorType.VALIDATION,
        title: 'Invalid Request',
        message: error?.message || 'Please check your input and try again.',
        shouldRetry: false,
      };
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      title: 'Something Went Wrong',
      message: error?.message || 'An unexpected error occurred. Please try again.',
      shouldRetry: true,
    };
  }

  /**
   * Get a short error message suitable for inline display
   */
  static getShortMessage(error: any): string {
    const details = this.parseError(error);
    return details.message;
  }

  /**
   * Check if error should trigger a session timeout/logout
   */
  static shouldLogout(error: any): boolean {
    const details = this.parseError(error);
    return details.type === ErrorType.UNAUTHORIZED;
  }

  /**
   * Check if retry is recommended for this error
   */
  static shouldRetry(error: any): boolean {
    const details = this.parseError(error);
    return details.shouldRetry;
  }
}
