import type { BusinessDayConfig, ClosedInterval, DayConfigEditState } from "@/components/types/business-day-config"
import { timeToMinutes, validateDayBoundsWithIntervals, validateNewClosedIntervalWithDetails } from "@/components/utils/timeUtils"
import { create } from "zustand"

/**
 * Interface for the business day configuration UI store
 */
interface BusinessDayConfigUIState {
  // State
  businessDayConfigs: BusinessDayConfig[]
  editingDayId: string | null
  editState: DayConfigEditState | null
  timeRangeError: string | null
  intervalError: string | null

  // Actions
  setBusinessDayConfigs: (configs: BusinessDayConfig[]) => void
  startEditing: (dayId: string, config: DayConfigEditState) => void
  cancelEditing: () => void
  resetEditState: () => void
  updateStartTime: (time: string) => boolean
  updateEndTime: (time: string) => boolean
  addClosedInterval: (startTime: string, endTime: string) => boolean
  updateClosedInterval: (index: number, interval: ClosedInterval) => boolean
  removeClosedInterval: (index: number) => void
  setTimeRangeError: (error: string | null) => void
  setIntervalError: (error: string | null) => void
  resetErrors: () => void
}

/**
 * Zustand store for managing UI state of business day configuration
 */
export const useBusinessDayConfigUIStore = create<BusinessDayConfigUIState>((set, get) => ({
  // Initial state
  businessDayConfigs: [],
  editingDayId: null,
  editState: null,
  timeRangeError: null,
  intervalError: null,

  // Actions
  setBusinessDayConfigs: (configs) => set({ businessDayConfigs: configs }),

  startEditing: (dayId, config) =>
    set({
      editingDayId: dayId,
      editState: { ...config },
      timeRangeError: null,
      intervalError: null,
    }),

  cancelEditing: () =>
    set({
      editingDayId: null,
      editState: null,
      timeRangeError: null,
      intervalError: null,
    }),

  resetEditState: () =>
    set({
      editingDayId: null,
      editState: null,
      timeRangeError: null,
      intervalError: null,
    }),

  updateStartTime: (time) => {
    const { editState } = get()
    if (!editState) return false

    // Validate that start time is before end time
    if (timeToMinutes(time) >= timeToMinutes(editState.endTime)) {
      set({ timeRangeError: "Start time must be before end time" })
      return false
    }

    // Validate that all closed intervals are still within bounds
    if (!validateDayBoundsWithIntervals(time, editState.endTime, editState.closedIntervals)) {
      set({ timeRangeError: "New start time would invalidate closed intervals" })
      return false
    }

    set({
      editState: { ...editState, startTime: time },
      timeRangeError: null,
    })

    return true
  },

  updateEndTime: (time) => {
    const { editState } = get()
    if (!editState) return false

    // Validate that end time is after start time
    if (timeToMinutes(editState.startTime) >= timeToMinutes(time)) {
      set({ timeRangeError: "End time must be after start time" })
      return false
    }

    // Validate that all closed intervals are still within bounds
    if (!validateDayBoundsWithIntervals(editState.startTime, time, editState.closedIntervals)) {
      set({ timeRangeError: "New end time would invalidate closed intervals" })
      return false
    }

    set({
      editState: { ...editState, endTime: time },
      timeRangeError: null,
    })

    return true
  },

  addClosedInterval: (startTime, endTime) => {
    const { editState } = get()
    if (!editState) return false

    const newInterval: ClosedInterval = {
      startTime,
      endTime,
    }

    // Validate that the new interval doesn't overlap with existing ones
    const validationResult = validateNewClosedIntervalWithDetails(newInterval, editState.closedIntervals)
    if (!validationResult.isValid) {
      // Provide a more specific error message
      if (validationResult.overlappingInterval) {
        const overlap = validationResult.overlappingInterval
        set({
          intervalError: `This interval overlaps with existing interval ${overlap.startTime} - ${overlap.endTime}`,
        })
      } else {
        set({ intervalError: "New closed interval would overlap with existing intervals" })
      }
      return false
    }

    set({
      editState: {
        ...editState,
        closedIntervals: [...editState.closedIntervals, newInterval],
      },
      intervalError: null,
    })

    return true
  },

  updateClosedInterval: (index, interval) => {
    const { editState } = get()
    if (!editState) return false

    // Check if the updated interval would overlap with any other interval
    const otherIntervals = editState.closedIntervals.filter((_, i) => i !== index)
    const validationResult = validateNewClosedIntervalWithDetails(interval, otherIntervals)

    if (!validationResult.isValid) {
      // Provide a more specific error message
      if (validationResult.overlappingInterval) {
        const overlap = validationResult.overlappingInterval
        set({
          intervalError: `This update would overlap with interval ${overlap.startTime} - ${overlap.endTime}`,
        })
      } else {
        set({ intervalError: "Updated interval would overlap with other intervals" })
      }
      return false
    }

    const newIntervals = [...editState.closedIntervals]
    newIntervals[index] = interval

    set({
      editState: { ...editState, closedIntervals: newIntervals },
      intervalError: null,
    })

    return true
  },

  removeClosedInterval: (index) => {
    const { editState } = get()
    if (!editState) return

    set({
      editState: {
        ...editState,
        closedIntervals: editState.closedIntervals.filter((_, i) => i !== index),
      },
      intervalError: null,
    })
  },

  setTimeRangeError: (error) => set({ timeRangeError: error }),

  setIntervalError: (error) => set({ intervalError: error }),

  resetErrors: () => set({ timeRangeError: null, intervalError: null }),
}))
