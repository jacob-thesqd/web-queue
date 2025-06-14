import { useState, useEffect, useCallback } from 'react';
import type { AccountManagerProfileData } from '@/app/api/account-manager-profile/[accountNumber]/route';

interface UseAccountManagerProfileResult {
  data: AccountManagerProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Timeout configuration (milliseconds)
const TIMEOUT_DURATION = 5000; // 5 seconds

export function useAccountManagerProfile(accountNumber: number): UseAccountManagerProfileResult {
  const [data, setData] = useState<AccountManagerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch(`/api/account-manager-profile/${accountNumber}`, {
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

      setData(result.data || null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out');
        console.log('⏱️ Account manager profile fetch timed out');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching account manager profile:', err);
      }
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
  };
} 