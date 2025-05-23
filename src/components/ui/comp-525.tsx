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
  loading = false 
}: MilestoneStepperComponentProps) {
  
  if (loading) {
    return (
      <div className="space-y-8 text-center w-full">
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
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center w-full">
      <Stepper defaultValue={currentStep} className="w-full !flex justify-between items-center">
        {steps.map(({ step, title, description }, index) => {
          return (
            <React.Fragment key={step}>
              <StepperItem
                step={step}
                className="max-md:items-start flex-shrink-0"
              >
                <div className="gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm p-4 relative h-24 flex items-start">
                  <div className="text-center md:text-left mr-10">
                    <StepperTitle className="mb-2 break-words whitespace-normal max-w-[16ch] hyphens-auto">
                      {title || `[DEBUG: Missing title for step ${step}]`}
                    </StepperTitle>
                  </div>
                  {step < currentStep ? (
                    <div className="absolute top-4 right-4 w-5 h-5  rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : step === currentStep ? (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 w-5 h-5  rounded-full border-2 border-gray-300 bg-white"></div>
                  )}
                </div>
              </StepperItem>
              {index < steps.length - 1 && (
                <StepperSeparator className="flex-1 mx-4" />
              )}
            </React.Fragment>
          );
        })}
      </Stepper>
    </div>
  )
}
