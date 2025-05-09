
"use client"

import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, isToday, isBefore } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarProps {
  currentMonth: Date
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export default function Calendar({ currentMonth, selectedDate, onDateSelect }: CalendarProps) {
  // Get today's date
  const today = new Date()

  // Calculate the date range to display (30 days from today)
  const dateRange = useMemo(() => {
    const endDate = addDays(today, 29) // Today + 29 more days = 30 days total
    return eachDayOfInterval({ start: today, end: endDate })
  }, [today])

  // Get days of the week for header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Get all days in the current month view
  const monthDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth)
    const lastDay = endOfMonth(currentMonth)
    return eachDayOfInterval({ start: firstDay, end: lastDay })
  }, [currentMonth])

  // Check if a date is selectable (within the 30-day range)
  const isDateSelectable = (date: Date) => {
    return dateRange.some((d) => isSameDay(d, date))
  }

  return (
    <div className="calendar">
      {/* Month and year display */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, i) => {
          // Calculate the day's position in the grid
          const dayOfWeek = day.getDay()

          // Add empty cells for days before the first day of the month
          if (i === 0) {
            const emptyDays = Array(dayOfWeek).fill(null)
            return [
              ...emptyDays.map((_, index) => <div key={`empty-${index}`} className="h-10" />),
              <DayCell
                key={day.toISOString()}
                day={day}
                isToday={isToday(day)}
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                isSelectable={isDateSelectable(day)}
                onSelect={onDateSelect}
              />,
            ]
          }

          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              isToday={isToday(day)}
              isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
              isSelectable={isDateSelectable(day)}
              onSelect={onDateSelect}
            />
          )
        })}
      </div>

      {/* 30-day range indicator */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing dates from {format(dateRange[0], "MMM d, yyyy")} to{" "}
        {format(dateRange[dateRange.length - 1], "MMM d, yyyy")}
      </div>
    </div>
  )
}

interface DayCellProps {
  day: Date
  isToday: boolean
  isSelected: boolean
  isSelectable: boolean
  onSelect: (date: Date) => void
}

function DayCell({ day, isToday, isSelected, isSelectable, onSelect }: DayCellProps) {
  const isPast = isBefore(day, new Date()) && !isToday

  return (
    <button
      type="button"
      onClick={() => isSelectable && !isPast && onSelect(day)}
      disabled={!isSelectable || isPast}
      className={cn(
        "h-10 w-full rounded-full flex items-center justify-center text-sm transition-colors",
        isToday && !isSelected && "border border-purple-500 text-purple-600",
        isSelected && "bg-purple-600 text-white",
        !isSelectable && "text-gray-300",
        isPast && "text-gray-300",
        isSelectable && !isSelected && !isPast && "hover:bg-purple-100",
        "disabled:cursor-not-allowed",
      )}
    >
      {format(day, "d")}
    </button>
  )
}
