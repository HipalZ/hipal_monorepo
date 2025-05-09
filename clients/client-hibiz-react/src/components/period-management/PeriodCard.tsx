import { memo, useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DollarSign, Edit2, Percent, Tag, Ticket, ToggleLeft, ToggleRight, Info, Clock, Users } from "lucide-react"
import { type Coupon, type CouponCreatePayload, useGetBusinessCoupons } from "@/hooks/useBusinessCoupons"
import type { PeriodConfig } from "@/hooks/useBusinessPeriodConfig.ts"
import PeriodEditForm from "./PeriodEditForm.tsx"

type PeriodCardProps = {
  periodConfig: PeriodConfig
  periodIndex: number
  dayIndex: number
  periodInfo: { icon: React.ComponentType; label: string; color: string }
  dayName: string
  onTogglePeriod: (day: number, period: number) => Promise<void>
  onSavePeriod: (
    day: number,
    period: number,
    base: number,
    redeemable: number,
    isOpen: boolean,
    couponAllocs?: any[],
  ) => Promise<void>
  isActionInProgress: boolean
  viewMode: "day" | "period"
  businessId: string
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>
  isCreatingCoupon: boolean
}

const PeriodCardManagement = ({
  periodConfig,
  periodIndex,
  dayIndex,
  periodInfo,
  dayName,
  onTogglePeriod,
  onSavePeriod,
  isActionInProgress,
  viewMode,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}: PeriodCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    baseCharge: periodConfig.baseCharge,
    redeemableCoverCharge: periodConfig.redeemableCoverCharge,
    isOpen: periodConfig.isOpen,
    couponAllocations: periodConfig.couponAllocations || [],
  })
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const { data: couponsResponse } = useGetBusinessCoupons(businessId)
  const coupons = couponsResponse?.data || []

  // Memoize coupon lookup map
  const couponsById = useMemo(() => new Map(coupons.map((c) => [c._id, c])), [coupons])

  // Stable handlers
  const getCouponName = useCallback((id: string) => couponsById.get(id)?.name || "Unknown", [couponsById])
  const handleStartEditing = useCallback(() => setIsEditing(true), [])
  const handleCancelEdit = useCallback(() => setIsEditing(false), [])
  const handleSave = useCallback(async () => {
    await onSavePeriod(
      dayIndex,
      periodIndex,
      editValues.baseCharge,
      editValues.redeemableCoverCharge,
      editValues.isOpen,
      editValues.couponAllocations,
    )
    setIsEditing(false)
  }, [dayIndex, periodIndex, editValues, onSavePeriod])
  const handleToggle = useCallback(() => onTogglePeriod(dayIndex, periodIndex), [dayIndex, periodIndex, onTogglePeriod])
  const handleFieldChange = useCallback(
    (field: string, value: any) =>
      setEditValues((prev) => ({
        ...prev,
        [field]: field === "isOpen" || field === "couponAllocations" ? value : Number(value),
      })),
    [],
  )
  const handleCouponClick = useCallback(
    (couponId: string) => {
      const coupon = couponsById.get(couponId)
      if (coupon) setSelectedCoupon(coupon)
    },
    [couponsById],
  )

  const { icon: PeriodIcon, color, label } = periodInfo

  // Determine card style based on state
  const containerClass = useMemo(() => {
    const baseClass = "rounded-lg border overflow-hidden"

    if (isEditing) {
      return `${baseClass} border-purple-300 shadow-md`
    }

    if (periodConfig.isOpen) {
      return periodConfig.couponAllocations?.length
        ? `${baseClass} bg-white border-purple-200 shadow-sm`
        : `${baseClass} bg-white border-gray-200`
    }

    return `${baseClass} bg-gray-50 border-gray-100`
  }, [periodConfig, isEditing])

  // Get background gradient based on period index
  const getHeaderGradient = () => {
    switch (periodIndex) {
      case 0:
        return "bg-gradient-to-r from-amber-50 to-white"
      case 1:
        return "bg-gradient-to-r from-blue-50 to-white"
      case 2:
        return "bg-gradient-to-r from-orange-50 to-white"
      case 3:
        return "bg-gradient-to-r from-indigo-50 to-white"
      default:
        return "bg-gradient-to-r from-gray-50 to-white"
    }
  }

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className={containerClass}>
      {/* Header */}
      <div className={`p-3 ${getHeaderGradient()} ${isEditing ? "border-b border-purple-100" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewMode === "day" ? (
              <>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${color
                    .replace("text-", "bg-")
                    .replace("500", "100")} ${color}`}
                >
                  <PeriodIcon size={16} />
                </div>
                <div>
                  <h4 className="font-medium">{label}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge
                      variant={periodConfig.isOpen ? "default" : "destructive"}
                      className={`${isEditing ? "opacity-50" : ""}`}
                    >
                      {periodConfig.isOpen ? "Open" : "Closed"}
                    </Badge>
                    {periodConfig.couponAllocations?.length > 0 && (
                      <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                        {periodConfig.couponAllocations.length} Coupons
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-primary text-base-100 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-xs font-medium">{dayName.substring(0, 2)}</span>
                </div>
                <div>
                  <h4 className="font-medium">{dayName}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge
                      variant={periodConfig.isOpen ? "default" : "destructive"}
                      className={`${isEditing ? "opacity-50" : ""}`}
                    >
                      {periodConfig.isOpen ? "Open" : "Closed"}
                    </Badge>
                    {periodConfig.couponAllocations?.length > 0 && (
                      <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                        {periodConfig.couponAllocations.length} Coupons
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEditing}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              disabled={isActionInProgress}
            >
              <Edit2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {isEditing ? (
          <PeriodEditForm
            editValues={editValues}
            onEditFieldChange={handleFieldChange}
            onCancel={handleCancelEdit}
            onSave={handleSave}
            isActionInProgress={isActionInProgress}
            businessId={businessId}
            onCreateCoupon={onCreateCoupon}
            isCreatingCoupon={isCreatingCoupon}
          />
        ) : (
          <div className="space-y-3">
            {/* Charges */}
            <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Charges</p>
                  <p className="text-xs text-gray-500">Base & Cover</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-right">
                  <span className="text-xs text-gray-500">Base</span>
                  <p className="font-medium">₹{periodConfig.baseCharge}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Cover</span>
                  <p className="font-medium">₹{periodConfig.redeemableCoverCharge}</p>
                </div>
              </div>
            </div>

            {/* Coupon Allocations */}
            {periodConfig.couponAllocations && periodConfig.couponAllocations.length > 0 ? (
              <div className="rounded-md bg-purple-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Ticket size={16} className="text-purple-600" />
                    <span className="font-medium text-sm text-purple-700">Coupon Allocations</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                          <Info size={14} className="text-purple-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Click on a coupon to view details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2">
                  {periodConfig.couponAllocations.map((coupon) => (
                    <Badge
                      key={coupon._id || coupon.couponId}
                      variant="outline"
                      className="flex cursor-pointer items-center gap-1.5 border-purple-200 px-2 py-1 transition-colors hover:bg-purple-100"
                      onClick={() => handleCouponClick(coupon.couponId)}
                    >
                      <span className="max-w-[80px] truncate">{getCouponName(coupon.couponId)}</span>
                      <span className="rounded-full bg-purple-100 px-1.5 text-purple-700">{coupon.remaining}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-3 text-center">
                <span className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <Tag size={12} />
                  No coupons allocated
                </span>
              </div>
            )}

            {/* Toggle Button */}
            <Button
              variant={periodConfig.isOpen ? "destructive" : "outline"}
              size="sm"
              onClick={handleToggle}
              className="w-full"
              disabled={isActionInProgress}
            >
              {periodConfig.isOpen ? (
                <span className="flex items-center gap-1.5">
                  <ToggleLeft size={16} />
                  Close Period
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ToggleRight size={16} />
                  Open Period
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Coupon Detail Modal */}
      <Dialog open={!!selectedCoupon} onOpenChange={(open) => !open && setSelectedCoupon(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span>Coupon Details</span>
            </DialogTitle>
            <DialogDescription>Information about this coupon allocation</DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-4 py-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-50 to-white p-4 flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        selectedCoupon.config.discountType === "PERCENTAGE"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {selectedCoupon.config.discountType === "PERCENTAGE" ? (
                        <Percent size={24} />
                      ) : (
                        <DollarSign size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCoupon.name}</h3>
                      <Badge variant={selectedCoupon.isActive ? "default" : "secondary"}>
                        {selectedCoupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Discount Type</h4>
                  <p className="text-base font-medium">
                    {selectedCoupon.config.discountType === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                  </p>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Discount Value</h4>
                  <p className="text-base font-medium">
                    {selectedCoupon.config.discountType === "PERCENTAGE"
                      ? `${selectedCoupon.config.value}%`
                      : `₹${selectedCoupon.config.value}`}
                  </p>
                </div>

                {selectedCoupon.config.discountType === "PERCENTAGE" && selectedCoupon.config.upto && (
                  <div className="col-span-2">
                    <h4 className="mb-1 text-sm font-medium text-gray-500">Maximum Discount</h4>
                    <p className="text-base font-medium">Up to ₹{selectedCoupon.config.upto}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <Clock size={14} className="text-purple-500" />
                  Booking Requirements
                </h4>
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-3">
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Base Charge</span>
                    <span className="font-medium">₹{selectedCoupon.bookingMeta.baseCharge}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Cover Charge</span>
                    <span className="font-medium">₹{selectedCoupon.bookingMeta.redeemableCoverCharge}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Min Guests</span>
                    <span className="font-medium">{selectedCoupon.bookingMeta.minGuests || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <Users size={14} className="text-purple-500" />
                  Allocation Details
                </h4>
                <div className="rounded-md bg-purple-50 p-3">
                  {periodConfig.couponAllocations.find((c) => c.couponId === selectedCoupon._id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Available Quantity:</span>
                      <Badge variant="secondary" className="font-bold">
                        {periodConfig.couponAllocations.find((c) => c.couponId === selectedCoupon._id)?.remaining}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

PeriodCardManagement.displayName = "PeriodCardManagement"
export default memo(PeriodCardManagement)
