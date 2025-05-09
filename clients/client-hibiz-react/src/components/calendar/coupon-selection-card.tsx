import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Percent, DollarSign, Tag, Clock, Users } from "lucide-react"
import { memo } from "react"
import type { Coupon } from "@/hooks/useBusinessCoupons.ts"

interface CouponSelectionCardProps {
  coupon: Coupon
  isSelected: boolean
  onToggle: (couponId: string, isSelected: boolean) => void
}

const CouponSelectionCard = memo(({ coupon, isSelected, onToggle }:CouponSelectionCardProps) => {
  const { _id, name, config, bookingMeta, isActive } = coupon

  // Determine icon based on discount type
  const Icon = config.discountType === "PERCENTAGE" ? Percent : DollarSign

  return (
    <Card className={`overflow-hidden border ${isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`coupon-${_id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onToggle(_id, checked === true)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <Label htmlFor={`coupon-${_id}`} className="font-medium text-base cursor-pointer">
                {name}
              </Label>
              <Badge variant={isActive ? "default" : "outline"} className="ml-auto">
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                <Icon className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-purple-700">
                {config.discountType === "PERCENTAGE" ? `${config.value}% Off` : `₹${config.value} Off`}
              </span>
              {config.upto && <span className="text-xs text-gray-500 ml-1">(Up to ₹{config.upto})</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-gray-600">Base: ₹{bookingMeta.baseCharge}</span>
              </div>
              {bookingMeta.redeemableCoverCharge && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-gray-600">Cover: ₹{bookingMeta.redeemableCoverCharge}</span>
                </div>
              )}
              {bookingMeta.minGuests && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-gray-600">Min Guests: {bookingMeta.minGuests}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CouponSelectionCard.displayName = "CouponSelectionCard"

export default CouponSelectionCard
