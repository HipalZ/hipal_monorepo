import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import PeriodCard from "./PeriodCard";
import { getDayName } from "@/components/utils/timeUtils";
import type { PeriodConfig } from "@/hooks/useBusinessPeriodConfig";
import { memo } from "react";

type PeriodGroupProps = {
  periodKey: string;
  periodIndex: number;
  days: Record<string, PeriodConfig>;
  periodInfo: {
    icon: any;
    label: string;
    color: string;
  };
  dayColors: string[];
  onTogglePeriod: (dayOfWeek: number, period: number) => Promise<void>;
  onSavePeriod: (
    dayOfWeek: number,
    period: number,
    baseCharge: number,
    redeemableCoverCharge: number,
    isOpen: boolean,
    couponAllocations?: any[],
  ) => Promise<void>;
  isActionInProgress: boolean;
  businessId: string;
  onCreateCoupon: (payload: any) => Promise<void>;
  isCreatingCoupon: boolean;
};

const PeriodGroup = ({
  periodKey,
  periodIndex,
  days,
  periodInfo,
  dayColors,
  onTogglePeriod,
  onSavePeriod,
  isActionInProgress,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}: PeriodGroupProps) => {
  const PeriodIcon = periodInfo.icon;

  return (
    <motion.div
      key={periodKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="shadow-sm overflow-hidden rounded-xl border"
    >
      <CardHeader
        className={`pb-2 pt-3 px-4 bg-gradient-to-r ${
          periodIndex === 0
            ? "from-amber-50 to-white"
            : periodIndex === 1
              ? "from-blue-50 to-white"
              : periodIndex === 2
                ? "from-orange-50 to-white"
                : "from-indigo-50 to-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              periodIndex === 0
                ? "bg-amber-500"
                : periodIndex === 1
                  ? "bg-blue-500"
                  : periodIndex === 2
                    ? "bg-orange-500"
                    : "bg-indigo-500"
            } text-white`}
          >
            <PeriodIcon size={16} />
          </div>
          <div>
            <CardTitle className="text-lg">{periodInfo.label} Period</CardTitle>
            <CardDescription className="text-xs">
              {periodIndex === 0
                ? "04:00 - 12:00"
                : periodIndex === 1
                  ? "12:00 - 16:00"
                  : periodIndex === 2
                    ? "16:00 - 19:00"
                    : "19:00 - 28:00"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-4 px-4">
        <ScrollArea className="h-[450px] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
            {Object.entries(days).map(([dayOfWeek, periodConfig]) => {
              const dayIndex = Number.parseInt(dayOfWeek);
              const dayName = getDayName(dayIndex);

              return (
                <PeriodCard
                  key={`${periodKey}-${dayOfWeek}`}
                  periodConfig={periodConfig}
                  periodIndex={periodIndex}
                  dayIndex={dayIndex}
                  periodInfo={periodInfo}
                  dayName={dayName}
                  onTogglePeriod={onTogglePeriod}
                  onSavePeriod={onSavePeriod}
                  isActionInProgress={isActionInProgress}
                  viewMode="period"
                  businessId={businessId}
                  onCreateCoupon={onCreateCoupon}
                  isCreatingCoupon={isCreatingCoupon}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </motion.div>
  );
};

export default memo(PeriodGroup);
