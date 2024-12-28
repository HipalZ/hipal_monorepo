import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { memo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels && data.datasets.length) {
            const dataset = data.datasets[0];
            return data.labels.map((label, index) => {
              const value = dataset.data[index];
              return {
                text: `${label}: ${value}`, // Append the number to the label
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.borderColor[index],
                lineWidth: dataset.borderWidth,
                hidden: !chart.isDatasetVisible(0),
                index: index,
              };
            });
          }
          return [];
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((value / total) * 100).toFixed(2);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

const MemoDetailedAnalytics = () => {
  const campaignsData = useWhatsappTempStore((s) => s.campaignsData);
  const rawData = [
    campaignsData?.overAllCount?.sent || 0,
    campaignsData?.overAllCount?.delivered || 0,
    campaignsData?.overAllCount?.read || 0,
    campaignsData?.overAllCount?.failed || 0,
    campaignsData?.overAllCount?.blocked || 0,
  ];

  const hasData = rawData.some((value) => value > 0);

  const data = {
    labels: ["Sent", "Received", "Read", "Failed", "Blocked"],
    datasets: [
      {
        data: rawData,
        backgroundColor: [
          "#25D366",
          "#FFEE8C",
          "#34B7F1",
          "#4B0082",
          "#FF0000",
        ],
        borderColor: ["#fff", "#fff", "#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-[300px] h-[300px] flex items-center justify-center">
      {hasData ? (
        <Pie data={data} options={options} />
      ) : (
        <div className="text-center text-gray-500">No data available</div>
      )}
    </div>
  );
};

const DetailedAnalyticsPieChart = memo(MemoDetailedAnalytics);
export default DetailedAnalyticsPieChart;
