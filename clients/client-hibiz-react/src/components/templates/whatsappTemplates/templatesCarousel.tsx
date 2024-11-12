import { memo, useCallback } from "react";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import diwali from "@/assets/whatzapp/diwali.jpg";
import ShimmerImage from "../shimmer";

const MemoTemplatesCarousel = () => {
  const {
    setStep,
    setTemplateSteps,
    setTemplateData,
    setPreDefinedTemplate,
    allTemplates,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    setTemplateData: s.setTemplateData,
    setPreDefinedTemplate: s.setPreDefinedTemplate,
    allTemplates: s.allTemplates,
  }));
  const handleTemplateClick = useCallback(
    (template: WhatsAppTemplatePayload) => {
      setTemplateData(template);
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.MODIFY);
      setPreDefinedTemplate(true);
    },
    [setStep, setTemplateData, setTemplateSteps, setPreDefinedTemplate],
  );
  return (
    <>
      {allTemplates?.map((template) => (
        <div className="px-2 md:w-full md:px-0" key={template.id}>
          <section
            className={cn(
              template?.status === "REJECTED"
                ? "opacity-75 pointer-events-none"
                : "cursor-pointer",
              "overflow-hidden transition-shadow duration-300 max-w-full max-h-[240px] md:max-w-[240px] md:max-h-[170px] bg-white rounded-lg shadow-md hover:shadow-lg md:h-full",
            )}
            onClick={() => handleTemplateClick(template)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleTemplateClick(template)
            }
            aria-label={`Select ${template.name} template`}
          >
            <article className="relative h-full">
              <article className="absolute top-0 left-0 right-0 px-2 py-1 z-1">
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-semibold text-white rounded-full",
                    template?.status === "APPROVED"
                      ? "bg-green-500"
                      : "bg-red-500",
                  )}
                >
                  {template?.status}
                </span>
              </article>
              <ShimmerImage
                src={
                  template?.components?.[0]?.example?.header_handle?.[0] ||
                  diwali
                }
                alt={template.name || "Template"}
                className="max-w-full max-h-[240px] md:max-w-[240px] md:max-h-[170px] object-cover w-full h-full"
              />
              <article className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-lg font-semibold text-white truncate">
                  {template.name}
                </h3>
              </article>
            </article>
          </section>
        </div>
      ))}
    </>
  );
};

const TemplatesCarousel = memo(MemoTemplatesCarousel);
export default TemplatesCarousel;
