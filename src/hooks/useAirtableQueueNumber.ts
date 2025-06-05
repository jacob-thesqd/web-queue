import { useState, useEffect, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableQueueNumberResult {
  queueNumber: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for queue number data to avoid repeated API calls
const queueNumberCache: Record<string, { queueNumber: number | null; timestamp: number }> = {};

/**
 * Hook to fetch queue number from Airtable for a given account number
 * Uses the Member # field to match the account number to the Queue Number field
 */
export function useAirtableQueueNumber(accountNumber?: number): UseAirtableQueueNumberResult {
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `queue-${accountNumber || 'unknown'}`;

  const fetchQueueNumber = useCallback(async () => {
    if (!accountNumber) {
      setQueueNumber(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = queueNumberCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setQueueNumber(cached.queueNumber);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search for the record in Airtable using the Member # field
      const response = await fetch(`/api/airtable/queue-number?memberNumber=${accountNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch queue number: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      queueNumberCache[cacheKey] = {
        queueNumber: data.queueNumber,
        timestamp: Date.now()
      };
      
      setQueueNumber(data.queueNumber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch queue number';
      setError(errorMessage);
      console.error('Error fetching queue number from Airtable:', err);
      setQueueNumber(null);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, cacheKey]);

  useEffect(() => {
    fetchQueueNumber();
  }, [fetchQueueNumber]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (queueNumberCache[cacheKey]) {
      delete queueNumberCache[cacheKey];
    }
    fetchQueueNumber();
  }, [fetchQueueNumber, cacheKey]);

  return {
    queueNumber,
    loading,
    error,
    refetch
  };
} 