import apiClient from '../apiClient';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get a list of resources with optional pagination and filtering
   */
  protected async getList<T>(
    endpoint: string = '',
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<PaginatedResponse<T>>> {
    const url = this.buildUrl(endpoint);
    return apiClient.get<PaginatedResponse<T>>(url, {
      ...config,
      params,
    });
  }

  /**
   * Get a single resource by ID
   */
  protected async getById<T>(
    id: number | string,
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(`${endpoint}/${id}`);
    return apiClient.get<T>(url, config);
  }

  /**
   * Create a new resource
   */
  protected async create<T>(
    data: any,
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint);
    return apiClient.post<T>(url, data, config);
  }

  /**
   * Update a resource with PUT (full update)
   */
  protected async update<T>(
    id: number | string,
    data: any,
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(`${endpoint}/${id}`);
    return apiClient.put<T>(url, data, config);
  }

  /**
   * Update a resource with PATCH (partial update)
   */
  protected async patch<T>(
    id: number | string,
    data: any,
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(`${endpoint}/${id}`);
    return apiClient.patch<T>(url, data, config);
  }

  /**
   * Delete a resource
   */
  protected async delete<T>(
    id: number | string,
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(`${endpoint}/${id}`);
    return apiClient.delete<T>(url, config);
  }

  /**
   * Make a custom POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint);
    return apiClient.post<T>(url, data, config);
  }

  /**
   * Make a custom GET request
   */
  protected async get<T>(
    endpoint: string,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint);
    return apiClient.get<T>(url, {
      ...config,
      params,
    });
  }

  /**
   * Build a URL by combining the base URL with the endpoint
   */
  protected buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if it exists
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // If baseUrl already ends with a slash, don't add another one
    if (this.baseUrl.endsWith('/')) {
      return `${this.baseUrl}${cleanEndpoint}`;
    }
    
    // Otherwise, add a slash between baseUrl and endpoint
    return cleanEndpoint ? `${this.baseUrl}/${cleanEndpoint}` : this.baseUrl;
  }
} 