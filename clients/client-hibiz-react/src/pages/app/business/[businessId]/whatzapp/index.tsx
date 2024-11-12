import Hi from "@/assets/svg/hi.svg";
import bannerImage from "@/assets/whatzapp/whatzAppTemplates.jpg";
import MiddlePopUp from "@/components/atom/middlePopUp";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { lazy, memo, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const CreateEditTemplate = lazy(
  () => import("@/components/templates/whatsappTemplates/createEditTemplate"),
);
const NotifyAndWallet = lazy(
  () => import("@/components/templates/whatsappTemplates/notifyAndWallet"),
);
const WalletHistory = lazy(
  () => import("@/components/templates/whatsappTemplates/walletHistory"),
);
const WhatzappDashboard = lazy(
  () => import("@/components/templates/whatsappTemplates/whatzappDashboard"),
);
const WhyNotEditPopup = lazy(
  () => import("@/components/templates/whatsappTemplates/WhyNotEditPopup"),
);

const MemoWhatzapp = () => {
  const {
    step,
    notEditPopup,
    setStep,
    setNotEditPopup,
    templateSteps,
    setTemplateSteps,
    preDefinedTemplate,
  } = useWhatsapp((s) => ({
    step: s.step,
    setStep: s.setStep,
    notEditPopup: s.notEditPopup,
    setNotEditPopup: s.setNotEditPopup,
    templateSteps: s.templateSteps,
    setTemplateSteps: s.setTemplateSteps,
    preDefinedTemplate: s.preDefinedTemplate,
  }));

  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    switch (templateSteps) {
      case TemplateSteps.MODIFY:
      case TemplateSteps.CREATE_EDIT:
        setStep(Step.SETUP);
        break;
      case TemplateSteps.SHOW_OPTIONS:
        if (preDefinedTemplate) {
          setTemplateSteps(TemplateSteps.MODIFY);
        } else {
          setTemplateSteps(TemplateSteps.CREATE_EDIT);
        }
        break;
      case TemplateSteps.SEND:
        setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
        break;
      default:
        navigate(`/app/business/${businessData?._id}/`);
        break;
    }
  }, [
    setStep,
    templateSteps,
    setTemplateSteps,
    navigate,
    businessData,
    preDefinedTemplate,
  ]);
  return (
    <main>
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
        {step === Step.WALLET_HISTORY && <WalletHistory />}
        {step === Step.CREATE_EDIT && <CreateEditTemplate />}
        {notEditPopup && (
          <MiddlePopUp
            show={notEditPopup}
            onClose={() => setNotEditPopup(false)}
          >
            <WhyNotEditPopup />
          </MiddlePopUp>
        )}
      </div>
    </main>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
