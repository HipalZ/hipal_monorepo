import { memo, useState } from "react";
import { TabGroup, TabPanel, TabPanels } from "@headlessui/react";

interface Campaign {
  id: string;
  name: string;
  status: "Active" | "Completed" | "Draft";
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

const MemoCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
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
  ]);

  return (
    <section className="px-4 mb-8">
      <TabGroup>
        <TabPanels className="mt-2">
          <TabPanel
            className={`rounded-lg bg-white border overflow-hidden
              ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Read
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            campaign.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : campaign.status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.sent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.delivered}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.read}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.failed}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <button
                          type="button"
                          className="px-4 py-2 shadow-lg text-white bg-[#00E676] rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:ring-opacity-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  );
};

const CampaignManagement = memo(MemoCampaignManagement);
export default CampaignManagement;
