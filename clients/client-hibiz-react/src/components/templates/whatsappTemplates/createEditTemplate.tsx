import { memo, lazy, useCallback, useRef, type FormEvent } from "react";
import useWhatsapp, {
  ActionType,
  HeaderInterface,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { useCreatingTemplate, useEditingTemplate } from "@/hooks/useTemplates";
import useBusinessData from "@/components/store/useBusinessData";
import type {
  CropperRef,
  WhatsAppTemplate,
} from "@/components/types/businessData";
import toast from "react-hot-toast";
import PopUp from "@/components/atom/popUp";
import EasyReactCropper from "@/components/cropper/cropper";
import { useWhatzappCroppedImg } from "@/components/helpers/whatzAppHelpers";
import CallOfAction from "./callOfAction";
import TemplateButtons from "./templateButtons";

const SuccessPopup = lazy(() => import("./successPopup"));
const Content = lazy(() => import("./content"));
const ShowOptionsToSend = lazy(() => import("./showOptionsToSend"));
const StepHeader = lazy(() => import("./stepHeader"));
const SendTemplate = lazy(() => import("./sendTemplate"));
const TemplatePreview = lazy(() => import("./templatePreview"));
const PreDefinedContent = lazy(() => import("./preDefinedContent"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const MemoCreateEditTemplate = () => {
  const { businessId } = useBusinessData((s) => ({
    businessId: s.businessData?._id,
  }));

  const {
    templateName,
    templateType,
    headerType,
    headerText,
    bodyText,
    footerText,
    variables,
    websiteUrl,
    buttonText,
    actionType,
    phoneNumber,
    templateSteps,
    setTemplateSteps,
    bodyVariableSequence,
    showCropper,
    setShowCropper,
    cropping,
    imageFiles,
    templateId,
    showSuccessPopup,
    setShowSuccessPopup,
  } = useWhatsapp((s) => ({
    templateId: s.templateId,
    templateName: s.templateName,
    templateType: s.templateType,
    headerType: s.headerType,
    headerText: s.headerText,
    bodyText: s.bodyText,
    footerText: s.footerText,
    variables: s.bodyVariables,
    websiteUrl: s.websiteUrl,
    buttonText: s.buttonText,
    actionType: s.actionType,
    phoneNumber: s.phoneNumber,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
    bodyVariableSequence: s.bodyVariableSequence,
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    cropping: s.cropping,
    imageFiles: s.imageFiles,
    showSuccessPopup: s.showSuccessPopup,
    setShowSuccessPopup: s.setShowSuccessPopup,
  }));

  const cropperRef = useRef<CropperRef>(null);
  const { handleCrop } = useWhatzappCroppedImg();

  const { createTemplate } = useCreatingTemplate();
  const { editTemplate } = useEditingTemplate();

  // handle form submit for create and edit template
  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("imageFiles", imageFiles);
    const imageUrl = {};
    console.log("imageUrl", imageUrl);

    // payload structure for create/edit template
    const payload = {
      businessId: businessId,
      name: templateName,
      language: "en_US",
      ...(templateId?.length > 0 && { templateId: templateId }),
      category: templateType,
      components: [
        ...(headerType && headerText
          ? [
              {
                type: "HEADER",
                format: headerType === HeaderInterface.Text ? "TEXT" : "IMAGE",
                ...(headerType === HeaderInterface.Text
                  ? { text: headerText }
                  : imageUrl && {
                      example: {
                        header_handle: [imageUrl],
                      },
                    }),
              },
            ]
          : []),
        {
          type: "BODY",
          text: bodyText,
          ...(variables.length > 0 && { example: { body_text: [variables] } }),
        },
        ...(footerText
          ? [
              {
                type: "FOOTER",
                text: footerText,
              },
            ]
          : []),
        ...(buttonText && (websiteUrl || phoneNumber)
          ? [
              {
                type: "BUTTONS",
                buttons: [
                  actionType === ActionType.VisitWebsite
                    ? {
                        type: "URL",
                        text: buttonText,
                        url: websiteUrl,
                      }
                    : {
                        type: "PHONE_NUMBER",
                        text: buttonText,
                        phone_number: `+91${phoneNumber}`,
                      },
                ],
              },
            ]
          : []),
      ],
      bodyVariableSequence: bodyVariableSequence,
    };

    let response;
    if (templateId?.length > 0) {
      response = await editTemplate(payload as unknown as WhatsAppTemplate);
    } else {
      response = await createTemplate(payload as unknown as WhatsAppTemplate);
    }
    if (response?.data?.status !== "REJECTED") {
      setShowSuccessPopup(true);
    } else {
      toast.error("Template creation rejected please contact support");
    }
  };

  // proceed forward after success popup
  const handleProceed = useCallback(() => {
    setShowSuccessPopup(false);
    setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
  }, [setTemplateSteps, setShowSuccessPopup]);

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
      <TemplateButtons />
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
      {showSuccessPopup && (
        <SuccessPopup
          show={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          onProceed={handleProceed}
        />
      )}
    </form>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
