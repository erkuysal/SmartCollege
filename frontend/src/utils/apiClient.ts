import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_ROUTES } from "./config/apiRoutes";

// Types for tokens
interface TokenPair {
  access: string;
  refresh: string;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Use only the domain without any path prefix
    const baseURL = 'http://127.0.0.1:8000';
    console.log('API Client initialized with baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL, // base URL without /api prefix
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Request to: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
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
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
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
            this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Log error details for debugging
        console.error('API Error:', {
          status: error.response?.status,
          url: originalRequest.url,
          method: originalRequest.method,
          data: error.response?.data
        });

        // Handle other errors
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
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }

  // Clear tokens from localStorage
  public clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Dispatch logout event for stores to listen to
    window.dispatchEvent(new Event('auth:logout'));
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  // Convenience methods for different HTTP verbs
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Ensure URL doesn't have double slashes
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    // Remove duplicate API prefixes if present
    const finalUrl = this.removeDuplicateApiPrefix(cleanUrl);
    console.log('GET request to:', finalUrl);
    return this.client.get<T>(finalUrl, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const finalUrl = this.removeDuplicateApiPrefix(cleanUrl);
    console.log('POST request to:', finalUrl);
    return this.client.post<T>(finalUrl, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const finalUrl = this.removeDuplicateApiPrefix(cleanUrl);
    console.log('PUT request to:', finalUrl);
    return this.client.put<T>(finalUrl, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const finalUrl = this.removeDuplicateApiPrefix(cleanUrl);
    console.log('PATCH request to:', finalUrl);
    return this.client.patch<T>(finalUrl, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const finalUrl = this.removeDuplicateApiPrefix(cleanUrl);
    console.log('DELETE request to:', finalUrl);
    return this.client.delete<T>(finalUrl, config);
  }

  // Helper method to remove duplicate API prefixes
  private removeDuplicateApiPrefix(url: string): string {
    // Check if the URL has duplicate /api/ segments
    const apiPattern = /\/api\/([^\/]+)\/api\/\1\//;
    if (apiPattern.test(url)) {
      // Replace the duplicate pattern with a single instance
      return url.replace(apiPattern, '/api/$1/');
    }
    
    // Ensure URL ends with a trailing slash for Django's APPEND_SLASH setting
    if (!url.endsWith('/')) {
      return url + '/';
    }
    
    return url;
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
