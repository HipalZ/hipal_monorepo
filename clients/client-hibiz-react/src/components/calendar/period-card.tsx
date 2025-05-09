import { memo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Edit, X, Save, PlusCircle, Ticket, Plus, Minus } from "lucide-react"
import { getPeriodName } from "@/components/utils/timeUtils"
import CouponCard from "@/components/calendar/coupon-card"
import type { IBookingBusinessDetails } from "@/hooks/useBookingCalendar"
import { format, parseISO } from "date-fns"
import type { Coupon } from "@/hooks/useBusinessCoupons.ts"
import { useMediaQuery } from "@/hooks/use-media-query.ts"
import { cn } from "@/lib/utils.ts"

interface PeriodCardProps {
  periodData: IBookingBusinessDetails
  editingPeriod: number | null
  isOpenState: boolean
  editedCoupons: Array<{ couponId: string; remaining: number }>
  allCoupons: Coupon[]
  isUpdating: boolean
  onStartEditing: (periodData: IBookingBusinessDetails) => void
  onCancelEditing: () => void
  onSaveChanges: (periodData: IBookingBusinessDetails) => void
  onUpdateCouponCount: (couponId: string, change: number) => void
  onShowAddCouponDialog: () => void
  isDetailView?: boolean
}

const PeriodCard = memo(
  ({
    periodData,
    editingPeriod,
    isOpenState,
    editedCoupons,
    allCoupons,
    isUpdating,
    onStartEditing,
    onCancelEditing,
    onSaveChanges,
    onUpdateCouponCount,
    onShowAddCouponDialog,
    isDetailView = false,
  }:PeriodCardProps) => {
    const isEditing = editingPeriod === periodData.bookingBusiness.period

    const isSmallScreen = useMediaQuery("(max-width: 640px)")

    // Render time slots grid
    const renderTimeSlots = useCallback(() => {
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {periodData.slots.map((slot) => (
            <div
              key={slot.slot}
              className={`rounded-md border p-3 ${
                !slot.isInOperatableRange
                  ? "border-gray-200 bg-gray-100"
                  : slot.count > 0
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-sm font-medium">{slot.slot}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">Bookings:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${slot.count > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-500"}`}
                >
                  {slot.count}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )
    }, [periodData.slots])

    // Render coupon section
    const renderCouponSection = useCallback(() => {
      return (
        <div className="mb-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="coupons" className="border-b-0">
              <AccordionTrigger className="py-2">
                <h3 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Ticket className="h-4 w-4 text-purple-500" />
                  Available Coupons (
                  {isEditing ? editedCoupons.length : periodData.bookingBusiness.couponsRemaining?.length || 0})
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                {isEditing ? (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium">Edit Coupon Allocations</h4>
                      <Button size="sm" variant="outline" onClick={onShowAddCouponDialog}>
                        <PlusCircle className="h-4 w-4 mr-1" /> Add Coupon
                      </Button>
                    </div>

                    {editedCoupons.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                        {editedCoupons.map((coupon) => {
                          // Find the full coupon details
                          const fullCoupon = allCoupons?.find((c) => c._id === coupon.couponId)
                          if (!fullCoupon) return null

                          return (
                            <Card key={coupon.couponId} className="border border-purple-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium">{fullCoupon.name}</h5>
                                  <Badge variant="outline">
                                    {fullCoupon.config.discountType === "PERCENTAGE"
                                      ? `${fullCoupon.config.value}% Off`
                                      : `₹${fullCoupon.config.value} Off`}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-gray-600">Allocation:</span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-6 w-6"
                                      onClick={() => onUpdateCouponCount(coupon.couponId, -1)}
                                      disabled={coupon.remaining <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{coupon.remaining}</span>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-6 w-6"
                                      onClick={() => onUpdateCouponCount(coupon.couponId, 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No coupons allocated. Click "Add Coupon" to add coupons.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                    {periodData.bookingBusiness.couponsRemaining &&
                    periodData.bookingBusiness.couponsRemaining.length > 0 ? (
                      periodData.bookingBusiness.couponsRemaining.map((coupon) => (
                        <CouponCard key={coupon._id} coupon={coupon} />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        No coupons available for this period.
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )
    }, [
      periodData.bookingBusiness.couponsRemaining,
      isEditing,
      editedCoupons,
      allCoupons,
      onUpdateCouponCount,
      onShowAddCouponDialog,
    ])

    // Render period details (only for detail view)
    const renderPeriodDetails = useCallback(() => {
      if (!isDetailView) return null

      return (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Period Details</h3>
          <div className="grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{periodData.bookingBusiness.isOpen ? "Open" : "Closed"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="font-medium">{periodData.numOfBookings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Coupons Available</p>
              <p className="font-medium">
                {isEditing ? editedCoupons.length : periodData.bookingBusiness.couponsRemaining?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">
                {format(parseISO(periodData.bookingBusiness.updatedAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>
        </div>
      )
    }, [
      isDetailView,
      periodData.bookingBusiness.isOpen,
      periodData.bookingBusiness.updatedAt,
      periodData.numOfBookings,
      periodData.bookingBusiness.couponsRemaining?.length,
      isEditing,
      editedCoupons.length,
    ])

    return (
      <Card
        className={cn(`rounded-none shadow-none lg:mx-4 lg:rounded-xl ${
          isEditing ? "border-purple-300 bg-purple-50" : ""
        }`)}
      >
        <CardHeader className={isDetailView ? undefined : "pb-3"}>
          <CardTitle className="flex items-center gap-4 justify-between text-lg">
            <span className="flex items-center gap-2 -ml-2">
              {getPeriodName(periodData.bookingBusiness.period)}
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isOpenState}
                    onCheckedChange={(checked) => {
                      // This is just to satisfy TypeScript, the actual state is managed in the parent component
                    }}
                    id={`period-switch-${isDetailView ? "detail-" : ""}${periodData.bookingBusiness.period}`}
                  />
                  <Label htmlFor={`period-switch-${isDetailView ? "detail-" : ""}${periodData.bookingBusiness.period}`}>
                    {isOpenState ? "Open" : "Closed"}
                  </Label>
                </div>
              ) : (
                <Badge variant={periodData.bookingBusiness.isOpen ? "default" : "destructive"}>
                  {periodData.bookingBusiness.isOpen ? "Open" : "Closed"}
                </Badge>
              )}
              {periodData.bookingBusiness.explicitlyEdited && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  Explicitly Edited
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              {!isDetailView && !isSmallScreen && (
                <Badge variant="outline" className="ml-auto">
                  {periodData.numOfBookings} {periodData.numOfBookings === 1 ? "booking" : "bookings"}
                </Badge>
              )}

              {isEditing ? (
                <>
                  <Button size="sm" variant="outline" onClick={onCancelEditing} disabled={isUpdating}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" variant="default" onClick={() => onSaveChanges(periodData)} disabled={isUpdating}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onStartEditing(periodData)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderPeriodDetails()}
          {renderCouponSection()}
          {isDetailView && <h3 className="mb-2 text-sm font-medium text-gray-700">Time Slots</h3>}
          {renderTimeSlots()}
        </CardContent>
      </Card>
    )
  },
)

PeriodCard.displayName = "PeriodCard"

export default PeriodCard
