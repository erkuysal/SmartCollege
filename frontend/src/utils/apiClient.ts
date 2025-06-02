import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_ROUTES } from "./config/apiRoutes";
import { API_CONFIG, AUTH_CONFIG, FEATURES } from "./config/environment";
import requestCache from "./cache/requestCache";
import logger from "./logging/logger";
import { retry } from "./helpers/requestControl";

// Create a module-specific logger
const apiLogger = logger.createLogger('API');

// Types for tokens
interface TokenPair {
  access: string;
  refresh: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Get base URL from environment config
    const baseURL = API_CONFIG.BASE_URL;
    
    // Only log in debug mode
    if (FEATURES.DEBUG_MODE) {
      apiLogger.info('API Client initialized with baseURL:', { baseURL });
    }
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.TIMEOUT, // Add timeout from config
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Only log in debug mode
        if (FEATURES.DEBUG_MODE) {
          apiLogger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        apiLogger.error('Request error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 500 Internal Server Error specifically
        if (error.response?.status === 500) {
          apiLogger.error('Server Error (500)', {
            url: originalRequest.url,
            method: originalRequest.method,
            data: error.response?.data
          });
          
          // Check if this endpoint should use fallbacks
          if (this.shouldUseFallbackForEndpoint(originalRequest.url || '')) {
            apiLogger.warn(`Using fallback for 500 error on ${originalRequest.url}`);
            
            // Create a custom error with a flag for fallback
            const fallbackError = new Error(`Server error with fallback: ${error.message}`);
            // @ts-ignore - Add custom property to error object
            fallbackError._useFallback = true;
            
            return Promise.reject(fallbackError);
          }
        }
        
        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, wait for new token
            try {
              const token = await new Promise<string>((resolve, reject) => {
                this.refreshSubscribers.push((token: string) => {
                  resolve(token);
                });
              });
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            } catch (err) {
              return Promise.reject(err);
            }
          }

          // Start refreshing process
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
            if (!refreshToken) {
              // No refresh token, logout user
              this.clearTokens();
              return Promise.reject(error);
            }

            // Call refresh token endpoint
            const response = await axios.post<TokenPair>(
              API_ROUTES.USERS_AUTH.TOKEN_REFRESH,
              { refresh: refreshToken }
            );

            const { access } = response.data;
            this.setTokens({ access, refresh: refreshToken });
            
            // Notify subscribers
            this.onRefreshed(access);
            
            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            apiLogger.warn('Token refresh failed, logging out user');
            this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        apiLogger.error('API Error', {
          status: error.response?.status,
          url: originalRequest.url,
          method: originalRequest.method,
          data: error.response?.data
        });

        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Store tokens in localStorage
  public setTokens(tokens: TokenPair): void {
    localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.access);
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);
  }

  // Clear tokens from localStorage
  public clearTokens(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    // Dispatch logout event for stores to listen to
    window.dispatchEvent(new Event(AUTH_CONFIG.LOGOUT_EVENT));
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  // Convenience methods for different HTTP verbs with caching for GET requests
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Process URL
    const finalUrl = this.processUrl(url);
    
    // Try to get from cache first (only for GET requests)
    if (FEATURES.ENABLE_API_CACHE) {
      const cacheKey = requestCache.generateKey(finalUrl, config?.params);
      const cachedResponse = requestCache.get<AxiosResponse<T>>(cacheKey);
      
      if (cachedResponse) {
        if (FEATURES.DEBUG_MODE) {
          apiLogger.debug(`Cache hit for GET ${finalUrl}`);
        }
        return cachedResponse;
      }
    }
    
    // Make actual request with retry capability
    const makeRequest = () => this.client.get<T>(finalUrl, config);
    
    try {
      const response = await retry(makeRequest, {
        maxAttempts: API_CONFIG.MAX_RETRIES,
        delay: API_CONFIG.RETRY_DELAY,
        onRetry: (attempt, error) => {
          apiLogger.warn(`Retry attempt ${attempt} for GET ${finalUrl}`, { error });
        }
      });
      
      // Cache successful GET responses
      if (FEATURES.ENABLE_API_CACHE) {
        const cacheKey = requestCache.generateKey(finalUrl, config?.params);
        requestCache.set(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      apiLogger.error(`Failed GET request to ${finalUrl} after retries`, { error });
      throw error;
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const finalUrl = this.processUrl(url);
    return this.client.post<T>(finalUrl, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const finalUrl = this.processUrl(url);
    // Invalidate relevant caches on data modification
    this.invalidateRelatedCaches(finalUrl);
    return this.client.put<T>(finalUrl, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const finalUrl = this.processUrl(url);
    // Invalidate relevant caches on data modification
    this.invalidateRelatedCaches(finalUrl);
    return this.client.patch<T>(finalUrl, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const finalUrl = this.processUrl(url);
    // Invalidate relevant caches on data deletion
    this.invalidateRelatedCaches(finalUrl);
    return this.client.delete<T>(finalUrl, config);
  }

  // Helper method to clean up and process URLs
  private processUrl(url: string): string {
    // Ensure URL doesn't have double slashes
    let processedUrl = url.replace(/([^:]\/)\/+/g, "$1");
    
    // Remove duplicate API prefixes if present
    processedUrl = this.removeDuplicateApiPrefix(processedUrl);
    
    // Ensure URL ends with a trailing slash for Django's APPEND_SLASH setting
    if (!processedUrl.endsWith('/') && !processedUrl.includes('?')) {
      processedUrl = `${processedUrl}/`;
    }
    
    return processedUrl;
  }

  // Helper method to remove duplicate API prefixes
  private removeDuplicateApiPrefix(url: string): string {
    // Check if the URL has duplicate /api/ segments
    const apiPattern = /\/api\/([^\/]+)\/api\/\1\//;
    if (apiPattern.test(url)) {
      // Replace the duplicate pattern with a single instance
      return url.replace(apiPattern, '/api/$1/');
    }
    
    return url;
  }
  
  // Invalidate caches related to a URL
  private invalidateRelatedCaches(url: string): void {
    if (!FEATURES.ENABLE_API_CACHE) return;
    
    // Extract the base resource path from the URL
    // Example: /api/users/123/ -> /api/users
    const pathParts = url.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const resourcePath = `/${pathParts[0]}/${pathParts[1]}`;
      requestCache.clear(resourcePath);
      
      if (FEATURES.DEBUG_MODE) {
        apiLogger.debug(`Invalidated cache for resource: ${resourcePath}`);
      }
    }
  }

  // Helper method to check if an endpoint should use fallback data
  private shouldUseFallbackForEndpoint(url: string): boolean {
    if (!API_CONFIG.ERROR_HANDLING.ENABLE_FALLBACKS) {
      return false;
    }
    
    return API_CONFIG.FALLBACK_ENABLED_ENDPOINTS.some(endpoint => 
      url.includes(endpoint)
    );
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
