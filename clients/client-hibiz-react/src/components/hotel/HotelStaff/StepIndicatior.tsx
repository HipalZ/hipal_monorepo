import { memo, useEffect, useRef, useState } from "react";

interface StepIndicatorProps {
  currentStep: number;
  steps: { id: number; label: string }[];
  onStepClick?: (stepId: number) => void;
}

const StepIndicator = ({
  currentStep,
  steps,
  onStepClick,
}: StepIndicatorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAllSteps, setShowAllSteps] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState(steps);

  // Check container width and decide whether to show all steps or a subset
  useEffect(() => {
    const checkWidth = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const stepWidth = 80; // Approximate width of each step (indicator + label)
      const totalStepsWidth = steps.length * stepWidth;

      if (totalStepsWidth > containerWidth) {
        setShowAllSteps(false);

        const importantStepIds = new Set([
          1, // First step
          steps.length, // Last step
          currentStep, // Current step
          currentStep - 1, // Previous step
          currentStep + 1, // Next step
        ]);

        // Filter to only include valid step IDs
        const filteredSteps = steps.filter(
          (step) =>
            importantStepIds.has(step.id) &&
            step.id >= 1 &&
            step.id <= steps.length,
        );

        setVisibleSteps(filteredSteps);
      } else {
        setShowAllSteps(true);
        setVisibleSteps(steps);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [steps, currentStep]);

  // Handle step click
  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId);
      return;
    }
  };

  // Get the display steps (either all steps or a subset)
  const displaySteps = showAllSteps ? steps : visibleSteps;

  return (
    <div
      ref={containerRef}
      className="relative px-4 overflow-x-auto hide-scrollbar"
    >
      <div className="flex items-center justify-between min-w-full">
        {displaySteps.map((step, index) => (
          <div key={step.id} className="z-10 flex flex-col items-center">
            {/* Step indicator */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
                ${
                  currentStep === step.id
                    ? "bg-primary text-base-100"
                    : currentStep > step.id
                      ? "bg-primary text-base-100"
                      : "bg-base-100 text-muted-foreground"
                }
              `}
              onClick={() => handleStepClick(step.id)}
            >
              {step.id}
            </div>

            {/* Step label */}
            <span
              className="mt-2 text-xs text-center max-w-[80px] truncate cursor-pointer"
              onClick={() => handleStepClick(step.id)}
            >
              {step.label}
            </span>

            {/* Ellipsis for skipped steps */}
            {!showAllSteps &&
              index < displaySteps.length - 1 &&
              displaySteps[index + 1].id - step.id > 1 && (
                <div
                  className="absolute mt-4 text-muted-foreground"
                  style={{
                    left: `calc(${
                      ((index + 0.5) * 100) / (displaySteps.length - 1)
                    }% - 8px)`,
                  }}
                >
                  •••
                </div>
              )}
          </div>
        ))}

        {/* Connecting lines */}
        <div className="absolute left-0 right-0 flex justify-center">
          <div className="flex w-full px-4">
            {displaySteps.slice(0, -1).map((step, index) => {
              const nextStep = displaySteps[index + 1];
              const isCompleted = currentStep > step.id;

              // Calculate width based on the gap between step IDs
              const stepGap = nextStep.id - step.id;
              const width = `${100 / (displaySteps.length - 1)}%`;

              return (
                <div
                  key={index}
                  className={`h-0.5 flex-1 mt-4 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                  style={{
                    width,
                    marginLeft: index === 0 ? "12px" : "0px",
                    marginRight:
                      index === displaySteps.length - 2 ? "12px" : "0px",
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StepIndicator);
