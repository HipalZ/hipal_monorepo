import { lazy, memo, useCallback } from "react";
import useWhatsapp, {
  Step,
  Tabs,
  TemplateSteps,
  TemplateType,
} from "@/components/store/useWhatsapp";
import { useFetchTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import TemplatesCarousel from "./templatesCarousel";
import BottomButton from "@/components/atom/bottomButton";

const CampaignAnalytics = lazy(() => import("./campaignAnalytics"));
// const WhatsappChat = lazy(() => import("./whatsappbot"));

const MemoWhatzappDashboard = () => {
  const {
    setStep,
    setTemplateSteps,
    activeTab,
    setActiveTab,
    setPreDefinedTemplate,
    setTemplateType,
    resetTemplateData,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    activeTab: s.activeTab,
    setActiveTab: s.setActiveTab,
    setPreDefinedTemplate: s.setPreDefinedTemplate,
    setTemplateType: s.setTemplateType,
    resetTemplateData: s.resetTemplateData,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();

  const handleCreateTemplate = useCallback(
    (type: string) => {
      // reset old data and navigate inside
      resetTemplateData();
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setPreDefinedTemplate(false);
      setTemplateType(type);
    },
    [
      setStep,
      setTemplateSteps,
      setPreDefinedTemplate,
      setTemplateType,
      resetTemplateData,
    ],
  );

  const { isPending } = useQuery({
    queryKey: ["templates", businessId, activeTab],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  return (
    <main className="container relative px-2 mx-auto">
      <nav className="mb-4">
        <ul className="flex space-x-2 overflow-auto">
          {Object.values(Tabs).map((tab) => (
            <li key={tab}>
              <button
                type="button"
                className={`capitalize px-4 py-2 rounded-lg transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-[#075E54] text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {activeTab === Tabs.TEMPLATES && (
        <section className="mb-10">
          <h2 className="mb-2 text-2xl font-semibold">
            Drafts/Existing templates
          </h2>
          <p className="mb-6 text-gray-600">
            Use these templates for sending to your customers instantly
          </p>
          <div className="relative grid gap-4 transition-transform duration-300 ease-in-out md:h-full md:grid-cols-4 md:transform-none">
            {isPending ? <LoadingSpinner /> : <TemplatesCarousel />}
          </div>
          <BottomButton
            fixed
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
        </section>
      )}

      {activeTab === Tabs.CAMPAIGNS && <CampaignAnalytics />}

      {/* {activeTab === Tabs.AUTOMATION && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Automation</h2>
          <p>Automation content goes here.</p>
        </section>
      )} */}
      {/* <WhatsappChat /> */}
    </main>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
