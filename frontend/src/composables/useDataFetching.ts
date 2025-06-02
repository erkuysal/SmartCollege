import { ref, computed } from 'vue';
import type { Ref } from 'vue';

interface FetchState<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  success: Ref<boolean>;
  fetch: (params?: any) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  hasData: Ref<boolean>;
}

/**
 * Composable for standardized data fetching with loading, error states, and retry capabilities
 * @param fetchFn The async function that fetches data
 * @param immediate Whether to fetch data immediately
 * @param initialData Optional initial data
 */
export function useDataFetching<T>(
  fetchFn: (params?: any) => Promise<T>,
  immediate: boolean = false,
  initialData: T | null = null
): FetchState<T> {
  const data = ref<T | null>(initialData) as Ref<T | null>;
  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const success = ref<boolean>(false);
  let lastParams: any = null;

  // Computed property to check if we have data
  const hasData = computed(() => data.value !== null);

  /**
   * Fetch data with the provided parameters
   */
  const fetch = async (params?: any): Promise<T | null> => {
    // Store params for potential retry
    lastParams = params;
    
    // Reset state for new fetch
    loading.value = true;
    error.value = null;
    success.value = false;

    try {
      const result = await fetchFn(params);
      data.value = result;
      success.value = true;
      return result;
    } catch (err) {
      error.value = err instanceof Error 
        ? err 
        : new Error(typeof err === 'string' ? err : 'An unknown error occurred');
      console.error('Fetch error:', error.value);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Retry the last fetch operation with the same parameters
   */
  const retry = async (): Promise<T | null> => {
    return fetch(lastParams);
  };

  /**
   * Reset the fetch state
   */
  const reset = (): void => {
    data.value = initialData;
    loading.value = false;
    error.value = null;
    success.value = false;
  };

  // Fetch immediately if requested
  if (immediate) {
    fetch();
  }

  return {
    data,
    loading,
    error,
    success,
    fetch,
    retry,
    reset,
    hasData
  };
}

/**
 * Error handling helper for common error scenarios
 */
export function getErrorMessage(error: Error | null): string {
  if (!error) return '';

  // Network errors
  if (error.message.includes('Network Error')) {
    return 'Network error. Please check your internet connection.';
  }

  // Authentication errors
  if (error.message.includes('401')) {
    return 'Authentication failed. Please login again.';
  }

  if (error.message.includes('403')) {
    return 'You don\'t have permission to access this resource.';
  }

  // Not found
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }

  // Server errors
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }

  // Validation errors
  if (error.message.includes('422')) {
    return 'Validation error. Please check your input.';
  }

  // Fallback error message
  return error.message || 'An unknown error occurred.';
}

export default useDataFetching; 