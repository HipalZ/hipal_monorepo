import { memo, lazy, useCallback, useRef, type FormEvent } from "react";
import useWhatsapp, {
  ActionType,
  HeaderInterface,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import {
  useCreatingTemplate,
  useEditingTemplate,
  useSendOptions,
} from "@/hooks/useTemplates";
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
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";

const Content = lazy(() => import("./content"));
const ShowOptionsToSend = lazy(() => import("./showOptionsToSend"));
const StepHeader = lazy(() => import("./stepHeader"));
const SendTemplate = lazy(() => import("./sendTemplate"));
const TemplatePreview = lazy(() => import("./templatePreview"));
const PreDefinedContent = lazy(() => import("./preDefinedContent"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const MemoCreateEditTemplate = () => {
  const { businessName, businessId } = useBusinessData((s) => ({
    businessName: s.businessData?.name,
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
  }));

  const { selectedOptions, selectedGroups, customerPhone, bulkCustomers } =
    useMessageRecipientsStore();

  const cropperRef = useRef<CropperRef>(null);
  const { handleCrop } = useWhatzappCroppedImg();

  const { createTemplate } = useCreatingTemplate();
  const { editTemplate } = useEditingTemplate();

  const { sendOptions } = useSendOptions();

  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("imageFiles", imageFiles);
    const imageUrl = {};
    console.log("imageUrl", imageUrl);

    // Prepare the payload based on selected options
    const payload = {
      ...(selectedOptions.includes("allCustomers") && { allCustomers: true }),
      ...(selectedOptions.includes("bulkUploadCustomers") && {
        bulkCustomers: bulkCustomers,
        templateId: Number(templateId),
        businessId: businessId,
        businessName: businessName,
      }),
      ...(selectedOptions.includes("sendCustomer") && { customerPhone }),
      ...(selectedOptions.includes("addGroups") && {
        groupIds: selectedGroups,
        templateId: Number(templateId),
        businessId: businessId,
        businessName: businessName,
        bulkCustomers: bulkCustomers,
      }),
    };
    sendOptions(payload);
    // payload structure for create/edit template
    // const payload = {
    //   businessId: businessId,
    //   name: templateName,
    //   language: "en_GB",
    //   ...(templateId?.length > 0 && { templateId: templateId }),
    //   category: templateType,
    //   components: [
    //     ...(headerType && headerText
    //       ? [
    //           {
    //             type: "HEADER",
    //             format: headerType === HeaderInterface.Text ? "TEXT" : "IMAGE",
    //             ...(headerType === HeaderInterface.Text
    //               ? { text: headerText }
    //               : imageUrl && {
    //                   example: {
    //                     header_handle: [imageUrl],
    //                   },
    //                 }),
    //           },
    //         ]
    //       : []),
    //     {
    //       type: "BODY",
    //       text: bodyText,
    //       ...(variables.length > 0 && { example: { body_text: [variables] } }),
    //     },
    //     ...(footerText
    //       ? [
    //           {
    //             type: "FOOTER",
    //             text: footerText,
    //           },
    //         ]
    //       : []),
    //     ...(buttonText && (websiteUrl || phoneNumber)
    //       ? [
    //           {
    //             type: "BUTTONS",
    //             buttons: [
    //               actionType === ActionType.VisitWebsite
    //                 ? {
    //                     type: "URL",
    //                     text: buttonText,
    //                     url: websiteUrl,
    //                   }
    //                 : {
    //                     type: "PHONE_NUMBER",
    //                     text: buttonText,
    //                     phone_number: `+91${phoneNumber}`,
    //                   },
    //             ],
    //           },
    //         ]
    //       : []),
    //   ],
    //   bodyVariableSequence: bodyVariableSequence,
    // };

    console.log(payload);

    //   let response;
    //   if (templateId?.length > 0) {
    //     response = await editTemplate(payload as unknown as WhatsAppTemplate);
    //   } else {
    //     response = await createTemplate(payload as unknown as WhatsAppTemplate);
    //   }
    //   if (response?.status === 200 || response?.status === 201) {
    //     if (response?.data?.status !== "REJECTED") {
    //       toast.success("Template created successfully");
    //       setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    //     } else {
    //       toast.error("Template creation rejected");
    //     }
    //   } else {
    //     toast.error(response?.message);
    // }
  };

  const handleNext = useCallback(() => {
    if (templateSteps === TemplateSteps.MODIFY) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    } else if (templateSteps === TemplateSteps.SHOW_OPTIONS) {
      setTemplateSteps(TemplateSteps.SEND);
    }
  }, [templateSteps, setTemplateSteps]);

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
      <BottomButton
        fixed
        buttons={[
          {
            text: "Update & Next",
            type: "submit",
            disable: !templateName || !bodyText,
          },
          {
            text: "Proceed & Next",
            onClick: handleNext,
            type: "button",
          },
        ]}
      />
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
    </form>
  );
};

const CreateEditTemplate = memo(MemoCreateEditTemplate);
export default CreateEditTemplate;
