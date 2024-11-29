import type { TimePeriod } from "@/components/types/businessId";
import type { FC } from "react";
import { FaClock } from "react-icons/fa";

interface TimeBasedAnalyticsProps {
  timeBasedAnalytics: TimePeriod[];
}

export const TimeBasedAnalytics: FC<TimeBasedAnalyticsProps> = ({
  timeBasedAnalytics,
}) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="flex items-center mb-4 text-2xl font-bold">
      <FaClock className="mr-2" /> Time-Based Analytics
    </h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {timeBasedAnalytics.map((period) => (
        <div key={period.timePeriod} className="p-4 bg-gray-100 rounded-lg">
          <h3 className="mb-2 text-lg font-semibold">{period.timePeriod}</h3>
          {period.topDish ? (
            <div>
              <p className="font-medium">{period.topDish.name}</p>
              <p>{period.topDish.count} orders</p>
            </div>
          ) : (
            <p>No top item data available</p>
          )}
        </div>
      ))}
    </div>
  </div>
);
