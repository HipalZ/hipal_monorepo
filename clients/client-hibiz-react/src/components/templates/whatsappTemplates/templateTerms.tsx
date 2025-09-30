import MiddlePopUp from "@/components/atom/middlePopUp";
import useBusinessData from "@/components/store/useBusinessData";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import useWhatsapp, {
  ActionType,
  HeaderInterface,
} from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import {
  useCreateTemplate,
  useEditTemplate,
  useMediaUpload,
  useSafeTranslate,
} from "@/hooks/useTemplates";
import { memo, useCallback, useState } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

// --- Main Component ---
const MemoTemplateTerms = () => {
  const { businessId, businessName } = useBusinessData((s) => ({
    businessId: s.businessData?._id,
    businessName: s.businessData?.name,
  }));
  const { createTemplate } = useCreateTemplate();
  const { editTemplate } = useEditTemplate();
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
  const templateId = useWhatsapp((s) => s.templateId);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const confirmCreate = useWhatsapp((s) => s.confirmCreate);
  const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);
  const selectedLangs = useWhatsapp((s) => s.selectedLangs);
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const flow = useWhatsappTempStore((s) => s.flow);

  const { uploadMedia } = useMediaUpload();
  const [isAccepted, setIsAccepted] = useState(false);

  const safeTranslate = useSafeTranslate();

  const handleConfirmPopUp = useCallback(async () => {
    setIsLoading(true);

    // Step 1: upload media if required
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

    for (const payload of payloads) {
      console.log("Submitting payload:", payload);
      if (templateId?.length > 0) {
        await editTemplate(payload);
      } else {
        await createTemplate(payload);
      }
    }

    setShowSuccessPopup(true);
    setIsLoading(false);
  }, [
    businessId,
    businessName,
    templateName,
    templateType,
    headerType,
    headerText,
    bodyText,
    variables,
    websiteUrl,
    buttonText,
    actionType,
    phoneNumber,
    templateId,
    uploadMedia,
    setShowSuccessPopup,
    bodyVariableSequence,
    createTemplate,
    editTemplate,
    setIsLoading,
    imagePreview,
    secondButtonText,
    flow,
    selectedLangs,
    safeTranslate,
  ]);

  return (
    <MiddlePopUp show={confirmCreate} onlyPopUp>
      <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-2xl">
        <div className="h-20 text-white bg-gradient-to-r from-[#075E54] to-[#25D366]">
          <center className="h-full py-2 text-2xl font-bold text-center">
            WhatsApp Meta Template <br />
            <span className="text-sm">Terms and Conditions</span>
          </center>
        </div>

        <div className="p-2">
          <p className="flex items-center mb-4 text-gray-600">
            <FiAlertCircle className="mr-2 text-yellow-500" />
            Please read and accept the following terms before creating a template.
          </p>
          <div className="h-[250px] overflow-y-auto border rounded-lg p-4 mb-6 custom-scrollbar">
            <div className="space-y-4">
              <p className="font-semibold">
                By creating a WhatsApp Meta template, you agree to the following
                terms and conditions:
              </p>

              <ol className="pl-5 space-y-3 list-decimal">
                {[
                  "Templates can only be edited once every 24 hours. Plan carefully before making changes.",
                  "Every new or updated template must undergo WhatsApp Meta's approval process, which may take up to 24-48 hours.",
                  "All template content must comply with WhatsApp's Business Policy and Community Standards. Violating content may result in rejection or account suspension.",
                  "No Promotional Content: Templates should not be used for unsolicited promotions or spam.",
                  "Use dynamic placeholders (e.g., 1, 2) responsibly to personalize messages. They cannot contain sensitive personal data.",
                  "Body text is limited to 1024 characters, including spaces and variables. Ensure the text remains within the specified character limits.",
                  "Approval Process: All templates are subject to review and approval by WhatsApp before they can be used.",
                  "Rejection: WhatsApp reserves the right to reject any template that violates its policies or guidelines. Rejected templates cannot be reused.",
                  "Usage Limits: There may be limits on the number of templates you can create or use, based on your account type.",
                  "Template Expiry: Unused templates may expire after a certain period. Regular use keeps them active.",
                  "Quality Score: Your template quality score affects your ability to send messages and create new templates.",
                  "Sending templates via WhatsApp may incur message charges based on your region and pricing plan.",
                  "Modifications: WhatsApp may modify these terms at any time. It's your responsibility to stay informed of any changes.",
                ].map((item, index) => (
                  <li key={index?.toString()} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ol>

              <p className="mt-6 font-semibold">
                By accepting these terms, you acknowledge that you have read,
                understood, and agree to abide by these conditions when creating
                and using WhatsApp Meta templates.
              </p>
            </div>
          </div>
          <label className="flex items-center mx-4 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-blue-600 form-checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
            />
            <span className="ml-2 text-gray-700">
              I accept the terms and conditions
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={() => setConfirmCreate(false)}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              setConfirmCreate(false);
              await handleConfirmPopUp();
            }}
            disabled={!isAccepted}
            className={`px-4 py-2 text-white rounded-md ${isAccepted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            <span className="flex items-center">
              <FiCheckCircle className="mr-2" />I Accept
            </span>
          </button>
        </div>
      </div>
    </MiddlePopUp>
  );
};

const TemplateTerms = memo(MemoTemplateTerms);
export default TemplateTerms;
