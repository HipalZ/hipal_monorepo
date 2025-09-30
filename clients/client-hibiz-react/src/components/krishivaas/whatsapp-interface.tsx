import logo from "@/assets/krishivaas/logo.svg";
import MiddlePopUp from "@/components/atom/middlePopUp";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, {
  Step,
  TemplateSteps,
  TemplateType,
} from "@/components/store/useWhatsapp";
import { lazy, memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
const SidebarResponsive = lazy(() => import("./SidebarResponsive"));
const TemplateBuilder = lazy(() => import("./template-builder"));
const MemoizedHeader = lazy(() => import("./common-header"));
import { Button } from "@/components/ui/button";

const WhatzappPayment = lazy(
  () => import("@/components/templates/whatsappTemplates/whatzappPayment"),
);
// const CreateEditTemplate = lazy(
//   () => import("@/components/templates/whatsappTemplates/createEditTemplate"),
// );
// const NotifyAndWallet = lazy(
//   () => import("@/components/templates/whatsappTemplates/notifyAndWallet"),
// );
const WalletHistory = lazy(
  () => import("@/components/templates/whatsappTemplates/walletHistory"),
);
const WhatzappDashboard = lazy(
  () => import("./whatsapp-dashboard"),
);
const WhyNotEditPopup = lazy(
  () => import("@/components/templates/whatsappTemplates/WhyNotEditPopup"),
);

// const TemplatesCarousel = lazy(() => import("./templates-carousel"));

const MemoWhatzapp = () => {
  const [tab, setTab] = useState<"templates" | "flows" | "analytics" | "alerts" | "settings">("templates");
  const step = useWhatsapp((s) => s.step);
  const setStep = useWhatsapp((s) => s.setStep);
  const notEditPopup = useWhatsapp((s) => s.notEditPopup);
  const setNotEditPopup = useWhatsapp((s) => s.setNotEditPopup);
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const businessData = useBusinessData((s) => s.businessData);
  const setOpenAnalytics = useWhatsappTempStore((s) => s.setOpenAnalytics);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const setCreateEditFlow = useWhatsappTempStore((s) => s.setCreateEditFlow);
  const createEditFlow = useWhatsappTempStore((s) => s.createEditFlow);
  const resetTemplateData = useWhatsapp((s) => s.resetTemplateData);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const setTemplateType = useWhatsapp((s) => s.setTemplateType);
  const navigate = useNavigate();

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
          if (openAnalytics || createEditFlow) {
            setOpenAnalytics(false);
            setCreateEditFlow(false);
            console.log("createEditFlow", createEditFlow);
          } else {
            navigate("/app/krishivaas/");
          }
          break;
        default:
          navigate("/app/krishivaas/");
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
    openAnalytics,
    setOpenAnalytics,
    createEditFlow,
    setCreateEditFlow,
    navigate,
  ]);

  const handleCreateTemplate = useCallback(
    (type: string) => {
      resetTemplateData();
      setShowSuccessPopup(false);
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setTemplateType(type);
    },
    [
      setStep,
      setTemplateSteps,
      setTemplateType,
      resetTemplateData,
      setShowSuccessPopup,
    ],
  );

  return (
    <>
      <div className="min-h-screen bg-[#FFEFE2]">
        <div>
          <SidebarResponsive active={tab} onSelect={(k) => setTab(k as any)} logo={logo} />
          {/* Banner */}
          <div className="flex items-center justify-between lg:ml-12 2xl:ml-0">
            <MemoizedHeader
              title="Create WhatsApp Template"
              onBack={handleBack}
              rightButton={<ul className="hidden md:flex md:justify-center gap-2">
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg "
                    onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                  >
                    + Marketing Template
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg "
                    onClick={() => handleCreateTemplate(TemplateType.Utility)}
                  >
                    + Utility Template
                  </Button>
                </li>
              </ul>}
            />

          </div>
          {step === Step.SETUP && (
            <section className="md:ml-[72px] lg:ml-48 px-3 md:px-6 lg:px-8 py-4 md:py-8">
              <WhatzappDashboard tab={tab}/>
              <article className="md:hidden flex gap-1 fixed bottom-0 right-0 left-0 w-full p-2 bg-[#ffffff]">
                <Button
                  type="button"
                  variant="outline"
                  className="text-base px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg h-12 w-full"
                  onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                >
                  + Marketing Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-base px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg h-12 w-full"
                  onClick={() => handleCreateTemplate(TemplateType.Utility)}
                >
                  + Utility Template
                </Button>
              </article>
            </section>
          )}
          {step === Step.WALLET_HISTORY && <WalletHistory />}
          {step === Step.CREATE_EDIT && <TemplateBuilder />}
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
      </div>
    </>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;

