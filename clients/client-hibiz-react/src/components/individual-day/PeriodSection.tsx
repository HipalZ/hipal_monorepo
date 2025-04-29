import { memo, useMemo } from "react"
import { AlertCircle, Edit, Moon, Sun, Sunrise, Sunset, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { formatTimeRange, timeToMinutes } from "@/components/utils/timeUtils"
import type { BusinessDayConfig } from "@/components/types/business-day-config"
import type { PeriodConfig } from "@/hooks/useBusinessPeriodConfig"
import type { Coupon } from "@/hooks/useBusinessCoupons.ts"

// Define period data with icons and colors
const PERIODS = [
  { id: 0, name: "Morning", icon: Sunrise, color: "amber", start: 240, end: 720 },
  { id: 1, name: "Afternoon", icon: Sun, color: "orange", start: 720, end: 960 },
  { id: 2, name: "Evening", icon: Sunset, color: "rose", start: 960, end: 1140 },
  { id: 3, name: "Night", icon: Moon, color: "indigo", start: 1140, end: 1680 },
]

type PeriodsSectionProps = {
  dayConfig: BusinessDayConfig
  periodConfigs: Record<string, PeriodConfig>
  onEditPeriod: (periodId: number) => void
  coupons: Coupon[]
}

const PeriodsSection = ({ dayConfig, periodConfigs, onEditPeriod, coupons }: PeriodsSectionProps) => {
  // Calculate period availability and slots
  const periodData = useMemo(() => {
    return PERIODS.map((period) => {
      const periodConfig = periodConfigs[period.id]
      const { available, slots, totalSlots, blockedSlots } = calculatePeriodSlots(period, dayConfig)

      // Get coupon details for allocated coupons
      const allocatedCoupons = periodConfig?.couponAllocations || []
      const couponDetails = allocatedCoupons.map((allocation) => {
        const coupon = coupons.find((c) => c._id === allocation.couponId)
        return {
          ...allocation,
          name: coupon?.name || "Unknown Coupon",
          discountType: coupon?.config?.discountType,
          value: coupon?.config?.value,
          upto: coupon?.config?.upto,
          bookingMeta: coupon?.bookingMeta || { baseCharge: 0, redeemableCoverCharge: 0, minGuests: 0 },
        }
      })

      return {
        ...period,
        available,
        slots,
        totalSlots,
        blockedSlots,
        config: periodConfig,
        coupons: couponDetails,
      }
    })
  }, [dayConfig, periodConfigs, coupons])

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Periods</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {periodData.map((period) => {
          const PeriodIcon = period.icon
          const colorClass = {
            amber: "from-amber-400 to-amber-600",
            orange: "from-orange-400 to-orange-600",
            rose: "from-rose-400 to-rose-600",
            indigo: "from-indigo-400 to-indigo-600",
          }[period.color]

          return (
            <Card
              key={period.id}
              className={cn(
                "overflow-hidden transition-all duration-300 hover:shadow-md",
                period.available ? "border-green-100" : "border-gray-200 bg-gray-50",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full bg-gradient-to-br p-2 ${colorClass} shadow-md`}>
                      <PeriodIcon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{period.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={period.available ? "default" : "secondary"}
                      className={period.available ? "bg-green-500" : ""}
                    >
                      {period.available ? "Available" : "Unavailable"}
                    </Badge>
                    {period.available && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditPeriod(period.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time Range:</span>
                    <span className="font-medium">{formatTimeRange(period.start, period.end)}</span>
                  </div>

                  {period.available ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Available Slots:</span>
                        <span className="font-medium text-green-600">{period.slots} slots</span>
                      </div>

                      {period.config && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Base Price:</span>
                            <span className="font-medium">₹{period.config.baseCharge || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Redeemable Cover:</span>
                            <span className="font-medium">₹{period.config.redeemableCoverCharge || 0}</span>
                          </div>

                          {/* Coupon Allocations */}
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-1 text-sm">
                              <Tag className="h-3.5 w-3.5 text-gray-500" />
                              <span className="text-gray-500">Allocated Coupons:</span>
                            </div>

                            {period.coupons && period.coupons.length > 0 ? (
                              <div className="mt-1">
                                <Accordion type="single" collapsible className="w-full">
                                  {period.coupons.map((coupon, idx) => (
                                    <AccordionItem
                                      key={idx}
                                      value={`coupon-${idx}`}
                                      className="border-b border-gray-100"
                                    >
                                      <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-gray-50 rounded-md">
                                        <div className="flex items-center justify-between w-full text-xs">
                                          <div className="flex-1 truncate text-left">
                                            <span className="font-medium">{coupon.name}</span>
                                            <span className="ml-1 text-gray-500">
                                              (
                                              {coupon.discountType === "PERCENTAGE"
                                                ? `${coupon.value}%`
                                                : `₹${coupon.value}`}
                                              )
                                            </span>
                                          </div>
                                          <Badge variant="outline" className="ml-1 text-xs">
                                            {coupon.remaining} left
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-2 pb-2 pt-1">
                                        <div className="bg-gray-50 rounded-md p-2 space-y-1.5 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Discount:</span>
                                            <span className="font-medium">
                                              {coupon.discountType === "PERCENTAGE"
                                                ? `${coupon.value}% ${coupon.upto ? `(up to ₹${coupon.upto})` : ""}`
                                                : `₹${coupon.value}`}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Base Charge:</span>
                                            <span className="font-medium">₹{coupon.bookingMeta?.baseCharge || 0}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Redeemable Cover:</span>
                                            <span className="font-medium">
                                              ₹{coupon.bookingMeta?.redeemableCoverCharge || 0}
                                            </span>
                                          </div>
                                          {coupon.bookingMeta?.minGuests > 0 && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-500">Min Guests:</span>
                                              <span className="font-medium">{coupon.bookingMeta.minGuests}</span>
                                            </div>
                                          )}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic">No coupons allocated</div>
                            )}
                          </div>
                        </>
                      )}

                      <div className="mt-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${(period.slots / period.totalSlots) * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>{period.blockedSlots} blocked</span>
                          <span>{period.totalSlots} total</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 flex items-center justify-center rounded-md bg-gray-100 p-2">
                      <AlertCircle className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{period.name} is outside business hours</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Calculate available slots for a period
const calculatePeriodSlots = (period: (typeof PERIODS)[0], dayConfig: BusinessDayConfig) => {
  const startMinutes = timeToMinutes(dayConfig.startTime)
  const endMinutes = timeToMinutes(dayConfig.endTime)

  // Check if this period overlaps with the business hours
  const periodStart = Math.max(period.start, startMinutes)
  const periodEnd = Math.min(period.end, endMinutes)

  if (periodStart >= periodEnd) {
    // This period is not covered by business hours
    return { available: false, slots: 0, totalSlots: 0, blockedSlots: 0 }
  }

  // Calculate total slots for this period (assuming 30-minute slots)
  const intervalMinutes = 30
  const periodTotalMinutes = periodEnd - periodStart
  const periodTotalSlots = Math.floor(periodTotalMinutes / intervalMinutes)

  // Calculate blocked slots for this period
  let periodBlockedMinutes = 0
  dayConfig.closedIntervals.forEach((interval) => {
    const intervalStart = Math.max(timeToMinutes(interval.startTime), periodStart)
    const intervalEnd = Math.min(timeToMinutes(interval.endTime), periodEnd)
    if (intervalStart < intervalEnd) {
      periodBlockedMinutes += intervalEnd - intervalStart
    }
  })

  const periodBlockedSlots = Math.ceil(periodBlockedMinutes / intervalMinutes)
  const periodAvailableSlots = periodTotalSlots - periodBlockedSlots

  return {
    available: periodAvailableSlots > 0,
    slots: periodAvailableSlots,
    totalSlots: periodTotalSlots,
    blockedSlots: periodBlockedSlots,
  }
}

export default memo(PeriodsSection)
