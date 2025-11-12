import diwali from '@/assets/whatzapp/diwali.jpg';
import useWhatsapp from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { WhatsAppTemplatePayload } from '@/components/types/businessData';
import { cn } from '@/components/utils/helper';
import { lazy, memo, useCallback } from 'react';
import ShimmerImage from '../shimmer';

const OpenConfirmEdit = lazy(() => import('./openConfirmEdit'));

const MemoTemplatesCarousel = () => {
  const { setTemplateData, setShowSuccessPopup, isOpenEditModal, setIsOpenEditModal } = useWhatsapp((s) => ({
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
                template?.status === 'REJECTED' ? 'pointer-events-none opacity-75' : 'cursor-pointer',
                'max-h-[240px] max-w-full overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg md:h-full md:max-w-[240px] lg:max-h-[170px]',
              )}
              onClick={() => handleTemplateClick(template)}
              onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(template)}
              aria-label={`Select ${template.name} template`}
            >
              <article className="relative h-full">
                <article className="z-1 absolute left-0 right-0 top-0 px-2 py-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-semibold text-white',
                      template?.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500',
                    )}
                  >
                    {template?.status}
                  </span>
                </article>
                {template?.components?.[0]?.format === 'VIDEO' ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full max-h-[400px] w-full max-w-full rounded-lg object-cover md:max-w-[240px] lg:max-h-[400px]"
                  >
                    <source src={template?.components?.[0]?.example?.header_handle?.[0] || diwali} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <ShimmerImage
                    src={template?.components?.[0]?.example?.header_handle?.[0] || diwali}
                    alt={template?.name || 'Template'}
                    className="h-full max-h-[400px] w-full max-w-full object-cover md:max-w-[240px] lg:max-h-[400px]"
                  />
                )}
                <article className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="truncate text-lg font-semibold text-white">{template.name}</h3>
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
