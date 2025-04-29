import type { ClosedInterval } from "../types/business-day-config"

/**
 * Convert time string (HH:MM) to minutes for easier comparison
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes back to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

/**
 * Check if a closed interval is valid (start < end)
 */
export const isValidInterval = (interval: ClosedInterval): boolean => {
  return timeToMinutes(interval.startTime) < timeToMinutes(interval.endTime)
}

/**
 * Check if two intervals overlap, properly handling day boundaries
 */
export const intervalsOverlap = (a: ClosedInterval, b: ClosedInterval): boolean => {
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)

  // Handle cases where intervals might span across midnight
  // If end time is less than start time, it means the interval spans midnight
  const aSpansMidnight = aEnd < aStart
  const bSpansMidnight = bEnd < bStart

  // Case 1: Neither interval spans midnight
  if (!aSpansMidnight && !bSpansMidnight) {
    return aStart < bEnd && aEnd > bStart
  }

  // Case 2: Interval A spans midnight, B doesn't
  if (aSpansMidnight && !bSpansMidnight) {
    // Either B is within the first part of A (before midnight)
    // or B is within the second part of A (after midnight)
    return bStart < aEnd || bEnd > aStart
  }

  // Case 3: Interval B spans midnight, A doesn't
  if (!aSpansMidnight && bSpansMidnight) {
    // Either A is within the first part of B (before midnight)
    // or A is within the second part of B (after midnight)
    return aStart < bEnd || aEnd > bStart
  }

  // Case 4: Both intervals span midnight
  // They will always overlap in this case
  return true
}

/**
 * Check if an interval is within day bounds, handling day boundaries
 */
export const isIntervalWithinDayBounds = (interval: ClosedInterval, dayStart: string, dayEnd: string): boolean => {
  const intervalStart = timeToMinutes(interval.startTime)
  const intervalEnd = timeToMinutes(interval.endTime)
  const dayStartMinutes = timeToMinutes(dayStart)
  const dayEndMinutes = timeToMinutes(dayEnd)

  // Handle cases where day or interval might span across midnight
  const daySpansMidnight = dayEndMinutes < dayStartMinutes
  const intervalSpansMidnight = intervalEnd < intervalStart

  // Case 1: Neither day nor interval spans midnight
  if (!daySpansMidnight && !intervalSpansMidnight) {
    return intervalStart >= dayStartMinutes && intervalEnd <= dayEndMinutes
  }

  // Case 2: Day spans midnight, interval doesn't
  if (daySpansMidnight && !intervalSpansMidnight) {
    // Interval is either in the first part of the day (before midnight)
    // or in the second part of the day (after midnight)
    return (
      (intervalStart >= dayStartMinutes && intervalStart <= 24 * 60) ||
      (intervalEnd >= 0 && intervalEnd <= dayEndMinutes)
    )
  }

  // Case 3: Interval spans midnight, day doesn't
  if (!daySpansMidnight && intervalSpansMidnight) {
    // This is a complex case - the interval can't be fully contained
    // within a day that doesn't span midnight
    return false
  }

  // Case 4: Both day and interval span midnight
  // Check if interval start is after day start and interval end is before day end
  if (daySpansMidnight && intervalSpansMidnight) {
    return intervalStart >= dayStartMinutes && intervalEnd <= dayEndMinutes
  }

  return false
}

/**
 * Generate time options for dropdowns (30 min intervals)
 * @param startHour Starting hour (e.g., 4 for 04:00)
 * @param endHour Ending hour (e.g., 28 for 04:00 next day)
 * @param intervalMinutes Interval in minutes (default: 30)
 */
export const generateTimeOptions = (
  startHour: number,
  endHour: number,
  intervalMinutes = 30,
): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += intervalMinutes) {
    const timeString = minutesToTime(minutes)
    const hour = Math.floor(minutes / 60)
    const min = minutes % 60

    // Format for display (convert 24+ hours to normal time)
    let displayHour = hour
    let period = "AM"

    if (hour >= 24) {
      displayHour = hour - 24
      period = "AM (Next Day)"
    } else if (hour >= 12) {
      period = "PM"
      if (hour > 12) {
        displayHour = hour - 12
      }
    }

    const label = `${displayHour}:${min.toString().padStart(2, "0")} ${period}`
    options.push({ value: timeString, label })
  }

  return options
}

/**
 * Get day name from day of week number
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek]
}

/**
 * Validate if new day bounds would invalidate any closed intervals
 */
export const validateDayBoundsWithIntervals = (
  startTime: string,
  endTime: string,
  closedIntervals: ClosedInterval[],
): boolean => {
  return closedIntervals.every((interval) => isIntervalWithinDayBounds(interval, startTime, endTime))
}

/**
 * Check if a new closed interval would overlap with existing ones
 * Returns an object with validation result and the overlapping interval if any
 */
export const validateNewClosedIntervalWithDetails = (
  newInterval: ClosedInterval,
  existingIntervals: ClosedInterval[],
): { isValid: boolean; overlappingInterval?: ClosedInterval } => {
  // First, check if the interval is valid (start time before end time)
  if (!isValidInterval(newInterval)) {
    return { isValid: false }
  }

  for (const interval of existingIntervals) {
    if (intervalsOverlap(newInterval, interval)) {
      return { isValid: false, overlappingInterval: interval }
    }
  }
  return { isValid: true }
}

/**
 * Check if a new closed interval would overlap with existing ones
 */
export const validateNewClosedInterval = (
  newInterval: ClosedInterval,
  existingIntervals: ClosedInterval[],
): boolean => {
  return validateNewClosedIntervalWithDetails(newInterval, existingIntervals).isValid
}

/**
 * Find available time slot for a new closed interval
 * Returns a suitable interval that doesn't overlap with existing ones
 */
export const findAvailableTimeSlot = (
  dayStartTime: string,
  dayEndTime: string,
  existingIntervals: ClosedInterval[],
): ClosedInterval | null => {
  // Convert all times to minutes for easier comparison
  const dayStartMinutes = timeToMinutes(dayStartTime)
  const dayEndMinutes = timeToMinutes(dayEndTime)

  // Handle day spans midnight case
  const daySpansMidnight = dayEndMinutes < dayStartMinutes

  // Calculate effective end minutes
  const effectiveEndMinutes = daySpansMidnight ? dayEndMinutes + 24 * 60 : dayEndMinutes
  const totalDayMinutes = effectiveEndMinutes - dayStartMinutes

  // If day is less than 30 minutes, can't fit an interval
  if (totalDayMinutes < 30) {
    return null
  }

  // Sort existing intervals by start time
  const sortedIntervals = [...existingIntervals].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime)
    const bStart = timeToMinutes(b.startTime)
    return aStart - bStart
  })

  // Find gaps between intervals
  let lastEndTime = dayStartMinutes

  // Check each interval to find a gap
  for (const interval of sortedIntervals) {
    const intervalStartMinutes = timeToMinutes(interval.startTime)
    const adjustedStartMinutes =
      intervalStartMinutes < dayStartMinutes && daySpansMidnight ? intervalStartMinutes + 24 * 60 : intervalStartMinutes

    // If there's a gap of at least 30 minutes before this interval, use it
    if (adjustedStartMinutes - lastEndTime >= 30) {
      return {
        startTime: minutesToTime(lastEndTime),
        endTime: minutesToTime(Math.min(lastEndTime + 30, adjustedStartMinutes)),
      }
    }

    // Update the last end time
    const intervalEndMinutes = timeToMinutes(interval.endTime)
    const adjustedEndMinutes =
      intervalEndMinutes < dayStartMinutes && daySpansMidnight ? intervalEndMinutes + 24 * 60 : intervalEndMinutes
    lastEndTime = Math.max(lastEndTime, adjustedEndMinutes)
  }

  // Check if there's space after the last interval
  if (effectiveEndMinutes - lastEndTime >= 30) {
    const newStartTime = lastEndTime
    const newEndTime = Math.min(lastEndTime + 30, effectiveEndMinutes)

    // Convert back to HH:MM format, handling midnight wrapping
    const normalizedStartTime =
      newStartTime >= 24 * 60 ? minutesToTime(newStartTime - 24 * 60) : minutesToTime(newStartTime)
    const normalizedEndTime = newEndTime >= 24 * 60 ? minutesToTime(newEndTime - 24 * 60) : minutesToTime(newEndTime)

    return {
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
    }
  }

  // No available slot found
  return null
}

/**
 * Create a default closed interval
 */
export const createDefaultClosedInterval = (
  dayStartTime: string,
  dayEndTime: string,
  existingIntervals: ClosedInterval[] = [],
): ClosedInterval | null => {
  // Try to find an available slot
  return findAvailableTimeSlot(dayStartTime, dayEndTime, existingIntervals)
}

/**
 * Calculate position percentage for timeline visualization
 */
export const calculateTimePosition = (time: string, dayStart: string, dayEnd: string): number => {
  const timeMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(dayStart)
  const endMinutes = timeToMinutes(dayEnd)
  const totalMinutes = endMinutes - startMinutes

  return ((timeMinutes - startMinutes) / totalMinutes) * 100
}

/**
 * Determine which period a time slot belongs to
 * @param time Time in HH:MM format
 * @returns Period number (0-3)
 */
export const determinePeriod = (time: string): number => {
  const minutes = timeToMinutes(time)

  // Period 0: Morning (04:00-12:00) = 240-720 minutes
  // Period 1: Afternoon (12:00-16:00) = 720-960 minutes
  // Period 2: Evening (16:00-19:00) = 960-1140 minutes
  // Period 3: Night (19:00-28:00) = 1140-1680 minutes

  if (minutes >= 240 && minutes < 720) return 0
  if (minutes >= 720 && minutes < 960) return 1
  if (minutes >= 960 && minutes < 1140) return 2
  if (minutes >= 1140 && minutes <= 1680) return 3

  // Default to morning if outside ranges
  return 0
}

/**
 * Get period name from period number
 */
export const getPeriodName = (period: number): string => {
  const periods = ["Morning", "Afternoon", "Evening", "Night"]
  return periods[period] || "Unknown"
}

export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
  }

  return `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`
}
const PERIODS = [
  { id: 0, name: "Morning", start: 240, end: 720 },
  { id: 1, name: "Afternoon", start: 720, end: 960 },
  { id: 2, name: "Evening", start: 960, end: 1140 },
  { id: 3, name: "Night", start: 1140, end: 1680 },
]
export const getPeriodInfo = (periodId: number) => {
  return PERIODS.find((period) => period.id === periodId) || PERIODS[0]
}
