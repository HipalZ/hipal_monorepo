import { memo, useCallback, useState, lazy, Fragment, Suspense } from "react";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import toast from "react-hot-toast";
import {
  Tabs,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import { apiRpc } from "@hi/common";
import useBusinessData from "@/components/store/useBusinessData";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import { BarChart2, Loader2 } from "lucide-react";

const CampaignDetails = lazy(() => import("./campaignDetails"));

const MemoCampaignAnalytics: React.FC = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const {
    setTemplateData,
    setTemplateSteps,
    setStep,
    setSingleTemplateAnalytics,
  } = useWhatsapp((s) => ({
    setTemplateData: s.setTemplateData,
    setTemplateSteps: s.setTemplateSteps,
    setStep: s.setStep,
    setSingleTemplateAnalytics: s.setSingleTemplateAnalytics,
  }));
  const {
    setActiveTab,
    allTemplates,
    selectedCampaign,
    setSelectedCampaign,
    setOpenAnalytics,
  } = useWhatsappTempStore((s) => ({
    setActiveTab: s.setActiveTab,
    allTemplates: s.allTemplates,
    selectedCampaign: s.selectedCampaign,
    setSelectedCampaign: s.setSelectedCampaign,
    setOpenAnalytics: s.setOpenAnalytics,
  }));

  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null,
  );
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  const getTemplateAnaylyticsById = useCallback(
    async (templateId: string) => {
      setLoadingTemplateId(templateId);
      try {
        const res = await apiRpc.whatsapp.analytics.by_template_id.$get({
          query: {
            templateId,
            businessId,
          },
        });

        const response = await res.json();
        if (res.status === 200 || res.status === 201) {
          setSingleTemplateAnalytics(response?.data);
          setSelectedCampaign(response?.data);
          setOpenAccordionId(templateId);
        } else {
          toast.error("Failed to fetch analytics data");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("An error occurred while fetching analytics data");
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [businessId, setSingleTemplateAnalytics, setSelectedCampaign],
  );

  const handleViewClick = useCallback(
    async (campaign: WhatsAppTemplatePayload) => {
      setOpenAnalytics(true);
      if (openAccordionId === campaign.id) {
        setOpenAccordionId(null);
      } else {
        setOpenAccordionId(campaign.id);
        await getTemplateAnaylyticsById(campaign.id);
      }
    },
    [getTemplateAnaylyticsById, openAccordionId, setOpenAnalytics],
  );

  const handleCampaign = useCallback(
    (campaign: WhatsAppTemplatePayload) => {
      const filteredCampaign = allTemplates?.find(
        (template) => template.name === campaign.name,
      );
      if (filteredCampaign) {
        if (filteredCampaign.status === "REJECTED") {
          toast.error(
            "This template is rejected. You cannot start a campaign.",
          );
          return;
        }
        console.log("filteredCampaign", filteredCampaign);
        setTemplateData(filteredCampaign);
        setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
        setStep(Step.CREATE_EDIT);
      } else {
        setActiveTab(Tabs.TEMPLATES);
      }
    },
    [setTemplateData, setActiveTab, allTemplates, setTemplateSteps, setStep],
  );

  return (
    <div className="w-full mx-auto space-y-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Campaign Analytics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your WhatsApp campaign performance
        </p>
      </div>
      <section className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Campaign
              </th>
              {/* <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Success (%)
              </th> */}
              <th
                scope="col"
                className="px-4 py-3 text-sm font-semibold tracking-wider text-left text-black uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTemplates?.map((campaign) => (
              <Fragment key={campaign.id}>
                <tr className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 text-base font-medium text-gray-900 whitespace-nowrap">
                    {campaign?.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {campaign?.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        campaign?.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : campaign?.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campaign?.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-base whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleCampaign(campaign)}
                      disabled={campaign?.status === "REJECTED"}
                      className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:cursor-not-allowed"
                    >
                      Start Campaign
                    </button>
                  </td>
                  {/* <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 uppercase bg-blue-200 rounded-full">
                            {((campaign.delivered / campaign.sent) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 mb-4 overflow-hidden text-xs bg-blue-200 rounded">
                        <div
                          style={{ width: `${(campaign.delivered / campaign.sent) * 100}%` }}
                          className="flex flex-col justify-center text-center text-white bg-blue-600 shadow-none whitespace-nowrap"
                        />
                      </div>
                    </div>
                  </td> */}
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewClick(campaign)}
                      disabled={
                        loadingTemplateId === campaign.id ||
                        campaign?.status === "REJECTED"
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    >
                      {loadingTemplateId === campaign.id ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : openAccordionId === campaign.id ? (
                        <>
                          <BarChart2 size={18} className="mr-2" />
                          Hide Insights
                        </>
                      ) : (
                        <>
                          <BarChart2 size={18} className="mr-2" />
                          View Insights
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {openAccordionId === campaign.id && (
                  <td colSpan={5} className="px-6 py-4">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      }
                    >
                      {selectedCampaign &&
                        selectedCampaign.templateName === campaign.name && (
                          <CampaignDetails campaign={selectedCampaign} />
                        )}
                    </Suspense>
                  </td>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const CampaignAnalytics = memo(MemoCampaignAnalytics);
export default CampaignAnalytics;
