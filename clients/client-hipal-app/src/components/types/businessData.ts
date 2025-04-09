import type { ICart } from "@/components/store/useCart";
import { MenuLayout, type CategoryType } from "@hi/db-models/src/validators";
import type { ILoyaltySetting } from "../store/useLoyaltyData";
import { Room } from "./hotelTypes";

export interface IBiz {
  placeId: string;
  placeUrl: string;
  googleReviewLink: string;
  logoUrl: string;
  email: string;
  businessId: string;
  branchName: string;
  name: string;
  registeredName: string;
  businessType: string;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  description: string;
  tags: string[];
  customLink: string;
  logo: string;
  address: string;
  staff: string[];
  _id: string;
  close: string;
  createdAt: string;
  fssaiLicenseNumber: string;
  gstNumber: string;
  gstPercentage: number;
  hibiz: boolean;
  hikitchen: boolean;
  hipeople: boolean;
  hitable: boolean;
  isHasDishData: boolean;
  isHasGst: boolean;
  isHasSetting: boolean;
  isPaymentIntegrated: boolean;
  kotPrinter: boolean;
  likes: string[];
  loyalty: boolean;
  open: string;
  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeRemovalPass: string;
  serviceControl: {
    discountPassword: string;
  };
  status: boolean;
  takeAwayName: string;
  tier: string;
  updatedAt: string;
  wallpaper: string;
  withPopCorn: boolean;
  location: string;
  phone: string;
  phoneNumber: string;
  __v: number;
  id: string;
  outLetType: string;
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

export interface IUniquelyDishes {
  _id: string;
  name: string;
  businessId: string;
  dishId: string;
  dishType: string;
  images: string[];
  isDeleted: boolean;
  __v: number;
}

export interface IStyles {
  "--p": string;
  "--pf": string;
  "--sf": string;
  "--af": string;
  "--nf": string;
  "--b2": string;
  "--b3": string;
  "--bc": string;
  "--pc": string;
  "--sc": string;
  "--ac": string;
  "--nc": string;
  "--inc": string;
  "--suc": string;
  "--wac": string;
  "--erc": string;
  "--rounded-box": string;
  "--rounded-btn": string;
  "--rounded-badge": string;
  "--animation-btn": string;
  "--animation-input": string;
  "--btn-text-case": string;
  "--btn-focus-scale": string;
  "--border-btn": string;
  "--tab-border": string;
  "--tab-radius": string;
  "--a": string;
  "--s": string;
  "--b1": string;
  explore: {
    openFrom: string;
    openTill: string;
  };
}

export interface IOutlet {
  _id: string;
  businessId: string;
  __v: number;
  email: string;
  registeredName: string;
  address: string;
  avgRating: number;
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
  isPosEnabled: boolean;
  shareCart?: boolean;
  birthdayCampaign?: boolean;
}

export interface TimingType {
  _id: string;
  name: string;
  businessId: string;
  isPublished: boolean;
  heading: string;
  dishIds: IDish[];
}

export enum MenuType {
  MAIN_SUB_DISH = 1,
  SUB_DISH = 2,
}

export enum CategoryLayout {
  EDGE = 1,
  CLASSIC = 2,
}

export enum CardLayout {
  GRID = 1,
  HORIZONTAL = 2,
}

export interface IMenuLayout {
  _id: string;
  menuType: MenuType;
  categoryLayout: CategoryLayout;
  cardLayout: CardLayout;
  primaryColor: string;
  secondaryColor: string;
}

export interface IBusinessData {
  couponz: Coupon[];
  outletInfo: IOutlet;
  businessId: string;
  banners: IBannerPayload[];
  menuData:IMenuLayout
  _id: string;
  settings?: IStyles;
  business?: BusinessDetails;
  dishesData?: IDish[];
  dishData?: IDish;
  theme?: HSLTheme;
  uniquelyDishes?: IUniquelyDishes[];
  parentCategories?: CategoryType[];
  childCategories?: CategoryType[];
  loyalty: ILoyaltySetting;
  cart?: ICart[];
  coupon?: Coupon;
  timings: TimingType;
  kot: KotOrder;
}

export interface ICategories extends ICategory {
  dishes: IDish[];
}

export interface IPopular {
  _id: string;
  name: string;
}
export interface IExplore {
  wallpaper: string;
  phone: string;
  countryCode?: string;
  location: string;
  openFrom?: string;
  openTill?: string;
  specialOffers?: {
    wallpaper: string;
    offerName: string;
    redirectType?: string;
    redirectId?: string;
    redirectName?: string;
  }[];
  popular?: IPopular[];
  highlights?: {
    name: string;
    stories: string[];
  }[];
}
export interface IThemes {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  fontURL?: string;
  buttonStyle?: string;
  miniBanner?: string;
  specialBanner?: string;
  endBanner?: string;
  instagramLink?: string;
  facebookLink?: string;
  youtubeLink?: string;
  linkedinLink?: string;
  footerText?: string;
}

export interface HSLTheme {
  [key: string]: string;
}
export interface ISettings {
  businessId: string;
  themes: IThemes;
  categoryOrder: string[];
  explore: IExplore;
  navigation: {
    from: string;
    to: string;
    categoryCard: string;
    dishCard: string;
  };
  _id: string;
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

export interface ICategoryTypes {
  [key: string]: ICategory;
}

export interface ICategorySubTypes {
  [key: string]: ICategory[];
}

export interface IExtraItem {
  _id: string;
  maxQuantity?: number;
  id: string;
  ExtraType?: string;
  name: string;
  price: number;
}

export interface IPortion {
  name: string;
  price: number;
  discount: string;
  default: boolean | string;
}
export interface Item {
  name: string;
  quantity: number;
  amount: number;
  extras: string[];
  comments: string;
}

export interface UserData {
  userPhone: string;
  userName: string;
  rewards: number;
  currentBalance: number;
  status: string;
  date: number;
  time: string;
  businessName: string;
  waiterName: string;
  items: Item[];
  tableName: string;
  day: string;
  loyaltyId: string;
  id: string;
  _id: string;
}

export interface User {
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
  birthdayTriggerCount?: number;
}

export interface CustomRole {
  businessId: string;
  customRoleId: string;
  role: string;
  accessControl: AccessControl;
  bookMark: boolean;
  _id: string;
}

export interface AccessControl {
  hibiz: boolean;
  _id: string;
}

export interface IBannerPayload {
  buttonTextColor: string;
  layout: string;
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
  _id?: string;
}
export type TextAlign =
  | "center"
  | "left"
  | "right"
  | "justify"
  | "initial"
  | "inherit";

interface SocialMediaLink {
  icon: string;
  link: string;
  _id: string;
}

export interface BusinessDetails {
  _id: string;
  businessId: string;
  __v: number;
  amenities: string[];
  footerDescription: string;
  fssai: string;
  gst: string;
  socialMediaLinks: SocialMediaLink[];
  tags: string[];
  timing: any[];
  billingEndTime: string;
  billingStartTime: string;
  branchName: string;
  brandName: string;
  name: string;
  fixOpenTime: string;
  fixCloseTime: string;
  customTiming?: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
  logoUrl: string;
  specialBannerUrl: string;
  endBannerUrl: string;
  outLetType: string;
  isCustomTime: boolean;
  description: string;
  avgPricingForTwo: number;
  location: string;
  phone: string;
  address: string;
  avgRating: number;
  logo: string;
}

export interface GoogleReview {
  _id: string;
  businessId: string;
  authorName: string;
  userId: string;
  comment: string;
  profilePhotoUrl: string;
  rating: number;
}

export interface CouponConfig {
  value: number;
  discountType: string;
  upto: number;
  _id: string;
  steps: any[];
}

export interface UserLimit {
  overAllLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  _id: string;
}

export interface Availability {
  when: string;
  customDays: string[];
  startTime: number;
  endTime: number;
  _id: string;
}

export interface EligibleUser {
  allUsers: boolean;
  userIds: string[];
  groupIds: string[];
  _id: string;
}

export interface CouponConditions {
  individualUserLimit: UserLimit;
  billValue: number;
  expiryClaimLimit: UserLimit;
  availability: Availability;
  eligibleUser: EligibleUser;
  expiryAfterGrabbed: number;
  requiredFields: string[];
  couponStartDate: number;
  couponEndDate: number;
  tc: string;
  _id: string;
}

export interface Coupon {
  channelId: string;
  cashbackAvailable: boolean;
  image: string;
  bgColour: string;
  availability: boolean;
  requiredFields: Array<string>;
  promotInExplore: boolean;
  _id: string;
  name: string;
  type: string;
  businessId: string;
  config: CouponConfig;
  isActive: boolean;
  visiable: boolean;
  isDeleted: boolean;
  conditions: CouponConditions;
  __v: number;
  promot: boolean;
}

export interface CouponResponse {
  message: string;
  err: boolean;
  data: Coupon[];
}

export interface IResponse {
  message: string;
  err: boolean;
  data: any;
  rewards?: number;
  googleReviewCount?: number;
}

export interface IMerchantDetails {
  businessId: string;
  razorpayMerchantId: string;
  razorpayKeyId: string;
}

interface Extra {
  name: string;
  price: number;
  quantity: number;
}

interface DishItem {
  dish: {
    name: string;
    price: number;
    quantity: number;
  };
  extras: Extra[];
}

export interface BillData {
  billing_user_name: string;
  serviceCharge: number;
  discount: number;
  tax: number;
  total: number;
  customerPhone: string;
  customerName: string;
  tableName: string;
  subTotal: number;
  billRequestId: string;
  items: DishItem[];
  claimedCoins: number;
  tips: number;
  initialTotal: number;
  couponId: string;
  finalSubTotal: number;
}

interface CartItem {
  id: string;
  portion: string | null;
  extras: string[];
  quantity: number;
  dish: Dish;
}

export interface KotOrder {
  _id: string;
  businessId: string;
  userId: string;
  phone: string;
  tableName: string;
  tableId: string;
  cart: CartItem[];
  date: number;
  rejected: boolean;
  accepted: boolean;
  edited: boolean;
  settled: boolean;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICheckTableSession {
  data: {
    isTransfer: boolean;
  };
  err: boolean;
  message: string;
}

export interface OptionalPropsData {
  coinz?: number;
  tips?: number;
  couponId?: string;
}
