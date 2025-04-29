import { memo, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Tag } from "lucide-react"
import type { Coupon } from "@/hooks/useBusinessCoupons"

type CouponAllocation = {
  couponId: string
  remaining: number
  _id?: string
}

type CouponAllocationSectionProps = {
  coupons: Coupon[]
  allocations: CouponAllocation[]
  onAllocationsChange: (allocations: CouponAllocation[]) => void
}

const CouponAllocationSection = ({ coupons, allocations, onAllocationsChange }: CouponAllocationSectionProps) => {
  // Create a map of coupon allocations for easier lookup
  const allocationMap = useMemo(() => {
    const map = new Map<string, number>()
    allocations.forEach((allocation) => {
      map.set(allocation.couponId, allocation.remaining)
    })
    return map
  }, [allocations])

  // Toggle coupon selection
  const toggleCoupon = useCallback(
    (couponId: string, checked: boolean) => {
      let newAllocations = [...allocations]

      if (checked) {
        // Add coupon with default remaining of 10
        if (!allocationMap.has(couponId)) {
          newAllocations.push({ couponId, remaining: 10 })
        }
      } else {
        // Remove coupon
        newAllocations = newAllocations.filter((a) => a.couponId !== couponId)
      }

      onAllocationsChange(newAllocations)
    },
    [allocations, allocationMap, onAllocationsChange],
  )

  // Update remaining count
  const updateRemaining = useCallback(
    (couponId: string, remaining: number) => {
      if (remaining < 1) remaining = 1

      const newAllocations = allocations.map((allocation) => {
        if (allocation.couponId === couponId) {
          return { ...allocation, remaining }
        }
        return allocation
      })

      onAllocationsChange(newAllocations)
    },
    [allocations, onAllocationsChange],
  )

  // Increment/decrement remaining count
  const adjustRemaining = useCallback(
    (couponId: string, delta: number) => {
      const current = allocationMap.get(couponId) || 0
      updateRemaining(couponId, Math.max(1, current + delta))
    },
    [allocationMap, updateRemaining],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Coupon Allocations</Label>
        <Badge variant="outline" className="font-normal">
          {allocations.length} Selected
        </Badge>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <Tag className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No coupons available to allocate.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[240px] pr-4 -mr-4">
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const isSelected = allocationMap.has(coupon._id)
              const remaining = allocationMap.get(coupon._id) || 0

              return (
                <Card
                  key={coupon._id}
                  className={`transition-all ${isSelected ? "border-primary/30 bg-primary/5" : "border-gray-200"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`coupon-${coupon._id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleCoupon(coupon._id, checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`coupon-${coupon._id}`} className="font-medium text-sm cursor-pointer">
                          {coupon.name}
                        </Label>
                        <div className="text-xs text-gray-500 mt-1">
                          {coupon.config.discountType === "PERCENTAGE" ? (
                            <span>
                              {coupon.config.value}% discount
                              {coupon.config.upto && ` (up to ₹${coupon.config.upto})`}
                            </span>
                          ) : (
                            <span>₹{coupon.config.value} off</span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-2">
                            <Label htmlFor={`remaining-${coupon._id}`} className="text-xs whitespace-nowrap">
                              Available Quantity:
                            </Label>
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-r-none"
                                onClick={() => adjustRemaining(coupon._id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                id={`remaining-${coupon._id}`}
                                type="number"
                                min="1"
                                value={remaining}
                                onChange={(e) => updateRemaining(coupon._id, Number.parseInt(e.target.value) || 1)}
                                className="h-7 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-l-none"
                                onClick={() => adjustRemaining(coupon._id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export default memo(CouponAllocationSection)
