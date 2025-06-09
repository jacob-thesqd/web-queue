'use client';

import { useState, useCallback } from 'react';

interface FilloutSubmission {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  startedAt: string;
  questions: any[];
  calculations: any[];
  urlParameters: any[];
  quiz: any;
  documents: any[];
  scheduling: any[];
  payments: any[];
  editLink: string;
}

interface DiscoverySubmissionResponse {
  submission: FilloutSubmission | null;
  memberNumber?: number;
  error?: string;
  filloutError?: string;
}

export function useDiscoverySubmission() {
  const [data, setData] = useState<DiscoverySubmissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async (memberNumber: number) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('🔍 Fetching discovery submission for member:', memberNumber);
      
      const response = await fetch(`/api/airtable/discovery-submission?memberNumber=${memberNumber}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch discovery submission');
      }

      setData(result);
      console.log('✅ Successfully fetched discovery submission');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('❌ Error fetching discovery submission:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchSubmission,
    reset
  };
} 