import { useState, useEffect,memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, Plus, X, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGetBusinessCoupons } from "@/hooks/useBusinessCoupons"
import CouponForm from "@/components/coupon-management/CouponForm"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"

type CouponAllocation = {
  couponId: string
  remaining: number
  _id?: string
}

type CouponAllocationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  currentAllocations: CouponAllocation[]
  onSave: (allocations: CouponAllocation[]) => void
  isLoading: boolean
  onCreateCoupon: (payload: any) => Promise<void>
  isCreatingCoupon: boolean
}

const CouponAllocationModal = ({
  open,
  onOpenChange,
  businessId,
  currentAllocations,
  onSave,
  isLoading,
  onCreateCoupon,
  isCreatingCoupon,
}: CouponAllocationModalProps) => {
  const { data: couponsResponse, isLoading: isLoadingCoupons } = useGetBusinessCoupons(businessId)
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize allocations from props
  useEffect(() => {
    if (open) {
      const newAllocations = new Map<string, number>()
      currentAllocations.forEach((allocation) => {
        newAllocations.set(allocation.couponId, allocation.remaining)
      })
      setAllocations(newAllocations)
      setError(null)
      setShowCreateForm(false)
    }
  }, [open, currentAllocations])

  // Toggle coupon selection
  const toggleCoupon = (couponId: string, checked: boolean) => {
    const newAllocations = new Map(allocations)
    if (checked) {
      // Add with default remaining of 10
      newAllocations.set(couponId, 10)
    } else {
      // Remove
      newAllocations.delete(couponId)
    }
    setAllocations(newAllocations)
  }

  // Update remaining count
  const updateRemaining = (couponId: string, remaining: number) => {
    if (remaining < 1) {
      setError("Remaining count must be at least 1")
      return
    }

    const newAllocations = new Map(allocations)
    newAllocations.set(couponId, remaining)
    setAllocations(newAllocations)
    setError(null)
  }

  // Handle save
  const handleSave = () => {
    const allocationArray: CouponAllocation[] = []
    allocations.forEach((remaining, couponId) => {
      allocationArray.push({ couponId, remaining })
    })
    onSave(allocationArray)
  }

  // Handle create coupon
  const handleCreateCoupon = async (formData: any) => {
    try {
      await onCreateCoupon(formData)
      setShowCreateForm(false)
    } catch (error) {
      console.error("Failed to create coupon:", error)
      // Keep the form open if there's an error
    }
  }

  // Get coupons from response
  const coupons = couponsResponse?.data || []
  const hasCoupons = coupons.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[100dvh] md:max-h-[85dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <span>Coupon Allocations</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {showCreateForm ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-x-hidden overflow-y-auto h-[90dvh] pb-[10rem]"
            >
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center gap-1"
                >
                  <X size={14} />
                  <span>Back to Coupons</span>
                </Button>
              </div>
              <CouponForm
                onSubmit={handleCreateCoupon}
                isSubmitting={isCreatingCoupon}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="coupon-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-hidden"
            >
              {isLoadingCoupons ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"/>
                  <p className="ml-3 text-sm text-gray-500">Loading coupons...</p>
                </div>
              ) : !hasCoupons ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Coupons Available</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't created any coupons yet. Create a coupon to allocate it to this period.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} className="mr-2" />
                    Create New Coupon
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">
                      Select coupons to allocate to this period and set the available quantity.
                    </p>
                    <Button size="sm" onClick={() => setShowCreateForm(true)}>
                      <Plus size={14} className="mr-1" />
                      New
                    </Button>
                  </div>

                  <ScrollArea className="min-h-[300px] max-h-[100dvh] lg:max-h-[80dvh] pr-4 -mr-4 ">
                    <div className="space-y-3 pb-[10rem]">
                      {coupons.map((coupon) => {
                        const isSelected = allocations.has(coupon._id)
                        const remaining = allocations.get(coupon._id) || 0

                        return (
                          <div
                            key={coupon._id}
                            className={`p-3 rounded-lg border ${
                              isSelected ? "border-primary/30 bg-primary/5" : "border-gray-200"
                            }`}
                          >
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
                                    <Input
                                      id={`remaining-${coupon._id}`}
                                      type="number"
                                      min="1"
                                      value={remaining}
                                      onChange={(e) =>
                                        updateRemaining(coupon._id, Number.parseInt(e.target.value) || 0)
                                      }
                                      className="h-8 w-20"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showCreateForm && hasCoupons && (
          <AdvancedBottomButton
            fixed={false}
            maxWidth="30rem"
            buttons={[
              {
                text: "Cancel",
                onClick: () => onOpenChange(false),
                disabled: isLoading,
                isBackButton: true,
                className:"pl-3 rounded-md"
              },
              {
                text: isLoading ? "Saving..." : "Save Allocations",
                onClick: handleSave,
                isLoading: isLoading,
                swipe: true,
                className:"rounded-md w-full"
              },
            ]}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default memo(CouponAllocationModal)
