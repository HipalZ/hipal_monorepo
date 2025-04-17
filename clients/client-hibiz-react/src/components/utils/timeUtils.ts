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
 * Check if two intervals overlap
 */
export const intervalsOverlap = (a: ClosedInterval, b: ClosedInterval): boolean => {
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)

  return aStart < bEnd && aEnd > bStart
}

/**
 * Check if an interval is within day bounds
 */
export const isIntervalWithinDayBounds = (interval: ClosedInterval, dayStart: string, dayEnd: string): boolean => {
  const intervalStart = timeToMinutes(interval.startTime)
  const intervalEnd = timeToMinutes(interval.endTime)
  const dayStartMinutes = timeToMinutes(dayStart)
  const dayEndMinutes = timeToMinutes(dayEnd)

  return intervalStart >= dayStartMinutes && intervalEnd <= dayEndMinutes
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

  // Sort existing intervals by start time
  const sortedIntervals = [...existingIntervals].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  // Find gaps between intervals
  let lastEndTime = dayStartMinutes

  // Check each interval to find a gap
  for (const interval of sortedIntervals) {
    const intervalStartMinutes = timeToMinutes(interval.startTime)

    // If there's a gap of at least 30 minutes before this interval, use it
    if (intervalStartMinutes - lastEndTime >= 30) {
      return {
        startTime: minutesToTime(lastEndTime),
        endTime: minutesToTime(Math.min(lastEndTime + 30, intervalStartMinutes)),
      }
    }

    // Update the last end time
    lastEndTime = Math.max(lastEndTime, timeToMinutes(interval.endTime))
  }

  // Check if there's space after the last interval
  if (dayEndMinutes - lastEndTime >= 30) {
    return {
      startTime: minutesToTime(lastEndTime),
      endTime: minutesToTime(Math.min(lastEndTime + 30, dayEndMinutes)),
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
