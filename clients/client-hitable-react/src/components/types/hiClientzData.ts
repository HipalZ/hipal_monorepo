export type NavItemTypes = "online" | "on floor" | "history" | "sales";

export interface HiClientzData {
  address: string | undefined;
  logoUrl: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  customRole: CustomRole[];
  password: string;
  role: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CustomRole {
  logoUrl: string | undefined;
  address: string | undefined;
  businessId: Business;
  customRoleId: string;
  role: string;
  accessControl: AccessControl;
  bookMark: boolean;
  _id: string;
}

export interface Business {
  businessName: string;
  name: string;
  _id: string;
  logo: string;
  address: string;
}

export interface AccessControl {
  hibiz: boolean;
  _id: string;
}

export interface Order {
  _id: string;
  businessId: string;
  total: number;
  currency: string;
  billValue: number;
  receipt: string;
  name: string;
  phone: string;
  tips: number;
  claimedCoins: number;
  discount: number;
  order_id: string;
  tableName: null | string;
  date: number;
}

export interface Alert {
  userId: {
    name: string;
    _id: string;
    phone: string;
  };
  posDiscount: number;
  isRejected: boolean;
  waiterName: string;
  completionCode: null | string;
  errorReason: null | string;
  errorDescription: null | string;
  _id: string;
  businessId: string;
  comment: null | string;
  status: string;
  tableName: string;
  alertType: string;
  order_id: Order;
  payment_id: string;
  isAccepted: boolean;
  message: string;
  coinsApplied: boolean;
  date: number;
  name: string;
}

export interface ISalesLite {
  totalSale: number;
  totalDiscount: number;
  totalOnlineSale: number;
  totalOfflineSale: number;
  coinzIssued: number;
  coinzRedeemed: number;
}
