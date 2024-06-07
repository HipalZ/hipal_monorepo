export interface Item {
  name: string;
  quantity: number;
  amount: number;
  extras: any[];
  comments: string;
}

export interface Bill {
  _id: string;
  serviceCharge: number;
  businessId: string;
  businessName: string;
  address: string;
  gstin: string;
  date: string;
  items: Item[];
  subTotal: number;
  sgst: number;
  cgst: number;
  tips: number;
  discountDescription: string;
  claimedAmount: any | number;
  total: number;
  customerId: string;
  customerName: string;
  waiterName: string;
  customerPhone: string;
  discount: any | number;
  mode: string;
  paymentMode: string;
  modeBreakDown: ImodeBreakDown;
  zoneId: string;
  tableId: string;
  paymentDate: string;
  time: string;
  tableName: string;
  modeCommission: number;
  duesPersonId: string;
  settle: boolean;
  id: string;
}
type ImodeBreakDown = {
  [key: string]: any;
};
export type BillsData = Bill[];

export interface Item {
  name: string;
  totaldues: number;
  duesPersonId: string;
}

export interface SaleDuesResponse {
  totalDues: number;
  items: Item[];
}

export interface DueItem {
  name: string;
  quantity: number;
  amount: number;
  extras: any[];
  comments: string;
}

export interface IDuesData {
  totalDues: number;
  userName: string;
  items: {
    businessId: string;
    businessName: string;
    address: string;
    gstin: string;
    date: string;
    items: DueItem[];
    subTotal: number;
    sgst: number;
    cgst: number;
    total: number;
    customerId: string;
    customerName: string;
    waiterName: string;
    customerPhone: string;
    discount: number | null;
    mode: string;
    paymentMode: string;
    zoneId: string;
    tableId: string;
    paymentDate: string;
    time: string;
    tableName: string;
    modeCommission: number;
    duesPersonId: string;
    settle: boolean;
    id: string;
  }[];
}

export interface CustomRole {
  businessId: string;
  customRoleId: string;
  permissions: string[];
  roleName: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: CustomRole[];
  password: string;
  id: string;
}
export interface IBusinessData {
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
  likes: any[]; // You might want to specify a more detailed type here
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
  id: string;
  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeRemovalPass: number;
}
export interface AlertData {
  businessId: string;
  subject: string;
  uniqueName: string;
  amount: number;
  lower: boolean;
  higher: boolean;
  date: string;
  value: number;
  id: string;
}

export type Customer = {
  _id: string;
  userPhone: string;
  userName: string;
  loyaltyId: string;
  rewards: number;
  password: number;
  id: string;
};

export interface IZones {
  _id: string;
  businessId: string;
  zoneName: string;
  zoneType: string;
  startTime: string;
  endTime: string;
  staff: string[];
  tables: string[];
  Occupied: number;
  charges: any[];
  id?: string;
}

export interface ICharges {
  _id: string;
  businessId: string;
  chargeName: string;
  chargeType: string;
  value: number;
  typeOfValue: string;
  id?: string;
}

// export interface Staff {
//   obj: {
//     name: string;
//     staffId: string;
//     status: string;
//     date: string;
//     businessId: string;
//     id: string;
//   };
//   obj2: {
//     date: string;
//     totalUser: number;
//     present: number;
//   };
// }

// export type StaffDetailsResponse = {
//   staff: Staff[];
// };
// export interface IStaffs{

// }
interface ICustomRole {
  businessId: string;
  customRoleId: string;
  permissions: string[];
  roleName: string;
}
export interface IStaffs {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: ICustomRole[];
  password: string;
  id: string;
}
export interface ITables {
  _id:string
  staffs?: any;
  businessId: string;
  zoneId: string;
  name: string;
  capacity: number;
  staff: any;
  status: string;
  activeUser: number;
  time: string;
  totalDishQuantity: number;
  deliverdDish: number;
  role: any;
  hiCode: string;
  id: string;
}
export interface ICharges {
  businessId: string;
  chargeName: string;
  chargeType: string;
  value: number;
  typeOfValue: string;
  id?: string;
}
export interface IDineIn {
  zones?: IZones[];
  tables?: ITables[];
  staff?: IStaffs[];
  charges?: ICharges[];
  categories?: ICategory[];
}
export type Category = {
  _id: string;
  id: string;
  name: string;
};

type Portion = {
  name: string;
  price: string;
  discount?: string;
  default: boolean;
};

type ExtraItem = {
  name: string;
  price: string;
};

export type Extra = {
  _id: string;
  id: string;
  name: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  items: ExtraItem[];
};

type Filter = {
  timeToConsume?: string;
  portionBestSuited?: string;
  levelOfSpice?: string;
  bestOccasion?: string;
  texture?: string;
  time?: string;
  bestWeather?: string;
  dishes: string[];
};

// Now the Dish type itself
export type Dish = {
  businessId: string;
  name: string;
  price: number | any;
  tax?: number;
  visibility: boolean;
  discount?: number;
  avgTime?: string;
  dishType: string;
  categories: Category[];
  portions: Portion[];
  extras: Extra[];
  kitchenId: string;
  filters: Filter;
  images: string[];
  description?: string;
  tags?: string[];
  links?: string[];
  delayTime?: string;
  availability: boolean;
  version: number;
  id: string;
  [index: string]: any;
};

export type IDish = {
  _id: string;
  id: string;
  name: string;
};
export interface IKitchen {
  _id: string
  businessId: string;
  kitchenName: string;
  description: string;
  staff: any[];
  id: string;
}
export interface ICategory {
  _id: string
  businessId: string;
  name: string;
  visibility: boolean;
  availability: boolean;
  hierarchy: "PARENT" | "CHILD";
  parentCategory: string;
  parentCategoryId: string;
  dishes: Dish[];
  id: string;
  coverImage: string;
}

export interface IDelivery {
  dishPrice: number;
  visibility: boolean;
  availability: boolean;
  kitchenId: string;
  portions: Portion[];
  extras: Extra[] | IDish;
}
export interface IPortion {
  _id: string;
  name: string;
  price: string;
  portionType: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  ExtraType: string;
  description: string;
  price: number;
  maxQuantity: number;
  availability: boolean;
  visibility: boolean;
}

export interface IAddOn {
  _id: string;
  businessId: string;
  name: string;
  addOnType: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  maxQuantity: number;
  items: AddOnItem[];
  id: string;
}
export interface IData {
  categories?: ICategory[];
  dishes?: Dish[];
  extras?: Extra[];
  kitchens?: IKitchen[];
  charges?: ICharges[];
  addOns?: IAddOn[];
}
export interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}
export interface IEditZone {
  zone: IZones;
  staff: IStaffs[];
  tables: ITables[];
  charges: ICharges[];
}
export interface IModes {
  businessId: "";
  mode: "";
  commission: 0;
  id: "";
}
export type IBusinessDetails = {
  name: string;
  registerName: string;
  businessType: string;
  address: string;
  url: string;
  logo: string;
};

export type ChildCategory = {
  [key in "childCategoryName" | "name"]: string;
} & {
  percentage: number;
  orders: number;
};

export type IAnalyticsItem = {
  [key in "parentCategoryName" | "categoryName"]: string;
} & {
  percentage: number;
  orders: number;
} & {
  [key in "childs" | "dishes"]: ChildCategory[];
};

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

export interface ICustomer {
  _id: string;
  name: string;
  id: string;
  phone: string;
  date: number;
  businessId: string;
}

export interface ICustomerzDashboard {
  totalCustomers: number;
  avgTicketValue: number;
  visitPerDay: number;
  repeatCustomers: number;
  newCustomers: number;
  Customers: ICustomer[];
}

export interface ICustomerReviews {
  customerName: string;
  phone: string;
  avgTicketValue: number;
  visitPerDay: number;
  reviews: number;
  latestBills: customerzBills[];
  latestReviews: Review[];
}

export interface Review {
  reviewerName: string;
  reviewerPhone: string;
  reviewRating: number;
  description: string;
  improvementAreas: string[];
  date: number;
  id: string;
}

export interface ICustomerzBills {
  bills: customerzBills[];
}
export interface customerzBills {
  items: Item[];
  subTotal: number;
  sgst: number;
  total: number;
  customerName: string;
  customerPhone: string;
  discount: number | null;
  mode: string;
  paymentDate: string;
  time: string;
  tableName: string;
  waiterName: string;
  tips: number;
  id: string;
}

export interface ICustomerzBillsItem {
  name: string;
  quantity: number;
  amount: number;
  category: string;
  extras: string[];
  comments: string;
}

export interface IReviewDashboard {
  data: Data;
  dailyReviewAnalysis: DailyReviewAnalysis[];
  latestReviews: ReviewDashboard[];
}

export interface Data {
  reviewCount: number;
  avgRating: number;
  positiveRatingCount: number;
  negativeRatingCount: number;
}

export interface DailyReviewAnalysis {
  totalReviewCount: number;
  count: number;
  positiveRatingCount: number;
  negativeRatingCount: number;
  positivePercentage: number;
  negativePercentage: number;
}

export interface ReviewDashboard {
  reviewerName: string;
  reviewerPhone: string;
  reviewRating: number;
  description: string;
  improvementAreas: string[];
  date: number;
  id: string;
}
