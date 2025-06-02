import { API_CONFIG, FEATURES } from '../config/environment';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * In-memory request cache for optimizing API calls
 * Provides caching for GET requests to reduce redundant network calls
 */
class RequestCache {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_TTL: number;

  constructor() {
    this.cache = new Map();
    this.DEFAULT_TTL = API_CONFIG.CACHE_TTL;
  }

  /**
   * Generate a cache key from a URL and optional parameters
   */
  public generateKey(url: string, params?: Record<string, any>): string {
    // Create a consistent key from URL + stringified params
    const paramsString = params ? JSON.stringify(params) : '';
    return `${url}:${paramsString}`;
  }

  /**
   * Get an item from the cache if it exists and is not expired
   */
  public get<T>(key: string): T | null {
    // If caching is disabled, always return null
    if (!FEATURES.ENABLE_API_CACHE) {
      return null;
    }

    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    // Return null if item doesn't exist or is expired
    if (!item || Date.now() > item.expiry) {
      if (item) {
        // Clean up expired item
        this.delete(key);
      }
      return null;
    }
    
    return item.data;
  }

  /**
   * Set a value in the cache with an optional TTL (time to live)
   */
  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Don't cache if feature is disabled
    if (!FEATURES.ENABLE_API_CACHE) {
      return;
    }
    
    const timestamp = Date.now();
    const expiry = timestamp + ttl;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiry
    });
  }

  /**
   * Delete an item from the cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache or entries matching a pattern
   */
  public clear(pattern?: string): void {
    if (!pattern) {
      // Clear entire cache
      this.cache.clear();
      return;
    }
    
    // Clear only matching keys
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Check if a key exists in the cache and is not expired
   */
  public has(key: string): boolean {
    if (!FEATURES.ENABLE_API_CACHE) {
      return false;
    }
    
    const item = this.cache.get(key);
    return !!item && Date.now() <= item.expiry;
  }

  /**
   * Get cache stats for debugging
   */
  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create a singleton instance
const requestCache = new RequestCache();
export default requestCache; 