import { memo, lazy, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { useQuery } from "@tanstack/react-query";
import { useGetTemplate } from "@/hooks/useTemplates";

const CreateEditTemplate = lazy(
  () => import("@/components/templates/whatsappTemplates/createEditTemplate"),
);
const MemoizedHeader = lazy(() => import("@/components/molecules/header"));
const SetupTemplate = lazy(
  () => import("@/components/templates/whatsappTemplates/setupTemplate"),
);

const MemoCreateTemplate = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("id");
  const { getTemplateApi } = useGetTemplate();

  const { step, setStep } = useWhatsapp((s) => ({
    step: s.step,
    setStep: s.setStep,
  }));

  const handleBack = useCallback(() => {
    if (step === Step.CREATE_EDIT) {
      setStep(Step.SETUP);
      return;
    }
    if (step === Step.SUBMIT) {
      setStep(Step.CREATE_EDIT);
      return;
    }
    navigate(`/app/business/${businessData?._id}/templates`);
  }, [navigate, businessData?._id, step]);

  // calling get template data for edit template page
  const getTemplateData = async () => {
    if (!templateId) {
      navigate(`/app/business/${businessData?._id}/whatsapp`);
      return null;
    }
    setStep(Step.CREATE_EDIT);
    const templateData = await getTemplateApi(templateId);
    return templateData || null;
  };

  // get single template data
  useQuery({
    queryKey: ["getTemplate", businessData?._id, templateId],
    queryFn: getTemplateData,
    enabled: !!businessData?._id && !!templateId,
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="Template"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </div>
      {step === Step.SETUP && <SetupTemplate />}
      {step === Step.CREATE_EDIT && <CreateEditTemplate />}
    </main>
  );
};

const CreateTemplate = memo(MemoCreateTemplate);
export default CreateTemplate;
