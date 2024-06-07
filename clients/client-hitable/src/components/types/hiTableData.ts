export interface IStatus {
  businessId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  dish: {
    dishId: string;
    name: string;
    price: number;
    qty: number;
    comments: string;
    extras: {
      name: string;
      price: string;
      quantity: number;
    }[];
    portions: {
      name: string;
      price: string;
      discount: string;
      default: string;
    };
  };
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  date: string;
  id: string;
  _id: string;
  subTotal: number;
  Total: number;
  discount: number;
  CGST: number;
  SGST: number;
  businessName: string;
  claimedAmount: number;
  serviceCharge: string;
  tips: string;
  packingCharges: number;
  RxPayableGST: number;
  swiggyPayableGST: number;
  priority: boolean;
  isDeleted: boolean;
  transferBy: string;
  switchedBy: string;
  mergedBy: string;
  kotDate: string;
  kickedOutBy: string;
  discountGivenBy: string;
  discountRemovedBy: string;
  coinsGivenBy: string;
  serviceChargeRemovedBy: string;
  serviceChargeAddedBy: string;
  itemAddedby: string;
  tipsGivenBy: string;
  staffName: string;
}

export interface IOrder {
  businessId: string;
  tableName: string;
  staffId: string;
  items: {
    businessId: string;
    zoneId: string;
    tableId: string;
    staffId: string;
    dish: {
      dishId: string;
      name: string;
      price: number;
      qty: number;
      comments: string;
      extras: {
        name: string;
        price: string;
        qty: number;
      }[];
      portions: {
        name: string;
        price: string;
        discount: string;
        default: string;
      };
    };
    customerName: string;
    customerPhone: string;
  }[];
  time: string;
  date: string;
  isAccept: boolean;
  customerName: string;
  customerPhone: string;
  id: string;
  _id: string;
}

export interface ICategory {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: Date | null;
  timerEnd: Date | null;
  availableDays: string[];
  hierarchy: string;
  coverImage: string;
  links: any[];
  dishes: any[];
  availability: boolean;
  version: number;
  id: string;
  _id: string;
  childCate: IChildCategory[];
}

export interface IChildCategory {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: Date | null;
  timerEnd: Date | null;
  availableDays: string[];
  parentCategory: string;
  parentCategoryId: string;
  hierarchy: string;
  coverImage: string;
  links: any[];
  dishes: any[];
  availability: boolean;
  version: number;
  id: string;
  _id: string;
}

export interface IBusinessData {
  settings?: ISettings;
  businessesData?: {
    businessName: string;
    registeredName: string;
    businessType: string;
    gstRegistered: boolean;
    multipleOutlets: boolean;
    customLink: string;
    logo: string;
    address: string;
    staff: string[];
    id: string;
    _id: string;
  };
  dishesData?: IDish[];
  dishData?: IDish;
  categoryData?: ICategory[];
  categories?: ICategories[];
  allCategoriesTypes?: {
    main: ICategoryTypes;
    sub: ICategorySubTypes;
  };
}

export interface ICategories extends ICategory {
  dishes: IDish[];
}

export interface ISettings {
  businessId: string;
  themes: {
    bgColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontURL: string;
    buttonStyle: string;
    miniBanner: string;
    specialBanner: string;
    endBanner: string;
    instagramLink: string;
    facebookLink: string;
    youtubeLink: string;
    linkedinLink: string;
    footerText: string;
  };
  categoryOrder: string[];
  explore: {
    wallpaper: string;
    phone: string;
    countryCode: string;
    location: string;
    openFrom: string;
    openTill: string;
    specialOffers: {
      wallpaper: string;
      offerName: string;
      redirectType?: undefined;
      redirectId?: undefined;
      redirectName?: undefined;
    }[];
    popular: {
      id: string;
      name: string;
    }[];
    highlights: {
      name: string;
      stories: string[];
    }[];
  };
  navigation: {
    from: string;
    to: string;
    categoryCard: string;
    dishCard: string;
  };
  id: string;
  _id: string;
}
export interface IDish {
  businessId: string;
  name: string;
  price: number;
  tax: null;
  visibility: boolean;
  discount: null;
  parentCategoryName: string;
  avgTime: null;
  dishType: string;
  categories: {
    id: string;
    name: string;
  }[];
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
}

export interface IExtras {
  id: string;
  _id: string;
  addOnType?: string;
  maxQuantity: number;
  name?: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  quantity: number;
  items: IExtraItem[];
}
export interface ICategory {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  hierarchy: string | 'PARENT';
  parentCategory: string;
  parentCategoryId?: string;
  coverImage: string;
  version: number;
  id: string;
  _id: string;
}

export interface ICategoryTypes {
  [key: string]: ICategory;
}

export interface ICategorySubTypes {
  [key: string]: ICategory[];
}

export interface IExtraItem {
  id: string;
  _id: string;
  ExtraType?: string;
  name: string;
  price: string;
  maxQuantity: number;
  quantity: number;
}

export interface IPortion {
  name: string;
  price: number;
  discount: string;
  default: boolean | string;
}

export interface Kitchen {
  businessId: string;
  kitchenName: string;
  description: string;
  staff: any[]; // Define more specifically if you have the structure of staff
  id: string;
  _id: string;
}
export interface Item {
  name: string;
  quantity: number;
  amount: number;
  extras: any[];
  comments: string;
}

export interface Bill {
  businessId: string;
  businessName: string;
  address: string;
  gstin: string;
  date: string;
  items: Item[];
  subTotal: number;
  sgst: number;
  cgst: number;
  total: number;
  customerId: string;
  customerName: string;
  waiterName: string;
  customerPhone: string;
  discount: null | number;
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
  _id: string;
}

export type BillsData = Bill[];

export interface IMerge {
  name: string;
  id: string;
  _id: string;
}
export interface ITable {
  businessId: string;
  zoneId: string;
  name: string;
  capacity: number;
  staff: string[];
  status: string;
  activeUser: number;
  time: string;
  totalDishQuantity: number;
  deliverdDish: number;
  role: null | string;
  hiCode: string;
  id: string;
  _id: string;
  mergeTables: IMerge[];
  isMerge: boolean;
  parentTableId: string;
  parentZoneId: string;
  hierarchy: string;
  tableId: string;
}

export interface IZoneData {
  zoneName: string;
  zoneType: string;
  staff: string[];
  tables: string[];
  Occupied: number;
  id: string;
  _id: string;
}
export interface IZone {
  zoneName: string;
  tables: ITable[];
}
export interface ITransformedTable {
  tableId: string;
  name: string;
  hierarchy: string;
  parentTableId: string;
  parentZoneId: string | undefined;
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
