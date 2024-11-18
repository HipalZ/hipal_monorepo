import { lazy, memo, useCallback } from "react";
import useWhatsapp from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import diwali from "@/assets/whatzapp/diwali.jpg";
import ShimmerImage from "../shimmer";

const OpenConfirmEdit = lazy(() => import("./openConfirmEdit"));

const MemoTemplatesCarousel = () => {
  const {
    setTemplateData,
    allTemplates,
    setShowSuccessPopup,
    isOpenEditModal,
    setIsOpenEditModal,
  } = useWhatsapp((s) => ({
    setTemplateData: s.setTemplateData,
    allTemplates: s.allTemplates,
    setShowSuccessPopup: s.setShowSuccessPopup,
    isOpenEditModal: s.isOpenEditModal,
    setIsOpenEditModal: s.setIsOpenEditModal,
  }));

  const handleTemplateClick = useCallback(
    (template: WhatsAppTemplatePayload) => {
      setTemplateData(template);
      setIsOpenEditModal(true);
      setShowSuccessPopup(false);
    },
    [setTemplateData, setShowSuccessPopup, setIsOpenEditModal],
  );

  return (
    <>
      {Array?.isArray(allTemplates) && allTemplates.length > 0 ? (
        allTemplates.map((template) => (
          <div className="px-2 md:w-full md:px-0" key={template.id}>
            <section
              className={cn(
                template?.status === "REJECTED"
                  ? "opacity-75 pointer-events-none"
                  : "cursor-pointer",
                "overflow-hidden transition-shadow duration-300 max-w-full max-h-[240px] md:max-w-[240px] lg:max-h-[170px] bg-white rounded-lg shadow-md hover:shadow-lg md:h-full",
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
                  className="max-w-full max-h-[400px] md:max-w-[240px] lg:max-h-[400px] object-cover w-full h-full"
                />
                <article className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {template.name}
                  </h3>
                </article>
              </article>
            </section>
          </div>
        ))
      ) : (
        <center>No templates available</center>
      )}
      {isOpenEditModal && <OpenConfirmEdit />}
    </>
  );
};

const TemplatesCarousel = memo(MemoTemplatesCarousel);
export default TemplatesCarousel;
