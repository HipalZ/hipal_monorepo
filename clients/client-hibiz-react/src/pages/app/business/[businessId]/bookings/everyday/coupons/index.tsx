import { useCallback, useState } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import MemoizedHeader from "@/components/molecules/header"
import CouponList from "@/components/coupon-management/CouponList"
import {
  useGetBusinessCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  type CouponCreatePayload,
  type CouponUpdatePayload,
} from "@/hooks/useBusinessCoupons"

const CouponManagement = () => {
  const { businessId = "" } = useParams<{ businessId: string }>()
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  // Fetch coupons
  const { data: couponsResponse, isLoading } = useGetBusinessCoupons(businessId)
  const { createCoupon, isCreating } = useCreateCoupon()
  const { updateCoupon, isUpdating } = useUpdateCoupon()

  // Handle create coupon
  const handleCreateCoupon = useCallback(
    async (payload: CouponCreatePayload) => {
      setIsActionInProgress(true)
      try {
        await createCoupon({ businessId, payload })
      } finally {
        setIsActionInProgress(false)
      }
    },
    [businessId, createCoupon],
  )

  // Handle update coupon
  const handleUpdateCoupon = useCallback(
    async (couponId: string, payload: CouponUpdatePayload) => {
      setIsActionInProgress(true)
      try {
        await updateCoupon({ couponId, payload, businessId })
      } finally {
        setIsActionInProgress(false)
      }
    },
    [businessId, updateCoupon],
  )

  // Extract coupons from response
  const coupons = couponsResponse?.data || []

  return (
    <main className="min-h-screen pb-[10rem]">
      {/* Header */}
      <header className="linear_gradient_background">
        <MemoizedHeader title="Coupon Management" />
      </header>

      {/* Main content */}
      <div className="container px-4 py-8 mx-auto">
        {/* Loading indicator */}
        <AnimatePresence>
          {(isLoading || isActionInProgress || isCreating || isUpdating) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-xl"
              >
                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                <p className="font-medium text-gray-700">
                  {isCreating ? "Creating coupon..." : isUpdating ? "Updating coupon..." : "Loading coupons..."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupon list */}
        <CouponList
          coupons={coupons}
          businessId={businessId}
          isLoading={isLoading}
          onCreateCoupon={handleCreateCoupon}
          onUpdateCoupon={handleUpdateCoupon}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </div>
    </main>
  )
}

export default CouponManagement
