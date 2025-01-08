export type NavItemTypes = "payments" | "history" | "sales" | "cart" | "Tables";

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
export interface CartItem {
  id: string;
  dish: Dish;
  portion: Portion | null;
  extras: any[]; // Replace `any[]` with a specific type if extras have a defined structure
  quantity: number;
  _id: string;
}

export interface Dish {
  _id: string;
  businessId: string;
  name: string;
  price: number;
  visibility: boolean;
  dishTypes: string[];
  categoryIds: string[];
  addOnIds: string[];
  images: string[];
  tags: string[];
  availability: boolean;
  isDeleted: boolean;
  portions: Portion[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  description: string;
}

export interface Portion {
  name: string;
  price: number;
  default: boolean;
  portionTypes: string[];
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
}

export interface Cart {
  _id: string;
  businessId: string;
  userId: User | null;
  tableName: string;
  cart: CartItem[];
  date: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IBusinessData {
  tags?: string[];
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
  isActive: boolean;
  themeApplied: boolean;
  parentOutLetId: {
    name: string;
  };
  __v: number;
  serviceControl: {
    discountPassword: string;
  };
}

export interface ILoyaltyData {
  _id: string;
  businessId: string;
  password: string;
  loyaltyId: string;
  origin: boolean;
  cardPattern: string;
  cardColor: string;
  fontColor: string;
  logo: string;
  expiryDate: string;
  rewardLimit: number;
  signUpBonus: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  setCashBackPercentage: number;
  setClaimedPercentage: number;
}

export interface IOutletInfo {
  _id: string;
  businessId: string;
  __v: number;
  address: string;
  amenities: string[];
  customTiming: {
    day: string;
    openTime: string;
    closeTime: string;
  }[][];
  description: string;
  isCustomTime: boolean;
  location: string;
  socialMediaLinks: {
    icon: string;
    link: string;
    _id: string;
  }[];
  tags: string[];
  logoUrl: string;
  specialBannerUrl: string;
  name: string;
  endBannerUrl: string;
  fssai: string;
  gst: string;
  billingEndTime: string;
  billingStartTime: string;
  branchName: string;
  brandName: string;
  footerDescription: string;
  phone: string;
  avgPricingForTwo: number;
  fixCloseTime: string;
  fixOpenTime: string;
  outLetType: string;
  placeId: string;
  placeUrl: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  isPosEnabled: boolean;
  shareCart: boolean;
}

export interface OrderData {
  _id: string;
  name: string;
  phone: string;
  cart: {
    id: string;
    dish: {
      name: string;
      price: number;
    };
    quantity: number;
    portion?: {
      name: string;
      price: number;
    };
    extras?: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  acceptedBy: string;
  accepted: boolean;
  createdAt: string;
  date: number;
  rejected: boolean;
  settled: boolean;
  tableName: string;
  userId: string;
}

export interface ICategory {
  _id: string;
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: null;
  timerEnd: null;
  availableDays: never[];
  hierarchy: string | "PARENT";
  parentCategory: string;
  parentCategoryId?: string;
  coverImage: string;
  links: never[];
  dishes: {
    _id: string;
    name: string;
  }[];
  version: number;
  id: string;
}
export interface IPortion {
  name: string;
  price: number;
  discount: string;
  default: boolean | string;
}

export interface IExtraItem {
  _id: string;
  maxQuantity?: number;
  id: string;
  ExtraType?: string;
  name: string;
  price: number;
}


export interface IExtras {
  _id: string;
  addOnType?: string;
  maxQuantity: number;
  name?: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  items: IExtraItem[];
}


export interface IDish {
  businessId: string;
  availability: false;
  name: string;
  price: number;
  tax: null;
  visibility: boolean;
  discount: null;
  avgTime: null;
  dishType: string;
  categories: ICategory[];
  portions: IPortion[];
  extras: IExtras[];
  filters: {
    timeToConsume: string;
    portionBestSuited: string;
    levelOfSpice: string;
    bestOccasion: string;
    texture: string;
    time: string;
    bestWeather: string;
    dishes: never[];
  };
  images: string[];
  description: string;
  tags: never[];
  links: never[];
  version: number;
  id: string;
  _id: string;
  dishId: string;
}