import { memo, useCallback, useState } from "react"
import { Plus } from "lucide-react"
import ClosedIntervalItem from "./ClosedIntervalItem"
import type { ClosedInterval } from "../types/business-day-config.ts"
import { createDefaultClosedInterval } from "../utils/timeUtils.ts"

/**
 * Props for the ClosedIntervalList component
 */
type ClosedIntervalListProps = {
  intervals: ClosedInterval[]
  dayStartTime: string
  dayEndTime: string
  onAddInterval: (startTime: string, endTime: string) => boolean
  onUpdateInterval: (index: number, updatedInterval: ClosedInterval) => boolean
  onRemoveInterval: (index: number) => void
  error?: string | null
}

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
  const [isAddingInterval, setIsAddingInterval] = useState(false)

  /**
   * Handle add interval button click
   */
  const handleAddInterval = useCallback(() => {
    // Create a default interval
    const defaultInterval = createDefaultClosedInterval(dayStartTime, dayEndTime, intervals)

    if (defaultInterval) {
      // Try to add the interval
      const success = onAddInterval(defaultInterval.startTime, defaultInterval.endTime)
      if (success) {
        setIsAddingInterval(false)
      }
    } else {
      // If no default interval could be created, use the day start time + 30 min
      // This gives the user a starting point to modify
      const startMinutes =
        Number.parseInt(dayStartTime.split(":")[0]) * 60 + Number.parseInt(dayStartTime.split(":")[1])
      const endMinutes = startMinutes + 30
      const endTime = `${Math.floor(endMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`

      onAddInterval(dayStartTime, endTime)
    }
  }, [dayStartTime, dayEndTime, intervals, onAddInterval])

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Closed Intervals</h3>
        <button
          type="button"
          onClick={handleAddInterval}
          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <Plus size={14} />
          Add Interval
        </button>
      </div>

      {/* Error message */}
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      
      {/* Intervals list */}
      <div className="space-y-2 mt-2">
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
          <p className="text-xs text-gray-500 italic">No closed intervals defined.</p>
        )}
      </div>
    </div>
  )
}

export default memo(ClosedIntervalList)
