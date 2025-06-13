import { useState, useEffect, useRef } from 'react';
import { AirtableAccountData } from '@/app/api/airtable/account/[accountNumber]/route';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableAccountData {
  accountData: AirtableAccountData | null;
  queueNumber: number | null;
  dropboxPath: string | null;
  churchName: string | null;
  markupLink: string | null;
  discoveryFormSubmissionId: string | null;
  contentSnareLink: string | null;
  loomVideoFolder: string | null;
  // Department data
  department: string | null;
  usedFieldName: string | null;
  availableFields: string[];
  // Sunday photos data
  sundayPhotosUploaded: boolean;
  sundayPhotosValue: number;
  memberNumber: number | null;
  loading: boolean;
  error: string | null;
}

// Cache for account data with timestamp-based expiration
const accountDataCache: Record<string, { 
  data: UseAirtableAccountData; 
  timestamp: number;
}> = {};

// Track ongoing fetch requests to prevent duplicates
const ongoingRequests: Record<string, Promise<void>> = {};

export function useAirtableAccount(accountNumber?: string | number): UseAirtableAccountData {
  const [data, setData] = useState<UseAirtableAccountData>({
    accountData: null,
    queueNumber: null,
    dropboxPath: null,
    churchName: null,
    markupLink: null,
    discoveryFormSubmissionId: null,
    contentSnareLink: null,
    loomVideoFolder: null,
    // Department data
    department: null,
    usedFieldName: null,
    availableFields: [],
    // Sunday photos data
    sundayPhotosUploaded: false,
    sundayPhotosValue: 0,
    memberNumber: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!accountNumber) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const cacheKey = accountNumber.toString();

    // Check cache first with timestamp-based expiration
    const cached = accountDataCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setData(cached.data);
      return;
    }

    // Check if there's already an ongoing request for this account
    if (cacheKey in ongoingRequests) {

      ongoingRequests[cacheKey].then(() => {
        // Re-check cache after the ongoing request completes
        const updatedCache = accountDataCache[cacheKey];
        if (updatedCache && isMountedRef.current) {
          setData(updatedCache.data);
        }
      }).catch(() => {
        // Handle errors from ongoing request
        if (isMountedRef.current) {
          setData(prev => ({ ...prev, loading: false }));
        }
      });
      return;
    }

    const fetchAccountData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/airtable/account/${accountNumber}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMountedRef.current) {
          const newData: UseAirtableAccountData = result.error ? {
            accountData: null,
            queueNumber: null,
            dropboxPath: null,
            churchName: null,
            markupLink: null,
            discoveryFormSubmissionId: null,
            contentSnareLink: null,
            loomVideoFolder: null,
            department: null,
            usedFieldName: null,
            availableFields: [],
            sundayPhotosUploaded: false,
            sundayPhotosValue: 0,
            memberNumber: null,
            loading: false,
            error: result.error,
          } : {
            accountData: result.accountData,
            queueNumber: result.queueNumber,
            dropboxPath: result.dropboxPath,
            churchName: result.churchName,
            markupLink: result.markupLink,
            discoveryFormSubmissionId: result.discoveryFormSubmissionId,
            contentSnareLink: result.contentSnareLink,
            loomVideoFolder: result.loomVideoFolder,
            // Department data
            department: result.department,
            usedFieldName: result.usedFieldName,
            availableFields: result.availableFields || [],
            // Sunday photos data
            sundayPhotosUploaded: result.sundayPhotosUploaded || false,
            sundayPhotosValue: result.sundayPhotosValue || 0,
            memberNumber: result.memberNumber,
            loading: false,
            error: null,
          };

          setData(newData);

          // Cache the data with timestamp
          accountDataCache[cacheKey] = {
            data: newData,
            timestamp: Date.now()
          };

        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error('Error fetching account data:', err);
          const errorData: UseAirtableAccountData = {
            accountData: null,
            queueNumber: null,
            dropboxPath: null,
            churchName: null,
            markupLink: null,
            discoveryFormSubmissionId: null,
            contentSnareLink: null,
            loomVideoFolder: null,
            department: null,
            usedFieldName: null,
            availableFields: [],
            sundayPhotosUploaded: false,
            sundayPhotosValue: 0,
            memberNumber: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch account data',
          };
          setData(errorData);
        }
      } finally {
        // Remove from ongoing requests
        delete ongoingRequests[cacheKey];
      }
    };

    // Store the promise to prevent duplicate requests
    ongoingRequests[cacheKey] = fetchAccountData();

    return () => {
      isMountedRef.current = false;
    };
  }, [accountNumber]);

  // Listen for global cache clear events
  useEffect(() => {
    const handleGlobalCacheClear = () => {
      // Clear module-level cache
      Object.keys(accountDataCache).forEach(key => {
        delete accountDataCache[key];
      });
      Object.keys(ongoingRequests).forEach(key => {
        delete ongoingRequests[key];
      });
             // Cache clear will trigger refresh through refreshCounter dependency
    };

    window.addEventListener('global-cache-clear', handleGlobalCacheClear);
    
    return () => {
      window.removeEventListener('global-cache-clear', handleGlobalCacheClear);
      isMountedRef.current = false;
    };
  }, []);

  return data;
} 