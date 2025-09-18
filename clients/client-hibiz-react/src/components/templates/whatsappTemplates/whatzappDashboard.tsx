import { lazy, memo, useCallback, useState } from "react";
import useWhatsapp, {
  Step,
  TemplateSteps,
  TemplateType,
} from "@/components/store/useWhatsapp";
import { useFetchTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";
import { MdCampaign } from "react-icons/md";
import { HiOutlineTemplate } from "react-icons/hi";
import {
  Tabs,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import { MessageCircle, Workflow } from "lucide-react";
import { TbSettingsAutomation } from "react-icons/tb";

const LinkTemplatePopup = lazy(() => import("./linkTemplatePopup"));
const WhatsappFlowSection = lazy(() => import("./whatsappFlows"));
const WhatsAppAutomationFlow = lazy(() => import("./whatsappAutomation"));
const FlowBuilderPage = lazy(() => import("./whatsappFlowBuilder"));
const WhatzappFlowsList = lazy(() => import("./WhatzappFlowsList"));
const WhatsappChats = lazy(() => import("./whatsappChats"));
const CampaignAdvancedAnalytics = lazy(
  () => import("./campaignAdvancedAnalytics"),
);
const TemplatesCarousel = lazy(() => import("./templatesCarousel"));
const CampaignAnalytics = lazy(() => import("./campaignAnalytics"));

const MemoWhatzappDashboard = () => {
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const activeTab = useWhatsappTempStore((s) => s.activeTab);
  const setStep = useWhatsapp((s) => s.setStep);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const setTemplateType = useWhatsapp((s) => s.setTemplateType);
  const resetTemplateData = useWhatsapp((s) => s.resetTemplateData);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const setActiveTab = useWhatsappTempStore((s) => s.setActiveTab);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const createEditFlow = useWhatsappTempStore((s) => s.createEditFlow);
  const flowBuilderOpen = useWhatsappTempStore((s) => s.flowBuilderOpen);
  const setFlowBuilderOpen = useWhatsappTempStore((s) => s.setFlowBuilderOpen);
  const [openLinkTemplatePopup, setOpenLinkTemplatePopup] = useState(false);
  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();

  const handleCreateTemplate = useCallback(
    (type: string) => {
      // reset old data and navigate inside
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

  const handleLinkTemplate = useCallback(() => {
    setOpenLinkTemplatePopup(true);
  }, []);

  const getTabIcon = useCallback((tab: Tabs) => {
    switch (tab) {
      case Tabs.CAMPAIGNS:
        return <MdCampaign className="w-5 h-5 mr-2" />;
      case Tabs.TEMPLATES:
        return <HiOutlineTemplate className="w-5 h-5 mr-2" />;
      // case Tabs.FLOWS:
      //   return <Workflow className="w-5 h-5 mr-2" />;
      // case Tabs.AUTOMATION:
      //   return <TbSettingsAutomation className="w-5 h-5 mr-2" />;
      // case Tabs.CHATS:
      //   return <MessageCircle className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  }, []);

  const { isPending } = useQuery({
    queryKey: ["templates", businessId, activeTab],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  return (
    <main className="container relative mx-auto my-4">
      {!openAnalytics && !createEditFlow && !flowBuilderOpen && (
        <nav className="border overflow-auto hide-scrollbar sticky top-20 z-50 w-full flex items-center justify-between px-2 py-4 mb-2 bg-gray-100">
          <ul className="flex space-x-2">
            {Object.values(Tabs).map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  className={`flex items-center capitalize px-4 py-2 rounded-lg transition-colors duration-300 ${
                    activeTab === tab
                      ? "bg-[#075E54] text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {getTabIcon(tab)}
                  <span>{tab}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {activeTab === Tabs.TEMPLATES && !openAnalytics && (
        <section className="p-4 mb-20 shadow-sm rounded-xl">
          <section className="flex justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Templates</h2>
            <ul className="hidden gap-2 md:flex">
              {outLetType === "HOTEL" && (
                <li>
                  <button
                    type="button"
                    className="px-4 py-2 text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-500 on_active_bounce"
                    onClick={handleLinkTemplate}
                  >
                    + Link Your Template
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 on_active_bounce"
                  onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                >
                  + Marketing Template
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 on_active_bounce"
                  onClick={() => handleCreateTemplate(TemplateType.Utility)}
                >
                  + Utility Template
                </button>
              </li>
            </ul>
          </section>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Use these templates for sending to your customers instantly
          </p>
          <div className="relative grid gap-4 transition-transform duration-300 ease-in-out md:h-full md:grid-cols-4 lg:grid-cols-5 md:transform-none">
            {isPending ? <LoadingSpinner /> : <TemplatesCarousel />}
          </div>
          <article className="md:hidden">
            <BottomButton
              fixed
              colorGrad
              buttons={[
                {
                  text: "Marketing Template",
                  type: "button",
                  onClick: () => handleCreateTemplate(TemplateType.Marketing),
                },
                {
                  text: "Utility Template",
                  type: "button",
                  onClick: () => handleCreateTemplate(TemplateType.Utility),
                },
              ]}
            />
          </article>
        </section>
      )}
      {/* {activeTab === Tabs.AUTOMATION && !createEditFlow && (
        <WhatsappFlowSection />
      )} */}
      {/* {activeTab === Tabs.FLOWS && (
        <>
          {!flowBuilderOpen ? (
            <div className="p-4 mb-6">
              <button
                type="button"
                onClick={() => setFlowBuilderOpen(true)}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md"
              >
                + Create New WhatsApp Flow
              </button>
              <WhatzappFlowsList />
            </div>
          ) : (
            <FlowBuilderPage />
          )}
        </>
      )} */}

      {/* {activeTab === Tabs.AUTOMATION && createEditFlow && (
        <WhatsAppAutomationFlow />
      )} */}
      {/* {activeTab === Tabs.CHATS && <WhatsappChats />} */}
      {activeTab === Tabs.CAMPAIGNS && !openAnalytics && <CampaignAnalytics />}
      {activeTab === Tabs.CAMPAIGNS && openAnalytics && (
        <CampaignAdvancedAnalytics />
      )}
      {openLinkTemplatePopup && (
        <LinkTemplatePopup
          openLinkTemplatePopup={openLinkTemplatePopup}
          setOpenLinkTemplatePopup={setOpenLinkTemplatePopup}
        />
      )}
    </main>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
