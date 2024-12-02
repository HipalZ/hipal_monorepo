import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import {
  ShowOptions,
  useMessageRecipientsStore,
} from "@/components/store/useMessageRecipientsStore";
import useWhatsapp, { TemplateSteps } from "@/components/store/useWhatsapp";
import { useSendOptions } from "@/hooks/useTemplates";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

const MemoTemplateButtons = () => {
  const {
    templateId,
    templateName,
    bodyText,
    templateSteps,
    setTemplateSteps,
    templateStatus,
  } = useWhatsapp((s) => ({
    templateId: s.templateId,
    templateName: s.templateName,
    bodyText: s.bodyText,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
    templateStatus: s.templateStatus,
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
      allCustomers: selectedOptions.includes(ShowOptions.ALL_CUSTOMERS),
      templateId: Number(templateId),
      businessId: businessId || "",
      businessName: businessName,
      bulkCustomers: selectedOptions.includes(ShowOptions.BULK_UPLOAD_CUSTOMERS)
        ? bulkCustomers
        : [],
      groupIds: selectedOptions.includes(ShowOptions.ADD_GROUPS)
        ? selectedGroups
        : [],
      ...(sendLaterTime && sendLaterTime > 0 && { time: sendLaterTime }),
      ...(testNumber?.length > 0 && { customerPhone: testNumber }),
    };
    sendOptions.mutate(payload);
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
  ]);

  // handle next button click
  const handleNext = useCallback(() => {
    if (templateSteps === TemplateSteps.CREATE_EDIT) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    } else if (templateSteps === TemplateSteps.SHOW_OPTIONS) {
      if (
        templateId?.length === 0 ||
        (selectedOptions.includes(ShowOptions.BULK_UPLOAD_CUSTOMERS) &&
          uploadedFileName === null) ||
        uploadedFileName?.length === 0
      ) {
        return toast.error("Please upload excel file");
      }
      if (
        selectedOptions.includes(ShowOptions.ADD_GROUPS) &&
        selectedGroups.length === 0
      ) {
        return toast.error("Please select atleast one group");
      }
      setTemplateSteps(TemplateSteps.SEND);
    } else if (templateSteps === TemplateSteps.SEND) {
      sendCustomers();
      setTemplateSteps(TemplateSteps.NONE);
    }
  }, [
    templateSteps,
    setTemplateSteps,
    sendCustomers,
    templateId,
    selectedOptions,
    selectedGroups,
    uploadedFileName,
  ]);
  return (
    <>
      {templateId ? (
        <BottomButton
          fixed
          colorGrad
          buttons={[
            {
              text: "Update & Proceed ►",
              type: "submit",
              hide:
                templateSteps === TemplateSteps.SEND ||
                templateSteps === TemplateSteps.SHOW_OPTIONS,
              disable: !templateName || !bodyText,
            },
            {
              text: "Proceed to Next ►",
              onClick: handleNext,
              type: "button",
              disable: templateStatus === "REJECTED",
              hide: templateSteps === TemplateSteps.CREATE_EDIT,
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
