// splitModes
export interface SplitMode {
  name: string;
  amount: number;
  _id: string;
}

// the nested order_id object
export interface OrderId {
  _id: string;
  businessId: string;
  total: number;
  currency: string;
  billValue: number;
  receipt: string;
  userId: string;
  tips: number;
  claimedCoins: number;
  discount: number;
  order_id: string;
  tableName: string;
  cashbackAvailable: boolean;
  date: number;
  couponDiscount: number;
  gst: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// user info within Payment
export interface PaymentUser {
  _id: string;
  phone: string;
  name: string;
}

// extras on a bill‑item
export interface Extra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// portion option
export interface Portion {
  _id: string;
  name: string;
  price: number;
  default: boolean;
  portionTypes: string[];
  posPortionId: string;
  createdAt: string;
  updatedAt: string;
}

// the dish itself
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
  updatedAt: string;
  visibility: boolean;
  active: boolean;
  kitchenId: string;
  tax: number;
  gst: number;
  vat: number;
}

// one line‑item on the bill
export interface BillItem {
  id: string;
  dish: Dish;
  portion: Portion | null;
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  discount: number;
  _id: string;
  /** When true, item has no category; display as "dishName (open item)" and use Open Item for category/dish-type. */
  isOpenItem?: boolean;
}

// the top‑level Payment document
export interface Payment {
  _id: string;
  businessId: string;
  date: number;
  total: number;
  userId: PaymentUser;
  mode: string;
  paymentMode: string;
  billValue: number;
  tableName: string;
  order_id: OrderId;
  tips: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  claimedCoins: number;
  razorpayEventId: string;
  waiterName: string;
  posBillId: string;
  earnCoins: number;
  settleType: string;
  comment: string;
  tax: number;
  serviceCharge: number;
  splitModes: SplitMode[];
  discount: number;
  initialTax: number;
  initialSubTotal: number;
  initialTotal: number;
  finalSubTotal: number;
  discountType: string;
  isDeleted: boolean;
  updatedAt: number;
  billId: string;
  couponDiscount: number;
  billItems: BillItem[];
  pin: string;
  createdAt: string;
  __v: number;
}
