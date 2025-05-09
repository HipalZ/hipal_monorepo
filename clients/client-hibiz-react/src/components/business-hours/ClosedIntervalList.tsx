import { Plus } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import type { ClosedInterval } from '../types/business-day-config.ts';
import { Button } from '../ui/button.tsx';
import { createDefaultClosedInterval } from '../utils/timeUtils.ts';
import ClosedIntervalItem from './ClosedIntervalItem';

/**
 * Props for the ClosedIntervalList component
 */
type ClosedIntervalListProps = {
  intervals: ClosedInterval[];
  dayStartTime: string;
  dayEndTime: string;
  onAddInterval: (startTime: string, endTime: string) => boolean;
  onUpdateInterval: (index: number, updatedInterval: ClosedInterval) => boolean;
  onRemoveInterval: (index: number) => void;
  error?: string | null;
};

/**
 * Component for displaying and managing a list of closed intervals
 */
const ClosedIntervalList = ({
  intervals,
  dayStartTime,
  dayEndTime,
  onAddInterval,
  onUpdateInterval,
  onRemoveInterval,
  error,
}: ClosedIntervalListProps) => {
  // Local state for new interval
  const [isAddingInterval, setIsAddingInterval] = useState(false);

  /**
   * Handle add interval button click
   */
  const handleAddInterval = useCallback(() => {
    // Create a default interval
    const defaultInterval = createDefaultClosedInterval(dayStartTime, dayEndTime, intervals);

    if (defaultInterval) {
      // Try to add the interval
      const success = onAddInterval(defaultInterval.startTime, defaultInterval.endTime);
      if (success) {
        setIsAddingInterval(false);
      }
    } else {
      // If no default interval could be created, use the day start time + 30 min
      // This gives the user a starting point to modify
      const startMinutes = Number.parseInt(dayStartTime.split(':')[0]) * 60 + Number.parseInt(dayStartTime.split(':')[1]);
      const endMinutes = startMinutes + 30;
      const endTime = `${Math.floor(endMinutes / 60)
        .toString()
        .padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

      onAddInterval(dayStartTime, endTime);
    }
  }, [dayStartTime, dayEndTime, intervals, onAddInterval]);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Closed Intervals</h3>
        <Button variant="secondary" size="sm" type="button" onClick={handleAddInterval}>
          <Plus size={14} />
          Add Interval
        </Button>
      </div>

      {/* Error message */}
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

      {/* Intervals list */}
      <div className="mt-2 space-y-2">
        {intervals.length > 0 ? (
          intervals.map((interval, index) => (
            <ClosedIntervalItem
              key={index}
              interval={interval}
              index={index}
              dayStartTime={dayStartTime}
              dayEndTime={dayEndTime}
              onUpdate={onUpdateInterval}
              onRemove={onRemoveInterval}
            />
          ))
        ) : (
          <p className="text-xs italic text-gray-500">No closed intervals defined.</p>
        )}
      </div>
    </div>
  );
};

export default memo(ClosedIntervalList);
