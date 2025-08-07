export interface VariantSplit {
  percentage: number
}

export interface SplitBillPayload {
  businessId: string
  tableName: string
  variantCount: number
  variants: VariantSplit[]
}

export interface ItemVariant {
  variantId: string
  variantName: string
  itemIds: string[]
}

export interface ItemWiseSplitPayload {
  businessId: string
  tableName: string
  variants: ItemVariant[]
}

export interface BillItem {
  _id: string
  dish: {
    _id: string
    name: string
    price: number
  }
  quantity: number
  portion?: {
    name: string
    price: number
  }
}
