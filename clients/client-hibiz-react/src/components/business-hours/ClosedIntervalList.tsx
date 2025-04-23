
import  { type FC, memo, useCallback } from "react"
import type { ClosedInterval } from "../types/business-day-config"
import ClosedIntervalItem from "./ClosedIntervalItem"
import { Plus, AlertCircle, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createDefaultClosedInterval } from "../utils/timeUtils"
import { Button } from "../ui/button"

/**
 * Props for the ClosedIntervalList component
 */
type ClosedIntervalListProps = {
    intervals: ClosedInterval[]
    dayStartTime: string
    dayEndTime: string
    onAddInterval: (startTime: string, endTime: string) => void
    onUpdateInterval: (index: number, updatedInterval: ClosedInterval) => void
    onRemoveInterval: (index: number) => void
    error?: string | null
}

/**
 * Component for managing a list of closed intervals
 */
const ClosedIntervalList: FC<ClosedIntervalListProps> = ({
    intervals,
    dayStartTime,
    dayEndTime,
    onAddInterval,
    onUpdateInterval,
    onRemoveInterval,
    error,
}) => {
    // Handle add interval button click
    const handleAddInterval = useCallback(() => {
        const defaultInterval = createDefaultClosedInterval(dayStartTime, dayEndTime, intervals)

        if (defaultInterval) {
            onAddInterval(defaultInterval.startTime, defaultInterval.endTime)
        } else {
            // No available slot found
            alert(
                "No available time slot for a new closed interval. All time slots are already covered or remaining gaps are less than 30 minutes.",
            )
        }
    }, [dayStartTime, dayEndTime, intervals, onAddInterval])

    return (
        <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-red-500" />
                    <label className="text-sm font-medium text-gray-700">Closed Intervals</label>
                </div>

                {/* Add interval button */}
                <Button
                    type="button"
                    onClick={handleAddInterval}
                    variant="secondary"   
                    size="sm"             >
                    <Plus size={14} />
                    Add Interval
                </Button>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-3 flex items-start gap-2 rounded-md bg-red-50 p-2.5 text-sm text-red-600">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* List of intervals */}
            <div className="mt-2 space-y-2">
                <AnimatePresence initial={false}>
                    {intervals.map((interval, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ClosedIntervalItem
                                interval={interval}
                                index={index}
                                dayStartTime={dayStartTime}
                                dayEndTime={dayEndTime}
                                onUpdate={onUpdateInterval}
                                onRemove={onRemoveInterval}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {intervals.length === 0 && (
                    <div className="flex items-center justify-center p-4 border border-gray-300 border-dashed rounded-md bg-gray-50">
                        <p className="text-sm text-gray-500">
                            No closed intervals. Add intervals to block off specific times when you're not accepting bookings.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default memo(ClosedIntervalList)
