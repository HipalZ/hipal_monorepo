import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { useSendOptions } from "@/hooks/useTemplates";
import { memo, useCallback } from "react";

const MemoTemplateButtons = () => {
  const {
    templateId,
    templateName,
    bodyText,
    templateSteps,
    setTemplateSteps,
    templateStatus,
    setStep,
  } = useWhatsapp((s) => ({
    templateId: s.templateId,
    templateName: s.templateName,
    bodyText: s.bodyText,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
    templateStatus: s.templateStatus,
    setStep: s.setStep,
  }));
  const { businessName, businessId } = useBusinessData((s) => ({
    businessName: s.businessData?.name,
    businessId: s.businessData?._id,
  }));
  const {
    selectedOptions,
    selectedGroups,
    bulkCustomers,
    sendLaterTime,
    testNumber,
    uploadedFileName,
  } = useMessageRecipientsStore((s) => ({
    selectedOptions: s.selectedOptions,
    selectedGroups: s.selectedGroups,
    bulkCustomers: s.bulkCustomers,
    sendLaterTime: s.sendLaterTime,
    testNumber: s.testNumber,
    uploadedFileName: s.uploadedFileName,
  }));
  const sendOptions = useSendOptions();
  // send customers based on selected options
  const sendCustomers = useCallback(() => {
    const payload = {
      allCustomers: selectedOptions.includes("allCustomers"),
      templateId: Number(templateId),
      businessId: businessId,
      businessName: businessName,
      bulkCustomers: bulkCustomers,
      groupIds: selectedGroups,
      ...(sendLaterTime && sendLaterTime > 0 && { time: sendLaterTime }),
      ...(testNumber?.length > 0 && { customerPhone: testNumber }),
    };
    sendOptions.mutate(payload, {
      onSuccess: () => {
        setStep(Step.SETUP);
      },
      onError: () => {
        console.log("Error sending message");
      },
    });
  }, [
    selectedOptions,
    bulkCustomers,
    templateId,
    businessId,
    businessName,
    selectedGroups,
    sendLaterTime,
    sendOptions,
    testNumber,
    setStep,
  ]);

  // handle next button click
  const handleNext = useCallback(() => {
    if (templateSteps === TemplateSteps.CREATE_EDIT) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    } else if (templateSteps === TemplateSteps.SHOW_OPTIONS) {
      if (
        templateId?.length === 0 ||
        selectedOptions?.length === 0 ||
        (selectedOptions.includes("bulkUploadCustomers") &&
          uploadedFileName?.length === 0)
      )
        return;
      setTemplateSteps(TemplateSteps.SEND);
    } else if (templateSteps === TemplateSteps.SEND) {
      sendCustomers();
    }
  }, [
    templateSteps,
    setTemplateSteps,
    sendCustomers,
    templateId,
    selectedOptions,
    uploadedFileName,
  ]);
  return (
    <>
      {templateId ? (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Update & Next",
              type: "submit",
              disable:
                !templateName ||
                !bodyText ||
                templateSteps === TemplateSteps.SEND ||
                templateSteps === TemplateSteps.SHOW_OPTIONS,
            },
            {
              text: "Proceed to Next ►",
              onClick: handleNext,
              type: "button",
              disable: templateStatus === "REJECTED",
            },
          ]}
        />
      ) : templateSteps === TemplateSteps.CREATE_EDIT ? (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Create Template",
              type: "submit",
              disable: !templateName || !bodyText,
            },
          ]}
        />
      ) : (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Save to Next",
              onClick: handleNext,
              type: "button",
            },
          ]}
        />
      )}
      {sendOptions?.isPending && <LoadingSpinner />}
    </>
  );
};

const TemplateButtons = memo(MemoTemplateButtons);
export default TemplateButtons;
