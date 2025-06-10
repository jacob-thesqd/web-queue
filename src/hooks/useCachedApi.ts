import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '@/lib/api-cache';
import { globalConfig } from '@/config/globalConfig';

interface UseCachedApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for making cached API calls
 * Prevents duplicate requests and provides automatic caching
 */
export function useCachedApi<T>(
  url?: string,
  options?: {
    enabled?: boolean; // Whether to auto-fetch on mount
    params?: Record<string, any>; // Parameters for cache key
  }
): UseCachedApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url || !globalConfig.airtable.enableGlobalApiCache) {
      // Fall back to regular fetch if cache is disabled
      if (!url) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (isMountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiCache.get<T>(
        url,
        async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        },
        options?.params
      );

      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, options?.params]);

  useEffect(() => {
    if (options?.enabled !== false && url) {
      fetchData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData, options?.enabled, url]);

  const refetch = useCallback(() => {
    if (url) {
      // Invalidate cache and refetch
      apiCache.invalidate(url, options?.params);
      fetchData();
    }
  }, [url, fetchData, options?.params]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Hook specifically for Airtable account data
 */
export function useCachedAirtableAccount(accountNumber?: string | number) {
  const url = accountNumber ? `/api/airtable/account/${accountNumber}` : undefined;
  
  return useCachedApi<any>(url, {
    enabled: !!accountNumber,
    params: { accountNumber }
  });
}

/**
 * Hook specifically for task templates
 */
export function useCachedTaskTemplates() {
  return useCachedApi<any>('/api/airtable/task-templates');
}

/**
 * Hook specifically for strategy member data
 */
export function useCachedStrategyMember(accountId?: string) {
  const url = accountId ? `/api/strategy-member?account=${accountId}` : undefined;
  
  return useCachedApi<any>(url, {
    enabled: !!accountId,
    params: { account: accountId }
  });
} 