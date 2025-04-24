import type {
  BusinessDayConfig,
  UpdateBusinessDayConfigPayload,
} from "@/components/types/business-day-config";
import DayConfigCard from "./DayConfigCard";
import { memo } from "react";

/**
 * Props for the DayConfigList component
 */
type DayConfigListProps = {
  configs: BusinessDayConfig[];
  businessId: string;
  onToggleDay: (businessId: string, dayOfWeek: number) => Promise<void>;
  onUpdateConfig: (
    businessId: string,
    payload: UpdateBusinessDayConfigPayload,
  ) => Promise<void>;
};

/**
 * Component for displaying a list of day configurations
 */
const DayConfigList = ({
  configs,
  businessId,
  onToggleDay,
  onUpdateConfig,
}: DayConfigListProps) => {
  // Sort configs by day of week
  const sortedConfigs = [...configs].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="grid items-start grid-cols-1 gap-4 md:grid-cols-2">
      {sortedConfigs.map((config) => (
        <DayConfigCard
          key={config._id}
          config={config}
          businessId={businessId}
          onToggleDay={onToggleDay}
          onUpdateConfig={onUpdateConfig}
        />
      ))}
    </div>
  );
};

export default memo(DayConfigList);
