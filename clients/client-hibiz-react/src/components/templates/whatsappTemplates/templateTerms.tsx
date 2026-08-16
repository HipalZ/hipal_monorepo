import MiddlePopUp from '@/components/atom/middlePopUp';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { ActionType, HeaderInterface } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { WhatsAppTemplatePayload } from '@/components/types/businessData';
import { useCreateTemplate, useEditTemplate, useMediaUpload } from '@/hooks/useTemplates';
import { memo, useCallback, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const clean = (s?: string | null, max = 1024) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, Math.max(0, max));

export const cap = (s?: string | null, max = 25) => {
  const t = clean(s, max);
  return t || undefined;
};

export const httpsUrl = (u?: string | null) => {
  const t = (u ?? '').trim();
  if (!t) return undefined;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

// Normalizes to E.164; if no country code, uses IN by default.
export const e164 = (p?: string | null, defaultCC = '91') => {
  const raw = (p ?? '').trim();

  // strip spaces, dashes, parentheses
  let t = raw.replace(/[^\d+]/g, '');

  // handle "00" international prefix (e.g., 0091...)
  if (t.startsWith('00')) t = `+${t.slice(2)}`;

  // if it already starts with +, keep it
  if (t.startsWith('+')) return t;

  // if it starts with country code digits (e.g., 91...) and length > 10, keep it
  if (t.startsWith(defaultCC) && t.length > 10) return `+${t}`;

  // otherwise assume local number -> prepend default CC
  return `+${defaultCC}${t}`;
};

const buildButton = ({
  actionType,
  text,
  url,
  phone,
  flowId,
}: {
  actionType: ActionType;
  text?: string | null;
  url?: string | null;
  phone?: string | null;
  flowId?: string | null;
}) => {
  const label = cap(text, 25);

  switch (actionType) {
    case ActionType.VisitWebsite: {
      const finalUrl = httpsUrl(url);
      if (label && finalUrl) {
        return {
          type: 'URL',
          text: label,
          url: finalUrl,
          ...(finalUrl.includes('{{') ? { example: ['A9xK2'] } : {}),
        };
      }
      break;
    }

    case ActionType.MarketingOptOut: {
      if (label) return { type: 'QUICK_REPLY', text: label };
      break;
    }

    case ActionType.Flow: {
      if (label && flowId) return { type: 'FLOW', text: label, flow_id: flowId };
      break;
    }

    case ActionType.CallUs: {
      const phone_number = e164(phone);
      if (label && phone_number) return { type: 'PHONE_NUMBER', text: label, phone_number };
      break;
    }

    default:
      return null;
  }

  return null;
};

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
  const firstActionType = useWhatsapp((s) => s.firstActionType);
  const secondActionType = useWhatsapp((s) => s.secondActionType);
  const phoneNumber = useWhatsapp((s) => s.phoneNumber);
  const secondWebsiteUrl = useWhatsapp((s) => s.secondWebsiteUrl);
  const secondPhoneNumber = useWhatsapp((s) => s.secondPhoneNumber);
  const bodyVariableSequence = useWhatsapp((s) => s.bodyVariableSequence);
  const setTemplateError = useWhatsapp((s) => s.setTemplateError);
  const templateId = useWhatsapp((s) => s.templateId);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const confirmCreate = useWhatsapp((s) => s.confirmCreate);
  const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);

  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const flow = useWhatsappTempStore((s) => s.flow);
  // calling media api
  const { uploadMedia } = useMediaUpload();

  const handleConfirmPopUp = useCallback(async () => {
    // Clear any previous error so the retry starts clean.
    setTemplateError(null);

    // Pre-flight: Meta rejects bodies that start or end with a placeholder.
    // Plus a couple of cheap local checks so the user gets fast feedback.
    const trimmedBody = (bodyText ?? '').trim();
    if (!templateName || templateName.trim().length < 3) {
      setTemplateError('Template name must be at least 3 characters.');
      return;
    }
    if (trimmedBody.length < 24) {
      setTemplateError('Message body is too short (minimum 24 characters).');
      return;
    }
    if (/^\{\{(?:\d+|[a-zA-Z_][\w]*)\}\}/.test(trimmedBody)) {
      setTemplateError('The message body cannot START with a variable. Add some text before the first {{...}} placeholder.');
      return;
    }
    if (/\{\{(?:\d+|[a-zA-Z_][\w]*)\}\}\s*$/.test(trimmedBody)) {
      setTemplateError('The message body cannot END with a variable. Add some text after the last {{...}} placeholder.');
      return;
    }

    setIsLoading(true);
    let whatsappImageHandler = imagePreview || '';

    if (
      (headerType === HeaderInterface.Image ||
        headerType === HeaderInterface.Video ||
        headerType === HeaderInterface.Document ||
        headerType === HeaderInterface.Audio) &&
      imagePreview.length > 0
    ) {
      const { handle } = await uploadMedia();
      whatsappImageHandler = handle;
    }

    const components: any[] = [];
    // HEADER
    if (headerType === HeaderInterface.Text) {
      const header = clean(headerText, 60);
      if (header) {
        components.push({
          type: 'HEADER',
          format: 'TEXT',
          text: header,
        });
      }
    }

    // 🖼️ IMAGE or 🎞️ VIDEO
    else if ((headerType === HeaderInterface.Image || headerType === HeaderInterface.Video) && whatsappImageHandler) {
      components.push({
        type: 'HEADER',
        format: headerType === HeaderInterface.Image ? 'IMAGE' : 'VIDEO',
        example: { header_handle: [whatsappImageHandler] },
      });
    }

    // 📄 DOCUMENT
    else if (headerType === HeaderInterface.Document && whatsappImageHandler) {
      components.push({
        type: 'HEADER',
        format: 'DOCUMENT',
        example: { header_handle: [whatsappImageHandler] },
      });
    }

    // 🎧 AUDIO (optional, if you plan to support later)
    else if (headerType === HeaderInterface.Audio && whatsappImageHandler) {
      components.push({
        type: 'HEADER',
        format: 'AUDIO',
        example: { header_handle: [whatsappImageHandler] },
      });
    }

    // BODY (required)
    const body = bodyText;
    const bodyComp: any = { type: 'BODY', text: body };
    const bodyVars = Array.isArray(variables) ? variables.map((v) => clean(v) || '') : [];
    if (bodyVars.length > 0) bodyComp.example = { body_text: [bodyVars] };
    components.push(bodyComp);

    // FOOTER (optional)
    const footer = businessName ? clean(`Powered by ${businessName}`, 60) : '';
    if (footer) components.push({ type: 'FOOTER', text: footer });
    // BUTTONS (optional)
    const buttons: any[] = [];

    const firstButton = buildButton({
      actionType: firstActionType,
      text: buttonText,
      url: websiteUrl,
      phone: phoneNumber,
      flowId: flow?.id,
    });

    if (firstButton) buttons.push(firstButton);

    const secondButton = buildButton({
      actionType: secondActionType,
      text: secondButtonText,
      url: secondWebsiteUrl,
      phone: secondPhoneNumber,
      flowId: flow?.id,
    });

    if (secondButton) buttons.push(secondButton);

    if (buttons.length > 0) components.push({ type: 'BUTTONS', buttons });
    const buttonVariableSequence = buttons
      .filter((button) => button.type === 'URL' && button.url?.includes('{{'))
      .map((_, index) => `button${index + 1}`);

    // Only send `imageUrl` if we have a real HTTPS URL — never base64 or a
    // blob: URL (those are local-only and would be useless on the backend).
    const safeImageUrl =
      imagePreview && /^https?:\/\//i.test(imagePreview) ? imagePreview : undefined;

    // FINAL payload
    const payload: WhatsAppTemplatePayload = {
      businessId,
      name: templateName,
      language: 'en_GB',
      ...(templateId?.length ? { templateId } : {}),
      category: templateType,
      components,
      ...(safeImageUrl ? { imageUrl: safeImageUrl } : {}),
      ...(Array.isArray(bodyVariableSequence) ? { bodyVariableSequence } : {}),
      ...(buttonVariableSequence.length ? { buttonVariableSequence } : {}),
    };
    try {
      if (templateId?.length > 0) {
        await editTemplate(payload);
      } else {
        await createTemplate(payload);
      }
    } catch (err: any) {
      // Mutation hooks already surface the error via setTemplateError. As a
      // final safety net, capture anything that escaped (sync throw, etc.).
      setTemplateError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    phoneNumber,
    templateId,
    uploadMedia,
    setTemplateError,
    bodyVariableSequence,
    createTemplate,
    editTemplate,
    setIsLoading,
    imagePreview,
    secondButtonText,
    firstActionType,
    secondActionType,
    secondPhoneNumber,
    secondWebsiteUrl,
    flow?.id,
  ]);

  const [isAccepted, setIsAccepted] = useState(false);

  return (
    <MiddlePopUp show={confirmCreate} onlyPopUp>
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="h-20 bg-gradient-to-r from-[#075E54] to-[#25D366] text-white">
          <center className="h-full py-2 text-center text-2xl font-bold">
            Whatzapp Meta template <br />
            <span className="text-sm">Terms and Conditions</span>
          </center>
        </div>

        <div className="p-2">
          <p className="mb-4 flex items-center text-gray-600">
            <FiAlertCircle className="mr-2 text-yellow-500" />
            Please read and accept the following terms before creating a template.
          </p>

          <div className="custom-scrollbar mb-6 h-[250px] overflow-y-auto rounded-lg border p-4">
            <div className="space-y-4">
              <p className="font-semibold">By creating a WhatsApp Meta template, you agree to the following terms and conditions:</p>

              <ol className="list-decimal space-y-3 pl-5">
                {[
                  'Templates can only be edited once every 24 hours. Plan carefully before making changes.',
                  "Every new or updated template must undergo WhatsApp Meta's approval process, which may take up to 24-48 hours.",
                  "All template content must comply with WhatsApp's Business Policy and Community Standards. Violating content may result in rejection or account suspension.",
                  'No Promotional Content: Templates should not be used for unsolicited promotions or spam.',
                  'Use dynamic placeholders (e.g., 1, 2) responsibly to personalize messages. They cannot contain sensitive personal data.',
                  'Body text is limited to 1024 characters, including spaces and variables. Ensure the text remains within the specified character limits.',
                  'Approval Process: All templates are subject to review and approval by WhatsApp before they can be used.',
                  'Rejection: WhatsApp reserves the right to reject any template that violates its policies or guidelines. Rejected templates cannot be reused.',
                  'Usage Limits: There may be limits on the number of templates you can create or use, based on your account type.',
                  'Template Expiry: Unused templates may expire after a certain period. Regular use keeps them active.',
                  'Quality Score: Your template quality score affects your ability to send messages and create new templates.',
                  'Sending templates via WhatsApp may incur message charges based on your region and pricing plan.',
                  "Modifications: WhatsApp may modify these terms at any time. It's your responsibility to stay informed of any changes.",
                ].map((item, index) => (
                  <li key={index?.toString()} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ol>

              <p className="mt-6 font-semibold">
                By accepting these terms, you acknowledge that you have read, understood, and agree to abide by these conditions when creating and
                using WhatsApp Meta templates.
              </p>
            </div>
          </div>
          <label className="mx-4 flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
            />
            <span className="ml-2 text-gray-700">I accept the terms and conditions</span>
          </label>
        </div>

        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setConfirmCreate(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className={`rounded-md px-4 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAccepted ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'cursor-not-allowed bg-gray-400'
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
