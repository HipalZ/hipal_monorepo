import CouponsImage from "@/assets/services/coupons.png";
import HibizImage from "@/assets/services/hibiz.png";
import BillsImage from "@/assets/services/bills.png";
import HiPeopleImage from "@/assets/services/hi ppl.png";
import LoyaltyImage from "@/assets/services/loyalty.png";
import MenuImage from "@/assets/services/menu.png";
import StaffImage from "@/assets/services/staff.png";
import Themes from "@/assets/services/themes.png";
import Settings from "@/assets/services/setting.png";
import Services from "@/assets/services/services.png";
import Analytics from "@/assets/services/analytics.png";
import Review from "@/assets/services/review.png";

export interface ILiteVersionCardButton {
  image: string;
  text: string;
  description: string;
  navigateTo?: string;
}

export const getButtons = (outletType: string): ILiteVersionCardButton[] => [
  {
    image: Themes,
    text: "Themes ",
    description: "Make your app look good",
    navigateTo: "businessControl",
  },
  {
    image: BillsImage,
    text: "Payments",
    description: "All payment related stuff",
    navigateTo: "payments",
  },
  {
    image: StaffImage,
    text: "Staff",
    description: "Create your Team",
    navigateTo: "staff",
  },
  {
    image: HibizImage,
    text: "Hi site",
    description: "Make your website more beautiful",
    navigateTo: "hiSite",
  },
  {
    image: Settings,
    text: "Settings",
    description: "All settings in one place",
    navigateTo: "settings",
  },
  outletType === "MENU"
    ? {
        image: MenuImage,
        text: "Menu",
        description: "Manage your menu",
        navigateTo: "menu",
      }
    : {
        image: Services,
        text: "Service",
        description: "Manage your services",
        navigateTo: "services",
      },
  {
    image: HiPeopleImage,
    text: "Hi People",
    description: "Manage your PplZ Data",
    navigateTo: "people",
  },
  {
    image: LoyaltyImage,
    text: "Loyalty",
    description: "Manage your Loyalty",
    navigateTo: "loyalty",
  },
  {
    image: CouponsImage,
    text: "Coupons",
    description: "Manage your coupons",
    navigateTo: "coupons",
  },

  {
    image: HiPeopleImage,
    text: "WhatzApp",
    description: "Manage your WhatsApp",
    navigateTo: "whatzapp",
  },
  {
    image: Review,
    text: "Reviews",
    description: "Manage your reviews",
    navigateTo: "reviews",
  },
  {
    image: Analytics,
    text: "Analytics",
    description: "Get insights of your business",
    navigateTo: "analytics",
  },
];

export interface Dish {
  id: string;
  name: string;
  count: number;
}

export interface TimePeriod {
  timePeriod: string;
  topDish: Dish | null;
}

export interface AnalyticsData {
  topDishes: Dish[];
  timeBasedAnalytics: TimePeriod[];
}

export interface ApiResponse {
  err: boolean;
  data: AnalyticsData;
  message: string;
}
