import type { CartItem } from "../bill";

export interface SplitBillTableSessionInterface {
  businessId: string; // ObjectId
  tableName: string;
  serviceCharge?: number;
  settleType?: string;
  date?: number;
  total?: number;
  subTotal?: number;
  gst?: number;
  discount?: number;
  tips?: number;
  claimedCoins?: number;
  couponId?: string;
  couponDiscount?: number;
  isDiscountApplied?: boolean;
  reasonOfDiscount?: string;
  serviceChargeAppliedBy?: string; // ObjectId
  serviceChargeRemovedBy?: string; // ObjectId
  discountAppliedBy?: string; // ObjectId
  discountRemovedBy?: string; // ObjectId
  reasonOfServiceCharge?: string;
  discountAppliedOn?: "ON_BILL" | "ON_DISH";
  gstPercentage?: number;
  serviceChargePercentage?: number;
  newDishGst?: number;
  isServiceChargeRemoved?: boolean;
  customerIds?: string[]; // Array of ObjectIds
  items?: CartItem[];
  billPrintCount?: number;
  splitBillInvoiceNumber?: number;
  originTableSessionId: string;
  variantName: string;
}
