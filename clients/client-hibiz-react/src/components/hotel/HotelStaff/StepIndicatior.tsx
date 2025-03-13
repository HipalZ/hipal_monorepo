import { memo } from "react"

interface StepIndicatorProps {
  currentStep: number
  steps: { id: number; label: string }[]
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="relative flex items-center justify-between mb-6">
      {steps.map((step) => (
        <div key={step.id} className="z-10 flex flex-col items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${
                currentStep === step.id
                  ? "bg-primary text-base-100"
                  : currentStep > step.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }
            `}
          >
            {step.id}
          </div>
          <span className="mt-1 text-xs">{step.label}</span>
        </div>
      ))}

      {/* Connecting lines */}
      <div className="absolute left-0 right-0 flex justify-center">
        <div className="flex w-full px-4">
          {steps.slice(0, -1).map((_, index) => (
            <div
              key={index}
              className={`h-0.5 flex-1 mt-4 ${currentStep > index + 1 ? "bg-primary" : "bg-muted"}`}
              style={{
                marginLeft: index === 0 ? "12px" : "0px",
                marginRight: index === steps.length - 2 ? "12px" : "0px",
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(StepIndicator)

