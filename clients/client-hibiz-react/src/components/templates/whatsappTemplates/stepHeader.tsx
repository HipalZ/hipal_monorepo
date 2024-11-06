import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";
import { memo, useCallback } from "react";

const MemoStepHeader = () => {
  const { step, setStep } = useWhatsapp((s) => ({
    step: s.step,
    setStep: s.setStep,
  }));

  const handleStep = useCallback((step: Step) => {
    setStep(step);
  }, []);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex text-sm font-medium">
        <li
          onClick={() => handleStep(Step.SETUP)}
          onKeyDown={() => handleStep(Step.SETUP)}
          className={cn(
            step === Step.SETUP ? "text-blue-600" : "text-gray-400",
            "flex items-center hover:cursor-pointer",
          )}
        >
          <span
            className={cn(
              step === Step.SETUP
                ? "bg-blue-600 border border-blue-600 text-white"
                : "border border-gray-300",
              "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
            )}
          >
            1
          </span>
          <span>Set up template</span>
        </li>
        <li
          onClick={() => handleStep(Step.CREATE_EDIT)}
          onKeyDown={() => handleStep(Step.CREATE_EDIT)}
          className={cn(
            step === Step.CREATE_EDIT ? "text-blue-600" : "text-gray-400",
            "flex items-center ml-4 hover:cursor-pointer",
          )}
        >
          <span
            className={cn(
              step === Step.CREATE_EDIT
                ? "bg-blue-600 border border-blue-600 text-white"
                : "border border-gray-300",
              "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
            )}
          >
            2
          </span>
          <span>Create/Edit template</span>
        </li>
      </ol>
    </nav>
  );
};

const StepHeader = memo(MemoStepHeader);
export default StepHeader;
