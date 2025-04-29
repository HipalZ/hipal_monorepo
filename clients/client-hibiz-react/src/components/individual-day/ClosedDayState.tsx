"use client"

import { memo } from "react"
import { Calendar, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import MemoizedHeader from "@/components/molecules/header"
import { getDayName } from "../utils/timeUtils.ts"

type ClosedDayStateProps = {
  dayConfig: any
  onToggleDay: () => Promise<void>
}

const ClosedDayState = ({ dayConfig, onToggleDay }: ClosedDayStateProps) => {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="linear_gradient_background">
        <MemoizedHeader title={`${getDayName(dayConfig?.dayOfWeek)} Settings`} />
      </header>

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">{getDayName(dayConfig?.dayOfWeek)} is Closed</h2>
        <p className="mb-8 max-w-md text-center text-gray-500">
          This day is currently closed for bookings. Enable this day to configure business hours, periods, and closed
          intervals.
        </p>
        <Button onClick={onToggleDay} size="lg" className="gap-2">
          <Power className="h-4 w-4" />
          Enable {getDayName(dayConfig?.dayOfWeek)}
        </Button>
      </div>
    </main>
  )
}

export default memo(ClosedDayState)
