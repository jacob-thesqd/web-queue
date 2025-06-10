import { useState, useEffect } from 'react';
import { AirtableAccountData } from '@/app/api/airtable/account/[accountNumber]/route';

interface UseAirtableAccountData {
  accountData: AirtableAccountData | null;
  queueNumber: number | null;
  dropboxPath: string | null;
  churchName: string | null;
  markupLink: string | null;
  discoveryFormSubmissionId: string | null;
  loading: boolean;
  error: string | null;
}

export function useAirtableAccount(accountNumber?: string | number): UseAirtableAccountData {
  const [data, setData] = useState<UseAirtableAccountData>({
    accountData: null,
    queueNumber: null,
    dropboxPath: null,
    churchName: null,
    markupLink: null,
    discoveryFormSubmissionId: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!accountNumber) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    let isMounted = true;

    const fetchAccountData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/airtable/account/${accountNumber}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          if (result.error) {
            setData(prev => ({
              ...prev,
              loading: false,
              error: result.error,
            }));
          } else {
            setData(prev => ({
              ...prev,
              accountData: result.accountData,
              queueNumber: result.queueNumber,
              dropboxPath: result.dropboxPath,
              churchName: result.churchName,
              markupLink: result.markupLink,
              discoveryFormSubmissionId: result.discoveryFormSubmissionId,
              loading: false,
              error: null,
            }));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching account data:', err);
          setData(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch account data',
          }));
        }
      }
    };

    fetchAccountData();

    return () => {
      isMounted = false;
    };
  }, [accountNumber]);

  return data;
} 