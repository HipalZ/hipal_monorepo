import useWhatsapp, { TemplateSteps } from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";
import { memo, useCallback } from "react";

const MemoStepHeader = () => {
  const { templateSteps, setTemplateSteps } = useWhatsapp((s) => ({
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
  }));

  const handleTemplateStep = useCallback(
    (step: TemplateSteps) => {
      setTemplateSteps(step);
    },
    [setTemplateSteps],
  );

  return (
    <nav aria-label="Progress" className="mb-8 overflow-x-auto">
      <ol className="flex text-sm font-medium">
        {templateSteps === TemplateSteps.MODIFY && (
          <li
            onClick={() => handleTemplateStep(TemplateSteps.MODIFY)}
            onKeyDown={() => handleTemplateStep(TemplateSteps.MODIFY)}
            className={cn(
              templateSteps === TemplateSteps.MODIFY
                ? "text-green-600"
                : "text-gray-400",
              "flex items-center ml-4 hover:cursor-pointer",
            )}
          >
            <span
              className={cn(
                templateSteps === TemplateSteps.MODIFY
                  ? "bg-green-600 border border-green-600 text-white"
                  : "border border-gray-300",
                "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
              )}
            >
              1
            </span>
            <span>Modify template</span>
          </li>
        )}
        {templateSteps === TemplateSteps.CREATE_EDIT && (
          <li
            onClick={() => handleTemplateStep(TemplateSteps.CREATE_EDIT)}
            onKeyDown={() => handleTemplateStep(TemplateSteps.CREATE_EDIT)}
            className={cn(
              templateSteps === TemplateSteps.CREATE_EDIT
                ? "text-green-600"
                : "text-gray-400",
              "flex items-center ml-4 hover:cursor-pointer",
            )}
          >
            <span
              className={cn(
                templateSteps === TemplateSteps.CREATE_EDIT
                  ? "bg-green-600 border border-green-600 text-white"
                  : "border border-gray-300",
                "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
              )}
            >
              1
            </span>
            <span>Create template</span>
          </li>
        )}
        <li className="flex items-center">
          <span className="w-8 ml-2 border-t-2 border-gray-300 border-dashed" />
        </li>
        <li
          onClick={() => handleTemplateStep(TemplateSteps.SHOW_OPTIONS)}
          onKeyDown={() => handleTemplateStep(TemplateSteps.SHOW_OPTIONS)}
          className={cn(
            templateSteps === TemplateSteps.SHOW_OPTIONS
              ? "text-green-600"
              : "text-gray-400",
            "flex items-center ml-4 hover:cursor-pointer",
          )}
        >
          <span
            className={cn(
              templateSteps === TemplateSteps.SHOW_OPTIONS
                ? "bg-green-600 border border-green-600 text-white"
                : "border border-gray-300",
              "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
            )}
          >
            2
          </span>
          <span>Show options</span>
        </li>
        <li className="flex items-center">
          <span className="w-8 ml-2 border-t-2 border-gray-300 border-dashed" />
        </li>
        <li
          onClick={() => handleTemplateStep(TemplateSteps.SEND)}
          onKeyDown={() => handleTemplateStep(TemplateSteps.SEND)}
          className={cn(
            templateSteps === TemplateSteps.SEND
              ? "text-green-600"
              : "text-gray-400",
            "flex items-center ml-4 hover:cursor-pointer",
          )}
        >
          <span
            className={cn(
              templateSteps === TemplateSteps.SEND
                ? "bg-green-600 border border-green-600 text-white"
                : "border border-gray-300",
              "flex items-center justify-center w-8 h-8 mr-2 p-4 rounded-full",
            )}
          >
            3
          </span>
          <span>Send template</span>
        </li>
      </ol>
    </nav>
  );
};

const StepHeader = memo(MemoStepHeader);
export default StepHeader;
