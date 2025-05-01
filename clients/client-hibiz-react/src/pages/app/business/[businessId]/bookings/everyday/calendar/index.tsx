import MemoizedHeader from "@/components/molecules/header/index.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query.ts"
import { useGetBookingCalendar } from "@/hooks/useBookingCalendar"
import { cn } from "@/lib/utils.ts"
import { eachDayOfInterval, format, getDay, isSameMonth, isToday, parseISO } from "date-fns"
import {
  ArrowRight,
  CalendarIcon,
  CalendarPlus2Icon as CalendarIcon2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Tag,
  Users,
} from "lucide-react"
import { memo, useCallback, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
// Import the new hooks

interface IBookingCalendarUpdated {
  date: Date
  dateString: string
  isToday: boolean
  numOfBookings: number
  explicitlyEdited: boolean
  day: number
  maxBookings: number
}

const Calendar = () => {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState<IBookingCalendarUpdated | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { gettingCalendar, calendar } = useGetBookingCalendar(businessId as string)


  // Use the media query hook for responsive design
  const isSmallScreen = useMediaQuery("(max-width: 640px)")
  const isExtraSmallScreen = useMediaQuery("(max-width: 400px)")

  // Process calendar data for efficient lookup and get date range
  const { bookingsByDate, maxBookings, dateRange } = useMemo(() => {
    if (!calendar || calendar.length === 0) {
      return { bookingsByDate: {}, maxBookings: 0, dateRange: { start: new Date(), end: new Date() } }
    }

    const bookingsMap: Record<string, { numOfBookings: number; explicitlyEdited: boolean; day: number }> = {}
    let maxBookings = 0

    // Sort dates to ensure they're in chronological order
    const sortedDates = [...calendar].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Get first and last date from the API data
    const startDate = parseISO(sortedDates[0].date)
    const endDate = parseISO(sortedDates[sortedDates.length - 1].date)

    for (const day of calendar) {
      bookingsMap[day.date] = {
        numOfBookings: day.numOfBookings,
        explicitlyEdited: day.explicitlyEdited,
        day: day.day,
      }

      if (day.numOfBookings > maxBookings) {
        maxBookings = day.numOfBookings
      }
    }

    return {
      bookingsByDate: bookingsMap,
      maxBookings,
      dateRange: { start: startDate, end: endDate },
    }
  }, [calendar])

  // Generate calendar days - only for the 60 days we have data for
  const calendarDays = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return []

    // Get all days in the date range from the API
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })

    return days.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd")
      const dayData = bookingsByDate[dateKey] || { numOfBookings: 0, explicitlyEdited: false, day: getDay(day) }

      return {
        date: day,
        dateString: dateKey,
        isToday: isToday(day),
        numOfBookings: dayData.numOfBookings,
        explicitlyEdited: dayData.explicitlyEdited,
        day: dayData.day,
        maxBookings: maxBookings || 1,
      }
    })
  }, [dateRange, bookingsByDate, maxBookings])

  // Add a page state to track which set of days we're viewing
  const [currentPage, setCurrentPage] = useState(0)

  // Filter days to show current view (28 days at a time with pagination)
  const visibleDays = useMemo(() => {
    if (calendarDays.length === 0) return []

    // Calculate how many pages we have (60 days / 28 days per page, rounded up)
    const totalPages = Math.ceil(calendarDays.length / 28)

    // Make sure currentPage is within bounds
    const safePage = Math.min(Math.max(0, currentPage), totalPages - 1)

    // Calculate start and end indices for the current page
    const startIndex = safePage * 28
    const endIndex = Math.min(startIndex + 27, calendarDays.length - 1)

    return calendarDays.slice(startIndex, endIndex + 1)
  }, [calendarDays, currentPage])

  // Add functions to handle pagination
  const goToNextPage = useCallback(() => {
    const totalPages = Math.ceil(calendarDays.length / 28)
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }, [calendarDays.length])

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }, [])

  // Add a function to check if we're on the last page
  const isLastPage = useMemo(() => {
    const totalPages = Math.ceil(calendarDays.length / 28)
    return currentPage >= totalPages - 1
  }, [calendarDays.length, currentPage])

  // Add a function to check if we're on the first page
  const isFirstPage = useMemo(() => {
    return currentPage === 0
  }, [currentPage])

  // Handle day click
  const handleDayClick = useCallback((day: IBookingCalendarUpdated) => {
    setSelectedDay(day)
    setIsModalOpen(true)
  }, [])

  // Navigate to day detail page - UPDATED to use dateString
  const handleKnowMore = useCallback(() => {
    if (selectedDay) {
      navigate(`/app/business/${businessId}/bookings/everyday/calendar/${selectedDay.dateString}`)
      setIsModalOpen(false)
    }
  }, [businessId, navigate, selectedDay])

  // Fixed intensity color calculation
  const getIntensityColor = useCallback((bookings: number) => {
    if (bookings === 0) return "bg-white"

    // Use absolute booking counts for intensity levels
    let intensity = 1
    if (bookings <= 10) intensity = 1
    else if (bookings <= 15) intensity = 2
    else if (bookings <= 20) intensity = 3
    else if (bookings <= 30) intensity = 4
    else intensity = 5

    switch (intensity) {
      case 1:
        return "bg-purple-50"
      case 2:
        return "bg-purple-100"
      case 3:
        return "bg-purple-200"
      case 4:
        return "bg-purple-300"
      case 5:
        return "bg-purple-400"
      default:
        return "bg-white"
    }
  }, [])

  // Format date for display
  const formatDateRange = useCallback(() => {
    if (visibleDays.length === 0) return ""

    const firstDay = visibleDays[0].date
    const lastDay = visibleDays[visibleDays.length - 1].date
    const totalPages = Math.ceil(calendarDays.length / 28)

    let dateRange = ""
    if (isSameMonth(firstDay, lastDay)) {
      dateRange = `${format(firstDay, "MMMM d")} - ${format(lastDay, "d, yyyy")}`
    } else {
      dateRange = `${format(firstDay, "MMM d")} - ${format(lastDay, "MMM d, yyyy")}`
    }

    // On small screens, make the date range more compact
    if (isSmallScreen) {
      return `${format(firstDay, "MMM d")} - ${format(lastDay, "MMM d")}`
    }

    return `${dateRange} (Page ${currentPage + 1} of ${totalPages})`
  }, [visibleDays, calendarDays.length, currentPage, isSmallScreen])

  // Render loading skeleton
  if (gettingCalendar) {
    return (
      <main className="p-6">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-gray-200" />
        <div className="mb-4 flex justify-between">
          <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`header-${i}`} className="h-8 animate-pulse rounded-md bg-gray-200" />
          ))}
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={`day-${i}`} className="aspect-square animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main>
      <header className="linear_gradient_background">
        <MemoizedHeader title="Booking Calendar" />
      </header>

      <Card className="m-4 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 pb-4 pt-4 text-white">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle className="text-xl font-bold">{formatDateRange()}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-4">
          {/* Calendar Legend - Hide on extra small screens */}
          {!isExtraSmallScreen && (
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-gray-50 p-2 sm:p-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Booking Intensity:</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded border bg-white" />
                <span>None</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded border bg-purple-50" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded border bg-purple-200" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded border bg-purple-400" />
                <span>High</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-2 flex cursor-help items-center gap-1 text-gray-500">
                      <Info className="h-4 w-4" />
                      <span className="text-xs">Edited days</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Days that have been manually configured</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
            {/* Calendar days */}
            {visibleDays.map((day, index) => (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                onKeyDown={(e) => e.key === "Enter" && handleDayClick(day)}
                role="button"
                tabIndex={0}
                className={cn(
                  "relative aspect-square cursor-pointer rounded-md border transition-all",
                  isSmallScreen ? "p-0.5" : "p-1", // Smaller padding on mobile
                  day.isToday ? "border-purple-500" : "border-gray-100",
                  getIntensityColor(day.numOfBookings),
                  "hover:border-purple-300 hover:shadow-sm",
                )}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        isSmallScreen ? "text-base" : "text-xl",
                        "font-semibold",
                        day.isToday && "rounded-full bg-purple-500 px-1 py-0.5 text-white",
                      )}
                    >
                      {format(day.date, "d")}
                    </span>
                    {
                      !isSmallScreen && (
                        <span
                          className={cn(
                            "text-sm font-semibold absolute transform -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2",
                            day.isToday ? "text-purple-800" : "text-gray-800",
                          )}
                        >
                          {format(day.date, "EEE")}
                        </span>
                      )
                    }

                    {day.explicitlyEdited && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(isSmallScreen ? "h-1.5 w-1.5" : "h-2 w-2", "rounded-full bg-amber-400")}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">This day has been manually configured</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {day.numOfBookings > 0 && (
                    <div className="mt-auto flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-none bg-white/80 font-medium px-1 py-0 h-auto", // Smaller badge on mobile
                          isSmallScreen ? "text-[0.65rem]" : "text-xs",
                          day.numOfBookings > 0 ? "text-purple-700" : "text-gray-400",
                        )}
                      >
                        {/* Show only number on very small screens */}
                        {isExtraSmallScreen
                          ? day.numOfBookings
                          : isSmallScreen
                            ? `${day.numOfBookings} ${day.numOfBookings === 1 ? "b" : "bs"}`
                            : `${day.numOfBookings} ${day.numOfBookings === 1 ? "booking" : "bookings"}`}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="mt-4 sm:mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size={isSmallScreen ? "sm" : "default"}
              onClick={goToPreviousPage}
              disabled={isFirstPage}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {!isExtraSmallScreen && "Previous"}
            </Button>

            <div className="text-xs sm:text-sm text-gray-500">
              {isSmallScreen
                ? `${visibleDays.length}/${calendarDays.length}`
                : `Showing ${visibleDays.length} of ${calendarDays.length} days`}
            </div>

            <Button
              variant="outline"
              size={isSmallScreen ? "sm" : "default"}
              onClick={goToNextPage}
              disabled={isLastPage}
              className="flex items-center gap-1"
            >
              {!isExtraSmallScreen && "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon2 className="h-5 w-5 text-purple-500" />
              Day Details
            </DialogTitle>
          </DialogHeader>

          {selectedDay && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-4">
                <h3 className="mb-2 text-lg font-semibold text-purple-700">
                  {format(selectedDay.date, "EEEE, MMMM d, yyyy")}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{selectedDay.numOfBookings}</span>
                      {selectedDay.numOfBookings === 1 ? " booking" : " bookings"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">
                      Day of week: <span className="font-medium">{format(selectedDay.date, "EEEE")}</span>
                    </span>
                  </div>

                  {selectedDay.explicitlyEdited && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">This day has been manually configured</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  View detailed booking information for {format(selectedDay.date, "MMMM d, yyyy")}, including time
                  slots, period configurations, and booking counts.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              onClick={handleKnowMore}
            >
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

Calendar.displayName = "Calendar"

export default memo(Calendar)
