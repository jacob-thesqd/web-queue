import { useState, useEffect, useCallback } from 'react';
import type { AccountManagerData } from '@/app/api/account-manager/[accountNumber]/route';

interface UseAccountManagerDataResult {
  data: AccountManagerData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAccountManagerData(accountNumber: number): UseAccountManagerDataResult {
  const [data, setData] = useState<AccountManagerData[]>([]);
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

      const response = await fetch(`/api/account-manager/${accountNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data || []);
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
  };
} 