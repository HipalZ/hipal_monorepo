import type { ReactNode } from 'react';
import type Area from 'react-easy-crop';
import type { businessType, exploreLayout, MenuLayout } from '../store/useBusinessCtrl';
import type { User } from '../store/useOwnerLogin';
import type { BannerType } from '../utils/bannerLayouts';

export interface CustomRole {
  businessId: string;
  customRoleId: string;
  permissionGroupIds: string[];
  permissionIds: string[];
  permissions: {
    [key: string]: boolean;
  };
  role: string;
  bookmark: boolean;
  _id: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: CustomRole[];
  staffPermissions?: {
    _id: string;
    name: string;
    isHaveAccess: boolean;
  }[];
  password: string;
  id: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
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
  exploreLayout: exploreLayout;
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

export type IBusinessDetails = {
  name: string;
  registerName: string;
  businessType: string;
  address: string;
  url: string;
  logo: string;
};

export interface IDuesPersonsData {
  _id: string;
  totalDuesAmount: number;
  userId: UserDetails;
}

export interface IPaymentMode {
  _id: string;
  businessId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOutletInfo {
  isHipalzPos: boolean;
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
  categoryTopBannerUrl: string;
  name: string;
  endBannerUrl: string;
  fssai: string;
  gst: string;
  billingEndTime: string;
  billingStartTime: string;
  endBillTime?: number;
  startBillTime?: number;
  branchName: string;
  brandName: string;
  footerDescription: string;
  phone: string;
  avgPricingForTwo: number;
  fixCloseTime: string;
  fixOpenTime: string;
  outLetType: string;
  hotelBanners?: string[];
  placeId: string;
  placeUrl: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  isPosEnabled: boolean;
  shareCart: boolean;
  posWithOnlyMenu: boolean;
  subscriptionEnded?: boolean;
  orderEditWindowMinutes?: number;
  foodOrderSla?: {
    avgAcceptanceTime?: number;
    avgDeliveryTime?: number;
    useItemPrepTime?: boolean;
  };
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
  modeObj: Record<string, number>;
  totalTips: number;
  totalTax: number;
  totalServiceCharge: number;
  totalClaimedCoins: number;
  totalEarnCoins: number;
  totalDiscount: number;
  forceSettle: number;
}
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

export interface BillItem {
  id: string;
  dish: DishItem;
  portion: any | null; // Can be null
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  _id: string;
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
export interface HistoryData {
  existingPayments: IExistingPayments[];
  totalSale: number;
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

export interface ILoginProps {
  user: User;
  accessToken: string;
  refreshToken: string;
  existingUser: User;
}

export interface IDish {
  dishTypes: string[];
  _id: string;
  name: string;
  images: string[];
  dishType: string;
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
  hierarchy: string | 'PARENT';
  parentCategory: string;
  parentCategoryId?: string;
  coverImage: string;
  links: never[];
  dishes: {
    _id: string;
    name: string;
    images: string[];
    businessId: string;
  }[];
  version: number;
  id: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CNY' | 'RUB' | 'BRL' | 'ZAR' | 'KRW' | 'MXN' | 'NZD' | 'SGD';

export type CurrencyCodeSymbol = '₹' | '$' | '€' | '£' | '¥' | 'A$' | 'C$' | '¥' | '₽' | 'R$' | 'R' | '₩' | '$' | '₩';

export interface IBizInfo {
  categoryTopBanner: string;
  newAmenities: string[];
  _id: string;
  logoUrl: string;
  endBannerUrl: string;
  specialBannerUrl: string;
  categoryTopBannerUrl: string;
  businessId: string;
  name: string;
  description: string;
  phone: string;
  location: string;
  avgPricingForTwo: string;
  socialMediaLinks: {
    icon: string;
    link: string;
  }[];
  amenities: string[];
  tags: string[];
  fssai: string;
  gst: string;
  footerDescription: string;
  fixOpenTime: string;
  fixCloseTime: string;
  customTiming: Array<Record<string, string>>;
  isCustomTime: boolean;
  address: string;
  currencyCode: string;
  currencySymbol: string;
}

export type Banner = {
  _id: string;
  title: string;
  description: string;
  bannerType: string;
};

export type Color = {
  textColor: string;
  bgColor: string;
};

export type IStyles = {
  color: string;
  buttonColor?: string;
};

export interface IBanner {
  isPublished: boolean;
  _id: string;
  layout: string;
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
  patternType?: string;
}

export type TextAlign = 'center' | 'left' | 'right' | 'justify' | 'initial' | 'inherit';

export interface IBizPayload {
  customTiming?: { day: string; openTime: string; closeTime: string }[];
  fixCloseTime?: string;
  fixOpenTime?: string;
  socialMediaLinks?: { icon: string; link: string }[];
  name?: string;
  socialMedia?: { icon: string; link: string }[];
  footerDescription?: string;
  businessId: string;
  specialBannerUrl?: string;
  categoryTopBannerUrl?: string;
  logoUrl?: string;
  endBannerUrl?: string;
  fssai?: string;
  gst?: string;
  description?: string;
  phone?: string;
  location?: string;
  amenities?: string[];
  tags?: string[];
  avgPricingForTwo?: string;
  isCustomTime?: boolean;
  address?: string;
  hotelBanners?: string[];
  orderEditWindowMinutes?: number;
  foodOrderSla?: {
    avgAcceptanceTime?: number;
    avgDeliveryTime?: number;
    useItemPrepTime?: boolean;
  };
}

export interface IBannerPayload {
  layout?: string;
  layoutId?: string;
  businessId?: string;
  isPublished?: boolean;
  bannerType?: string;
  bannerImage?: string;
  heading?: string;
  headingColor?: string;
  paragraph?: string;
  paragraphColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  callToAction?: string;
  backgroundColor?: string;
  redirectionId?: string;
  redirectionType?: string;
  redirectionName?: string;
  patternType?: string;
  _id?: string;
}

export interface BasicInfo {
  _id: number;
  text: string;
}
interface PatternProps {
  color: string;
}
export interface BannerLayout {
  onlyImage: boolean | undefined;
  _id: BannerType;
  heading: string;
  paragraph: string;
  isButton: boolean;
  buttonText: string;
  title: string;
  image: string;
  isPattern: boolean;
  pattern: React.FC<PatternProps>;
  description: string;
}

export interface RazorpayAcquirerData {
  rrn: string;
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
  tableName: string | null;
  date: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserDetails {
  _id: string;
  name: string;
  phone: string;
}

export interface Payment {
  comment: string;
  waiterName: string;
  _id: string;
  businessId: string;
  date: number;
  total: number;
  userId: UserDetails;
  mode: string;
  paymentMode: string;
  billValue: number;
  tableName: string;
  order_id: Order;
  tips: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  claimedCoins: number;
  razorpayAcquirerData: RazorpayAcquirerData;
  razorpayEventId: string;
  earnCoins: number;
  createdAt: string;
  updatedAt: string;
  phone: string;
  reviewId: {
    _id: string;
    reviewRating: number;
  };
  tagId: {
    _id: string;
    name: string;
  };
  __v: number;
}

export interface GroupData {
  _id: string;
  groupId: string;
  businessId: string;
  duration: number;
  visitCount?: number;
  visitType?: 'ABOVE' | 'BELOW';
  spendAmount?: number;
  spendType?: 'ABOVE' | 'BELOW';
  userCount: number;
  userPercentage: number;
  groupName: string;
  __v: number;
  groupColor: string;
  date: number;
}

export interface AboutCustomerData {
  averageSpendAmount: number;
  averageReturnPercentage: number;
  averageReviewCount: number;
  newUserCount: number;
}

export interface UserReviewData {
  likePercentage: number;
  dislikePercentage: number;
}

export interface SummarizedPeopleData {
  totalSubscriberCount: number;
  groups: GroupData[];
  aboutCustomer: AboutCustomerData;
  userReviews: Record<string, UserReviewData>;
}

// Define the type for each record in the array
export interface ICustomerRecord {
  _id: string;
  userId: User;
  businessId: string;
  visitCount: number;
  totalSpend: number;
  avgSpend: number;
  dateOfJoining: number;
  __v: number;
  coinzIssued?: number;
  coinzUsed?: number;
  currentCoins?: number;
  couponCount?: number;
}

export interface IGroupFilter {
  duration: number;
  visit: number;
  visitType: 'ABOVE' | 'BELOW';
  spend: number;
  spendType: 'ABOVE' | 'BELOW';
  _id: string;
}

export interface IUserGroup {
  _id: string;
  name: string;
  businessId: string;
  description: string;
  filter: IGroupFilter[];
  autoUpdate: boolean;
  groupType: 'MANUAL' | 'DYNAMIC';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userIds: string[];
  groupColor: string;
}
export interface UserDashboardDetails {
  email: string;
  phone: number;
  currentCoinz: number;
  name: string;
  totalSale: number;
  AvarageSale: number;
  NumOfVisits: number;
  NumOfSessions: number;
  coinzIssued: number;
  coinzUsed: number;
  bill: Payment[];
}

export interface UserTags {
  remainderInDuration: string;
  displayForCaptains: boolean;
  duration: number;
  tagType: string;
  _id: string;
  tagTypeId: string;
  name: string;
  businessId: string;
}

export interface UserUpdateTag {
  _id: string;
  tagIds: string[];
  userId: string;
  comment: string;
}

export interface TagArray {
  tagId: Tag;
  count: number;
}
export interface Tag {
  note: string;
  time: number;
  createdBy: {
    _id: string;
    name: string;
  };
  remainderInDuration: string;
  reminderDate: number;
  _id: string;
  name: string;
  tagType: string;
  displayForCaptains: boolean;
}

export interface TagDetails {
  tagId: Tag;
  count: number;
  createdBy: {
    _id: string;
    name: string;
  };
}

export interface UserTagDetails {
  displayForCaptains: boolean;
  remainderData: number;
}

export interface ICoinzUsage {
  _id: string;
  userId: string;
  rewards: number;
  status: string;
  date: number;
  tableName: string;
  order_id: string;
  loyaltyId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

export interface IHistory {
  remainder: string;
  duration: string;
  time: string;
}

export interface INotes {
  _id: string;
  businessId: string;
  userId: string;
  noteTitle: string;
  noteDescription: string;
  noteUrl: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export enum DatePickerEnum {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  ONE_MONTH = 'ONE MONTH',
  CUSTOM_DATE = 'CUSTOM DATE',
}

export interface SocialMediaLink {
  _id: number;
  icon: string;
  logo: ReactNode;
  link: string;
}

// Define the Channel type
interface Channel {
  _id: string;
  name: string;
}

// Define the Link type
interface Link {
  channelId: Channel;
  link: string;
}

// Define the Config type
interface Config {
  value: number;
  discountType: 'AMOUNT' | 'PERCENTAGE';
  upto: number;
  _id: string;
}

// Define the IndividualUserLimit type
interface IndividualUserLimit {
  overAllLimit: number;
  _id: string;
}

// Define the ExpiryClaimLimit type
interface ExpiryClaimLimit {
  overAllLimit: number;
  _id: string;
}

// Define the Availability type
interface Availability {
  when: 'custom' | 'allthetime' | 'birthdayweek' | 'birthdaymonth' | 'weekdays' | 'weekends';
  customDays: string[];
  startTime: number;
  endTime: number;
  _id: string;
}

// Define the EligibleUser type
interface EligibleUser {
  allUsers: boolean;
  userIds: string[];
  groupIds: string[];
  _id: string;
}

// Define the Conditions type
interface Conditions {
  individualUserLimit: IndividualUserLimit;
  billValue: number;
  expiryClaimLimit: ExpiryClaimLimit;
  availability: Availability;
  eligibleUser: EligibleUser;
  expiryAfterGrabbed: number;
  requiredFields: string[];
  couponStartDate: number;
  couponEndDate: number;
  tc: string;
  _id: string;
}

export interface ICoupon {
  _id: string;
  name: string;
  type: 'FIX';
  businessId: string;
  config: Config;
  isActive: boolean;
  image: string;
  bgColour: string;
  isPublish: boolean;
  isDeleted: boolean;
  cashbackAvailable: boolean;
  promote: boolean;
  promoteOnBill: boolean;
  conditions: Conditions;
  __v: number;
  links: Link[];
}

export interface WhatsAppTemplateComponent {
  example?: {
    header_handle?: string[];
  };
  type: string;
  format?: string;
  text?: string;
  buttons?: WhatsAppTemplateButton[];
}

export interface IWhatsappHeaderType {
  type: string;
  format: string;
  text: string;
}

export interface WhatsAppTemplateButton {
  type: string;
  text: string;
  url?: string; // Optional, only applies to URL button
  example?: string[]; // Optional, only applies to dynamic URL button
  phone_number?: string; // Optional, only applies to PHONE_NUMBER button
}

export interface WhatsAppTemplatePayload {
  parameter_format: string;
  status: string;
  id: string;
  businessId: string | undefined;
  name: string;
  language: string;
  templateId?: string; // Optional, only applies to existing templates
  category: string;
  components: WhatsAppTemplateComponent[];
  imageUrl?: string; // Optional, only applies if imageUrl is present
  bodyVariableSequence: string[];
  buttonVariableSequence?: string[];
}

export interface CropperRef {
  current: {
    getCroppedAreaPixels: () => Area | null;
  };
}

export interface IBizInfoResponse {
  data: IBizInfo;
  err: boolean;
  message: string;
}

export interface IBannerResponse {
  data: IBanner[];
  err: boolean;
  message: string;
}

export interface BannerProps {
  banner: IBannerPayload;
  layout: {
    isPattern: boolean;
    pattern: React.FC<PatternProps>;
    isButton: boolean;
    onlyImage: boolean;
  };
}

export enum ViewType {
  BANNERS = 'Banners',
  DRAFTS = 'Drafts',
}

interface ButtonStyle {
  color?: string;
  buttonColor?: string;
}

interface ParagraphStyle {
  color?: string;
}

export interface UseBannerStylesProps {
  buttonStyle?: ButtonStyle;
  paragraphStyle?: ParagraphStyle;
  openPreview: boolean;
  selectedBannerType: string;
}

export interface ICouponzLinks {
  name: string;
  link: string;
}

export interface WhatsappError {
  error_user_msg: string;
  error_user_title?: string;
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  is_transient?: boolean;
  fbtrace_id?: string;
}

export interface WhatsappResponseErrorData {
  error: WhatsappError;
  id: string;
  status: string;
  err: boolean;
}

export interface MainResponseHandling {
  data: WhatsappResponseErrorData;
  err: boolean;
  message: string;
}

interface IBulk {
  name: string;
  phone: string;
  variables?: Record<string, string>;
}
export interface ISendOptionsPayload {
  templateId: number;
  businessId: string;
  businessName: string;
  customerPhone: string;
  bulkCustomers: IBulk[];
  groupIds: string[];
}

interface IUserWallet {
  name: string;
  _id: string;
  email: string;
}
export interface IWalletHistory {
  _id: string;
  businessId: string;
  userId: IUserWallet;
  amount: number;
  type: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUserMessage {
  _id?: string;
  businessId: string;
  userId: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
  type?: 'text' | 'image' | 'video' | 'document';
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  ownerId: string;
  phoneNumber: string;
}

export interface IWhatsAppMessage {
  _id: string;
  businessId: string;
  date: number;
  isDeleted: boolean;
  isOwner: boolean;
  message: string;
  userId: string;
  ownerId: string;
  type?: 'text' | 'image' | 'video' | 'document';
  mediaUrl?: string;
  caption?: string;
  filename?: string;
}

export interface IListPos {
  _id: string;
  name: string;
}

export type Bill = {
  _id: string;
  billId: {
    _id: string;
    total: number;
  };
  isSettled: boolean;
  date: number;
};

export type DuesData = {
  totalDuesAmount: number;
  bill: Bill[];
};

export interface IWhatsAppFlows {
  description?: string;
  _id: string;
  businessId: string;
  name: string;
  flows: FlowStep[];
  status: string;
  createdAt: string;
  updatedAt: string;
  flowId?: string;
}

export interface FlowStep {
  _id: string;
  templateId: string;
  templateName: string;
  triggerAt: number;
}
