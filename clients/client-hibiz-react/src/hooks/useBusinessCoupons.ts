
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRpc } from "@hi/common"
import { useError } from "@/components/store/useError"
import toast from "react-hot-toast"

// Types for coupon management
export type CouponDiscountType = "PERCENTAGE" | "AMOUNT"

export type CouponConfig = {
  value: number
  discountType: CouponDiscountType
  upto?: number
  _id?: string
  steps?: any[]
}

export type CouponBookingMeta = {
  baseCharge: number
  redeemableCoverCharge?: number
  minGuests?: number
}

export type Coupon = {
  _id: string
  name: string
  type: string
  businessId: string
  config: CouponConfig
  bookingMeta: CouponBookingMeta
  isActive: boolean
  isPublish: boolean
  isDeleted: boolean
  cashbackAvailable: boolean
  promote: boolean
  promoteOnBill: boolean
  isExpired: boolean
  dineIn: boolean
  __v: number
}

export type CouponCreatePayload = {
  name: string
  config: {
    value: number
    discountType: CouponDiscountType
    upto?: number
  }
  bookingMeta: {
    baseCharge: number
    redeemableCoverCharge?: number
    minGuests?: number
  }
}

export type CouponUpdatePayload = Partial<CouponCreatePayload>

export type CouponResponse = {
  status: number
  data: Coupon
  message: string
}

export type CouponsResponse = {
  status: number
  data: Coupon[]
  message: string
}

/**
 * Hook for fetching all coupons for a business
 */
export const useGetBusinessCoupons = (businessId: string) => {
  const queryKey = ["businessCoupons", businessId]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiRpc.bookings.coupon.business[":businessId"].$get({
        param: { businessId },
      })
      return result.json() as CouponsResponse
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for fetching a single coupon by ID
 */
export const useGetCouponById = (couponId: string) => {
  const queryKey = ["coupon", couponId]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiRpc.bookings.coupon[":couponId"].$get({
        param: { couponId },
      })
      return result.json() as CouponResponse
    },
    enabled: !!couponId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for creating a new coupon
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  const { setError, setOpenErrorModal } = useError()

  const { isPending: isCreating, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      payload,
    }: {
      businessId: string
      payload: CouponCreatePayload
    }) => {
      const response = await apiRpc.bookings.coupon.business[":businessId"].$post({
        param: { businessId },
        json: payload,
      })
      return response.json() as CouponResponse
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true)
        setError("Failed to create coupon")
        return toast.error("Failed to create coupon")
      }
      if (data.status === 409) {
        setOpenErrorModal(true)
        setError("Coupon with this name already exists")
        return toast.error("Coupon with this name already exists")
      }
      if (data.status === 200 || data.status === 201) {
        // Invalidate the business coupons query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["businessCoupons", variables.businessId] })
        return toast.success("Coupon created successfully")
      }
    },
    onError: (error) => {
      console.error("Failed to create coupon:", error)
      toast.error("Failed to create coupon")
    },
  })

  return { isCreating, createCoupon: mutateAsync }
}

/**
 * Hook for updating an existing coupon
 */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient()
  const { setError, setOpenErrorModal } = useError()

  const { isPending: isUpdating, mutateAsync } = useMutation({
    mutationFn: async ({
      couponId,
      payload,
      businessId,
    }: {
      couponId: string
      payload: CouponUpdatePayload
      businessId: string
    }) => {
      const response = await apiRpc.bookings.coupon[":couponId"].$patch({
        param: { couponId },
        json: payload,
      })
      return response.json() as CouponResponse
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true)
        setError("Failed to update coupon")
        return toast.error("Failed to update coupon")
      }
      if (data.status === 404) {
        setOpenErrorModal(true)
        setError("Coupon not found")
        return toast.error("Coupon not found")
      }
      if (data.status === 200 || data.status === 201) {
        // Invalidate both the specific coupon query and the business coupons query
        queryClient.invalidateQueries({ queryKey: ["coupon", variables.couponId] })
        queryClient.invalidateQueries({ queryKey: ["businessCoupons", variables.businessId] })
        return toast.success("Coupon updated successfully")
      }
    },
    onError: (error) => {
      console.error("Failed to update coupon:", error)
      toast.error("Failed to update coupon")
    },
  })

  return { isUpdating, updateCoupon: mutateAsync }
}
