import { useState, useEffect, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableDropboxPathResult {
  dropboxPath: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for dropbox path data to avoid repeated API calls
const dropboxPathCache: Record<string, { dropboxPath: string | null; timestamp: number }> = {};

/**
 * Hook to fetch Dropbox folder path from Airtable for a given account number
 * Uses the Member # field to match the account number to the Dropbox Folder Church Root field
 */
export function useAirtableDropboxPath(accountNumber?: number): UseAirtableDropboxPathResult {
  const [dropboxPath, setDropboxPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `dropbox-${accountNumber || 'unknown'}`;

  const fetchDropboxPath = useCallback(async () => {
    if (!accountNumber) {
      setDropboxPath(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = dropboxPathCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setDropboxPath(cached.dropboxPath);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search for the record in Airtable using the Member # field
      const response = await fetch(`/api/airtable/dropbox-path?memberNumber=${accountNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dropbox path: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      dropboxPathCache[cacheKey] = {
        dropboxPath: data.dropboxPath,
        timestamp: Date.now()
      };
      
      setDropboxPath(data.dropboxPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dropbox path';
      setError(errorMessage);
      console.error('Error fetching dropbox path from Airtable:', err);
      setDropboxPath(null);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, cacheKey]);

  useEffect(() => {
    fetchDropboxPath();
  }, [fetchDropboxPath]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (dropboxPathCache[cacheKey]) {
      delete dropboxPathCache[cacheKey];
    }
    fetchDropboxPath();
  }, [fetchDropboxPath, cacheKey]);

  return {
    dropboxPath,
    loading,
    error,
    refetch
  };
} 