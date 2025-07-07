import { memo, useCallback } from "react";
import { CheckCircle, FileText, Users, Utensils } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  goToDirectStep: (step: number) => void;
}

const steps = [
  {
    number: 1,
    title: "Basic Info",
    icon: FileText,
  },
  {
    number: 2,
    title: "Assign Staff",
    icon: Users,
  },
  {
    number: 3,
    title: "Link Dishes",
    icon: Utensils,
  },
];

function StepIndicatorComponent({
  currentStep,
  goToDirectStep,
}: StepIndicatorProps) {
  const handleStepClick = useCallback(
    (step: number) => {
      goToDirectStep(step);
    },
    [goToDirectStep],
  );

  const progressBarWidth =
    steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 80 : 0;

  return (
    <div className="relative flex items-center justify-between mb-8 flex-1 w-full max-w-[30rem] overflow-hidden" >
      <div className="absolute left-8 w-[80%] right-0 top-[70%] -translate-y-1/2 h-1 bg-gray-200 rounded-full" />

      <div
        className="absolute left-8 top-[70%] overflow-hidden -translate-y-1/2 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${progressBarWidth}%` }}
      />

      {steps.map((stepItem) => {
        const isActive = currentStep === stepItem.number;
        const isCompleted = currentStep > stepItem.number;
        const StepIcon = stepItem.icon;

        return (
          <div
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleStepClick(stepItem.number);
              }
            }}
            onClick={() => handleStepClick(stepItem.number)}
            key={stepItem.number}
            className="z-10 flex flex-col items-center flex-1 cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full mt-1 flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? "bg-green-500 text-white shadow-lg"
                  : isActive
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <StepIcon className="w-6 h-6" />
              )}
            </div>
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-medium ${
                  isActive ? "text-primary" : "text-gray-600"
                }`}
              >
                {stepItem.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(StepIndicatorComponent);
