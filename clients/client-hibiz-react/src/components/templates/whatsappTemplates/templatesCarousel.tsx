import diwali from '@/assets/whatzapp/diwali.jpg';
import useWhatsapp from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { WhatsAppTemplatePayload } from '@/components/types/businessData';
import { cn } from '@/components/utils/helper';
import { lazy, memo, useCallback } from 'react';
import ShimmerImage from '../shimmer';

const OpenConfirmEdit = lazy(() => import('./openConfirmEdit'));

const renderMediaPreview = (template: WhatsAppTemplatePayload) => {
  const header = template?.components?.[0];
  const format = header?.format;
  const url = header?.example?.header_handle?.[0] || diwali;

  switch (format) {
    case 'IMAGE':
      return (
        <ShimmerImage
          src={url}
          alt={template?.name || 'Template'}
          className="h-full max-h-[400px] w-full max-w-full object-cover md:max-w-[240px] lg:max-h-[400px]"
        />
      );

    case 'VIDEO':
      return (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full max-h-[400px] w-full max-w-full rounded-lg object-cover md:max-w-[240px] lg:max-h-[400px]"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );

    case 'DOCUMENT':
      return (
        <div className="relative h-full max-h-[400px] w-full max-w-full overflow-hidden rounded-lg md:max-w-[240px] lg:max-h-[400px]">
          <iframe src={url} title="Document Preview" className="pointer-events-none h-full w-full rounded-lg border-0" />
          <div className="pointer-events-none absolute inset-0 bg-transparent" />
        </div>
      );

    case 'AUDIO':
      return (
        <div className="flex h-full items-center justify-center bg-gray-200">
          <audio controls src={url} className="w-full px-4" />
        </div>
      );

    default:
      return <ShimmerImage src={diwali} alt="Fallback Template" className="h-full max-h-[400px] w-full max-w-full object-cover" />;
  }
};

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
      {Array.isArray(allTemplates) && allTemplates.length > 0 ? (
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
                {/* Status Badge */}
                <article className="absolute left-0 right-0 top-0 z-10 px-2 py-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-semibold text-white',
                      template?.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500',
                    )}
                  >
                    {template?.status}
                  </span>
                </article>

                {/* Dynamic Media Preview */}
                {renderMediaPreview(template)}

                {/* Title */}
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
