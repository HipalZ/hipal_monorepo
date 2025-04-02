import { memo, useMemo } from "react"
import { WeekDay } from "@/components/store/useMenuCreationStore"
import type { MenuLayout } from "@/hooks/useMenuLayout"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IZone } from "../store/useZone"

// Day names mapping
const dayNames = {
  [WeekDay.SUNDAY]: "Sunday",
  [WeekDay.MONDAY]: "Monday",
  [WeekDay.TUESDAY]: "Tuesday",
  [WeekDay.WEDNESDAY]: "Wednesday",
  [WeekDay.THURSDAY]: "Thursday",
  [WeekDay.FRIDAY]: "Friday",
  [WeekDay.SATURDAY]: "Saturday",
}

interface ZoneAvailabilitySummaryProps {
  menuLayouts: MenuLayout[]
  zones: IZone[]
}

interface ZoneDayStatus {
  day: WeekDay
  covered: boolean
  menuName?: string
  menuId?: string
  isActive?: boolean
}

interface ZoneAvailability {
  zoneId: string
  zoneName: string
  dayStatus: Record<WeekDay, ZoneDayStatus>
  missingDays: WeekDay[]
  hasMissingDays: boolean
  hasInactiveDays: boolean
}

const ZoneAvailabilitySummary = memo(({ menuLayouts, zones }: ZoneAvailabilitySummaryProps) => {
  // Calculate availability for each zone
  const zoneAvailability = useMemo(() => {
    if (!zones || !menuLayouts) return []

    const availability: ZoneAvailability[] = zones.map((zone) => {
      // Initialize day status for this zone
      const dayStatus: Record<WeekDay, ZoneDayStatus> = {
        [WeekDay.SUNDAY]: { day: WeekDay.SUNDAY, covered: false },
        [WeekDay.MONDAY]: { day: WeekDay.MONDAY, covered: false },
        [WeekDay.TUESDAY]: { day: WeekDay.TUESDAY, covered: false },
        [WeekDay.WEDNESDAY]: { day: WeekDay.WEDNESDAY, covered: false },
        [WeekDay.THURSDAY]: { day: WeekDay.THURSDAY, covered: false },
        [WeekDay.FRIDAY]: { day: WeekDay.FRIDAY, covered: false },
        [WeekDay.SATURDAY]: { day: WeekDay.SATURDAY, covered: false },
      }

      // Find all layouts that include this zone
      const zoneLayouts = menuLayouts.filter((layout) => layout.zoneIds.includes(zone._id || ""))

      // Mark days covered by active layouts
      zoneLayouts.forEach((layout) => {
        layout.days.forEach((day) => {
          // If day is already covered by an active layout, don't overwrite
          if (dayStatus[day].covered && dayStatus[day].isActive) return

          dayStatus[day] = {
            day: day as WeekDay,
            covered: true,
            menuName: layout.name,
            menuId: layout._id,
            isActive: layout.isActive,
          }
        })
      })

      // Find missing days (not covered by any active layout)
      const missingDays = Object.values(dayStatus)
        .filter((status) => !status.covered || !status.isActive)
        .map((status) => status.day)

      // Check if there are any days covered by inactive layouts
      const hasInactiveDays = Object.values(dayStatus).some((status) => status.covered && !status.isActive)

      return {
        zoneId: zone._id || "",
        zoneName: zone.name,
        dayStatus,
        missingDays,
        hasMissingDays: missingDays.length > 0,
        hasInactiveDays,
      }
    })

    return availability
  }, [menuLayouts, zones])

  // Check if any zones have missing days
  const hasIssues = useMemo(() => {
    return zoneAvailability.some((zone) => zone.hasMissingDays || zone.hasInactiveDays)
  }, [zoneAvailability])

  if (!hasIssues) {
    return (
      <Alert variant="default" className="mb-6">
        <CheckCircle2 className="w-4 h-4" />
        <AlertTitle>All zones fully covered</AlertTitle>
        <AlertDescription>All zones have menu layouts for every day of the week.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mb-6">
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Menu Coverage Issues</AlertTitle>
        <AlertDescription>
          Some zones have days without active menu layouts. Expand each zone below to see details.
        </AlertDescription>
      </Alert>

      <Accordion type="multiple" className="w-full">
        {zoneAvailability.map((zone) => {
          if (!zone.hasMissingDays && !zone.hasInactiveDays) return null

          return (
            <AccordionItem key={zone.zoneId} value={zone.zoneId} className="mb-2 bg-white border rounded-md">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{zone.zoneName}</span>
                  {zone.hasMissingDays && (
                    <Badge variant="destructive" className="text-xs">
                      {zone.missingDays.length} {zone.missingDays.length === 1 ? "day" : "days"} missing
                    </Badge>
                  )}
                  {zone.hasInactiveDays && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                      Has inactive menus
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1">
                  {Object.values(WeekDay)
                    .filter((day) => !Number.isNaN(Number(day)))
                    .map((day) => {
                      const status = zone.dayStatus[day as WeekDay]
                      const isCovered = status.covered && status.isActive
                      const isInactive = status.covered && !status.isActive

                      return (
                        <div
                          key={day}
                          className={cn(
                            "p-2 rounded-md text-center flex flex-col items-center text-xs",
                            isCovered
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : isInactive
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-red-50 text-red-800 border border-red-200",
                          )}
                        >
                          <span className="font-medium">{dayNames[day as WeekDay]}</span>
                          {isCovered ? (
                            <div className="mt-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mx-auto mb-1" />
                              <span className="line-clamp-1">{status.menuName}</span>
                            </div>
                          ) : isInactive ? (
                            <div className="mt-1 text-[10px]">
                              <AlertCircle className="w-3 h-3 mx-auto mb-1" />
                              <span className="line-clamp-1">{status.menuName}</span>
                              <span className="font-medium">(Inactive)</span>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px]">
                              <XCircle className="w-3 h-3 mx-auto mb-1" />
                              <span>No menu</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>

                {zone.hasMissingDays && (
                  <div className="mt-3 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Missing days: </span>
                      {zone.missingDays.map((day) => dayNames[day]).join(", ")}
                    </p>
                  </div>
                )}

                {zone.hasInactiveDays && (
                  <div className="mt-1 text-xs text-amber-700">
                    <p>Some days are covered by inactive menu layouts. Activate these layouts or create new ones.</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
})

ZoneAvailabilitySummary.displayName = "ZoneAvailabilitySummary"
export default ZoneAvailabilitySummary

