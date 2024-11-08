import type { ReactNode } from "react";
import type {
  businessType,
  exploreLayout,
  MenuLayout,
} from "../store/useBusinessCtrl";
import type { User } from "../store/useOwnerLogin";
import type { BannerType } from "../utils/bannerLayouts";
import type Area from "react-easy-crop";

interface IAcessControl {
  [key: string]: string;
  _id: string;
}

export interface CustomRole {
  businessId: string;
  customRoleId: string;
  permissions: string[];
  role: string;
  bookmark: boolean;
  _id: string;
  accessControl: IAcessControl;
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

export interface IUserId {
  _id: string;
  name: string;
  phone: string;
}

export interface IExistingPayments {
  comment: boolean;
  _id: string;
  businessId: string;
  date: number;
  total: number;
  customerName: string;
  customerPhone: string;
  userId: IUserId;
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
  hierarchy: string | "PARENT";
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

export interface IBizInfo {
  _id: string;
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

export type TextAlign =
  | "center"
  | "left"
  | "right"
  | "justify"
  | "initial"
  | "inherit";

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
  visitType?: "ABOVE" | "BELOW";
  spendAmount?: number;
  spendType?: "ABOVE" | "BELOW";
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
}

export interface IGroupFilter {
  duration: number;
  visit: number;
  visitType: "ABOVE" | "BELOW";
  spend: number;
  spendType: "ABOVE" | "BELOW";
  _id: string;
}

export interface IUserGroup {
  _id: string;
  name: string;
  businessId: string;
  description: string;
  filter: IGroupFilter[];
  autoUpdate: boolean;
  groupType: "MANUAL" | "DYNAMIC";
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
  TODAY = "TODAY",
  YESTERDAY = "YESTERDAY",
  ONE_MONTH = "ONE MONTH",
  CUSTOM_DATE = "CUSTOM DATE",
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
  discountType: "AMOUNT" | "PERCENTAGE";
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
  when:
    | "custom"
    | "allthetime"
    | "birthdayweek"
    | "birthdaymonth"
    | "weekdays"
    | "weekends";
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
  type: "FIX";
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
  type: string;
  format?: string; // Optional, only applies to HEADER component
  text?: string;
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplateButton {
  type: string;
  text: string;
}

export interface WhatsAppTemplate {
  name: string;
  parameter_format: string;
  components: WhatsAppTemplateComponent[];
  language: string;
  status: string;
  category: string;
  bodyVariableSequence: string[];
  id: string;
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
  BANNERS = "Banners",
  DRAFTS = "Drafts",
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

export interface WhatsAppTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  image?: { link: string };
}

export interface WhatsAppTemplatePayload {
  name: string;
  parameter_format: "POSITIONAL";
  components: WhatsAppTemplateComponent[];
  language: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  category: "UTILITY" | "MARKETING" | "TRANSACTIONAL";
  id: string;
}
