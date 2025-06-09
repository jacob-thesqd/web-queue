import { useState, useEffect, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';
import type { AirtableAccountData } from '@/app/api/airtable/account/[accountNumber]/route';

interface UseAirtableAccountDataResult {
  accountData: AirtableAccountData | null;
  queueNumber: number | null;
  dropboxPath: string | null;
  churchName: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for account data to avoid repeated API calls
const accountDataCache: Record<string, { 
  accountData: AirtableAccountData | null;
  queueNumber: number | null;
  dropboxPath: string | null;
  churchName: string | null;
  timestamp: number;
}> = {};

/**
 * Hook to fetch complete account data from Airtable for a given account number
 * Uses the Member # field to match the account number and returns all account fields
 */
export function useAirtableAccountData(accountNumber?: number): UseAirtableAccountDataResult {
  const [accountData, setAccountData] = useState<AirtableAccountData | null>(null);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [dropboxPath, setDropboxPath] = useState<string | null>(null);
  const [churchName, setChurchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `account-${accountNumber || 'unknown'}`;

  const fetchAccountData = useCallback(async () => {
    if (!accountNumber) {
      setAccountData(null);
      setQueueNumber(null);
      setDropboxPath(null);
      setChurchName(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = accountDataCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setAccountData(cached.accountData);
      setQueueNumber(cached.queueNumber);
      setDropboxPath(cached.dropboxPath);
      setChurchName(cached.churchName);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch account data from the new generic API route
      const response = await fetch(`/api/airtable/account/${accountNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      accountDataCache[cacheKey] = {
        accountData: data.accountData,
        queueNumber: data.queueNumber,
        dropboxPath: data.dropboxPath,
        churchName: data.churchName,
        timestamp: Date.now()
      };
      
      setAccountData(data.accountData);
      setQueueNumber(data.queueNumber);
      setDropboxPath(data.dropboxPath);
      setChurchName(data.churchName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch account data';
      setError(errorMessage);
      console.error('Error fetching account data from Airtable:', err);
      setAccountData(null);
      setQueueNumber(null);
      setDropboxPath(null);
      setChurchName(null);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, cacheKey]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (accountDataCache[cacheKey]) {
      delete accountDataCache[cacheKey];
    }
    fetchAccountData();
  }, [fetchAccountData, cacheKey]);

  return {
    accountData,
    queueNumber,
    dropboxPath,
    churchName,
    loading,
    error,
    refetch
  };
} 