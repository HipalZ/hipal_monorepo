export type DiscountType = "ON_BILL" | "ON_DISH"

// Base interface for variant support
interface BasePayload {
  businessId: string
  tableName: string
  variantId?: string // Optional variant ID for split bills
}

export interface DiscountPayload extends BasePayload {
  value: number
  reasonOfDiscount?: string
  discountAppliedBy: string
  discountAppliedOn: DiscountType
  itemIds?: string[]
}

export interface RemoveDiscountPayload extends BasePayload {
  discountRemovedBy: string
}

export interface AddCoinzPayload extends BasePayload {
  value: number
}

export interface RemoveCoinzPayload extends BasePayload {
  coinzRemovedBy: string
}

export interface AddCouponPayload extends BasePayload {
  couponId: string
}

export interface RemoveCouponPayload extends BasePayload {}

export interface AddServiceChargePayload extends BasePayload {
  serviceChargeAppliedBy: string
}

export interface RemoveServiceChargePayload extends BasePayload {
  serviceChargeRemovedBy: string
  reasonOfServiceCharge: string
}

export interface SettleTypePayload extends BasePayload {}

export interface ReprintPayload extends BasePayload {}

// API Response types
export interface ApiResponse<T = any> {
  status: number
  message?: string
  data?: T
}

export interface ApiError {
  message: string
  status?: number
}
