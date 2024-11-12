import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import type { Campaign } from "./campaignAnalytics";
import { memo } from "react";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MemoCampaignDetails: React.FC<{ campaign: Campaign }> = ({
  campaign,
}) => {
  // Data and options for Chart.js
  console.log("campaign", campaign);
  const data = {
    labels: ["Sent", "Delivered", "Read", "Clicked"],
    datasets: [
      {
        label: `Analytics for ${campaign?.templateName}`,
        data: [
          campaign?.sent,
          campaign?.delivered,
          campaign?.read,
          campaign?.clicked,
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
        callbacks: {
          label: (tooltipItem: TooltipItem<"bar">) =>
            `${(tooltipItem.raw as number).toLocaleString()}`,
        },
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
        <h2 className="text-xl font-semibold">
          {campaign?.templateName} Analytics
        </h2>
        <p className="text-gray-600">
          Detailed performance of the {campaign?.templateName} campaign
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-[#8884d8] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Sent</h3>
            <div className="text-2xl font-bold">{campaign?.sent}</div>
          </div>
          <div className="p-4 bg-[#82ca9d] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Delivered</h3>
            <div className="text-2xl font-bold">{campaign?.delivered}</div>
          </div>
          <div className="p-4 bg-[#ffc658] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Read</h3>
            <div className="text-2xl font-bold">{campaign?.read}</div>
          </div>
          <div className="p-4 bg-[#ffc658] text-white rounded-lg shadow">
            <h3 className="text-sm font-medium">Clicked</h3>
            <div className="text-2xl font-bold">{campaign?.clicked}</div>
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
