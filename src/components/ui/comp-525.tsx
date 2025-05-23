import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

const steps = [
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
]

export default function MilestoneStepperComponent() {
  return (
    <div className="space-y-8 text-center w-full">
      <Stepper defaultValue={2} className="w-full !flex justify-between items-center">
        {steps.map(({ step, title, description }, index) => (
          <>
            <StepperItem
              key={step}
              step={step}
              className="max-md:items-start flex-shrink-0"
            >
              <StepperTrigger className="gap-4 rounded max-md:flex-col">
                <StepperIndicator />
                <div className="text-center md:-order-1 md:text-left">
                  <StepperTitle>{title}</StepperTitle>
                  <StepperDescription className="max-sm:hidden">
                    {description}
                  </StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            {index < steps.length - 1 && (
              <StepperSeparator className="flex-1 mx-4" />
            )}
          </>
        ))}
      </Stepper>
    </div>
  )
}
