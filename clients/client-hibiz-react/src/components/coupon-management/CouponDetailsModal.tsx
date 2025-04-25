import { memo } from "react"
import { Percent, DollarSign, Users, CheckCircle, XCircle, Edit, Ticket } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Coupon } from "@/hooks/useBusinessCoupons"

type CouponDetailModalProps = {
  coupon: Coupon | null
  onClose: () => void
  onEdit: (coupon: Coupon) => void
}

const CouponDetailModal = ({ coupon, onClose, onEdit }: CouponDetailModalProps) => {
  if (!coupon) return null

  return (
    <Dialog open={!!coupon} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            <span>Coupon Details</span>
          </DialogTitle>
          <DialogDescription>View detailed information about this coupon</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                coupon.config.discountType === "PERCENTAGE"
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {coupon.config.discountType === "PERCENTAGE" ? <Percent size={24} /> : <DollarSign size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{coupon.name}</h3>
              <Badge variant={coupon.isActive ? "default" : "secondary"}>
                {coupon.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Discount Type</h4>
              <p className="text-base font-medium">
                {coupon.config.discountType === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Discount Value</h4>
              <p className="text-base font-medium">
                {coupon.config.discountType === "PERCENTAGE" ? `${coupon.config.value}%` : `₹${coupon.config.value}`}
              </p>
            </div>

            {coupon.config.discountType === "PERCENTAGE" && coupon.config.upto && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Maximum Discount</h4>
                <p className="text-base font-medium">Up to ₹{coupon.config.upto}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Booking Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Base Charge</span>
                </div>
                <p className="text-base font-medium">₹{coupon.bookingMeta.baseCharge}</p>
              </div>

              {coupon.bookingMeta.redeemableCoverCharge && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Redeemable Cover</span>
                  </div>
                  <p className="text-base font-medium">₹{coupon.bookingMeta.redeemableCoverCharge}</p>
                </div>
              )}

              {coupon.bookingMeta.minGuests && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Minimum Guests</span>
                  </div>
                  <p className="text-base font-medium">{coupon.bookingMeta.minGuests}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <div className="flex items-center gap-2">
                {coupon.isActive ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-red-600 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                onClose()
                onEdit(coupon)
              }}
              className="flex items-center gap-1.5"
            >
              <Edit size={16} />
              <span>Edit Coupon</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(CouponDetailModal)
