import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { Skeleton } from "@/components/ui/skeleton"
import React, { useMemo } from "react"
import { MilestoneStep } from "@/api/airtable"
import { useTaskTemplates } from "@/hooks/useTaskTemplates"

interface MilestoneStepperComponentProps {
  steps?: MilestoneStep[];
  currentStep?: number;
  loading?: boolean;
  mode?: 'grid' | 'list';
  useAirtable?: boolean; // New prop to enable Airtable data fetching
}

const defaultSteps: MilestoneStep[] = [
  {
    step: 1,
    title: "Step One",
    description: "Desc for step one",
  },
  {
    step: 2,
    title: "Step Two",
    description: "Desc for step two",
  },
  {
    step: 3,
    title: "Step Three",
    description: "Desc for step three",
  },
];

// Optimized immediate steps with the exact LCP text to prevent layout shift
const immediateSteps: MilestoneStep[] = [
  {
    step: 1,
    title: "Review Strategy Brief & Approve Web Scope", // This is your LCP element text
    description: "Initial milestone",
  },
  {
    step: 2,
    title: "Content Review", 
    description: "Review milestone",
  },
  {
    step: 3,
    title: "Strategy Brief",
    description: "Final milestone",
  },
];

export default function MilestoneStepperComponent({ 
  steps: externalSteps, 
  currentStep = 2,
  loading: externalLoading = false,
  mode = 'list',
  useAirtable = false
}: MilestoneStepperComponentProps) {
  
  // Conditionally use Airtable data if enabled
  const airtableData = useAirtable ? useTaskTemplates() : { steps: [], loading: false, error: null };
  
  // Memoize the steps selection to prevent unnecessary re-renders
  const steps = useMemo(() => {
    if (useAirtable) {
      // If still loading, show immediate fallback instead of waiting
      if (airtableData.loading) {
        return immediateSteps;
      }
      // If error or no data, show default
      if (airtableData.error || !airtableData.steps.length) {
        return defaultSteps;
      }
      return airtableData.steps;
    }
    return externalSteps || defaultSteps;
  }, [useAirtable, airtableData.loading, airtableData.error, airtableData.steps, externalSteps]);
  
  // Never show loading state - always render something immediately
  const loading = useAirtable ? false : externalLoading;
  
  const isGridMode = mode === 'grid';
  
  // Show error state only if Airtable fails after loading (not during loading)
  if (useAirtable && airtableData.error && !airtableData.loading) {
    return (
      <div className="text-center p-4 text-red-600">
        <p>Failed to load task templates from Airtable</p>
        <p className="text-sm text-gray-500 mt-1">{airtableData.error}</p>
      </div>
    );
  }
  
  // Remove loading skeleton - always render content immediately
  return (
    <div className={`${isGridMode ? 'space-y-2' : 'space-y-4'} ${isGridMode ? 'text-left' : 'text-center'} w-full ${isGridMode ? 'max-w-sm' : 'max-w-4xl'} ${isGridMode ? 'mx-0' : 'mx-auto'} ml-2`}>
      {isGridMode ? (
        <Stepper defaultValue={currentStep} orientation="vertical">
          {steps.map(({ step, title, description }) => (
            <StepperItem
              key={step}
              step={step}
              className="relative items-start not-last:flex-1"
            >
              <StepperTrigger className="items-start rounded pb-8 last:pb-0 pointer-events-none">
                <StepperIndicator />
                <div className="mt-0.5 px-3 text-left min-w-0 flex-1">
                  <StepperTitle 
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ 
                      // Inline styles for immediate rendering without CSS blocking
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      lineHeight: '1.25rem'
                    }}
                  >
                    {title}
                  </StepperTitle>
                </div>
              </StepperTrigger>
              {step < steps.length && (
                <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
              )}
            </StepperItem>
          ))}
        </Stepper>
      ) : (
        <Stepper defaultValue={currentStep} className="w-full !flex justify-between items-center">
          {steps.map(({ step, title, description }, index) => {
            return (
              <React.Fragment key={step}>
                <StepperItem
                  step={step}
                  className="max-md:items-start flex-shrink-0 min-w-0"
                >
                  <div className="gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm p-4 h-24 relative flex items-start min-w-0 w-full pointer-events-none">
                    <div className="text-center md:text-left mr-10 min-w-0 flex-1">
                      <StepperTitle 
                        className="mb-2 break-words whitespace-normal max-w-[16ch] hyphens-auto text-sm"
                        style={{
                          // Critical inline styles for LCP optimization
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          lineHeight: '1.25rem',
                          marginBottom: '0.5rem',
                          margin: '0px',
                          display: 'block',
                          color: 'inherit', // Ensure no color delay
                          visibility: 'visible', // Force visibility
                        }}
                        suppressHydrationWarning={true} // Prevent hydration mismatch delays
                      >
                        {title || `[DEBUG: Missing title for step ${step}]`}
                      </StepperTitle>
                    </div>
                    {step < currentStep ? (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : step === currentStep ? (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                    )}
                  </div>
                </StepperItem>
                {index < steps.length - 1 && (
                  <StepperSeparator className="flex-1 mx-2 lg:mx-4" />
                )}
              </React.Fragment>
            );
          })}
        </Stepper>
      )}
    </div>
  )
}
