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
import POS from "@/assets/services/POS.png";
import Zones from "@/assets/services/zones.png";

export interface ILiteVersionCardButton {
  image: string;
  text: string;
  description: string;
  navigateTo: string;
}

export const getButtons = (
  outletType: string,
): { [key: string]: ILiteVersionCardButton[] } => ({
  management: [
    {
      image: Themes,
      text: "Themes",
      description: "Make your app look good",
      navigateTo: "themes",
    },
    {
      image: StaffImage,
      text: "Staff",
      description: "Create your Team",
      navigateTo: "staff",
    },
    {
      image: Settings,
      text: "Settings",
      description: "All settings in one place",
      navigateTo: "settings",
    },
    {
      image: BillsImage,
      text: "Payments",
      description: "All payment related stuff",
      navigateTo: "payments",
    },
  ],
  services: [
    {
      image: HibizImage,
      text: "Hi site",
      description: "Make your website more beautiful",
      navigateTo: "explorePage",
    },
    {
      image: Zones,
      text: "Zones",
      description: "Manage your Zones and Tables",
      navigateTo: "zones",
    },
    ...(outletType === "MENU"
      ? [
          {
            image: MenuImage,
            text: "Menu",
            description: "Manage your menu",
            navigateTo: "menu",
          },
        ]
      : [
          {
            image: Services,
            text: "Services",
            description: "Manage your services",
            navigateTo: "services",
          },
        ]),
    ...(outletType === "MENU"
      ? [
          {
            image: POS,
            text: "POS",
            description: "Manage your POS",
            navigateTo: "pos",
          },
        ]
      : []),
  ],
  Coupon_And_Loyalty: [
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
  ],
  Marketing: [
    {
      image: HiPeopleImage,
      text: "Hi People",
      description: "Manage your PplZ Data",
      navigateTo: "people",
    },
    {
      image: Review,
      text: "Reviews",
      description: "Manage your reviews",
      navigateTo: "reviews",
    },
    {
      image: HiPeopleImage, // You might want to replace this with a WhatsApp-specific image
      text: "WhatsApp",
      description: "Manage your WhatsApp",
      navigateTo: "whatzapp",
    },
    {
      image: Analytics,
      text: "Analytics",
      description: "Get insights of your business",
      navigateTo: "analytics",
    },
  ],
});

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
