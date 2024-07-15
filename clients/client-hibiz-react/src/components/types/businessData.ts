import type { businessType, exploreLayout, MenuLayout } from "../store/useBusinessCtrl";
import type { User } from "../store/useOwnerLogin";

interface IAcessControl {
  [key: string]: string;
  _id: string
}

export interface CustomRole {
  businessId: string;
  customRoleId: string;
  permissions: string[];
  role: string;
  bookmark: boolean;
  _id: string;
  accessControl: IAcessControl
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
  tags: string[];
  description: string;
  _id: string;
  name: string;
  registeredName: string;
  businessType: businessType;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  customLink: string;
  logo: string;
  address: string;
  staffIds: string[];
  gstNumber: string;
  fssaiLicenseNumber: string;
  status: boolean;
  likes: any[];
  wallpaper: string;
  tier: string;
  open: string;
  outlet: boolean;
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
  exploreLayout:exploreLayout;
  menuLayout: MenuLayout;
  primaryColor: string;
  secondaryColor: string;
  takeAwayName: string;
  loyalty: boolean;
  isHasGst: boolean;
  gstPercentage: number;
  isPaymentIntegrated: boolean;
  withPopCorn: boolean;
  createdAt: string;
  updatedAt: string;
  isActive:boolean;
  parentOutLetId: {
    name: string
  }
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
  comment: string;
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
export interface OrderDetails {
  _id: string;
  businessId: string;
  total: number;
  currency?: string;
  billValue: number;
  receipt?: string;
  name: string;
  phone: string;
  tips: number;
  claimedCoins: number;
  discount?: number;
  order_id: string;
  tableName: string;
  date: number;
  __v: number;
}

export interface IExistingPayments {
  comment: boolean;
  _id: string;
  businessId: string;
  date: number;
  total: number;
  customerName: string;
  customerPhone: string;
  mode: string;
  paymentMode: string;
  billValue: number;
  tableName: string;
  order_id: OrderDetails;
  tips: number;
  claimedCoins: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface HistoryData {
  existingPayments: IExistingPayments[];
  totalSale: number;
}

export interface NetworkInformation extends EventTarget {
  downlink?: number;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  rtt?: number;
  saveData?: boolean;
  onchange?: EventListenerOrEventListenerObject;
}

export interface NavigatorWithNetworkInformation extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export interface ILoginProps {
  user: User
  accessToken: string;
  refreshToken: string;
  existingUser: User;
}

export interface IDish {
  _id: string,
  name: string,
  images: string[],
  dishType: string,
}
export interface ICategory {
  _id: string
  businessId: string
  name: string
  visibility: boolean
  timerOn: boolean
  timerStart: null
  timerEnd: null
  availableDays: never[]
  hierarchy: string | "PARENT"
  parentCategory: string
  parentCategoryId?: string
  coverImage: string
  links: never[]
  dishes: {
    _id: string,
    name: string,
    images: string[],
    businessId: string,
  }[]
  version: number
  id: string
}

export interface IBizInfo {
  _id: string,
  logoUrl: string;
  endBannerUrl: string;
  specialBannerUrl: string;
  businessId: string;
  name: string;
  description: string;
  phone: string;
  location: string;
  avgPricingForTwo: string;
  socialMediaLinks: {
    icon: string,
    link: string
  }[]
  amenities: string[];
  tags: string[];
  fssai: string;
  gst: string;
  footerDescription: string;
  fixOpenTime: string;
  fixCloseTime: string;
  customTiming: Array<Record<string,string>>;
  isCustomTime: boolean;
}

export type Banner = {
  _id: string;
  title: string;
  description: string;
  bannerType: string;
}

export type Color = {
  textColor: string
  bgColor: string
}

export type IStyles = {
  textAlign: string,
  fontWeight: number,
  color: string
}

  export interface IBanner {
    _id: string;
    businessId: string;
    bannerType?: string;
    bannerImage?: string;
    headingColor?: string;
    headingFontWeight?: string;
    headingAlign?: string;
    paragraphColor?: string;
    paragraphFontWeight?: string;
    paragraphAlign?: string;
    callToAction?: string;
    backgroundColor?: string;
    redirectionId?: string;
    redirectionType?: string;
    isDeleted?: boolean;
    buttonColor?: string;
    redirectionName?: string;
    heading?: string;
    paragraph?: string;
  }

export type TextAlign = 'center' | 'left' | 'right' | 'justify' | 'initial' | 'inherit'

export interface IBizPayload {
  customTiming?: { day: string; openTime: string; closeTime: string; }[];
  fixCloseTime?: string;
  fixOpenTime?: string;
  socialMediaLinks?: { icon: string; link: string; }[];
  name?:string;
  socialMedia?: { icon: string; link: string; }[];
  footerDescription?: string;
  businessId: string;
  specialBannerUrl?: string;
  logoUrl?: string;
  endBannerUrl?: string;
  fssai?: string;
  gst?: string;
  description?: string;
  phone?: string;
  location?: string;
  amenities?: string[];
  tags?: string[];
  avgPricingForTwo?:string;
  isCustomTime: boolean;
}

export interface IBannerPayload {
  businessId?: string;
  isPublished?: boolean;
  bannerType?: string;
  bannerImage?: string;
  heading?: string;
  headingColor?: string;
  headingFontWeight?: string;
  headingAlign?: string;
  paragraph?: string;
  paragraphColor?: string;
  paragraphFontWeight?: string;
  paragraphAlign?: string;
  buttonColor?: string;
  callToAction?: string;
  backgroundColor?: string;
  redirectionId?: string;
  redirectionType?: string;
  redirectionName?: string;
  _id?:string
}

export interface BasicInfo{
  _id:number
  text:string
}