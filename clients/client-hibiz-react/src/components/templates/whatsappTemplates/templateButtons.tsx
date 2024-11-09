import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";
import useWhatsapp, { TemplateSteps } from "@/components/store/useWhatsapp";
import { useSendOptions } from "@/hooks/useTemplates";
import { memo, useCallback } from "react";

const MemoTemplateButtons = () => {
  const {
    templateId,
    templateName,
    bodyText,
    templateSteps,
    setTemplateSteps,
  } = useWhatsapp((s) => ({
    templateId: s.templateId,
    templateName: s.templateName,
    bodyText: s.bodyText,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
  }));
  const { businessName, businessId } = useBusinessData((s) => ({
    businessName: s.businessData?.name,
    businessId: s.businessData?._id,
  }));
  const {
    selectedOptions,
    selectedGroups,
    customerPhone,
    bulkCustomers,
    sendLaterTime,
    testNumber,
  } = useMessageRecipientsStore((s) => ({
    selectedOptions: s.selectedOptions,
    selectedGroups: s.selectedGroups,
    customerPhone: s.customerPhone,
    bulkCustomers: s.bulkCustomers,
    sendLaterTime: s.sendLaterTime,
    testNumber: s.testNumber,
  }));
  const { sendOptions } = useSendOptions();
  // send customers based on selected options
  const sendCustomers = useCallback(() => {
    const payload = {
      // all customers
      ...(selectedOptions.includes("allCustomers") && { allCustomers: true }),
      // bulk uploaded customers
      ...(selectedOptions.includes("bulkUploadCustomers") && {
        bulkCustomers: bulkCustomers,
        templateId: Number(templateId),
        businessId: businessId,
        businessName: businessName,
      }),
      // send to a customer
      ...(selectedOptions.includes("sendCustomer") && { customerPhone }),
      // send to a group
      ...(selectedOptions.includes("addGroups") && {
        groupIds: selectedGroups,
        templateId: Number(templateId),
        businessId: businessId,
        businessName: businessName,
        bulkCustomers: bulkCustomers,
      }),
      ...(sendLaterTime && sendLaterTime > 0 && { time: sendLaterTime }),
      ...(testNumber?.length > 0 && { customerPhone: testNumber }),
    };
    sendOptions(payload);
  }, [
    selectedOptions,
    bulkCustomers,
    templateId,
    businessId,
    businessName,
    customerPhone,
    selectedGroups,
    sendLaterTime,
    sendOptions,
    testNumber,
  ]);

  // handle next button click
  const handleNext = useCallback(() => {
    if (templateSteps === TemplateSteps.MODIFY) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    } else if (templateSteps === TemplateSteps.SHOW_OPTIONS) {
      setTemplateSteps(TemplateSteps.SEND);
    } else if (templateSteps === TemplateSteps.SEND) {
      sendCustomers();
    }
  }, [templateSteps, setTemplateSteps, sendCustomers]);
  return (
    <>
      {templateId ? (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Update & Next",
              type: "submit",
              disable: !templateName || !bodyText,
            },
            {
              text: "Proceed to Next",
              onClick: handleNext,
              type: "button",
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
            {
              text: "Proceed to Next",
              onClick: handleNext,
              type: "button",
            },
          ]}
        />
      ) : (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Proceed to Next",
              onClick: handleNext,
              type: "button",
            },
          ]}
        />
      )}
    </>
  );
};

const TemplateButtons = memo(MemoTemplateButtons);
export default TemplateButtons;
