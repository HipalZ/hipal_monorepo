import type { IBillData } from "@/components/types/hiClientzData.ts"

/**
 * Extracts variant ID from current bill data
 */
export const getVariantId = (currentBill: IBillData | null): string | undefined => {
  return currentBill?.variantId
}

/**
 * Creates payload with variant support
 */
export const createPayloadWithVariant = <T extends Record<string, any>>(
  basePayload: T,
  currentBill: IBillData | null,
): T => {
  const variantId = getVariantId(currentBill)

  if (variantId) {
    return {
      ...basePayload,
      variantId,
    }
  }

  return basePayload
}

/**
 * Checks if current bill is part of split bills
 */
export const isSplitBillVariant = (currentBill: IBillData | null): boolean => {
  return Boolean(currentBill?.variantId)
}

/**
 * Gets the appropriate query key based on variant
 */
export const getBillQueryKey = (currentBill: IBillData | null): string[] => {
  const baseKey = ["getTableBill"]
  const variantId = getVariantId(currentBill)

  // if (variantId) {
  //   return [...baseKey, variantId]
  // }

  return baseKey
}
