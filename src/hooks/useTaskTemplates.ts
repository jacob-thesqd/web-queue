import { useState, useEffect, useCallback, useRef } from 'react';
import { MilestoneStep } from '@/lib/airtable/types';
import { globalConfig } from '@/config/globalConfig';

interface UseTaskTemplatesResult {
  steps: MilestoneStep[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Enhanced cache with versioning and persistence
interface CacheEntry {
  steps: MilestoneStep[];
  timestamp: number;
  version: string;
}

// Cache for task templates data with persistence
let cachedData: CacheEntry | null = null;

// Immediate fallback data for instant rendering
const immediateFallbackSteps: MilestoneStep[] = [
  {
    step: 1,
    title: "Queue Approval",
    description: "Initial milestone processing",
    estimate: 10,
    owner: ["Strategy Team"]
  },
  {
    step: 2,
    title: "Content Review",
    description: "Content validation and review",
    estimate: 30,
    owner: ["Web Team"]
  },
  {
    step: 3,
    title: "Strategy Brief",
    description: "Final strategy approval",
    estimate: 20,
    owner: ["Strategy Team"]
  }
];

// Try to load from localStorage on initialization
const loadFromStorage = (): CacheEntry | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('task-templates-cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if cache is still valid (within duration)
      if (Date.now() - parsed.timestamp < globalConfig.airtable.cacheDuration) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load task templates from localStorage:', error);
  }
  return null;
};

// Save to localStorage
const saveToStorage = (data: CacheEntry): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('task-templates-cache', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save task templates to localStorage:', error);
  }
};

/**
 * Custom hook to fetch task templates from Airtable
 * Includes enhanced caching, immediate fallback, and error handling
 */
export function useTaskTemplates(): UseTaskTemplatesResult {
  // Initialize with immediate fallback for faster rendering
  const [steps, setSteps] = useState<MilestoneStep[]>(immediateFallbackSteps);
  const [loading, setLoading] = useState(false); // Start with false for immediate render
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) return;
    
    // Check memory cache first
    if (cachedData && Date.now() - cachedData.timestamp < globalConfig.airtable.cacheDuration) {
      setSteps(cachedData.steps);
      setLoading(false);
      return;
    }

    // Check localStorage cache
    const storedCache = loadFromStorage();
    if (storedCache) {
      cachedData = storedCache;
      setSteps(storedCache.steps);
      setLoading(false);
      return;
    }

    fetchInProgress.current = true;

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), globalConfig.airtable.timeoutMs);
      
      const response = await fetch('/api/airtable/task-templates', {
        signal: controller.signal,
        // No aggressive caching
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task templates: ${response.status} ${response.statusText}`);
      }
      
      const taskTemplates: MilestoneStep[] = await response.json();
      
      if (!taskTemplates || !Array.isArray(taskTemplates)) {
        throw new Error('Invalid task templates data format');
      }
      
      // Create cache entry with version
      const cacheEntry: CacheEntry = {
        steps: taskTemplates,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      // Update both memory and localStorage cache
      cachedData = cacheEntry;
      saveToStorage(cacheEntry);
      
      setSteps(taskTemplates);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Using fallback data.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch task templates');
      }
      console.error('Error in useTaskTemplates:', err);
      
      // Keep the immediate fallback data on error
      setSteps(immediateFallbackSteps);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    // Start with immediate data, then fetch in background
    const storedCache = loadFromStorage();
    if (storedCache) {
      cachedData = storedCache;
      setSteps(storedCache.steps);
    }
    
    // Fetch fresh data in background (non-blocking)
    setTimeout(() => {
      fetchData();
    }, 0);
  }, []);

  const refetch = useCallback(async () => {
    // Clear all caches and refetch
    cachedData = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('task-templates-cache');
    }
    await fetchData();
  }, [fetchData]);

  return {
    steps,
    loading,
    error,
    refetch
  };
} 