import  {type FC, memo, useCallback } from "react"
import { generateTimeOptions, timeToMinutes, determinePeriod, getPeriodName } from "@/components/utils/timeUtils"
import { Clock, AlertCircle } from "lucide-react"

/**
 * Props for the TimeRangeSelector component
 */
type TimeRangeSelectorProps = {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  error?: string | null
}

/**
 * Component for selecting a time range (start and end time)
 */
const TimeRangeSelector: FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
}) => {
  // Generate time options for dropdowns
  const startTimeOptions = generateTimeOptions(4, 27.5, 30)
  const endTimeOptions = generateTimeOptions(4.5, 28, 30)

  // Handle start time change
  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onStartTimeChange(e.target.value)
    },
    [onStartTimeChange],
  )

  // Handle end time change
  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onEndTimeChange(e.target.value)
    },
    [onEndTimeChange],
  )

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Clock size={16} className="text-primary" />
        <label className="text-sm font-medium text-gray-700">Business Hours</label>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-red-50 p-2.5 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Start time selector */}
        <div className="flex-1">
          <label className="block mb-1 text-xs text-gray-500">Open</label>
          <div className="relative">
            <select
              value={startTime}
              onChange={handleStartTimeChange}
              className="w-full px-3 py-2 pr-8 text-sm transition-colors bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {startTimeOptions.map((option) => (
                <option key={`start-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
       
          </div>
        </div>

        <div className="flex items-center h-10">
          <div className="w-6 h-px bg-gray-300"></div>
        </div>

        {/* End time selector */}
        <div className="flex-1">
          <label className="block mb-1 text-xs text-gray-500">Close</label>
          <div className="relative">
            <select
              value={endTime}
              onChange={handleEndTimeChange}
              className="w-full px-3 py-2 pr-8 text-sm transition-colors bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {endTimeOptions.map((option) => (
                <option key={`end-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
        
          </div>
        </div>
      </div>
      {startTime && endTime && (
        <div className="p-3 mt-3 rounded-md bg-blue-50">
          <h4 className="mb-1 text-xs font-medium text-blue-700">Slot Information</h4>
          <div className="text-sm text-blue-600">
            {(() => {
              // Calculate total slots
              const startMinutes = timeToMinutes(startTime)
              const endMinutes = timeToMinutes(endTime)
              const totalMinutes = endMinutes - startMinutes
              const totalSlots = Math.floor(totalMinutes / 30)

              // Determine periods covered
              const startPeriod = determinePeriod(startTime)
              const endPeriod = determinePeriod(endTime)

              return (
                <>
                  <p>
                    Total time: {Math.floor(totalMinutes / 60)} hours {totalMinutes % 60} minutes
                  </p>
                  <p>Available slots: {totalSlots} (30-minute intervals)</p>
                  <p>
                    Periods: {getPeriodName(startPeriod)}
                    {startPeriod !== endPeriod ? ` to ${getPeriodName(endPeriod)}` : ""}
                  </p>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(TimeRangeSelector)
