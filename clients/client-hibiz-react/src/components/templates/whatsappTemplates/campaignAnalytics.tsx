"use client";
import { memo, useCallback, useMemo, useState } from "react";
import CampaignDetails from "./campaignDetails";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface Campaign {
  id: string;
  name: string;
  status: "Active" | "Completed" | "Draft";
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Diwali 2023",
    status: "Completed",
    sent: 12000,
    delivered: 12000,
    read: 11000,
    failed: 1000,
  },
  {
    id: "2",
    name: "New Year Offer",
    status: "Active",
    sent: 5000,
    delivered: 4900,
    read: 4500,
    failed: 100,
  },
  {
    id: "3",
    name: "Summer Sale",
    status: "Draft",
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  },
];

const getStatusColor = (status: Campaign["status"]) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    case "Draft":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const MemoCampaignAnalytics: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">(
    "overview",
  );

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0);
  const totalDelivered = campaigns.reduce(
    (sum, campaign) => sum + campaign.delivered,
    0,
  );
  const totalRead = campaigns.reduce((sum, campaign) => sum + campaign.read, 0);
  const totalFailed = campaigns.reduce(
    (sum, campaign) => sum + campaign.failed,
    0,
  );

  const chartData = useMemo(
    () =>
      campaigns.map((campaign) => ({
        name: campaign.name,
        sent: campaign.sent,
        delivered: campaign.delivered,
        read: campaign.read,
        failed: campaign.failed,
      })),
    [],
  );

  const handleViewClick = useCallback((campaign: Campaign) => {
    setSelectedCampaign((prev) => (prev?.id === campaign.id ? null : campaign));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedCampaign(null);
  }, []);

  return (
    <div className="w-full mx-auto mb-6 bg-white rounded-lg shadow-md">
      <div className="p-2 border-b lg:p-4">
        <h2 className="text-xl font-semibold">Campaign Analytics</h2>
        <p className="text-gray-600">
          Overview of your WhatsApp campaign performance
        </p>
      </div>
      <div className="p-2 lg:p-4">
        <div className="flex w-full p-1 mb-4 space-x-4 border rounded-lg">
          <button
            type="button"
            className={`w-1/2 px-4 py-2 rounded-lg ${
              activeTab === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`w-1/2 px-4 py-2 rounded-lg ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              <div className="p-4 bg-[#8884d8] text-white rounded-lg shadow">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium">Total Sent</h3>
                </div>
                <div className="text-2xl font-bold">
                  {totalSent.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-[#82ca9d] text-white rounded-lg shadow">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium">Total Delivered</h3>
                </div>
                <div className="text-2xl font-bold">
                  {totalDelivered.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-[#ffc658] text-white rounded-lg shadow">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium">Total Read</h3>
                </div>
                <div className="text-2xl font-bold">
                  {totalRead.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-[#ff8042] text-white rounded-lg shadow">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium">Total Failed</h3>
                </div>
                <div className="text-2xl font-bold">
                  {totalFailed.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Sent</th>
                    <th className="p-2 text-left">Delivered</th>
                    <th className="p-2 text-left">Read</th>
                    <th className="p-2 text-left">Failed</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                {campaigns.map((campaign) => (
                  <tbody key={campaign?.id}>
                    <tr className="border-b">
                      <td className="p-2">{campaign.name}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status,
                          )}`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="p-2">{campaign.sent.toLocaleString()}</td>
                      <td className="p-2">
                        {campaign.delivered.toLocaleString()}
                      </td>
                      <td className="p-2">{campaign.read.toLocaleString()}</td>
                      <td className="p-2">
                        {campaign.failed.toLocaleString()}
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          onClick={() => handleViewClick(campaign)}
                        >
                          {selectedCampaign?.id === campaign.id
                            ? "Hide"
                            : "View"}
                        </button>
                      </td>
                    </tr>
                    {selectedCampaign?.id === campaign.id && (
                      <tr>
                        <td colSpan={7} className="p-4">
                          <CampaignDetails campaign={selectedCampaign} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#8884d8" />
                <Bar dataKey="delivered" fill="#82ca9d" />
                <Bar dataKey="read" fill="#ffc658" />
                <Bar dataKey="failed" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignAnalytics = memo(MemoCampaignAnalytics);
export default CampaignAnalytics;
