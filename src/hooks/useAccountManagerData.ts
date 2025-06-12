import { useState, useEffect, useCallback } from 'react';
import type { AccountManagerData } from '@/app/api/account-manager/[accountNumber]/route';

interface UseAccountManagerDataResult {
  data: AccountManagerData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  dataSource: 'supabase' | 'airtable' | null;
}

// Timeout configuration (milliseconds)
const TIMEOUT_DURATION = 3000; // 3 seconds

export function useAccountManagerData(accountNumber: number): UseAccountManagerDataResult {
  const [data, setData] = useState<AccountManagerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'airtable' | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountNumber) {
      setError('Account number is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

      // First try to fetch without the timeout to avoid user seeing loading state unnecessarily
      try {
        const response = await fetch(`/api/account-manager/${accountNumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }

        setData(result.data || []);
        
        // Determine data source based on metadata (if available) or infer from shape
        // We don't get explicit metadata about the source, so check if profile_picture exists
        // as that would indicate it came from Supabase's rich data
        const hasProfilePicture = result.data?.some((item: any) => item.profile_picture);
        setDataSource(hasProfilePicture ? 'supabase' : 'airtable');
      } catch (err) {
        // If the error was a timeout, use the ?forceFallback=true query param
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('⏱️ Account manager data fetch timed out, using Airtable fallback');
          
          // Force fallback by adding query parameter
          const fallbackResponse = await fetch(`/api/account-manager/${accountNumber}?forceFallback=true`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!fallbackResponse.ok) {
            throw new Error(`Fallback fetch failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
          }

          const fallbackResult = await fallbackResponse.json();
          
          if (fallbackResult.error) {
            throw new Error(fallbackResult.error);
          }

          setData(fallbackResult.data || []);
          setDataSource('airtable');
        } else {
          throw err; // Re-throw if it's not a timeout
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching account manager data:', err);
    } finally {
      setLoading(false);
    }
  }, [accountNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    dataSource,
  };
} 