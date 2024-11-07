import { memo, lazy, useCallback } from "react";
import useWhatsapp, {
  ActionType,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { useCreatingTemplate, useEditTemplate } from "@/hooks/useTemplates";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import type { WhatsAppTemplate } from "@/components/types/businessData";

const Content = lazy(() => import("./content"));
const ShowOptionsToSend = lazy(() => import("./showOptionsToSend"));
const StepHeader = lazy(() => import("./stepHeader"));
const SendTemplate = lazy(() => import("./sendTemplate"));
const TemplatePreview = lazy(() => import("./templatePreview"));
const PreDefinedCallOfAction = lazy(() => import("./preDefinedCOA"));
const PreDefinedContent = lazy(() => import("./preDefinedContent"));
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
    templateSteps,
    setTemplateSteps,
    bodyVariableSequence,
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
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
    bodyVariableSequence: s.bodyVariableSequence,
  }));

  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("id");

  const { createTemplate } = useCreatingTemplate();
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
      bodyVariableSequence: bodyVariableSequence,
    };
    console.log(payload);
    // const response = await createTemplate(payload as WhatsAppTemplate);
    // if (templateId) {
    //   response = await editTemplateApi(payload as WhatsAppTemplate);
    // } else {
    // }
    // if (response?.status === 200) {
    //   return navigate(`/app/business/${businessId}/whatzapp`);
    // }
  };

  const handleNext = useCallback(() => {
    if (templateSteps === TemplateSteps.MODIFY) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    }
  }, [templateSteps, setTemplateSteps]);

  return (
    <>
      <div className="container p-3 pb-24 font-sans lg:p-4">
        <StepHeader />
        <div className="grid gap-8 md:grid-cols-2">
          <TemplatePreview />
          {templateSteps === TemplateSteps.MODIFY && (
            <section>
              <PreDefinedContent />
              <PreDefinedCallOfAction />
            </section>
          )}
          {templateSteps === TemplateSteps.CREATE_EDIT && (
            <section>
              <Content />
            </section>
          )}
          {templateSteps === TemplateSteps.SHOW_OPTIONS && (
            <ShowOptionsToSend />
          )}
          {templateSteps === TemplateSteps.SEND && <SendTemplate />}
        </div>
      </div>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Next",
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
