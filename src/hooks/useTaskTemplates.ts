import { useState, useEffect, useCallback } from 'react';
import { MilestoneStep } from '@/api/airtable';
import { globalConfig } from '@/config/globalConfig';

interface UseTaskTemplatesResult {
  steps: MilestoneStep[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache for task templates data
let cachedData: { steps: MilestoneStep[]; timestamp: number } | null = null;

/**
 * Custom hook to fetch task templates from Airtable
 * Includes caching, loading states, and error handling
 */
export function useTaskTemplates(): UseTaskTemplatesResult {
  const [steps, setSteps] = useState<MilestoneStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cachedData && Date.now() - cachedData.timestamp < globalConfig.airtable.cacheDuration) {
      setSteps(cachedData.steps);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/airtable/task-templates');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task templates: ${response.statusText}`);
      }
      
      const taskTemplates: MilestoneStep[] = await response.json();
      
      // Cache the data with timestamp
      cachedData = {
        steps: taskTemplates,
        timestamp: Date.now()
      };
      
      setSteps(taskTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task templates');
      console.error('Error in useTaskTemplates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache and refetch
    cachedData = null;
    await fetchData();
  }, [fetchData]);

  return {
    steps,
    loading,
    error,
    refetch
  };
} 