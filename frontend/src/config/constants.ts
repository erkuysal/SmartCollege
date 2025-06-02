/**
 * Application configuration constants
 */

/**
 * App information
 */
export const APP_INFO = {
  name: 'Smart College',
  version: '1.0.0',
  description: 'College Management System',
  copyright: `© ${new Date().getFullYear()} Smart College. All rights reserved.`
};

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  storageKey: 'smartcollege_auth',
  tokenExpiryBuffer: 300, // 5 minutes in seconds
  refreshTokenPath: '/auth/refresh',
  loginPath: '/auth/login',
  logoutPath: '/auth/logout'
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultLimit: 10,
  limitOptions: [5, 10, 25, 50, 100],
  defaultPage: 1
};

/**
 * Date format options
 */
export const DATE_FORMATS = {
  display: {
    date: 'MMM DD, YYYY',
    dateTime: 'MMM DD, YYYY HH:mm',
    time: 'HH:mm',
    shortDate: 'MM/DD/YYYY'
  },
  input: {
    date: 'YYYY-MM-DD',
    dateTime: 'YYYY-MM-DDTHH:mm',
    time: 'HH:mm'
  }
};

/**
 * Application roles and permissions
 */
export const ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
  STAFF: 'staff'
};

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must be at most ${max} characters`,
  numeric: 'Must contain only numbers',
  alphanumeric: 'Must contain only letters and numbers',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date',
  password: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
  passwordMatch: 'Passwords do not match'
};

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  },
  maxFiles: 5
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'smartcollege_theme',
  language: 'smartcollege_language',
  userSettings: 'smartcollege_user_settings'
};

/**
 * Animation timing
 */
export const ANIMATION = {
  short: 150,
  medium: 300,
  long: 500
};

/**
 * Navigation drawer widths
 */
export const DRAWER_WIDTH = {
  collapsed: 64,
  expanded: 256
};

export default {
  APP_INFO,
  API_CONFIG,
  AUTH_CONFIG,
  PAGINATION,
  DATE_FORMATS,
  ROLES,
  VALIDATION_MESSAGES,
  FILE_UPLOAD,
  STORAGE_KEYS,
  ANIMATION,
  DRAWER_WIDTH
}; 