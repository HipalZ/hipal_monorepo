import { memo } from "react"
import { Percent, DollarSign, Edit, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/hooks/useBusinessCoupons"

type CouponCardProps = {
  coupon: Coupon
  onEdit: (coupon: Coupon) => void
  onView: (coupon: Coupon) => void
}

const CouponCard = ({ coupon, onEdit, onView }: CouponCardProps) => {
  return (
    <Card
      className={`h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        coupon.isActive ? "border-green-100" : "border-gray-200"
      }`}
      onClick={() => onView(coupon)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                coupon.config.discountType === "PERCENTAGE"
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {coupon.config.discountType === "PERCENTAGE" ? <Percent size={20} /> : <DollarSign size={20} />}
            </div>
            <div>
              <h3 className="font-medium text-base">{coupon.name}</h3>
              <Badge variant={coupon.isActive ? "default" : "secondary"} className="mt-1 text-xs">
                {coupon.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(coupon)
              }}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onView(coupon)
              }}
            >
              <Info size={16} />
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Discount</span>
            <Badge
              variant="outline"
              className={`${
                coupon.config.discountType === "PERCENTAGE"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {coupon.config.discountType === "PERCENTAGE" ? (
                <span>{coupon.config.value}%</span>
              ) : (
                <span>₹{coupon.config.value}</span>
              )}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Base Charge</span>
            <span className="text-sm font-medium">₹{coupon.bookingMeta.baseCharge}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CouponCard)
