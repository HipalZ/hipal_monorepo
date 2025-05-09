import { useCallback, memo } from "react"
import { motion } from "framer-motion"
import { ToggleLeft, ToggleRight } from "lucide-react"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PeriodCardManagement from "./PeriodCard"
import type { PeriodConfig } from "@/hooks/useBusinessPeriodConfig"
import type { CouponCreatePayload } from "@/hooks/useBusinessCoupons"

type DayCardProps = {
  dayOfWeek: string
  dayIndex: number
  periods: Record<string, PeriodConfig>
  dayName: string
  isAnyPeriodOpen: boolean
  periodIcons: Array<{
    icon: any
    label: string
    color: string
  }>
  dayColors: string[]
  onToggleAllPeriodsForDay: (dayIndex: number) => Promise<void>
  onTogglePeriod: (dayOfWeek: number, period: number) => Promise<void>
  onSavePeriod: (
    dayOfWeek: number,
    period: number,
    baseCharge: number,
    redeemableCoverCharge: number,
    isOpen: boolean,
    couponAllocations?: string[],
  ) => Promise<void>
  isActionInProgress: boolean
  businessId: string
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>
  isCreatingCoupon: boolean
}

const DayCard = ({
  dayOfWeek,
  dayIndex,
  periods,
  dayName,
  isAnyPeriodOpen,
  periodIcons,
  dayColors,
  onToggleAllPeriodsForDay,
  onTogglePeriod,
  onSavePeriod,
  isActionInProgress,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}: DayCardProps) => {
  const handleToggleAllPeriodsForDay = useCallback(() => {
    onToggleAllPeriodsForDay(dayIndex)
  }, [dayIndex, onToggleAllPeriodsForDay])

  return (
    <motion.div
      className={`shadow-sm overflow-hidden border lg:rounded-xl ${dayColors[dayIndex]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <section className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <span className="text-xs font-medium">{dayName.substring(0, 3)}</span>
            </div>
            <CardTitle className="text-lg">{dayName}</CardTitle>
          </section>
          <Button
            variant={isAnyPeriodOpen ? "outline" : "default"}
            size="sm"
            onClick={handleToggleAllPeriodsForDay}
            disabled={isActionInProgress}
            className="rounded-lg shadow-sm h-8 text-xs"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-1">
              {isAnyPeriodOpen ? (
                <>
                  <ToggleLeft size={14} />
                  <span>Close All Periods</span>
                </>
              ) : (
                <>
                  <ToggleRight size={14} />
                  <span>Open All Periods</span>
                </>
              )}
            </motion.div>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {Object.entries(periods).map(([periodKey, periodConfig]) => {
            const periodIndex = Number.parseInt(periodKey)
            const periodInfo = periodIcons[periodIndex]

            return (
              <PeriodCardManagement
                key={`${dayOfWeek}-${periodKey}`}
                periodConfig={periodConfig}
                periodIndex={periodIndex}
                dayIndex={dayIndex}
                periodInfo={periodInfo}
                dayName={dayName}
                onTogglePeriod={onTogglePeriod}
                onSavePeriod={onSavePeriod}
                isActionInProgress={isActionInProgress}
                viewMode="day"
                businessId={businessId}
                onCreateCoupon={onCreateCoupon}
                isCreatingCoupon={isCreatingCoupon}
              />
            )
          })}
        </div>
      </CardContent>
    </motion.div>
  )
}

export default memo(DayCard)
