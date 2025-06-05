import { useState, useEffect, useCallback } from 'react';
import { MilestoneStep } from '@/api/airtable';
import { globalConfig } from '@/config/globalConfig';

interface UseAirtableTaskMilestonesResult {
  steps: MilestoneStep[];
  currentStep: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for processed milestone data with timestamp
const airtableMilestoneCache: Record<string, { 
  steps: MilestoneStep[]; 
  currentStep: number; 
  timestamp: number;
}> = {};

// Default fallback steps when Airtable is unavailable
const defaultFallbackSteps: MilestoneStep[] = [
  {
    step: 1,
    title: "Queue Approval",
    description: "Current milestone"
  },
  {
    step: 2,
    title: "Content Review",
    description: "Next milestone"
  },
  {
    step: 3,
    title: "Strategy Brief",
    description: "Following milestone"
  }
];

/**
 * Hook that fetches Airtable task templates and applies the 3-step milestone logic
 * Mimics the behavior of the original useMilestoneData hook
 */
export function useAirtableTaskMilestones(
  accountNumber?: number,
  currentMilestoneIndex: number = 0 // Which task in the list should be "current"
): UseAirtableTaskMilestonesResult {
  const [steps, setSteps] = useState<MilestoneStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${accountNumber || 'default'}-${currentMilestoneIndex}`;

  const fetchData = useCallback(async () => {
    // Check cache first with timestamp-based expiration
    const cached = airtableMilestoneCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < globalConfig.airtable.cacheDuration) {
      setSteps(cached.steps);
      setCurrentStep(cached.currentStep);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all task templates from Airtable
      const response = await fetch('/api/airtable/task-templates');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task templates: ${response.statusText}`);
      }
      
      const allTasks: MilestoneStep[] = await response.json();
      
      if (!allTasks || allTasks.length === 0) {
        throw new Error('No task templates returned from Airtable');
      }

      // Apply the 3-step logic similar to the original milestone system
      let processedSteps: MilestoneStep[] = [];
      let processedCurrentStep = 1;

      const totalTasks = allTasks.length;
      const currentIndex = Math.min(currentMilestoneIndex, totalTasks - 1);

      if (currentIndex === 0) {
        // First milestone: show current, next, and future
        processedSteps = [
          {
            step: 1,
            title: allTasks[0]?.title || "Current Task",
            description: "Current milestone"
          },
          {
            step: 2,
            title: allTasks[1]?.title || "Next Task",
            description: "Next milestone"
          },
          {
            step: 3,
            title: allTasks[2]?.title || "Future Task",
            description: "Following milestone"
          }
        ];
        processedCurrentStep = 1;
      } else if (currentIndex >= totalTasks - 1) {
        // Last milestone: show previous, previous, current
        const prevIndex2 = Math.max(0, totalTasks - 3);
        const prevIndex1 = Math.max(0, totalTasks - 2);
        const currentIdx = totalTasks - 1;
        
        processedSteps = [
          {
            step: 1,
            title: allTasks[prevIndex2]?.title || "Previous Task",
            description: "Completed milestone"
          },
          {
            step: 2,
            title: allTasks[prevIndex1]?.title || "Previous Task",
            description: "Completed milestone"
          },
          {
            step: 3,
            title: allTasks[currentIdx]?.title || "Current Task",
            description: "Current milestone"
          }
        ];
        processedCurrentStep = 3;
      } else {
        // Middle milestone: show previous, current, next
        processedSteps = [
          {
            step: 1,
            title: allTasks[currentIndex - 1]?.title || "Previous Task",
            description: "Completed milestone"
          },
          {
            step: 2,
            title: allTasks[currentIndex]?.title || "Current Task",
            description: "Current milestone"
          },
          {
            step: 3,
            title: allTasks[currentIndex + 1]?.title || "Next Task",
            description: "Next milestone"
          }
        ];
        processedCurrentStep = 2;
      }

      setSteps(processedSteps);
      setCurrentStep(processedCurrentStep);

      // Cache the processed data with timestamp
      airtableMilestoneCache[cacheKey] = {
        steps: processedSteps,
        currentStep: processedCurrentStep,
        timestamp: Date.now()
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Airtable task milestones:', err);
      // Fallback to default steps on error
      setSteps(defaultFallbackSteps);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, currentMilestoneIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (airtableMilestoneCache[cacheKey]) {
      delete airtableMilestoneCache[cacheKey];
    }
    fetchData();
  }, [fetchData, cacheKey]);

  return {
    steps,
    currentStep,
    loading,
    error,
    refetch
  };
} 