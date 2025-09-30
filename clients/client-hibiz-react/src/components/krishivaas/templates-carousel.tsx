import { memo, useCallback } from "react";
import useWhatsapp from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import loyaltyImage from "@/assets/whatzapp/loyaltyImage.jpg";

// const OpenConfirmEdit = lazy(() => import("./openConfirmEdit"));

const MemoTemplatesCarousel = () => {
  const {
    setTemplateData,
    setShowSuccessPopup,
    isOpenEditModal,
    setIsOpenEditModal,
  } = useWhatsapp((s) => ({
    setTemplateData: s.setTemplateData,
    setShowSuccessPopup: s.setShowSuccessPopup,
    isOpenEditModal: s.isOpenEditModal,
    setIsOpenEditModal: s.setIsOpenEditModal,
  }));

  const { allTemplates } = useWhatsappTempStore((s) => ({
    allTemplates: s.allTemplates,
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
                "overflow-hidden transition-shadow duration-300 max-w-full max-h-[240px] md:max-w-[240px] lg:max-h-[170px] rounded-lg shadow-md hover:shadow-lg md:h-full",
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
                <img
                  src={
                    template?.components?.[0]?.example?.header_handle?.[0] || loyaltyImage
                  }
                  alt={template.name || "Template"}
                  className="max-w-full max-h-[400px] md:max-w-[240px] lg:max-h-[400px] object-cover w-full h-full"
                />
                <article className="absolute -bottom-2 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
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
      {/* {isOpenEditModal && <OpenConfirmEdit />} */}
    </>
  );
};

const TemplatesCarousel = memo(MemoTemplatesCarousel);
export default TemplatesCarousel;
