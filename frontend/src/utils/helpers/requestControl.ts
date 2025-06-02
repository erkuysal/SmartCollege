/**
 * Request control utilities for optimizing API calls
 * Provides debounce and throttle functions to limit excessive API calls
 */

/**
 * Creates a debounced function that delays invoking the target function
 * until after 'wait' milliseconds have elapsed since the last invocation.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param immediate - Whether to invoke the function on the leading edge instead of trailing edge
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && timeout === undefined;
    
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Creates a throttled function that only invokes the target function
 * at most once per every 'limit' milliseconds.
 *
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let lastCallTimer: number | undefined;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(context, args);
    } else {
      // Clear any existing timer
      clearTimeout(lastCallTimer);
      
      // Schedule a new call at the end of the throttle period
      lastCallTimer = window.setTimeout(() => {
        lastCall = now;
        func.apply(context, args);
      }, limit - (now - lastCall));
    }
  };
}

/**
 * Creates a function that memoizes the result of func. Useful for expensive computations
 * or API calls where the inputs are frequently the same.
 *
 * @param func - The function to have its output memoized
 * @param resolver - Function to resolve cache key from arguments
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver 
      ? resolver(...args) 
      : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Retries a function execution a specified number of times with optional delay
 * and backoff factor. Useful for handling unreliable API calls.
 *
 * @param func - Async function to retry
 * @param options - Retry options (maxAttempts, delay, backoffFactor)
 */
export async function retry<T>(
  func: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { 
    maxAttempts = 3, 
    delay = 300, 
    backoffFactor = 2,
    onRetry = () => {} 
  } = options;
  
  let attempt = 1;
  
  async function attempt_retry(): Promise<T> {
    try {
      return await func();
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // Notify of retry
      onRetry(attempt, error as Error);
      
      // Calculate delay with exponential backoff
      const retryDelay = delay * Math.pow(backoffFactor, attempt - 1);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Increment attempt counter and retry
      attempt++;
      return attempt_retry();
    }
  }
  
  return attempt_retry();
} 