import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Percent, DollarSign, Users, Clock, Tag } from "lucide-react"
import type { Coupon, CouponDiscountType } from "@/hooks/useBusinessCoupons.ts"

interface CouponCardProps {
  coupon: {
    couponId: Coupon
    remaining: number
  }
}

const CouponCard = ({ coupon }: CouponCardProps) => {
  const { couponId, remaining } = coupon
  const { name, config, bookingMeta, isActive } = couponId

  // Determine icon based on discount type
  const getIcon = (discountType: CouponDiscountType) => {
    if (discountType === "PERCENTAGE") {
      return Percent
    }
    return DollarSign
  }

  const Icon = getIcon(config.discountType)

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Gradient Icon Section */}
        <div className="w-1/4 p-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-full h-full rounded-full bg-white/20 blur-sm"></div>
            <Ticket className="h-10 w-10 text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" />
            <div className="absolute -bottom-1 -right-1 w-full h-full rounded-full bg-black/10 blur-sm"></div>
          </div>
        </div>

        {/* Coupon Details Section */}
        <div className="w-3/4 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-purple-800">{name}</h3>
            <Badge variant={isActive ? "" : "outline"} className="ml-2">
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-purple-700">
              {config.discountType === "PERCENTAGE" ? `${config.value}% Off` : `₹${config.value} Off`}
            </span>
            {config.upto && <span className="text-xs text-gray-500 ml-1">(Up to ₹{config.upto})</span>}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="flex items-center gap-1">
              <Ticket className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-gray-600">Remaining: {remaining}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CouponCard
