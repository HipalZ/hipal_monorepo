import type { FC } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FaChartPie } from "react-icons/fa";
import { COLORS, CustomTooltip } from "@/components/utils/chart-utils";
import type { Dish } from "@/components/types/businessId";

interface ColorLegendProps {
  data: Dish[];
}

const ColorLegend: FC<ColorLegendProps> = ({ data }) => (
  <div className="space-y-2">
    {data.map((item, index) => (
      <div key={item.id} className="flex items-center">
        <div
          className="w-4 h-4 mr-2"
          style={{ backgroundColor: COLORS[index % COLORS.length] }}
        ></div>
        <span>
          {item.name} - {item.count} orders
        </span>
      </div>
    ))}
  </div>
);

interface TopDishesChartProps {
  topDishes: Dish[];
}

export const TopDishesChart: FC<TopDishesChartProps> = ({ topDishes }) => (
  <div className="p-6 mt-12 bg-white rounded-lg shadow-md lg:mt-4">
    <h2 className="flex items-center mb-4 text-2xl font-bold">
      <FaChartPie className="mr-2" /> Top Items
    </h2>
    <div className="items-center justify-center lg:flex lg:space-x-4">
      <div className="flex-1 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topDishes}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              fill="#8884d8"
              label
            >
              {topDishes.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 px-4 mt-4 lg:w-1/4 lg:mt-0">
        <h3 className="mb-2 text-lg font-semibold">Item Specification</h3>
        <ColorLegend data={topDishes} />
      </div>
    </div>
  </div>
);
