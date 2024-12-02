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
import { BsWhatsapp } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WhatsappChats = lazy(
  () => import("@/components/templates/whatsappTemplates/whatsappChats"),
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

  const toggleChat = useCallback(() => {
    if (step === Step.CHATS) return setStep(Step.SETUP);
    setStep(Step.CHATS);
  }, [setStep, step]);

  const handleBack = useCallback(() => {
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
          if (
            step === Step.TRANSACTIONS ||
            step === Step.WALLET_HISTORY ||
            step === Step.CHATS
          ) {
            setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.CREATE_EDIT);
          }
          break;
        case TemplateSteps.SEND:
          if (
            step === Step.TRANSACTIONS ||
            step === Step.WALLET_HISTORY ||
            step === Step.CHATS
          ) {
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
        case Step.CHATS:
          setStep(Step.SETUP);
          break;
        default:
          navigate(`/app/business/${businessData?._id}/`);
          break;
      }
    }
  }, [setStep, step, templateSteps, setTemplateSteps, navigate, businessData]);
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
        {step === Step.TRANSACTIONS && <WhatzappPayment />}
        {step === Step.CHATS ? (
          <WhatsappChats />
        ) : (
          <section className="sticky max-w-[69rem] bottom-4 right-0 float-end z-50">
            <button
              type="button"
              onClick={toggleChat}
              className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 animate-bounce"
              aria-label="Open WhatsApp chat"
            >
              <BsWhatsapp className="w-6 h-6" />
            </button>
          </section>
        )}

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
