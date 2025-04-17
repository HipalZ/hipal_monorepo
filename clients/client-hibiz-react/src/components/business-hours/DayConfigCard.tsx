import  { memo, useCallback, useState } from "react"
import type { BusinessDayConfig, UpdateBusinessDayConfigPayload } from "../types/business-day-config"
import TimeRangeSelector from "./TimeRangeSelector"
import ClosedIntervalList from "./ClosedIntervalList"
import { Clock, ChevronDown, ChevronUp, Edit2, Save, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useBusinessDayConfigUIStore } from "../store/booking/businessDayConfigStore"
import {  getDayName } from "../utils/timeUtils"

/**
 * Props for the DayConfigCard component
 */
type DayConfigCardProps = {
  config: BusinessDayConfig
  businessId: string
  onToggleDay: (businessId: string, dayOfWeek: number) => Promise<void>
  onUpdateConfig: (businessId: string, payload: UpdateBusinessDayConfigPayload) => Promise<void>
}

/**
 * Component for displaying and editing a single day configuration
 */
const DayConfigCard: React.FC<DayConfigCardProps> = ({ config, businessId, onToggleDay, onUpdateConfig }) => {
  // Local state for expanded view
  const [isExpanded, setIsExpanded] = useState(false)

  // Get UI state and actions from store
  const {
    editingDayId,
    editState,
    timeRangeError,
    intervalError,
    startEditing,
    cancelEditing,
    updateStartTime,
    updateEndTime,
    addClosedInterval,
    updateClosedInterval,
    removeClosedInterval,
  } = useBusinessDayConfigUIStore()

  // Check if this card is being edited
  const isEditing = editingDayId === config._id

  /**
   * Start editing this day configuration
   */
  const handleStartEditing = useCallback(() => {
    startEditing(config._id, {
      dayOfWeek: config.dayOfWeek,
      startTime: config.startTime,
      endTime: config.endTime,
      closedIntervals: [...config.closedIntervals],
      isOpen: config.isOpen,
    })
    setIsExpanded(true)
  }, [config, startEditing])

  /**
   * Toggle day open/closed
   */
  const handleToggleDay = useCallback(() => {
    onToggleDay(businessId, config.dayOfWeek)
  }, [businessId, config.dayOfWeek, onToggleDay])

  /**
   * Handle start time change
   */
  const handleStartTimeChange = useCallback(
    (newStartTime: string) => {
      updateStartTime(newStartTime)
    },
    [updateStartTime],
  )

  /**
   * Handle end time change
   */
  const handleEndTimeChange = useCallback(
    (newEndTime: string) => {
      updateEndTime(newEndTime)
    },
    [updateEndTime],
  )

  /**
   * Add a new closed interval
   */
  const handleAddClosedInterval = useCallback(
    (startTime: string, endTime: string) => {
      addClosedInterval(startTime, endTime)
    },
    [addClosedInterval],
  )

  /**
   * Save changes to the day configuration
   */
  const handleSave = useCallback(async () => {
    if (!editState) return

    const payload: UpdateBusinessDayConfigPayload = {
      dayOfWeek: editState.dayOfWeek,
      startTime: editState.startTime,
      endTime: editState.endTime,
      closedIntervals: editState.closedIntervals,
      isOpen: editState.isOpen,
    }

    try {
      await onUpdateConfig(businessId, payload)
    } catch (error) {
      console.error("Error saving day config:", error)
    }
  }, [editState, businessId, onUpdateConfig])

  /**
   * Toggle expanded view
   */
  const toggleExpanded = useCallback(() => {
    if (!isEditing) {
      setIsExpanded((prev) => !prev)
    }
  }, [isEditing])

  // Check if there are any validation errors
  const hasErrors = timeRangeError || intervalError

  // Get day name abbreviation
  const dayAbbr = getDayName(config.dayOfWeek).substring(0, 3)

  // Add this component to render a visual timeline


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-xl shadow-sm transition-all duration-300 ${
        isEditing ? "shadow-md ring-2 ring-primary/20" : ""
      } ${config.isOpen ? "bg-white" : "bg-gray-50"}`}
    >
      {/* Card header */}
      <div
        className={`flex items-center justify-between p-4 ${
          config.isOpen ? "bg-gradient-to-r from-primary-50 to-white" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Day indicator */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              config.isOpen ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            <span className="text-sm font-medium">{dayAbbr}</span>
          </div>

          {/* Day name and status */}
          <div>
            <h3 className="text-base font-semibold text-gray-900">{getDayName(config.dayOfWeek)}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${config.isOpen ? "bg-green-500" : "bg-gray-400"}`}></span>
              <span className="text-xs text-gray-500">{config.isOpen ? "Open" : "Closed"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.isOpen}
              onChange={handleToggleDay}
              disabled={isEditing}
            />
            <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 peer-disabled:opacity-70"></div>
          </label>

          {/* Expand/collapse button */}
          {config.isOpen && !isEditing && (
            <button
            type="button"
              onClick={toggleExpanded}
              className="ml-1 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Card content - only show if day is open */}
      {config.isOpen && (
        <AnimatePresence>
          {(isExpanded || isEditing) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-gray-100">
                {/* View mode */}
                {!isEditing ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-medium text-gray-700">Business Hours:</span>
                        <span className="text-sm font-semibold">
                          {config.startTime} - {config.endTime}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-100"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                    </div>

                    {/* Display closed intervals if any */}
                    {config.closedIntervals.length > 0 && (
                      <div className="mt-3">
                        <h4 className="mb-2 text-xs font-medium text-gray-500 uppercase">Closed Intervals</h4>
                        <div className="space-y-2">
                          {config.closedIntervals.map((interval, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-md bg-gray-50 p-2.5 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <span className="font-medium text-gray-700">
                                {interval.startTime} - {interval.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Edit mode */
                  <div>
                    {/* Time range selector */}
                    {editState && (
                      <>
                        <TimeRangeSelector
                          startTime={editState.startTime}
                          endTime={editState.endTime}
                          onStartTimeChange={handleStartTimeChange}
                          onEndTimeChange={handleEndTimeChange}
                          error={timeRangeError}
                        />

                        {/* Closed intervals list */}
                        <ClosedIntervalList
                          intervals={editState.closedIntervals}
                          dayStartTime={editState.startTime}
                          dayEndTime={editState.endTime}
                          onAddInterval={handleAddClosedInterval}
                          onUpdateInterval={updateClosedInterval}
                          onRemoveInterval={removeClosedInterval}
                          error={intervalError}
                        />
                      </>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mt-5">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-600 disabled:bg-primary-300"
                        disabled={!!hasErrors}
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export default memo(DayConfigCard)
