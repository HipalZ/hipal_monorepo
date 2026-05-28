import useWhatsapp, { TemplateSteps } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { lazy, memo, type FormEvent } from 'react';

const CallOfAction = lazy(() => import('./callOfAction'));
const TemplateButtons = lazy(() => import('./templateButtons'));
const TemplateTerms = lazy(() => import('./templateTerms'));
const SuccessPopup = lazy(() => import('./successPopup'));
const Content = lazy(() => import('./content'));
const ShowOptionsToSend = lazy(() => import('./showOptionsToSend'));
const StepHeader = lazy(() => import('./stepHeader'));
const SendTemplate = lazy(() => import('./sendTemplate'));
const TemplatePreview = lazy(() => import('./templatePreview'));
const TemplateLoader = lazy(() => import('./templateLoader'));

const MemoCreateEditTemplate = () => {
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const showSuccessPopup = useWhatsapp((s) => s.showSuccessPopup);
  const confirmCreate = useWhatsapp((s) => s.confirmCreate);
  const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);
  const isLoading = useWhatsappTempStore((s) => s.isLoading);

  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmCreate(true);
  };

  return (
    <form onSubmit={handleSubmitReview} className="flex min-h-screen flex-col bg-gray-50/50">
      {/* 1. Fixed Header Area (Optional, if StepHeader isn't sticky) */}
      <div className="container mx-auto px-4 pt-6">
        <StepHeader />
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="container mx-auto mt-8 flex-grow px-4 pb-32">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="sticky top-8 hidden self-start transition-all lg:col-span-5 lg:block">
            <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-gray-200 bg-gray-100 p-8 shadow-inner">
              <TemplatePreview />
            </div>
            <p className="mt-4 text-center text-sm text-gray-400">Live Preview</p>
          </div>
          <div className="lg:col-span-7">
            <div className="mb-8 flex justify-center lg:hidden">
              <TemplatePreview />
            </div>

            {templateSteps === TemplateSteps.CREATE_EDIT && (
              <div className="space-y-6">
                <Content />
                <CallOfAction />
              </div>
            )}

            {templateSteps === TemplateSteps.SHOW_OPTIONS && <ShowOptionsToSend />}
            {templateSteps === TemplateSteps.SEND && <SendTemplate />}
          </div>
        </div>
      </div>
      <TemplateButtons />

      {/* Modals */}
      {showSuccessPopup && <SuccessPopup />}
      {confirmCreate && <TemplateTerms />}
      {isLoading && <TemplateLoader />}
    </form>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
