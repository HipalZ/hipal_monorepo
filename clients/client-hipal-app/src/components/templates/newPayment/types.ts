import type { IBusinessData, JewelleryData } from "../../types/businessData";

export interface OrderData {
  subTotal: number;
  gst: number;
  tips: number;
  discount: number;
  claimedCoins: number;
  couponDiscount: number;
  total: number;
  _id: string;
}

export interface BillRowProps {
  label: string;
  value: number;
  isNegative?: boolean;
}

export interface JewelleryPayProps {
  data?: IBusinessData;
}

// Re-export the imported types for convenience
export type { IBusinessData, JewelleryData };
