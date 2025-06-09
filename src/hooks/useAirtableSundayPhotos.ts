import { useState, useEffect, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableSundayPhotosResult {
  sundayPhotosUploaded: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for Sunday photos data to avoid repeated API calls
const sundayPhotosCache: Record<string, { sundayPhotosUploaded: boolean; timestamp: number }> = {};

/**
 * Hook to fetch Sunday Photos This Week field from Airtable for a given account number
 * Uses the Member # field to match the account number to the Sunday Photos This Week field
 * Returns true if field equals 1 (already uploaded), false otherwise
 */
export function useAirtableSundayPhotos(accountNumber?: number): UseAirtableSundayPhotosResult {
  const [sundayPhotosUploaded, setSundayPhotosUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `sunday-photos-${accountNumber || 'unknown'}`;

  const fetchSundayPhotos = useCallback(async () => {
    if (!accountNumber) {
      setSundayPhotosUploaded(false);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = sundayPhotosCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setSundayPhotosUploaded(cached.sundayPhotosUploaded);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search for the record in Airtable using the Member # field
      const response = await fetch(`/api/airtable/sunday-photos?memberNumber=${accountNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Sunday photos status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      sundayPhotosCache[cacheKey] = {
        sundayPhotosUploaded: data.sundayPhotosUploaded || false,
        timestamp: Date.now()
      };
      
      setSundayPhotosUploaded(data.sundayPhotosUploaded || false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Sunday photos status';
      setError(errorMessage);
      console.error('Error fetching Sunday photos status from Airtable:', err);
      setSundayPhotosUploaded(false);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, cacheKey]);

  useEffect(() => {
    fetchSundayPhotos();
  }, [fetchSundayPhotos]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (sundayPhotosCache[cacheKey]) {
      delete sundayPhotosCache[cacheKey];
    }
    fetchSundayPhotos();
  }, [fetchSundayPhotos, cacheKey]);

  return {
    sundayPhotosUploaded,
    loading,
    error,
    refetch
  };
} 