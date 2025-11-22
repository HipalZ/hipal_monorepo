import diwali from '@/assets/whatzapp/diwali.jpg';
import useWhatsapp from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { WhatsAppTemplatePayload } from '@/components/types/businessData';
import { cn } from '@/components/utils/helper';
import { lazy, memo, useCallback } from 'react';
import { BiFile, BiText } from 'react-icons/bi';
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

  const renderMediaPreview = (template: WhatsAppTemplatePayload) => {
    const format = template?.components?.[0]?.format;
    const handleUrl = template?.components?.[0]?.example?.header_handle?.[0] || '';
    const fallback = diwali;

    switch (format) {
      case 'TEXT':
        return (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100 text-gray-500">
            <span className="text-sm">{template?.components?.[0]?.text || 'Sample Text Header'}</span>
          </div>
        );

      case 'IMAGE':
        return (
          <ShimmerImage
            src={handleUrl || fallback}
            alt={template?.name || 'Template'}
            className="h-full max-h-[400px] w-full object-cover md:max-w-[240px] lg:max-h-[400px]"
          />
        );

      case 'VIDEO':
        return (
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            className="h-full max-h-[400px] w-full max-w-full rounded-lg object-cover md:max-w-[240px] lg:max-h-[400px]"
          >
            <source src={handleUrl || fallback} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );

      case 'DOCUMENT':
        return handleUrl.endsWith('.pdf') ? (
          <iframe src={handleUrl} title="Document Preview" className="h-full w-full rounded-lg bg-gray-50 object-contain" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100 text-gray-500">
            <BiFile className="mb-2 h-8 w-8" />
            <span className="text-sm font-medium">Document Attached</span>
          </div>
        );

      default:
        return (
          <div className="flex h-full flex-col items-center justify-center bg-gray-100 text-gray-500">
            <BiText className="mb-1 h-6 w-6" />
            <span className="text-sm">No Preview Available</span>
          </div>
        );
    }
  };

  return (
    <>
      {Array.isArray(allTemplates) && allTemplates.length > 0 ? (
        allTemplates.map((template) => (
          <div className="px-2 md:w-full md:px-0" key={template.id}>
            <section
              className={cn(
                template?.status === 'REJECTED' ? 'pointer-events-none opacity-75' : 'cursor-pointer',
                'max-h-[240px] min-h-[170px] max-w-full overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg md:h-full md:max-w-[240px] lg:max-h-[170px]',
              )}
              onClick={() => handleTemplateClick(template)}
              onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(template)}
              aria-label={`Select ${template.name} template`}
            >
              <article className="relative h-[170px] w-full">
                {/* Status badge */}
                <div className="absolute left-0 right-0 top-0 z-10 px-2 py-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-semibold text-white',
                      template?.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500',
                    )}
                  >
                    {template?.status}
                  </span>
                </div>

                {/* Media Preview */}
                {renderMediaPreview(template)}

                {/* Footer overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <h3 className="truncate text-sm font-semibold text-white">{template.name}</h3>
                </div>
              </article>
            </section>
          </div>
        ))
      ) : (
        <center className="mt-4 text-gray-500">No templates available</center>
      )}

      {isOpenEditModal && <OpenConfirmEdit />}
    </>
  );
};

const TemplatesCarousel = memo(MemoTemplatesCarousel);
export default TemplatesCarousel;
