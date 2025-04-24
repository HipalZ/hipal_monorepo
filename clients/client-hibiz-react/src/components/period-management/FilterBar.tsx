import { memo, useState } from "react"
import { Filter, Calendar, Clock, CheckCircle, XCircle, Tag, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getDayName } from "@/components/utils/timeUtils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type FilterBarProps = {
  activeTab: string
  selectedDays: string[]
  selectedPeriods: string[]
  periodIcons: Array<{
    icon: any
    label: string
    color: string
  }>
  onTabChange: (value: string) => void
  onDayChange: (value: string) => void
  onPeriodChange: (value: string) => void
  isMobile: boolean
  statusFilter?: "all" | "open" | "closed"
  onStatusFilterChange?: (status: "all" | "open" | "closed") => void
  couponFilter?: "all" | "with" | "without"
  onCouponFilterChange?: (status: "all" | "with" | "without") => void
}

const FilterBar = ({
  activeTab,
  selectedDays,
  selectedPeriods,
  periodIcons,
  onTabChange,
  onDayChange,
  onPeriodChange,
  isMobile,
  statusFilter = "all",
  onStatusFilterChange = () => { },
  couponFilter = "all",
  onCouponFilterChange = () => { },
}: FilterBarProps) => {
  // For desktop view, make it sticky and collapsible
  const [isCollapsed, setIsCollapsed] = useState(false)

  const renderFilterContent = () => (
    <Tabs defaultValue="by-day" value={activeTab} onValueChange={onTabChange}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <section>
          <Label className="text-xs font-semibold text-gray-700 mb-2 -mt-4 block">Filter by Day or Period</Label>
          <TabsList className="grid w-full h-auto grid-cols-2 p-1 sm:w-auto">
            <TabsTrigger
              value="by-day"
              className="flex items-center gap-1 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Calendar size={14} />
              <span>By Day</span>
            </TabsTrigger>
            <TabsTrigger
              value="by-period"
              className="flex items-center gap-1 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Clock size={14} />
              <span>By Period</span>
            </TabsTrigger>
          </TabsList>

        </section>
        {/* Status filter (open/closed) */}
        <div className="mb-4">
          <Label className="text-xs font-semibold text-gray-700 mb-2 block">Filter by Status</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => onStatusFilterChange("all")}
              className="text-xs h-8"
            >
              All Periods
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "open" ? "default" : "outline"}
              onClick={() => onStatusFilterChange("open")}
              className="text-xs h-8 flex items-center gap-1"
            >
              <CheckCircle size={12} className="text-green-500" />
              Open Only
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "closed" ? "default" : "outline"}
              onClick={() => onStatusFilterChange("closed")}
              className="text-xs h-8 flex items-center gap-1"
            >
              <XCircle size={12} className="text-red-500" />
              Closed Only
            </Button>
          </div>
        </div>
      </div>


      {/* Coupon filter (with/without coupons) */}
      <div className="mb-2">
        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Filter by Coupons</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={couponFilter === "all" ? "default" : "outline"}
            onClick={() => onCouponFilterChange("all")}
            className="text-xs h-8"
          >
            All Periods
          </Button>
          <Button
            size="sm"
            variant={couponFilter === "with" ? "default" : "outline"}
            onClick={() => onCouponFilterChange("with")}
            className="text-xs h-8 flex items-center gap-1"
          >
            <Tag size={12} className="text-purple-500" />
            With Coupons
          </Button>
          <Button
            size="sm"
            variant={couponFilter === "without" ? "default" : "outline"}
            onClick={() => onCouponFilterChange("without")}
            className="text-xs h-8 flex items-center gap-1"
          >
            <Tag size={12} className="text-gray-400" />
            Without Coupons
          </Button>
        </div>
      </div>

      {activeTab === "by-day" ? (
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-gray-700">Filter by Days</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-days"
                checked={selectedDays.includes("all")}
                onCheckedChange={() => onDayChange("all")}
              />
              <Label htmlFor="all-days" className="text-xs">
                All Days
              </Label>
            </div>
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${index}`}
                  checked={selectedDays.includes(index.toString())}
                  onCheckedChange={() => onDayChange(index.toString())}
                />
                <Label htmlFor={`day-${index}`} className="text-xs">
                  {getDayName(index)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700">Filter by Periods</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-periods"
                checked={selectedPeriods.includes("all")}
                onCheckedChange={() => onPeriodChange("all")}
              />
              <Label htmlFor="all-periods" className="text-xs">
                All Periods
              </Label>
            </div>
            {periodIcons.map((period, index) => {
              const PeriodIcon = period.icon
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${index}`}
                    checked={selectedPeriods.includes(index.toString())}
                    onCheckedChange={() => onPeriodChange(index.toString())}
                  />
                  <Label htmlFor={`period-${index}`} className="flex items-center gap-1 text-xs">
                    <PeriodIcon size={12} className={period.color} />
                    {period.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Tabs>
  )

  if (isMobile) {
    return (
      <>
        {/* Fixed bottom filter button for mobile */}
        <div className="fixed z-40 bottom-4 right-4 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90">
                <Filter size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl pt-4 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="px-1 pb-2 text-sm font-medium">Filters</div>
                <ScrollArea className="flex-1 pr-4 -mr-4 pb-16">{renderFilterContent()}</ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Hidden on mobile, visible on desktop */}
        <div className="hidden sm:block">
          <Card className="mb-5 shadow-sm">
            <CardContent className="p-4">{renderFilterContent()}</CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <div className="sticky top-[4.8rem] rounded-2xl z-50 p-2 mb-4 bg-[#00000010] backdrop-blur-xl">
      <Card className="shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsCollapsed(!isCollapsed)
            }
          }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} className="text-primary" />
            </motion.div>
            <h3 className="text-sm font-medium text-gray-800">Filters & View Options</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronUp size={18} />
            </motion.div>
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-4 border-t border-gray-100">{renderFilterContent()}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}

export default memo(FilterBar)
