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
      <div className={`space-y-8 text-center w-full ${isGridMode ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
        <div className={`w-full flex justify-between items-center ${isGridMode ? 'gap-2' : ''}`}>
          {[1, 2, 3].map((_, index) => (
            <div key={index} className={`flex items-center ${isGridMode ? 'flex-1' : ''}`}>
              <div className="max-md:items-start flex-shrink-0 w-full">
                <div className={`gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm ${isGridMode ? 'p-3 h-20' : 'p-4'} animate-pulse`}>
                  <div className={`${isGridMode ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-200 rounded-full`}></div>
                  <div className="text-center md:-order-1 md:text-left">
                    <div className={`${isGridMode ? 'h-3' : 'h-4'} bg-gray-200 rounded ${isGridMode ? 'w-16 mb-1' : 'w-20 mb-2'}`}></div>
                    <div className={`${isGridMode ? 'h-2' : 'h-3'} bg-gray-200 rounded ${isGridMode ? 'w-20' : 'w-32'} max-sm:hidden`}></div>
                  </div>
                </div>
              </div>
              {index < 2 && (
                <div className={`flex-1 ${isGridMode ? 'mx-1' : 'mx-4'} h-px bg-gray-200`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 text-center w-full ${isGridMode ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
      <Stepper defaultValue={currentStep} className={`w-full !flex justify-between items-center ${isGridMode ? 'gap-1' : ''}`}>
        {steps.map(({ step, title, description }, index) => {
          return (
            <React.Fragment key={step}>
              <StepperItem
                step={step}
                className={`max-md:items-start flex-shrink-0 min-w-0 ${isGridMode ? 'flex-1' : ''}`}
              >
                <div className={`gap-4 rounded max-md:flex-col bg-white border border-gray-200 shadow-sm ${isGridMode ? 'p-3 h-20' : 'p-4 h-24'} relative flex items-start min-w-0 w-full`}>
                  <div className={`text-center md:text-left ${isGridMode ? 'mr-6' : 'mr-10'} min-w-0 flex-1`}>
                    <StepperTitle className={`${isGridMode ? 'mb-1' : 'mb-2'} break-words whitespace-normal ${isGridMode ? 'max-w-[12ch]' : 'max-w-[16ch]'} hyphens-auto ${isGridMode ? 'text-xs leading-tight' : 'text-sm'}`}>
                      {title || `[DEBUG: Missing title for step ${step}]`}
                    </StepperTitle>
                  </div>
                  {step < currentStep ? (
                    <div className={`absolute ${isGridMode ? 'top-3 right-3 w-4 h-4' : 'top-4 right-4 w-5 h-5'} rounded-full bg-emerald-500 flex items-center justify-center`}>
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : step === currentStep ? (
                    <div className={`absolute ${isGridMode ? 'top-3 right-3 w-4 h-4' : 'top-4 right-4 w-5 h-5'} rounded-full bg-black flex items-center justify-center`}>
                      <div className={`${isGridMode ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-white`}></div>
                    </div>
                  ) : (
                    <div className={`absolute ${isGridMode ? 'top-3 right-3 w-4 h-4' : 'top-4 right-4 w-5 h-5'} rounded-full border-2 border-gray-300 bg-white`}></div>
                  )}
                </div>
              </StepperItem>
              {index < steps.length - 1 && (
                <StepperSeparator className={`flex-1 ${isGridMode ? 'mx-1 max-w-4' : 'mx-2 lg:mx-4'}`} />
              )}
            </React.Fragment>
          );
        })}
      </Stepper>
    </div>
  )
}
