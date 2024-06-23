export interface CustomRole {
  businessId: string;
  customRoleId: string;
  permissions: string[];
  roleName: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: CustomRole[];
  password: string;
  id: string;
  _id: string;
}
export interface IBusinessData {
  tags: any[];
  description: string;
  _id: string;
  businessName: string;
  registeredName: string;
  businessType: string;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  customLink: string;
  logo: string;
  address: string;
  staff: string[];
  gstNumber: string;
  fssaiLicenseNumber: string;
  status: boolean;
  likes: any[];
  wallpaper: string;
  tier: string;
  open: string;
  close: string;
  isHasSetting: boolean;
  isHasDishData: boolean;
  hikitchen: boolean;
  hitable: boolean;
  hipeople: boolean;
  hibiz: boolean;
  kotPrinter: boolean;
  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeRemovalPass: number;
  takeAwayName: string;
  loyalty: boolean;
  isHasGst: boolean;
  gstPercentage: number;
  isPaymentIntegrated: boolean;
  withPopCorn: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  serviceControl: {
    discountPassword: string;
  };
}


export type IBusinessDetails = {
  name: string;
  registerName: string;
  businessType: string;
  address: string;
  url: string;
  logo: string;
};


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
  name:string;
}

export interface ISalesLite {
  totalSale: number;
  totalDiscount: number;
  totalOnlineSale: number;
  totalOfflineSale: number;
  coinzIssued: number;
  coinzRedeemed: number;
}

export interface NetworkInformation extends EventTarget {
  downlink?: number;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  saveData?: boolean;
  onchange?: EventListenerOrEventListenerObject;
}

export interface NavigatorWithNetworkInformation extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}


