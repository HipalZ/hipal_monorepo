import type { TimePeriod } from '@/components/types/businessId';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { FaChartLine, FaClock, FaTrophy } from 'react-icons/fa';

interface TimeBasedAnalyticsProps {
  timeBasedAnalytics: TimePeriod[];
}

export const TimeBasedAnalytics: FC<TimeBasedAnalyticsProps> = ({ timeBasedAnalytics }) => {
  const totalPeriodsWithData = timeBasedAnalytics.filter((period) => period.topDish).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:mt-4"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center text-xl font-semibold text-gray-900">
            <FaClock className="mr-2 h-5 w-5 text-gray-500" />
            Time-Based Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {timeBasedAnalytics.length} periods • {totalPeriodsWithData} peak performers
          </p>
        </div>
        <FaChartLine className="h-5 w-5 text-gray-400" />
      </div>

      {/* Periods Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {timeBasedAnalytics.map((period, index) => (
          <motion.div
            key={period.timePeriod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600 transition-colors duration-200" />

            {/* Time period header */}
            <div className="mb-3 flex items-center">
              <FaClock className="mr-2 h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700" />
              <h3 className="truncate text-sm font-semibold text-gray-900">{period.timePeriod}</h3>
            </div>

            {/* Content */}
            {period.topDish ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaTrophy className="mr-2 h-4 w-4 text-gray-400 transition-colors group-hover:text-yellow-500" />
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-gray-800">{period.topDish.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-600">{period.topDish.count} orders</p>
                  <div className="h-1 w-8 overflow-hidden rounded-full bg-gray-200 group-hover:bg-gray-300">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-200"
                      style={{
                        width: `${Math.min((period.topDish.count / Math.max(...timeBasedAnalytics.map((p) => p.topDish?.count || 0))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-3">
                <div className="text-center">
                  <FaClock className="mx-auto mb-1 h-5 w-5 text-gray-300" />
                  <p className="text-xs text-gray-500">No data</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {timeBasedAnalytics.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full mt-4 flex flex-col items-center justify-center border-t border-gray-100 py-12 pt-6 text-center"
        >
          <FaClock className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-lg font-semibold text-gray-500">No Time Data Available</h3>
          <p className="max-w-md text-sm text-gray-400">Collect more orders to reveal peak patterns and optimize your schedule.</p>
        </motion.div>
      )}
    </motion.div>
  );
};
