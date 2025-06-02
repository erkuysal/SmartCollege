import { AxiosError } from 'axios';
import logger from '@/utils/logging/logger';
import { API_CONFIG } from '@/utils/config/environment';

// Create a module-specific logger
const errorLogger = logger.createLogger('ErrorHandler');

/**
 * Error types for more specific handling
 */
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

/**
 * User-friendly error messages by error type
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Network error. Please check your internet connection.',
  [ErrorType.SERVER]: 'The server encountered an error. Our team has been notified.',
  [ErrorType.VALIDATION]: 'Some information is incorrect or incomplete.',
  [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ErrorType.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Maps HTTP status codes to error types
 */
const STATUS_TO_ERROR_TYPE: Record<number, ErrorType> = {
  0: ErrorType.NETWORK,
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  408: ErrorType.TIMEOUT,
  500: ErrorType.SERVER,
  502: ErrorType.SERVER,
  503: ErrorType.SERVER,
  504: ErrorType.TIMEOUT
};

/**
 * Interface for error details
 */
export interface ErrorDetails {
  message: string;
  type: ErrorType;
  status: number | null;
  technical?: string;
  data?: any;
}

/**
 * Determine if an error is an Axios error
 */
export function isAxiosError(error: any): error is AxiosError {
  return error && error.isAxiosError === true;
}

/**
 * Process error objects to extract useful information and determine error type
 */
export function processError(error: any): ErrorDetails {
  // Default error details
  const errorDetails: ErrorDetails = {
    message: ERROR_MESSAGES[ErrorType.UNKNOWN],
    type: ErrorType.UNKNOWN,
    status: null
  };

  try {
    // Handle axios errors
    if (isAxiosError(error)) {
      const status = error.response?.status || 0;
      const errorType = STATUS_TO_ERROR_TYPE[status] || ErrorType.UNKNOWN;
      
      errorDetails.type = errorType;
      errorDetails.status = status;
      errorDetails.message = ERROR_MESSAGES[errorType];
      errorDetails.technical = error.message;
      errorDetails.data = error.response?.data;
      
      // Check for specific error messages in response data
      if (error.response?.data && typeof error.response.data === 'object') {
        const responseData = error.response.data as Record<string, any>;
        
        if (responseData.message && typeof responseData.message === 'string') {
          errorDetails.message = responseData.message;
        } else if (responseData.detail && typeof responseData.detail === 'string') {
          errorDetails.message = responseData.detail;
        }
        
        // For validation errors, try to create a readable message from field errors
        if (errorType === ErrorType.VALIDATION) {
          const fieldErrors = Object.entries(responseData)
            .filter(([key]) => key !== 'message' && key !== 'detail')
            .map(([field, errors]) => {
              const errorMessages = Array.isArray(errors) ? errors.join(', ') : String(errors);
              return `${field}: ${errorMessages}`;
            });
          
          if (fieldErrors.length > 0) {
            errorDetails.message = fieldErrors.join('\n');
          }
        }
      }
    } else if (error instanceof Error) {
      // Handle standard JavaScript errors
      errorDetails.technical = error.message;
      errorDetails.message = ERROR_MESSAGES[ErrorType.UNKNOWN];
    } else if (typeof error === 'string') {
      // Handle string errors
      errorDetails.technical = error;
      errorDetails.message = error;
    }
  } catch (processError) {
    // If error processing itself fails, log it but don't crash
    errorLogger.error('Error while processing error', { originalError: error, processError });
  }

  // Log the error based on config
  if (API_CONFIG.ERROR_HANDLING.LOG_ALL_ERRORS) {
    errorLogger.error('Application error', errorDetails);
  }

  return errorDetails;
}

/**
 * Shows a user-friendly error notification
 * This is a placeholder that would integrate with your UI notification system
 */
export function showErrorNotification(errorDetails: ErrorDetails): void {
  if (!API_CONFIG.ERROR_HANDLING.SHOW_ERROR_NOTIFICATIONS) {
    return;
  }
  
  // Use the global notification method if available
  if (typeof window !== 'undefined' && window.showErrorNotification) {
    window.showErrorNotification(errorDetails.message, errorDetails.type);
  } else {
    // Fallback to console if notification component is not available
    console.error(`[UI Notification] ${errorDetails.message}`);
  }
}

/**
 * Convenience function to process an error and show a notification in one step
 */
export function handleError(error: any): ErrorDetails {
  const details = processError(error);
  showErrorNotification(details);
  return details;
}

/**
 * Check if an error indicates we should use fallback data
 */
export function shouldUseFallback(error: any): boolean {
  return error && error._useFallback === true;
}

// Export default object for convenient imports
export default {
  processError,
  showErrorNotification,
  handleError,
  shouldUseFallback,
  ErrorType
}; 