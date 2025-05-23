import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import React from "react"

interface MilestoneStep {
  step: number;
  title: string;
  description: string;
}

interface MilestoneStepperComponentProps {
  steps?: MilestoneStep[];
  currentStep?: number;
  loading?: boolean;
  mode?: 'grid' | 'list';
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

export default function MilestoneStepperComponent({ 
  steps = defaultSteps, 
  currentStep = 2,
  loading = false,
  mode = 'list'
}: MilestoneStepperComponentProps) {
  
  const isGridMode = mode === 'grid';
  
  if (loading) {
    return (
      <div className={`${isGridMode ? 'space-y-2' : 'space-y-8'} text-center w-full ${isGridMode ? 'max-w-xs' : 'max-w-4xl'} mx-auto`}>
        {isGridMode ? (
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="w-full">
                <div className="gap-2 rounded bg-white border border-gray-200 shadow-sm p-2 animate-pulse flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 text-left">
                    <div className="h-2 bg-gray-200 rounded w-16 mb-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex justify-between items-center">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="max-md:items-start flex-shrink-0">
                  <div className="gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm p-4 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="text-center md:-order-1 md:text-left">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 max-sm:hidden"></div>
                    </div>
                  </div>
                </div>
                {index < 2 && (
                  <div className="flex-1 mx-4 h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

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
              <StepperTrigger className="items-start rounded pb-8 last:pb-0">
                <StepperIndicator />
                <div className="mt-0.5 px-3 text-left min-w-0 flex-1">
                  <StepperTitle className="whitespace-nowrap overflow-hidden text-ellipsis">{title}</StepperTitle>
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
                  <div className="gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm p-4 h-24 relative flex items-start min-w-0 w-full">
                    <div className="text-center md:text-left mr-10 min-w-0 flex-1">
                      <StepperTitle className="mb-2 break-words whitespace-normal max-w-[16ch] hyphens-auto text-sm">
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
