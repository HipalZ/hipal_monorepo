import { memo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import {
  BarChart2,
  CheckCircle,
  Eye,
  MousePointerClick,
  Send,
} from "lucide-react";
import type { Campaign } from "@/components/store/useWhatsappTempStore";

ChartJS.register(ArcElement, Tooltip, Legend);

const MemoCampaignDetails: React.FC<{ campaign: Campaign }> = ({
  campaign,
}) => {
  const data: ChartData<"pie"> = {
    labels: ["Sent", "Delivered", "Read", "Clicked"],
    datasets: [
      {
        data: [
          campaign?.sent,
          campaign?.delivered,
          campaign?.read,
          campaign?.clicked,
        ],
        backgroundColor: ["#25D366", "#FFEE8C", "#34B7F1", "#4B0082"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
          boxWidth: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (acc: number, data: number) => acc + data,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const onViewDetails = () => {
    console.log("View Detailed Analytics");
  };

  return (
    <div className="w-full mx-auto overflow-hidden bg-gray-100 shadow-lg rounded-xl">
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <div
          className="p-4 transition-transform duration-200 transform bg-white shadow-md rounded-xl "
          style={{ borderTop: "4px solid #25D366" }}
        >
          <h3 className="flex items-center justify-between mb-2 text-base font-semibold text-gray-700 sm:text-lg">
            <span>Sent</span>
            <Send className="text-green-500" size={20} />
          </h3>
          <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {campaign?.sent.toLocaleString("en-IN")}{" "}
          </div>
        </div>
        <div
          className="p-4 transition-transform duration-200 transform bg-white shadow-md rounded-xl "
          style={{ borderTop: "4px solid #FFEE8C" }}
        >
          <h3 className="flex items-center justify-between mb-2 text-base font-semibold text-gray-700 sm:text-lg">
            <span>Delivered</span>
            <CheckCircle className="text-yellow-500" size={20} />
          </h3>
          <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {campaign?.delivered.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          className="p-4 transition-transform duration-200 transform bg-white shadow-md rounded-xl "
          style={{ borderTop: "4px solid #34B7F1" }}
        >
          <h3 className="flex items-center justify-between mb-2 text-base font-semibold text-gray-700 sm:text-lg">
            <span>Read</span>
            <Eye className="text-blue-500" size={20} />
          </h3>
          <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {campaign?.read.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          className="p-4 transition-transform duration-200 transform bg-white shadow-md rounded-xl "
          style={{ borderTop: "4px solid #4B0082" }}
        >
          <h3 className="flex items-center justify-between mb-2 text-base font-semibold text-gray-700 sm:text-lg">
            <span>Clicked</span>
            <MousePointerClick className="text-purple-500" size={20} />
          </h3>
          <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {campaign?.clicked.toLocaleString("en-IN")}
          </div>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white shadow-md rounded-xl">
        <div className="w-1/2 h-64">
          <Pie data={data} options={options} />
        </div>
        <div>
          <button
            onClick={onViewDetails}
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 hover:scale-90"
          >
            <BarChart2 size={18} />
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignDetails = memo(MemoCampaignDetails);
export default CampaignDetails;
