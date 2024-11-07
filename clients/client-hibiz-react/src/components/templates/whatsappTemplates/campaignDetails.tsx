import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { Campaign } from "./campaignAnalytics";
import { memo } from "react";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MemoCampaignDetails: React.FC<{ campaign: Campaign }> = ({
  campaign,
}) => {
  // Data and options for Chart.js
  const data = {
    labels: ["Sent", "Delivered", "Read", "Failed"],
    datasets: [
      {
        label: `${campaign.name} Analytics`,
        data: [
          campaign.sent,
          campaign.delivered,
          campaign.read,
          campaign.failed,
        ],
        backgroundColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context) => `${context.raw.toLocaleString()}` },
      },
    },
    scales: {
      x: { display: true, title: { display: true, text: "Metrics" } },
      y: {
        display: true,
        title: { display: true, text: "Count" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{campaign.name} Analytics</h2>
        <p className="text-gray-600">
          Detailed performance of the {campaign.name} campaign
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-[#8884d8] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Sent</h3>
            <div className="text-2xl font-bold">
              {campaign.sent.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-[#82ca9d] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Delivered</h3>
            <div className="text-2xl font-bold">
              {campaign.delivered.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-[#ffc658] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Read</h3>
            <div className="text-2xl font-bold">
              {campaign.read.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-[#ff8042] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Failed</h3>
            <div className="text-2xl font-bold">
              {campaign.failed.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="h-[300px] mt-6">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

const CampaignDetails = memo(MemoCampaignDetails);
export default CampaignDetails;
