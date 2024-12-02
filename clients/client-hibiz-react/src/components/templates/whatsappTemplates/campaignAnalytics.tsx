import { memo, useCallback, useState, lazy } from "react";
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

const CampaignDetails = lazy(() => import("./campaignDetails"));
export interface Campaign {
  templateName: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  cost: number;
}

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
  const { setActiveTab, allTemplates } = useWhatsappTempStore((s) => ({
    setActiveTab: s.setActiveTab,
    allTemplates: s.allTemplates,
  }));
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
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
    [businessId, setSingleTemplateAnalytics],
  );

  const handleViewClick = useCallback(
    async (campaign: WhatsAppTemplatePayload) => {
      if (openAccordionId === campaign.id) {
        setOpenAccordionId(null);
      } else {
        setOpenAccordionId(campaign.id);
        await getTemplateAnaylyticsById(campaign.id);
      }
    },
    [getTemplateAnaylyticsById, openAccordionId],
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
    <div className="w-full mx-auto mb-6 bg-white rounded-lg shadow-md">
      <div className="p-2 border-b lg:p-4">
        <h2 className="text-xl font-semibold">Campaign Analytics</h2>
        <p className="text-gray-600">
          Overview of your WhatsApp campaign performance
        </p>
      </div>
      <div className="p-2 lg:p-4 overflow-x-auto min-h-[200px] h-full max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Campaign</th>
            </tr>
          </thead>
          {allTemplates?.map((campaign) => (
            <tbody key={campaign?.templateId}>
              <tr className="border-b">
                <td className="w-10 p-2 truncate">{campaign?.name}</td>
                <td className="w-10 p-2">{campaign?.category}</td>
                <td className="w-10">
                  <span
                    className={`px-2 py-1 lowercase rounded-lg ${
                      campaign?.status === "APPROVED" ||
                      campaign?.status === "PENDING"
                        ? "text-green-500 bg-green-100"
                        : ""
                    }`}
                  >
                    {campaign?.status}
                  </span>
                </td>
                <td className="w-24 p-2">
                  <button
                    type="button"
                    className="w-12 p-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => handleViewClick(campaign)}
                    disabled={loadingTemplateId === campaign.id}
                  >
                    {loadingTemplateId === campaign.id ? (
                      <span className="inline-block animate-spin">↻</span>
                    ) : openAccordionId === campaign.id ? (
                      "Hide"
                    ) : (
                      "View"
                    )}
                  </button>
                </td>
                <td className="w-12 p-2">
                  <button
                    type="button"
                    className="w-24 p-1 text-sm text-white bg-green-500 rounded-md md:w-36 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    onClick={() => handleCampaign(campaign)}
                  >
                    Start Campaign
                  </button>
                </td>
              </tr>
              {openAccordionId === campaign.id && (
                <tr>
                  <td colSpan={5}>
                    {selectedCampaign &&
                      selectedCampaign.templateName === campaign.name && (
                        <CampaignDetails campaign={selectedCampaign} />
                      )}
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
};

const CampaignAnalytics = memo(MemoCampaignAnalytics);
export default CampaignAnalytics;
