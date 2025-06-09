import { useState, useEffect, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableDepartmentResult {
  department: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for department data to avoid repeated API calls
const departmentCache: Record<string, { department: string | null; timestamp: number }> = {};

/**
 * Hook to fetch department from Airtable for a given account number
 * Uses the Member # field to match the account number to the Department (Plain Text) field
 */
export function useAirtableDepartment(accountNumber?: number): UseAirtableDepartmentResult {
  const [department, setDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `department-${accountNumber || 'unknown'}`;

  const fetchDepartment = useCallback(async () => {
    if (!accountNumber) {
      setDepartment(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = departmentCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setDepartment(cached.department);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search for the record in Airtable using the Member # field
      const response = await fetch(`/api/airtable/department?memberNumber=${accountNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch department: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      departmentCache[cacheKey] = {
        department: data.department,
        timestamp: Date.now()
      };
      
      setDepartment(data.department);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch department';
      setError(errorMessage);
      console.error('Error fetching department from Airtable:', err);
      setDepartment(null);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, cacheKey]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (departmentCache[cacheKey]) {
      delete departmentCache[cacheKey];
    }
    fetchDepartment();
  }, [fetchDepartment, cacheKey]);

  return {
    department,
    loading,
    error,
    refetch
  };
} 