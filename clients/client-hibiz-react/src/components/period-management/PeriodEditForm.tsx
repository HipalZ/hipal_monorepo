import { useState, useCallback, memo} from "react"
import { Save, X, Tag, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CouponAllocationModal from "./CouponAllocationModal"
import type { CouponAllocation } from "@/hooks/useBusinessPeriodConfig"
import { useGetBusinessCoupons } from "@/hooks/useBusinessCoupons"

type PeriodEditFormProps = {
  editValues: {
    baseCharge: number
    redeemableCoverCharge: number
    isOpen: boolean
    couponAllocations?: CouponAllocation[]
  }
  onEditFieldChange: (field: string, value: any) => void
  onCancel: () => void
  onSave: () => Promise<void>
  isActionInProgress: boolean
  businessId: string
  onCreateCoupon: (payload: any) => Promise<void>
  isCreatingCoupon: boolean
}

const PeriodEditForm = ({
  editValues,
  onEditFieldChange,
  onCancel,
  onSave,
  isActionInProgress,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}:PeriodEditFormProps) => {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const { data: couponsResponse } = useGetBusinessCoupons(businessId)
  const coupons = couponsResponse?.data || []

  // Get coupon names for display
  const getCouponName = useCallback(
    (couponId: string) => {
      const coupon = coupons.find((c) => c._id === couponId)
      return coupon ? coupon.name : "Unknown Coupon"
    },
    [coupons],
  )

  // Handle coupon allocation update
  const handleUpdateAllocations = useCallback(
    (allocations: CouponAllocation[]) => {
      onEditFieldChange("couponAllocations", allocations)
      setIsAllocationModalOpen(false)
    },
    [onEditFieldChange],
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="base-charge" className="text-xs text-gray-500">
            Base Charge
          </Label>
          <div className="relative mt-1">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</div>
            <Input
              id="base-charge"
              type="number"
              value={editValues.baseCharge}
              onChange={(e) => onEditFieldChange("baseCharge", Number(e.target.value) || 0)}
              className="pl-6 h-8 text-sm"
              disabled={isActionInProgress}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="cover-charge" className="text-xs text-gray-500">
            Redeemable Cover
          </Label>
          <div className="relative mt-1">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</div>
            <Input
              id="cover-charge"
              type="number"
              value={editValues.redeemableCoverCharge}
              onChange={(e) => onEditFieldChange("redeemableCoverCharge", Number(e.target.value) || 0)}
              className="pl-6 h-8 text-sm"
              disabled={isActionInProgress}
            />
          </div>
        </div>
      </div>

      {/* Coupon Allocations */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs text-gray-500 flex items-center gap-1">
            <Tag size={12} />
            Coupon Allocations
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAllocationModalOpen(true)}
            className="h-7 text-xs"
            disabled={isActionInProgress}
          >
            <Plus size={12} className="mr-1" />
            Manage
          </Button>
        </div>

        <div className="min-h-[40px] p-2 border border-dashed border-gray-200 rounded-md">
          {editValues.couponAllocations && editValues.couponAllocations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {editValues.couponAllocations.map((allocation) => (
                <Badge key={allocation.couponId} variant="outline" className="flex items-center gap-1 py-1 px-2">
                  <span className="text-xs font-normal">{getCouponName(allocation.couponId)}</span>
                  <span className="text-xs font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {allocation.remaining}
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-1">No coupons allocated to this period</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="period-status"
          checked={editValues.isOpen}
          onCheckedChange={(checked) => onEditFieldChange("isOpen", checked)}
          disabled={isActionInProgress}
        />
        <Label htmlFor="period-status" className="text-xs">
          {editValues.isOpen ? "Open" : "Closed"}
        </Label>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 text-xs" disabled={isActionInProgress}>
          <X size={14} className="mr-1" />
          Cancel
        </Button>
        <Button variant="default" size="sm" onClick={onSave} className="h-8 text-xs" disabled={isActionInProgress}>
          {isActionInProgress ? (
            <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin mr-1"></div>
          ) : (
            <Save size={14} className="mr-1" />
          )}
          Save
        </Button>
      </div>

      {/* Coupon Allocation Modal */}
      <CouponAllocationModal
        open={isAllocationModalOpen}
        onOpenChange={setIsAllocationModalOpen}
        businessId={businessId}
        currentAllocations={editValues.couponAllocations || []}
        onSave={handleUpdateAllocations}
        isLoading={isActionInProgress}
        onCreateCoupon={onCreateCoupon}
        isCreatingCoupon={isCreatingCoupon}
      />
    </div>
  )
}

export default memo(PeriodEditForm)
