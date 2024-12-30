 import Hi from "@/assets/svg/hi.svg";
import MemoizedHeader from "@/components/molecules/header";
import MiddlePopUp from "@/components/atom/middlePopUp";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { lazy, memo, useCallback } from "react";
import { useCheckRegistration } from "@/hooks/useTemplates";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import WhatsAppRegistration from "@/components/templates/whatsappTemplates/mainForm";
import { FaArrowLeft } from "react-icons/fa";
import WhatsAppLoader from "@/components/templates/whatsappTemplates/whatsappLoader";

const PendingStatusStep = lazy(
  () => import("@/components/templates/whatsappTemplates/pendingStatus"),
);
const WhatzappPayment = lazy(
  () => import("@/components/templates/whatsappTemplates/whatzappPayment"),
);
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
  const { checkRegistration } = useCheckRegistration();
  const step = useWhatsapp((s) => s.step);
  const setStep = useWhatsapp((s) => s.setStep);
  const notEditPopup = useWhatsapp((s) => s.notEditPopup);
  const setNotEditPopup = useWhatsapp((s) => s.setNotEditPopup);
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const activeTab = useWhatsappTempStore((s) => s.activeTab);
  const setOpenAnalytics = useWhatsappTempStore((s) => s.setOpenAnalytics);
  const whatzappFormEnabled = useWhatsapp((s) => s.whatzappFormEnabled);
  const checkReg = useWhatsappTempStore((s) => s.checkReg);
  const whatzappStatus = useWhatsappTempStore((s) => s.whatzappStatus);
  const businessData = useBusinessData((s) => s.businessData);

  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    console.log("templateSteps", templateSteps);
    console.log("step", step);
    if (templateSteps !== TemplateSteps.NONE) {
      switch (templateSteps) {
        case TemplateSteps.MODIFY:
        case TemplateSteps.CREATE_EDIT:
          if (
            step === Step.TRANSACTIONS ||
            step === Step.WALLET_HISTORY ||
            step === Step.CHATS
          ) {
            setTemplateSteps(TemplateSteps.CREATE_EDIT);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.NONE);
            setStep(Step.SETUP);
          }
          break;
        case TemplateSteps.SHOW_OPTIONS:
          if (step === Step.TRANSACTIONS || step === Step.WALLET_HISTORY) {
            setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.CREATE_EDIT);
          }
          break;
        case TemplateSteps.SEND:
          if (step === Step.TRANSACTIONS || step === Step.WALLET_HISTORY) {
            setTemplateSteps(TemplateSteps.SEND);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
          }
          break;
        default:
          setTemplateSteps(TemplateSteps.NONE);
          setStep(Step.SETUP);
          break;
      }
    } else {
      switch (step) {
        case Step.WALLET_HISTORY:
        case Step.CREATE_EDIT:
        case Step.TRANSACTIONS:
          setStep(Step.SETUP);
          break;
        case Step.SETUP:
          if (activeTab === Tabs.CAMPAIGNS && openAnalytics) {
            setOpenAnalytics(false);
          } else {
            navigate(`/app/business/${businessData?._id}/`);
          }
          break;
        default:
          navigate(`/app/business/${businessData?._id}/`);
          break;
      }
    }
  }, [
    setStep,
    step,
    templateSteps,
    setTemplateSteps,
    navigate,
    businessData,
    activeTab,
    openAnalytics,
    setOpenAnalytics,
  ]);

  const { isLoading } = useQuery({
    queryKey: ["fetchWaba", businessData?._id],
    queryFn: checkRegistration,
    enabled: !!businessData?._id && !checkReg,
  });

  return (
    <>
      {isLoading ? (
        <WhatsAppLoader />
      ) : (
        <main>
          {!whatzappFormEnabled && <WhatsAppRegistration />}
          {whatzappFormEnabled && !whatzappStatus && (
            <>
              <MemoizedHeader
                title="WhatzApp"
                leftIcon={<FaArrowLeft />}
                onBack={handleBack}
                headingColor="white"
              />
              <PendingStatusStep />
            </>
          )}
          {whatzappFormEnabled && whatzappStatus && (
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
              {step === Step.SETUP && <WhatzappDashboard />}
              {step === Step.WALLET_HISTORY && <WalletHistory />}
              {step === Step.CREATE_EDIT && <CreateEditTemplate />}
              {step === Step.TRANSACTIONS && <WhatzappPayment />}
              {notEditPopup && (
                <MiddlePopUp
                  show={notEditPopup}
                  onClose={() => setNotEditPopup(false)}
                >
                  <WhyNotEditPopup />
                </MiddlePopUp>
              )}
            </div>
          )}
        </main>
      )}
    </>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
