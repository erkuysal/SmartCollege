/**
 * Base types for store states
 */

/**
 * Generic store state interface
 */
export interface StoreState<T> {
  loading: boolean;
  error: string | null;
  selectedItem: T | null;
}

/**
 * List store state interface with pagination
 */
export interface ListStoreState<T> extends StoreState<T> {
  items: T[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

/**
 * Authentication store state interface
 */
export interface AuthStoreState {
  user: any | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * UI store state interface
 */
export interface UIStoreState {
  darkMode: boolean;
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    read: boolean;
  }>;
}

/**
 * Filter state interface
 */
export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  page: number;
  pageSize: number;
} 