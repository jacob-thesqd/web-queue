import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface MilestoneData {
  step_number: number;
  previous_step_2_name: string | null;
  previous_step_1_name: string | null;
  current_step_name: string;
  next_step_1_name: string | null;
  next_step_2_name: string | null;
}

export interface MilestoneStep {
  step: number;
  title: string;
  description: string;
}

interface UseMilestoneDataResult {
  steps: MilestoneStep[];
  currentStep: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for milestone data
const milestoneCache: Record<number, { steps: MilestoneStep[]; currentStep: number }> = {};

// Default fallback steps when no account number is provided
const defaultFallbackSteps: MilestoneStep[] = [
  {
    step: 1,
    title: "Strategy Brief Review",
    description: "Current milestone"
  },
  {
    step: 2,
    title: "Analytics Setup",
    description: "Next milestone"
  },
  {
    step: 3,
    title: "Site Onboarding",
    description: "Following milestone"
  }
];

export function useMilestoneData(accountNumber?: number): UseMilestoneDataResult {
  const [steps, setSteps] = useState<MilestoneStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountNumber) {
      // Fallback to default steps when no account number is provided
      setSteps(defaultFallbackSteps);
      setCurrentStep(1);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    if (milestoneCache[accountNumber]) {
      const cached = milestoneCache[accountNumber];
      setSteps(cached.steps);
      setCurrentStep(cached.currentStep);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_current_milestone_step', { p_account_number: accountNumber });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data) {
        throw new Error('No milestone data returned');
      }

      // Handle the case where the API returns an array with one object
      const rawMilestoneData = Array.isArray(data) ? data[0] : data;
      
      if (!rawMilestoneData) {
        throw new Error('No milestone data in API response');
      }

      const milestoneData = rawMilestoneData as MilestoneData;
      
      // Process the data according to the logic
      let processedSteps: MilestoneStep[] = [];
      let processedCurrentStep = 1;

      if (milestoneData.previous_step_1_name === null) {
        // Put on first step, use next_step_1_name and next_step_2_name for following steps
        processedSteps = [
          {
            step: 1,
            title: milestoneData.current_step_name,
            description: "Current milestone"
          },
          {
            step: 2,
            title: milestoneData.next_step_1_name || "Upcoming Step",
            description: "Next milestone"
          },
          {
            step: 3,
            title: milestoneData.next_step_2_name || "Future Step",
            description: "Following milestone"
          }
        ];
        processedCurrentStep = 1;
      } else if (milestoneData.next_step_1_name === null) {
        // Put on last step, use previous_step_1_name and previous_step_2_name for previous steps
        processedSteps = [
          {
            step: 1,
            title: milestoneData.previous_step_2_name || "Previous Step",
            description: "Completed milestone"
          },
          {
            step: 2,
            title: milestoneData.previous_step_1_name || "Previous Step",
            description: "Completed milestone"
          },
          {
            step: 3,
            title: milestoneData.current_step_name,
            description: "Current milestone"
          }
        ];
        processedCurrentStep = 3;
      } else {
        // Put on middle step, use previous_step_1_name for step before and next_step_1_name for step after
        processedSteps = [
          {
            step: 1,
            title: milestoneData.previous_step_1_name,
            description: "Completed milestone"
          },
          {
            step: 2,
            title: milestoneData.current_step_name,
            description: "Current milestone"
          },
          {
            step: 3,
            title: milestoneData.next_step_1_name,
            description: "Next milestone"
          }
        ];
        processedCurrentStep = 2;
      }

      setSteps(processedSteps);
      setCurrentStep(processedCurrentStep);

      // Cache the processed data
      milestoneCache[accountNumber] = {
        steps: processedSteps,
        currentStep: processedCurrentStep
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching milestone data:', err);
      // Fallback to default steps on error
      setSteps(defaultFallbackSteps);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  }, [accountNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache for this account number
    if (accountNumber && milestoneCache[accountNumber]) {
      delete milestoneCache[accountNumber];
    }
    fetchData();
  }, [fetchData, accountNumber]);

  return {
    steps,
    currentStep,
    loading,
    error,
    refetch,
  };
} 