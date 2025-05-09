"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Calendar from "./Calendar"

interface BookingDetailsProps {
  guestCount: number
  selectedDate: Date | null
  onGuestUpdate: (count: number) => void
  onDateSelect: (date: Date) => void
  onBack: () => void
}

export default function BookingDetails({
  guestCount,
  selectedDate,
  onGuestUpdate,
  onDateSelect,
  onBack,
}: BookingDetailsProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Generate options for guest dropdown (1-30)
  const guestOptions = Array.from({ length: 30 }, (_, i) => i + 1)

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  // Handle guest count change
  const handleGuestChange = (value: string) => {
    onGuestUpdate(Number.parseInt(value))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <button type="button" onClick={onBack} className="absolute left-4 top-4 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-center">Book a Table</h2>
      </div>

      {/* Guest Selection Dropdown */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Users className="text-gray-500 mr-2" size={20} />
          <span className="text-gray-700 mr-2">Guests:</span>
          <Select value={guestCount.toString()} onValueChange={handleGuestChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {guestOptions.map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "guest" : "guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Date</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <Calendar currentMonth={currentMonth} selectedDate={selectedDate} onDateSelect={onDateSelect} />
      </div>

      {/* Footer with Continue Button */}
      <div className="p-4 border-t sticky bottom-0 bg-white">
        <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={!selectedDate}>
          Continue to Time Selection
        </Button>
      </div>
    </div>
  )
}
