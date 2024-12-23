"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Sent", "Received", "Read", "Failed", "Block"],
  datasets: [
    {
      data: [555, 550, 548, 2, 5],
      backgroundColor: ["#ef4444", "#22c55e", "#3b82f6", "#ec4899", "#6b7280"],
      borderColor: ["#fff", "#fff", "#fff", "#fff", "#fff"],
      borderWidth: 2,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
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

export function DetailedAnalyticsPieChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[300px] h-[300px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
