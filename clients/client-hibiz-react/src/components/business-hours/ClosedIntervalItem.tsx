import { memo, useCallback } from "react"
import { Trash2 } from "lucide-react"
import type { ClosedInterval } from "../types/business-day-config"
import { generateTimeOptions } from "../utils/timeUtils"

/**
 * Props for the ClosedIntervalItem component
 */
type ClosedIntervalItemProps = {
  interval: ClosedInterval
  index: number
  dayStartTime: string
  dayEndTime: string
  onUpdate: (index: number, updatedInterval: ClosedInterval) => void
  onRemove: (index: number) => void
}

/**
 * Component for displaying and editing a single closed interval
 */
const ClosedIntervalItem = ({
  interval,
  index,
  dayStartTime,
  dayEndTime,
  onUpdate,
  onRemove,
}: ClosedIntervalItemProps) => {
  // Generate time options for the dropdowns
  const timeOptions = generateTimeOptions(4, 28)

  // Handle start time change
  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(index, { ...interval, startTime: e.target.value })
    },
    [index, interval, onUpdate],
  )

  // Handle end time change
  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(index, { ...interval, endTime: e.target.value })
    },
    [index, interval, onUpdate],
  )

  // Handle remove button click
  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [index, onRemove])

  return (
    <div className="flex items-center gap-2 p-3 border border-red-100 rounded-md bg-red-50">
      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full" />

      <div className="flex items-center flex-1 gap-2">
        {/* Start time selector */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={interval.startTime}
              onChange={handleStartTimeChange}
              className="w-full appearance-none rounded-md border border-red-200 bg-white px-3 py-1.5 pr-8 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {timeOptions.map((option) => (
                <option
                  key={`start-${option.value}`}
                  value={option.value}
                  disabled={option.value < dayStartTime || option.value >= interval.endTime}
                >
                  {option.label}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="flex items-center h-8">
          <div className="w-4 h-px bg-red-200"></div>
        </div>

        {/* End time selector */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={interval.endTime}
              onChange={handleEndTimeChange}
              className="w-full appearance-none rounded-md border border-red-200 bg-white px-3 py-1.5 pr-8 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {timeOptions.map((option) => (
                <option
                  key={`end-${option.value}`}
                  value={option.value}
                  disabled={option.value <= interval.startTime || option.value > dayEndTime}
                >
                  {option.label}
                </option>
              ))}
            </select>

          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        className="flex-shrink-0 rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-100"
        aria-label="Remove interval"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default memo(ClosedIntervalItem)
