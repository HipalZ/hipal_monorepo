import { memo, lazy } from "react";
import StepHeader from "./stepHeader";
import useWhatsapp, { ActionType } from "@/components/store/useWhatsapp";
import Content from "./content";
import { useCreateTemplate, useEditTemplate } from "@/hooks/useTemplates";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import type { WhatsAppTemplate } from "@/components/types/businessData";

const TemplatePreview = lazy(() => import("./templatePreview"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const MemoCreateEditTemplate = () => {
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
  } = useWhatsapp((s) => ({
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
  }));

  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("id");

  const { createTemplateApi } = useCreateTemplate();
  const { editTemplateApi } = useEditTemplate();
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.businessData?._id);

  const handleSubmitReview = async () => {
    // payload structure for create/edit template
    const payload = {
      name: templateName,
      language: "en_US",
      category: templateType,
      components: [
        ...(headerType && headerText
          ? [
              {
                type: "HEADER",
                format: headerType,
                text: headerText,
              },
            ]
          : []),
        {
          type: "BODY",
          text: bodyText,
          ...(variables.length > 0 && { example: { body_text: variables } }),
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
    };
    let response: any;
    if (templateId) {
      response = await editTemplateApi(payload as WhatsAppTemplate);
    } else {
      response = await createTemplateApi(payload as WhatsAppTemplate);
    }
    if (response?.status === 200) {
      return navigate(`/app/business/${businessId}/whatsapp`);
    }
  };

  return (
    <>
      <div className="container p-4 pb-24 mx-auto font-sans">
        <StepHeader />
        <div className="grid gap-8 md:grid-cols-2">
          <Content />
          <TemplatePreview />
        </div>
      </div>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Submit For Review",
            onClick: handleSubmitReview,
            type: "button",
            disable: !templateName || !bodyText,
          },
        ]}
      />
    </>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
