import { memo, lazy, useRef, type FormEvent, useState, useCallback } from "react";
import useWhatsapp, {
  ActionType,
  HeaderInterface,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import type { CropperRef } from "@/components/types/businessData";
import PopUp from "@/components/atom/popUp";
import EasyReactCropper from "@/components/cropper/cropper";
import { useWhatzappCroppedImg, httpsUrl, cap } from "@/components/helpers/whatzAppHelpers";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { useSafeTranslate, useMediaUpload } from "@/hooks/useTemplates";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";

const PayloadPreview = lazy(() => import("./payload-preview"));
const TemplatePreview = lazy(() => import("../templates/whatsappTemplates/templatePreview"));
const CallOfAction = lazy(() => import("../templates/whatsappTemplates/callOfAction"));
const ContentBuilder = lazy(() => import("./content-builder"));
const ShowOptionsToSend = lazy(() => import("../templates/whatsappTemplates/showOptionsToSend"));
const SendTemplate = lazy(() => import("../templates/whatsappTemplates/sendTemplate"));
const SuccessPopup = lazy(() => import("../templates/whatsappTemplates/successPopup"));
const TemplateButtons = lazy(() => import("../templates/whatsappTemplates/templateButtons"));
const TemplateTerms = lazy(() => import("./terms-conditions"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const StepHeader = lazy(() => import("../templates/whatsappTemplates/stepHeader"));

const MemoTemplateBuilder = () => {
  const businessId = useBusinessData((s) => s.businessId) || "";
  const businessName = useBusinessData((s) => s.businessName) || "";
  const templateStatus = useWhatsapp((s) => s.templateStatus);
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const showCropper = useWhatsapp((s) => s.showCropper);
  const setShowCropper = useWhatsapp((s) => s.setShowCropper);
  const cropping = useWhatsapp((s) => s.cropping);
  const showSuccessPopup = useWhatsapp((s) => s.showSuccessPopup);
  const confirmCreate = useWhatsapp((s) => s.confirmCreate);
  const templateName = useWhatsapp((s) => s.templateName);
  const templateType = useWhatsapp((s) => s.templateType);
  const headerType = useWhatsapp((s) => s.headerType);
  const headerText = useWhatsapp((s) => s.headerText);
  const bodyText = useWhatsapp((s) => s.bodyText);
  const variables = useWhatsapp((s) => s.bodyVariables);
  const websiteUrl = useWhatsapp((s) => s.websiteUrl);
  const buttonText = useWhatsapp((s) => s.buttonText);
  const actionType = useWhatsapp((s) => s.actionType);
  const phoneNumber = useWhatsapp((s) => s.phoneNumber);
  const bodyVariableSequence = useWhatsapp((s) => s.bodyVariableSequence);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);
  const selectedLangs = useWhatsapp((s) => s.selectedLangs);
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const flow = useWhatsappTempStore((s) => s.flow);
  const cropperRef = useRef<CropperRef>(null);
  const [previewPayloads, setPreviewPayloads] = useState([]);
  const { handleCrop } = useWhatzappCroppedImg();
  const { uploadMedia } = useMediaUpload();
  const safeTranslate = useSafeTranslate();
  const [showPreview, setShowPreview] = useState(false);

  const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);

  const handleOpenTerms = useCallback(() => {
    setConfirmCreate(true);
  }, [setConfirmCreate]);

  const templateId = useWhatsapp((s) => s.templateId);
  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let whatsappImageHandler = imagePreview || "";
    let storageImageUrl = "";
    if (
      headerType === HeaderInterface.Image &&
      imagePreview?.length > 0 &&
      imagePreview.includes("data:")
    ) {
      const { url, handle } = await uploadMedia();
      whatsappImageHandler = handle;
      storageImageUrl = url;
    }

    // Step 2: build all payloads per language
    const tasks = selectedLangs.map(async (lang) => {
      // translate relevant fields
      const translatedHeader =
        headerType === HeaderInterface.Text
          ? await safeTranslate(headerText, lang)
          : headerText;

      const translatedBody = await safeTranslate(bodyText, lang);
      const translatedFooter = businessName
        ? await safeTranslate(`Powered by ${businessName}`, lang)
        : "";

      const components: any[] = [];

      // header
      if (headerType === HeaderInterface.Text && translatedHeader) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: translatedHeader,
        });
      } else if (headerType === HeaderInterface.Image && whatsappImageHandler) {
        components.push({
          type: "HEADER",
          format: "IMAGE",
          example: { header_handle: [whatsappImageHandler] },
        });
      }

      // body
      const bodyComp: any = { type: "BODY", text: translatedBody };
      if (variables?.length > 0) {
        bodyComp.example = { body_text: [variables] };
      }
      components.push(bodyComp);

      // footer
      if (translatedFooter) components.push({ type: "FOOTER", text: translatedFooter });

      // buttons
      const buttons: any[] = [];
      switch (actionType) {
        case ActionType.VisitWebsite: {
          const text = cap(buttonText, 25);
          const url = httpsUrl(websiteUrl);
          if (text && url) buttons.push({ type: "URL", text, url });
          break;
        }
        case ActionType.MarketingOptOut: {
          const text = cap(secondButtonText || "Stop", 25);
          if (text) buttons.push({ type: "QUICK_REPLY", text });
          break;
        }
        case ActionType.Flow: {
          const text = cap(buttonText || "Continue", 25);
          const flow_id = flow?.id;
          if (text && flow_id) buttons.push({ type: "FLOW", text, flow_id });
          break;
        }
        case ActionType.CallUs: {
          const text = cap(buttonText, 25);
          const phone_number = e164(phoneNumber);
          if (text && phone_number)
            buttons.push({ type: "PHONE_NUMBER", text, phone_number });
          break;
        }
        default:
          break;
      }
      if (buttons.length > 0) components.push({ type: "BUTTONS", buttons });

      const payload: WhatsAppTemplatePayload = {
        businessId,
        name: `${templateName}_${lang}`,
        language: lang,
        ...(templateId?.length ? { templateId } : {}),
        category: templateType,
        components,
        ...(storageImageUrl ? { imageUrl: storageImageUrl } : {}),
        ...(bodyVariableSequence ? { bodyVariableSequence } : {}),
      };

      return payload;
    });

    const payloads = await Promise.all(tasks);
    console.log("All payloads:", payloads);
    setPreviewPayloads(payloads);
    setIsLoading(false);
    setShowPreview(true);
  };

  const isLoading = useWhatsappTempStore((s) => s.isLoading);

  return (
    <form onSubmit={handleSubmitReview}>
      <div className="container mx-auto max-w-[1400px] pt-4 p-3 pb-24 font-sans lg:p-4">
        <div className="md:pl-16">
          <StepHeader />
        </div>
        <div className="grid gap-8 md:mt-4 md:grid-cols-2">
          <TemplatePreview />
          {templateSteps === TemplateSteps.CREATE_EDIT && (
            <section>
              <ContentBuilder />
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
      {showPreview ? <PayloadPreview showPreview={showPreview} setShowPreview={setShowPreview} previewPayloads={previewPayloads} handleOpenTerms={handleOpenTerms} setPreviewPayloads={setPreviewPayloads} />
        : null}
      {confirmCreate ? <TemplateTerms previewPayloads={previewPayloads} /> : null}
      {isLoading && <LoadingSpinner />}
    </form>
  );
};

const TemplateBuilder = memo(MemoTemplateBuilder);
export default TemplateBuilder;
