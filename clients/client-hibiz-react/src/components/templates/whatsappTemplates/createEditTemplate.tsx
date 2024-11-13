import { memo, lazy, useRef, type FormEvent } from "react";
import useWhatsapp, { TemplateSteps } from "@/components/store/useWhatsapp";
import type { CropperRef } from "@/components/types/businessData";
import PopUp from "@/components/atom/popUp";
import EasyReactCropper from "@/components/cropper/cropper";
import { useWhatzappCroppedImg } from "@/components/helpers/whatzAppHelpers";
import { useMediaUpload } from "@/hooks/useTemplates";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useTempStore } from "@/components/store/useTempStore";

const CallOfAction = lazy(() => import("./callOfAction"));
const TemplateButtons = lazy(() => import("./templateButtons"));
const TemplateTerms = lazy(() => import("./templateTerms"));
const SuccessPopup = lazy(() => import("./successPopup"));
const Content = lazy(() => import("./content"));
const ShowOptionsToSend = lazy(() => import("./showOptionsToSend"));
const StepHeader = lazy(() => import("./stepHeader"));
const SendTemplate = lazy(() => import("./sendTemplate"));
const TemplatePreview = lazy(() => import("./templatePreview"));
const PreDefinedContent = lazy(() => import("./preDefinedContent"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const MemoCreateEditTemplate = () => {
  const {
    templateSteps,
    showCropper,
    setShowCropper,
    cropping,
    showSuccessPopup,
    templateStatus,
    confirmCreate,
    setConfirmCreate,
  } = useWhatsapp((s) => ({
    templateSteps: s.templateSteps,
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    cropping: s.cropping,
    showSuccessPopup: s.showSuccessPopup,
    setShowSuccessPopup: s.setShowSuccessPopup,
    templateStatus: s.templateStatus,
    confirmCreate: s.confirmCreate,
    setConfirmCreate: s.setConfirmCreate,
  }));
  const cropperRef = useRef<CropperRef>(null);
  const { handleCrop } = useWhatzappCroppedImg();

  // handle form submit for create and edit template
  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmCreate(true);
  };

  // proceed forward after success popup
  const isLoading = useTempStore((s) => s.isLoading);

  return (
    <form onSubmit={handleSubmitReview}>
      <div className="container p-3 pb-24 font-sans lg:p-4">
        <StepHeader />
        <div className="grid gap-8 md:mt-4 md:grid-cols-2">
          <TemplatePreview />
          {templateSteps === TemplateSteps.MODIFY && (
            <section>
              <PreDefinedContent />
              <CallOfAction />
            </section>
          )}
          {templateSteps === TemplateSteps.CREATE_EDIT && (
            <section>
              <Content />
              <CallOfAction />
            </section>
          )}
          {templateSteps === TemplateSteps.SHOW_OPTIONS && (
            <ShowOptionsToSend />
          )}
          {templateSteps === TemplateSteps.SEND && <SendTemplate />}
        </div>
      </div>
      {templateStatus === "REJECTED" ? (
        <center className="text-red-500">
          Your template is rejected first update the template before proceeding
        </center>
      ) : null}
      <TemplateButtons />
      {showCropper && (
        <PopUp hide show={showCropper} onClose={() => setShowCropper(false)}>
          <section className="my-[10rem]">
            <EasyReactCropper
              key={cropping.image}
              image={cropping.image}
              ref={cropperRef}
              width={400}
              height={400}
            />
          </section>
          <BottomButton
            buttons={[
              {
                text: "Crop",
                onClick: () => handleCrop(cropperRef),
              },
              {
                text: "Cancel",
                onClick: () => setShowCropper(false),
                type: "button",
              },
            ]}
          />
        </PopUp>
      )}
      {showSuccessPopup && <SuccessPopup />}
      {confirmCreate ? <TemplateTerms /> : null}
      {isLoading && <LoadingSpinner />}
    </form>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
