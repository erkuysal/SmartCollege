/**
 * Environment configuration
 * Centralizes environment variables and configuration settings
 */

// API configuration
export const API_CONFIG = {
  // Base URL - should be environment-specific
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Request retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache settings
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Error handling settings
  ERROR_HANDLING: {
    ENABLE_FALLBACKS: true, // Enable fallback data for API failures
    SHOW_ERROR_NOTIFICATIONS: true, // Show user-facing error notifications
    LOG_ALL_ERRORS: true, // Log all errors to the console/reporting service
  },
  
  // List of endpoints with fallback data
  FALLBACK_ENABLED_ENDPOINTS: [
    '/api/college/schedules',
    '/api/college/courses',
    '/api/college/classrooms',
  ],
};

// Authentication settings
export const AUTH_CONFIG = {
  // Storage keys
  TOKEN_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  USER_STORAGE_KEY: 'user_data',
  
  // Token refresh settings
  REFRESH_THRESHOLD: 5 * 60, // 5 minutes before expiry (in seconds)
  
  // Events
  LOGOUT_EVENT: 'auth:logout',
  LOGIN_EVENT: 'auth:login',
};

// Feature flags
export const FEATURES = {
  ENABLE_API_CACHE: true,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_TRACKING: true,
  DEBUG_MODE: import.meta.env.DEV || false,
};

// App-wide constants
export const APP_CONSTANTS = {
  APP_NAME: 'SmartCollege',
  APP_VERSION: '1.0.0',
  COPYRIGHT: `© ${new Date().getFullYear()} SmartCollege`,
}; 