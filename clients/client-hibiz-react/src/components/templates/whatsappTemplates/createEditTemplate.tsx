import LoadingSpinner from '@/components/atom/loadingSpinner';
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

const MemoCreateEditTemplate = () => {
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const showSuccessPopup = useWhatsapp((s) => s.showSuccessPopup);
  const templateStatus = useWhatsapp((s) => s.templateStatus);
  const confirmCreate = useWhatsapp((s) => s.confirmCreate);
  const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);

  // handle form submit for create and edit template
  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmCreate(true);
  };

  // proceed forward after success popup
  const isLoading = useWhatsappTempStore((s) => s.isLoading);

  return (
    <form onSubmit={handleSubmitReview}>
      <div className="container p-3 pb-24 font-sans lg:p-4">
        <StepHeader />
        <div className="grid gap-8 md:mt-4 md:grid-cols-2">
          <TemplatePreview />
          {templateSteps === TemplateSteps.CREATE_EDIT && (
            <section>
              <Content />
              <CallOfAction />
            </section>
          )}
          {templateSteps === TemplateSteps.SHOW_OPTIONS && <ShowOptionsToSend />}
          {templateSteps === TemplateSteps.SEND && <SendTemplate />}
        </div>
      </div>
      {templateStatus === 'REJECTED' ? (
        <center className="text-red-500">Your template is rejected first update the template before proceeding</center>
      ) : null}
      <TemplateButtons />
      {showSuccessPopup && <SuccessPopup />}
      {confirmCreate ? <TemplateTerms /> : null}
      {isLoading && <LoadingSpinner />}
    </form>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
