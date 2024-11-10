"use client";
import { memo, useCallback, useState } from "react";
import CampaignDetails from "./campaignDetails";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import { useTemplateAnalytics } from "@/hooks/useTemplates";
import useWhatsapp, { Tabs } from "@/components/store/useWhatsapp";
import LoadingSpinner from "@/components/atom/loadingSpinner";

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
  const { activeTab, templateAnalytics, totalData } = useWhatsapp((s) => ({
    activeTab: s.activeTab,
    templateAnalytics: s.templateAnalytics,
    totalData: s.totalData,
  }));
  const { getTemplateAnalytics } = useTemplateAnalytics();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  const handleViewClick = useCallback((campaign: Campaign) => {
    setSelectedCampaign((prev) =>
      prev?.templateName === campaign.templateName ? null : campaign,
    );
  }, []);

  const { isPending } = useQuery({
    queryKey: ["templatesAnalytics", businessId, activeTab],
    queryFn: getTemplateAnalytics,
    enabled: !!businessId && activeTab === Tabs.CAMPAIGNS,
  });

  return (
    <div className="w-full mx-auto mb-6 bg-white rounded-lg shadow-md">
      <div className="p-2 border-b lg:p-4">
        <h2 className="text-xl font-semibold">Campaign Analytics</h2>
        <p className="text-gray-600">
          Overview of your WhatsApp campaign performance
        </p>
      </div>
      <div className="p-2 lg:p-4">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-[#8884d8] text-white rounded-lg shadow">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
              <h3 className="text-sm font-medium">Total Sent</h3>
            </div>
            <div className="text-2xl font-bold">
              {totalData[0]?.totalSent || 0}
            </div>
          </div>
          <div className="p-4 bg-[#82ca9d] text-white rounded-lg shadow">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
              <h3 className="text-sm font-medium">Total Delivered</h3>
            </div>
            <div className="text-2xl font-bold">
              {totalData[0]?.totalDelivered || 0}
            </div>
          </div>
          <div className="p-4 bg-[#ffc658] text-white rounded-lg shadow">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
              <h3 className="text-sm font-medium">Total Read</h3>
            </div>
            <div className="text-2xl font-bold">
              {totalData[0]?.totalRead || 0}
            </div>
          </div>
          <div className="p-4 bg-[#ff8042] text-white rounded-lg shadow">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
              <h3 className="text-sm font-medium">Total Clicked</h3>
            </div>
            <div className="text-2xl font-bold">
              {totalData[0]?.totalClicked || 0}
            </div>
          </div>
        </div>
        {isPending ? (
          <LoadingSpinner />
        ) : (
          <div className="mt-4 overflow-x-auto min-h-[200px] h-full max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Sent</th>
                  <th className="p-2 text-left">Delivered</th>
                  <th className="p-2 text-left">Read</th>
                  <th className="p-2 text-left">Clicked</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              {templateAnalytics.map((campaign) => {
                return (
                  <tbody key={campaign?.templateName}>
                    <tr className="border-b">
                      <td className="p-2">{campaign?.templateName}</td>
                      <td className="p-2">{campaign?.sent}</td>
                      <td className="p-2">{campaign?.delivered}</td>
                      <td className="p-2">{campaign?.read}</td>
                      <td className="p-2">{campaign?.clicked}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          className="w-full p-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          onClick={() => handleViewClick(campaign)}
                        >
                          {selectedCampaign?.templateName ===
                          campaign?.templateName
                            ? "Hide"
                            : "View"}
                        </button>
                      </td>
                    </tr>
                    {selectedCampaign?.templateName ===
                      campaign.templateName && (
                      <tr>
                        <td colSpan={7}>
                          {selectedCampaign && (
                            <CampaignDetails campaign={selectedCampaign} />
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignAnalytics = memo(MemoCampaignAnalytics);
export default CampaignAnalytics;
