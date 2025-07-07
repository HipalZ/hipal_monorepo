// ─────────────────────────────────────────────────────────────────────────────
// Reusable User reference
// ─────────────────────────────────────────────────────────────────────────────
export interface UserRef {
  _id: string;
  phone: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core models (unchanged from before)
// ─────────────────────────────────────────────────────────────────────────────
export type DiscountAppliedOn = "ON_BILL" | "ON_ITEM";

export interface Extra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Portion {
  _id: string;
  name: string;
  price: number;
  default: boolean;
  portionTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  _id: string;
  businessId: string;
  posDishId: string;
  __v: number;
  availability: boolean;
  categoryIds: string[];
  createdAt: string;
  description: string;
  dishTypes: string[];
  ignoreDiscount: string;
  ignoreTax: string;
  images: string[];
  isDeleted: boolean;
  menuId: string;
  name: string;
  portions: Portion[];
  pos: boolean;
  posTax: string;
  price: number;
  rank: number;
  tags: string[];
  updatedAt: string;
  visibility: boolean;
  active: boolean;
  kitchenId: string;
  tax: number;
  gst: number;
}

export interface CartItem {
  id: string;
  dish: Dish;
  portion: Portion | null;
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  _id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Order Payload (with UserRef fields)
// ─────────────────────────────────────────────────────────────────────────────
export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  tableName: string;
  couponId: string;
  discountAppliedOn: DiscountAppliedOn;
  reasonOfDiscount: string;
  reasonOfServiceCharge: string;

  // now full user objects (or null if not applied)
  serviceChargeAppliedBy: UserRef | null;
  serviceChargeRemovedBy: UserRef | null;
  discountAppliedBy: UserRef | null;
  discountRemovedBy: UserRef | null;

  items: CartItem[];
  subTotal: number;
  gst: number;
  discount: number;
  claimedCoins: number;
  couponDiscount: number;
  serviceCharge: number;
  otherTax: number;
  tips: number;
  total: number;
  billId: string;
}
