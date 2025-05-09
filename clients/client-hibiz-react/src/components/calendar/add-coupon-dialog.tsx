import  { useState, useCallback, useMemo, useEffect, memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Coupon } from "@/hooks/useBusinessCoupons.ts"
import CouponSelectionCard from "./coupon-selection-card.tsx"

interface AddCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allCoupons: Coupon[]
  editedCoupons: Array<{ couponId: string; remaining: number }>
  onAddCoupons: (selectedCoupons: Array<{ couponId: string; remaining: number }>) => void
  isLoading: boolean
}

const AddCouponDialog = ({
  open,
  onOpenChange,
  allCoupons,
  editedCoupons,
  onAddCoupons,
  isLoading,
}:AddCouponDialogProps) => {
  // State for selected coupons and their counts
  const [selectedCoupons, setSelectedCoupons] = useState<Record<string, number>>({})

  // Reset selections when dialog opens/closes
  
  useEffect(() => {
    if (open) {
      setSelectedCoupons({})
    }
  }, [open])

  // Filter available coupons (active and not already added)
  const availableCoupons = useMemo(() => {
    if (!allCoupons) return []
    const editedCouponIds = editedCoupons.map((c) => c.couponId)
    return allCoupons.filter((coupon) => coupon.isActive && !editedCouponIds.includes(coupon._id))
  }, [allCoupons, editedCoupons])

  // Handle coupon selection toggle
  const handleToggleCoupon = useCallback((couponId: string, isSelected: boolean) => {
    setSelectedCoupons((prev) => {
      const newSelections = { ...prev }
      if (isSelected) {
        newSelections[couponId] = 5 // Default allocation
      } else {
        delete newSelections[couponId]
      }
      return newSelections
    })
  }, [])

  // Update coupon count
  const handleCountChange = useCallback((couponId: string, count: number) => {
    setSelectedCoupons((prev) => ({
      ...prev,
      [couponId]: Math.max(1, count), // Ensure count is at least 1
    }))
  }, [])

  // Add selected coupons
  const handleAddCoupons = useCallback(() => {
    const couponsToAdd = Object.entries(selectedCoupons).map(([couponId, remaining]) => ({
      couponId,
      remaining,
    }))
    onAddCoupons(couponsToAdd)
    onOpenChange(false)
  }, [selectedCoupons, onAddCoupons, onOpenChange])

  // Check if any coupons are selected
  const hasSelections = useMemo(() => Object.keys(selectedCoupons).length > 0, [selectedCoupons])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Coupons</DialogTitle>
          <DialogDescription>
            Select coupons and set allocation counts for this period. You can add multiple coupons at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-purple-200 animate-spin"></div>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No available coupons to add.</div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">Available Coupons</h3>
                <p className="text-xs text-gray-500">Select coupons to add to this period</p>
              </div>

              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-3">
                  {availableCoupons.map((coupon) => (
                    <div key={coupon._id} className="space-y-2">
                      <CouponSelectionCard
                        coupon={coupon}
                        isSelected={!!selectedCoupons[coupon._id]}
                        onToggle={handleToggleCoupon}
                      />

                      {selectedCoupons[coupon._id] && (
                        <div className="ml-8 flex items-center gap-2">
                          <Label htmlFor={`count-${coupon._id}`} className="text-sm">
                            Allocation:
                          </Label>
                          <Input
                            id={`count-${coupon._id}`}
                            type="number"
                            min="1"
                            value={selectedCoupons[coupon._id]}
                            onChange={(e) =>
                              handleCountChange(
                                coupon._id,
                                Number.parseInt(e.target.value) || selectedCoupons[coupon._id],
                              )
                            }
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-gray-500">
            {hasSelections ? `${Object.keys(selectedCoupons).length} coupon(s) selected` : "No coupons selected"}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCoupons} disabled={!hasSelections}>
              Add Selected Coupons
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddCouponDialog)
