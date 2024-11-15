import MiddlePopUp from "@/components/atom/middlePopUp";
import useBusinessData from "@/components/store/useBusinessData";
import { useTempStore } from "@/components/store/useTempStore";
import useWhatsapp, {
  ActionType,
  HeaderInterface,
} from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import {
  useCreateTemplate,
  useEditTemplate,
  useMediaUpload,
} from "@/hooks/useTemplates";
import { memo, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const MemoTemplateTerms = () => {
  const { businessId } = useBusinessData((s) => ({
    businessId: s.businessData?._id,
  }));
  const { createTemplate } = useCreateTemplate();
  const { editTemplate } = useEditTemplate();
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
    bodyVariableSequence,
    templateId,
    setShowSuccessPopup,
    confirmCreate,
    setConfirmCreate,
    imagePreview,
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
    bodyVariableSequence: s.bodyVariableSequence,
    setShowSuccessPopup: s.setShowSuccessPopup,
    confirmCreate: s.confirmCreate,
    setConfirmCreate: s.setConfirmCreate,
    imagePreview: s.imagePreview,
  }));

  const { setIsLoading } = useTempStore((s) => ({
    setIsLoading: s.setIsLoading,
  }));
  // calling media api
  const { uploadMedia } = useMediaUpload();

  const handleConfirmPopUp = useCallback(async () => {
    if (!businessId) return;
    if (variables.includes("")) {
      toast.error("Please select a variable");
      return;
    }
    // Step 1: Upload media if required
    setIsLoading(true);
    let whatsappImageHandler = imagePreview || "";
    let storageImageUrl = "";
    if (
      headerType === HeaderInterface.Image &&
      imagePreview.length > 0 &&
      imagePreview.includes("data:")
    ) {
      const { url, handle } = await uploadMedia();
      whatsappImageHandler = handle;
      storageImageUrl = url;
    }
    // Step 2: Prepare the payload
    const payload: WhatsAppTemplatePayload = {
      businessId: businessId,
      name: templateName,
      language: "en_US",
      ...(templateId?.length > 0 && { templateId: templateId }),
      category: templateType,
      components: [
        ...(headerType
          ? [
              {
                type: "HEADER",
                format: headerType === HeaderInterface.Text ? "TEXT" : "IMAGE",
                ...(headerType === HeaderInterface.Text
                  ? { text: headerText }
                  : {
                      example: { header_handle: [whatsappImageHandler] },
                    }),
              },
            ]
          : []),
        {
          type: "BODY",
          text: bodyText,
          ...(variables.length > 0 && {
            example: { body_text: [variables] },
          }),
        },
        ...(footerText ? [{ type: "FOOTER", text: footerText }] : []),
        ...(buttonText && (websiteUrl || phoneNumber)
          ? [
              {
                type: "BUTTONS",
                buttons: [
                  actionType === ActionType.VisitWebsite
                    ? { type: "URL", text: buttonText, url: websiteUrl }
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
      ...(storageImageUrl && { imageUrl: storageImageUrl }),
      bodyVariableSequence: bodyVariableSequence,
    };
    console.log("payload", payload);
    // Step 3: Call the appropriate API (create or edit)
    if (templateId?.length > 0) {
      await editTemplate(payload);
    } else {
      await createTemplate(payload);
    }

    // Success: Update UI state
    setShowSuccessPopup(true);
    setIsLoading(false);
  }, [
    businessId,
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
    templateId,
    uploadMedia,
    setShowSuccessPopup,
    bodyVariableSequence,
    createTemplate,
    editTemplate,
    setIsLoading,
    imagePreview,
  ]);

  const [isAccepted, setIsAccepted] = useState(false);

  return (
    <MiddlePopUp show={confirmCreate} onlyPopUp>
      <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-2xl">
        <div className="h-20 text-white bg-gradient-to-r from-[#075E54] to-[#25D366]">
          <center className="h-full py-2 text-2xl font-bold text-center">
            Whatzapp Meta template <br />
            <span className="text-sm">Terms and Conditions</span>
          </center>
        </div>

        <div className="p-2">
          <p className="flex items-center mb-4 text-gray-600">
            <FiAlertCircle className="mr-2 text-yellow-500" />
            Please read and accept the following terms before creating a
            template.
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
              className="w-5 h-5 text-blue-600 transition duration-150 ease-in-out form-checkbox"
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
            className="px-4 py-2 text-gray-600 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className={`px-4 py-2 text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAccepted
                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                : "bg-gray-400 cursor-not-allowed"
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
