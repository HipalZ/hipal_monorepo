export type NavItemTypes = "Alerts" | "History" | "Sales" | "Cart" | "Tables";

export enum NavItemTypesEnum {
  ALERTS = "Alerts",
  HISTORY = "History",
  SALES = "Sales",
  CART = "Cart",
  TABLES = "Tables",
}

export interface Ipermissions {
  sale_summary: boolean;
  bill: boolean;
  order_accept: boolean;
  place_order: boolean;
  normal_settle: boolean;
  force_settle: boolean;
  resolve_table: boolean;
  free_table: boolean;
}

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
  permissions: Ipermissions;
  permissionIds: string[];
  permissionGroupIds: string[];
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

export interface Alert {
  updateFeature: string[];
  appUrl: string;
  v: number;
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
  isDeleted: boolean;
  deletedBy: string;
  reasonOfDeletion: string;
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
  accepted?: boolean;
  edited?: boolean;
  name?: string;
  phone?: string;
  rejected?: boolean;
  settled?: boolean;
  businessId: string;
  userId: User | string | null;
  tableName: string;
  cart: CartItem[];
  date: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export type businessType = "FOOD" | "OTHER" | "";
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
    _id: string;
    dish: {
      name: string;
      price: number;
    };
    isDeleted: boolean;
    deletedBy: string;
    reasonOfDeletion: string;
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
  transferd: boolean;
  transferedBy: IUserId;
  date: number;
  rejected: boolean;
  settled: boolean;
  tableName: string;
  toTable: string;
  fromTable: string;
  userId: string;
  isDeleted: boolean;
  deletedBy: string;
  reasonOfDeletion: string;
}

export interface ICategory {
  _id: string;
  businessId: string;
  name: string;
  availability: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  rank: number;
  description: string;
  tags: string[];
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

export interface ITag {
  _id: string;
  name: string;
}

export interface IUserId {
  _id: string;
  name: string;
  phone: string;
  dob: number;
}

export interface ICustomerInformation {
  _id: string;
  userId: IUserId;
  businessId: string;
  visitCount: number;
  totalSpend: number;
  avgSpend: number;
  dateOfJoining: number;
  coinzIssued: number;
  coinzUsed: number;
  currentCoins: number;
  couponCount: number;
  tableName: string;
  tagIds: ITag[];
}

export interface IBillData {
  tips: number;
  claimedCoins: number;
  serviceCharge: number;
  discount: number;
  couponDiscount: number;
  discountAppliedBy: string;
  discountRemovedBy: string;
  gst: number;
  isPaid: boolean;
  reasonOfDiscount: string;
  reasonOfServiceCharge: string;
  serviceChargeAppliedBy: string;
  serviceChargeRemovedBy: string;
  total: number;
  customerPhone: string;
  customerName: string;
  tableName: string;
  subTotal: number;
  billId: string;
  variantId?: string;
  variantName?: number;
  _id?: string;
  otherTax: number;
  discountAppliedOn?: string;

  couponId?: string;
  billItems: Array<{
    gst: number;
    subTotal: number;
    totalGst: number;
    items: Array<{
      dish: {
        _id: string;
        name: string;
        price: number;
        businessId: string;
        posDishId: string;
        description: string;
        dishTypes: string[];
        ignoreDiscount: string;
        ignoreTax: string;
        images: string[];
        isDeleted: boolean;
        menuId: string;
        portions: Array<{
          name: string;
          price: number;
          default: boolean;
          portionTypes: string[];
          _id: string;
        }>;
        pos: boolean;
        posTax: string;
        rank: number;
        tags: string[];
        visibility: boolean;
        active: boolean;
        kitchenId?: string;
        tax: number;
        gst: number;
        instruction?: string;
      };
      id: string;
      _id: string;
      portion: {
        name: string;
        price: number;
        default: boolean;
        portionTypes: string[];
        _id: string;
      } | null;
      extras: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      quantity: number;
      isDeleted: boolean;
    }>;
  }>;
}

export interface IUnsettleTables {
  _id: string;
  userIds: string[];
  totalItemCount: number;
  tableId: {
    _id: string;
    name: string;
  };
  status: string;
  performedBy: {
    _id: string;
    name: string;
  };
  isDeleted: boolean;
  date: number;
  currentTableAmount: number;
  capacity: number;
  businessId: string;
  kotIds: {
    _id: string;
    cart: CartItem[];
  }[];
}
