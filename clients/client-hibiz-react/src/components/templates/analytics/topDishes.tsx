import type { Dish } from '@/components/types/businessId';
import { COLORS, CustomTooltip } from '@/components/utils/chart-utils';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { FaChartPie, FaCrown, FaFire } from 'react-icons/fa';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

interface ColorLegendProps {
  data: Dish[];
  maxVisible?: number;
}

const ColorLegend: FC<ColorLegendProps> = ({ data, maxVisible = 5 }) => {
  const displayData = data.slice(0, maxVisible);
  const hasMore = data.length > maxVisible;

  return (
    <div className={`space-y-3 ${hasMore ? 'custom-scrollbar max-h-72 overflow-y-auto' : ''}`}>
      {displayData.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:from-indigo-50 hover:to-purple-50 hover:shadow-md"
        >
          <div className="flex items-center">
            <div className="mr-3 h-5 w-5 rounded-full shadow-lg ring-2 ring-white/50" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <div>
              <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-indigo-600">{item.name}</span>
              <p className="text-xs text-gray-500">({((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%)</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-semibold text-gray-600">{item.count}</span>
            <FaFire className="text-xs text-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface RenderActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: Dish;
  percent: number;
  rank: number;
}

const RenderActiveShape: FC<RenderActiveShapeProps> = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
}) => {
  const radian = Math.PI / 180;
  const x = cx + (outerRadius + 10) * Math.cos(-midAngle * radian);
  const y = cy + (outerRadius + 10) * Math.sin(-midAngle * radian);

  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="14" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={x} y={y + 20} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
        {payload.name}
      </text>
    </g>
  );
};

interface TopDishesChartProps {
  topDishes: Dish[];
}

export const TopDishesChart: FC<TopDishesChartProps> = ({ topDishes }) => {
  const totalOrders = topDishes.reduce((sum, dish) => sum + dish.count, 0);
  const topItem = topDishes[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-12 overflow-hidden rounded-3xl border border-indigo-100/50 bg-gradient-to-br from-white via-indigo-50 to-purple-50 p-8 shadow-xl lg:mt-4"
    >
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-xl" />
      <div className="absolute bottom-0 left-0 mb-16 ml-16 h-24 w-24 rounded-full bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 blur-xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <h2 className="mb-2 flex items-center text-3xl font-extrabold text-gray-900">
          <div className="relative mr-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2 shadow-lg">
            <FaChartPie className="text-2xl text-white" />
            <FaCrown className="absolute -right-1 -top-1 text-sm text-yellow-300" />
          </div>
          Top Performing Items
        </h2>
        <p className="text-base font-medium text-gray-600">Spotlight on your crowd favorites from {totalOrders.toLocaleString()} total orders</p>
        {topItem && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 flex items-center rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3"
          >
            <FaFire className="mr-2 text-xl text-green-500" />
            <span className="text-sm font-bold text-green-800">
              🔥 {topItem.name} leads with {topItem.count} orders!
            </span>
          </motion.div>
        )}
      </div>

      {/* Chart and Legend Grid */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-0">
        {/* Chart Section */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative lg:col-span-2">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
          <div className="relative z-10 h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topDishes}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={50}
                  fill="#8884d8"
                  paddingAngle={5}
                  cornerRadius={8}
                  activeIndex={0}
                  activeShape={RenderActiveShape}
                  labelLine={false}
                >
                  {topDishes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Legend Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-full">
          <h3 className="mb-6 flex items-center text-lg font-bold text-gray-900">
            Order Breakdown
            <FaChartPie className="ml-2 text-sm text-indigo-500" />
          </h3>
          <ColorLegend data={topDishes} maxVisible={5} />
        </motion.div>
      </div>
    </motion.div>
  );
};
