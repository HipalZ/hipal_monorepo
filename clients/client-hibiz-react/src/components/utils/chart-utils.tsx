import type { FC } from "react";

export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

export const CustomTooltip: FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded shadow-md">
        <p className="font-semibold">{label}</p>
        <p>{`Orders: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
