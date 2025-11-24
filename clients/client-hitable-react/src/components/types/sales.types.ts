export interface Extra {
  name: string;
  price: number;
  quantity: number;
}

export interface DishItem {
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
  portions: any[];
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
  vat: number;
  quantity: number; // Added quantity to DishItem as it's used in BillItem
}

export interface OrderDetails {
  _id: string;
  businessId: string;
  total: number;
  currency: string;
  billValue: number;
  receipt: string;
  userId: string; // This is a string ID in the nested object
  tips: number;
  claimedCoins: number;
  discount: number;
  order_id: string; // This is the actual order_id string
  tableName: string;
  cashbackAvailable: boolean;
  date: number;
  couponDiscount: number;
  gst: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface BillItem {
  id: string;
  dish: DishItem;
  portion: any | null; // Can be null
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  _id: string;
}
export interface IUserId {
  _id: string;
  name: string;
  phone: string;
}

export interface SplitMode {
  _id: string;
  name: string;
  amount: number; // Added amount
}

export interface IExistingPayments {
  _id: string;
  businessId: string;
  comment: string; // Changed from boolean to string
  status?: string; // Added status
  userId: IUserId;
  alertType?: string; // Added alertType
  order_id: OrderDetails;
  isAccepted?: boolean; // Added isAccepted
  message?: string; // Added message
  isRejected?: boolean; // Added isRejected
  errorReason?: string | null; // Added errorReason
  tableName: string;
  errorDescription?: string | null; // Added errorDescription
  posDiscount: number;
  paxCount: number;
  waiterName: string | null;
  coinsApplied?: boolean; // Added coinsApplied
  billInvoice: number; // Added billInvoice
  date: number; // Top-level date
  billId: string | null;
  hiCode?: string; // Added hiCode
  mode: string;
  paymentMode: string; // Added paymentMode
  appUrl?: string; // Added appUrl
  updateFeature?: any[]; // Added updateFeature
  createdAt: string; // Top-level createdAt
  updatedAt: number; // Top-level updatedAt (number in provided object)
  __v: number;
  tips: number; // Top-level tips
  razorpayPaymentId?: string; // Optional Razorpay fields
  razorpayOrderId?: string;
  razorpayEventId?: string;
  claimedCoins: number; // Top-level claimedCoins
  earnCoins: number; // Added earnCoins
  tagIds: any[]; // Added tagIds
  settleType: string;
  tax: number; // Added tax
  serviceCharge: number; // Added serviceCharge
  splitModes: SplitMode[]; // Updated splitModes
  discount: number; // Top-level discount
  initialTax: number; // Added initialTax
  initialSubTotal: number; // Added initialSubTotal
  initialTotal: number; // Added initialTotal
  finalSubTotal: number; // Added finalSubTotal
  discountType: string; // Added discountType
  isDeleted: boolean; // Added isDeleted
  billItems: BillItem[]; // Added billItems array
  couponDiscount: number; // Top-level couponDiscount
  billValue: number; // Top-level billValue
}
