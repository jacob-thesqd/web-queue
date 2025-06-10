import { globalConfig } from '@/config/globalConfig';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

interface ApiCacheConfig {
  cacheDuration: number;
  enableLogging: boolean;
}

class ApiCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private config: ApiCacheConfig;

  constructor(config: ApiCacheConfig) {
    this.config = config;
  }

  /**
   * Generate a cache key from URL and parameters
   */
  private generateCacheKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidCache<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.config.cacheDuration;
  }

  /**
   * Log cache operations if logging is enabled
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`🗄️ ApiCache: ${message}`, ...args);
    }
  }

  /**
   * Get data from cache or fetch it if not available/expired
   */
  async get<T>(
    url: string, 
    fetcher: () => Promise<T>, 
    params?: Record<string, any>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(url, params);

    // Check if we have valid cached data
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      this.log(`Cache hit for ${url}`);
      return cached.data;
    }

    // Check if there's an ongoing request for this key
    const ongoingRequest = this.ongoingRequests.get(cacheKey);
    if (ongoingRequest) {
      this.log(`Waiting for ongoing request for ${url}`);
      return ongoingRequest;
    }

    // No cache and no ongoing request, start a new fetch
    this.log(`Cache miss, fetching ${url}`);
    
    const fetchPromise = fetcher()
      .then((data) => {
        // Store the result in cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Remove from ongoing requests
        this.ongoingRequests.delete(cacheKey);
        
        this.log(`Data cached for ${url}`);
        return data;
      })
      .catch((error) => {
        // Remove from ongoing requests on error
        this.ongoingRequests.delete(cacheKey);
        throw error;
      });

    // Store the promise to prevent duplicate requests
    this.ongoingRequests.set(cacheKey, fetchPromise);
    
    return fetchPromise;
  }

  /**
   * Manually set cache data (useful for prefetching)
   */
  set<T>(url: string, data: T, params?: Record<string, any>): void {
    const cacheKey = this.generateCacheKey(url, params);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    this.log(`Data manually cached for ${url}`);
  }

  /**
   * Invalidate cache for a specific URL
   */
  invalidate(url: string, params?: Record<string, any>): void {
    const cacheKey = this.generateCacheKey(url, params);
    this.cache.delete(cacheKey);
    this.ongoingRequests.delete(cacheKey);
    this.log(`Cache invalidated for ${url}`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.ongoingRequests.clear();
    this.log('All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      ongoingRequests: this.ongoingRequests.size,
      config: this.config
    };
  }
}

// Create a global instance of the cache manager
export const apiCache = new ApiCacheManager({
  cacheDuration: globalConfig.airtable.cacheDuration,
  enableLogging: process.env.NODE_ENV === 'development'
});

/**
 * Helper function to create a cached fetch function
 */
export function createCachedFetch<T>(url: string) {
  return (params?: Record<string, any>): Promise<T> => {
    return apiCache.get(
      url,
      () => fetch(url).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      params
    );
  };
}

/**
 * Helper function for cached API calls with parameters
 */
export function createCachedApiCall<T>(baseUrl: string) {
  return (pathOrParams: string | Record<string, any>, params?: Record<string, any>): Promise<T> => {
    let url = baseUrl;
    let cacheParams = params;

    if (typeof pathOrParams === 'string') {
      url = `${baseUrl}/${pathOrParams}`;
    } else {
      cacheParams = pathOrParams;
    }

    return apiCache.get(
      url,
      () => fetch(url).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      cacheParams
    );
  };
} 