import { lazy, memo } from "react";
import { useFetchTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import {
  Tabs,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const FlowBuilderPage = lazy(() => import("../templates/whatsappTemplates/whatsappFlowBuilder"));
const WhatzappFlowsList = lazy(() => import("../templates/whatsappTemplates/WhatzappFlowsList"));
const CampaignAdvancedAnalytics = lazy(
  () => import("../templates/whatsappTemplates/campaignAdvancedAnalytics"),
);
const CampaignAnalytics = lazy(() => import("../templates/whatsappTemplates/campaignAnalytics"));
const TemplatesCarousel = lazy(() => import("./templates-carousel"));

const MemoWhatzappDashboard = ({tab}) => {
  const activeTab = useWhatsappTempStore((s) => s.activeTab);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const flowBuilderOpen = useWhatsappTempStore((s) => s.flowBuilderOpen);
  const setFlowBuilderOpen = useWhatsappTempStore((s) => s.setFlowBuilderOpen);
  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();
  const {isPending} = useQuery({
    queryKey: ["templates", businessId, activeTab],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  if(isPending) return <LoadingSpinner />;
  return (
    <main className="container relative mx-auto my-4">
      {tab === Tabs.TEMPLATES && !openAnalytics && (
        <div className="container mx-auto max-w-[1400px] pt-4">

          <div
            className="
                        grid
                        [--min:240px]
                        grid-cols-[repeat(auto-fill,minmax(var(--min),1fr))]
                        gap-5 md:gap-6 lg:gap-8 pb-[5rem]
                      "
          >
            <TemplatesCarousel />
          </div>

        </div>
      )}
      {tab === Tabs.FLOWS && (
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
      )}

      {tab === Tabs.CAMPAIGNS && !openAnalytics && <CampaignAnalytics />}
      {tab === Tabs.CAMPAIGNS && openAnalytics && (
        <CampaignAdvancedAnalytics />
      )}
    </main>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
