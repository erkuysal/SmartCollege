/**
 * Common helper utilities for the application
 */

/**
 * Format a date string to a localized date format
 * @param dateString - The date string to format
 * @param options - Formatting options
 */
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  const date = typeof dateString === 'string' 
    ? new Date(dateString)
    : dateString;
    
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate a string to a specified length with ellipsis
 * @param str - The string to truncate
 * @param length - Maximum length
 */
export function truncate(str: string, length: number = 30): string {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

/**
 * Generate a random ID (useful for temporary keys)
 * @param prefix - Optional prefix for the ID
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Deep clone an object
 * @param obj - The object to clone
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if an object is empty
 * @param obj - The object to check
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get a nested value from an object using a path string
 * @param obj - The object to get the value from
 * @param path - The path to the value (e.g., 'user.address.street')
 * @param defaultValue - The default value if the path doesn't exist
 */
export function getNestedValue<T>(
  obj: Record<string, any>,
  path: string,
  defaultValue: T
): T {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Group an array of objects by a specified key
 * @param array - The array to group
 * @param key - The key to group by
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Serialize an object to URL query parameters
 * @param params - The parameters object
 */
export function serializeQueryParams(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

/**
 * Parse URL query parameters to an object
 * @param queryString - The query string to parse
 */
export function parseQueryParams(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const query = queryString.startsWith('?') 
    ? queryString.substring(1) 
    : queryString;
    
  if (!query) return params;
  
  query.split('&').forEach(param => {
    const [key, value] = param.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  
  return params;
}

/**
 * Filter an array by a search term across multiple properties
 * @param array - The array to filter
 * @param searchTerm - The search term
 * @param keys - The keys to search in
 */
export function filterBySearchTerm<T>(
  array: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] {
  if (!searchTerm) return array;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value !== undefined && 
        value !== null && 
        String(value).toLowerCase().includes(lowerSearchTerm);
    });
  });
}

/**
 * Sort an array of objects by a specified key
 * @param array - The array to sort
 * @param key - The key to sort by
 * @param direction - The sort direction
 */
export function sortByKey<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    let valueA = a[key];
    let valueB = b[key];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const strA = valueA.toLowerCase();
      const strB = valueB.toLowerCase();
      return direction === 'asc' 
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    }
    
    // Handle number comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    }
    
    // Handle date comparison
    if (valueA instanceof Date && valueB instanceof Date) {
      return direction === 'asc' 
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }
    
    // Default comparison for other types
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
} 