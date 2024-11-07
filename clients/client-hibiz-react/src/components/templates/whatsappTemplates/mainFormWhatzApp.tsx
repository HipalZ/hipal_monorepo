import { lazy, memo, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import MiddlePopUp from "@/components/atom/middlePopUp";
import { useNavigate } from "react-router-dom";
import bannerImage from "@/assets/whatzapp/whatzAppTemplates.jpg";
import useBusinessData from "@/components/store/useBusinessData";

const MemoizedHeader = lazy(() => import("@/components/molecules/header"));
const NotifyAndWallet = lazy(() => import("./notifyAndWallet"));
const WhatzappDashboard = lazy(() => import("./whatzappDashboard"));
const CreateEditTemplate = lazy(() => import("./createEditTemplate"));
const WhyNotEditPopup = lazy(() => import("./WhyNotEditPopup"));

const MemoMainFormWhatzApp = () => {
  const {
    step,
    notEditPopup,
    setStep,
    setNotEditPopup,
    templateSteps,
    setTemplateSteps,
  } = useWhatsapp((s) => ({
    step: s.step,
    setStep: s.setStep,
    notEditPopup: s.notEditPopup,
    setNotEditPopup: s.setNotEditPopup,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
  }));

  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (templateSteps === TemplateSteps.MODIFY) {
      setStep(Step.SETUP);
      return;
    }
    if (templateSteps === TemplateSteps.SHOW_OPTIONS) {
      setTemplateSteps(TemplateSteps.MODIFY);
      return;
    }
    if (templateSteps === TemplateSteps.SEND) {
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
      return;
    }
    navigate(`/app/business/${businessData?._id}/`);
  }, [setStep, templateSteps, setTemplateSteps, navigate, businessData]);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full rounded-lg whatzapp_gradient_background">
        <MemoizedHeader
          title="WhatzApp"
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          rightButton={<NotifyAndWallet />}
          onBack={handleBack}
          headingColor="white"
        />
      </div>
      {/* Banner */}

      {step === Step.SETUP && (
        <>
          <img
            src={bannerImage}
            alt="bannerImage"
            className="mt-2 rounded-lg"
          />
          <br />
          <WhatzappDashboard />
        </>
      )}
      {step === Step.CREATE_EDIT && <CreateEditTemplate />}
      {notEditPopup && (
        <MiddlePopUp show={notEditPopup} onClose={() => setNotEditPopup(false)}>
          <WhyNotEditPopup />
        </MiddlePopUp>
      )}
    </div>
  );
};

const MainFormWhatzApp = memo(MemoMainFormWhatzApp);
export default MainFormWhatzApp;
