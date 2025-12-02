import CouponsImage from "@/assets/services/coupons.png";
import HibizImage from "@/assets/services/hibiz.png";
import BillsImage from "@/assets/services/bills.png";
import HiPeopleImage from "@/assets/services/hi ppl.png";
import WhatzappImage from "@/assets/services/whatzapp.png";
import LoyaltyImage from "@/assets/services/loyalty.png";
import MenuImage from "@/assets/services/menu.png";
import StaffImage from "@/assets/services/staff.png";
import Themes from "@/assets/services/themes.png";
import Settings from "@/assets/services/setting.png";
import Services from "@/assets/services/services.png";
import Analytics from "@/assets/services/analytics.png";
import Review from "@/assets/services/review.png";
import Zones from "@/assets/services/zones.png";
import Events from "@/assets/services/events.jpg";
import ImageGrid from "@/assets/services/ImageGrid.png";
import PosImage from "@/assets/services/posImage.png";
import PasswordImage from "@/assets/services/password.png";
import Reports from "@/assets/services/reports.png";

export interface ILiteVersionCardButton {
  image: string;
  text: string;
  description: string;
  navigateTo: string;
}

export const getButtons = (
  outletType: string,
  isPosEnabled: boolean,
): { [key: string]: ILiteVersionCardButton[] } => ({
  management: [
    {
      image: Themes,
      text: "Themes",
      description: "Make your app look good",
      navigateTo: "themes",
    },
    {
      image: BillsImage,
      text: "Payments",
      description: "All payment related stuff",
      navigateTo: "payments",
    },
    {
      image: Reports,
      text: "Reports",
      description: "Download your Reports",
      navigateTo: "reports",
    },
    {
      image: PosImage,
      text: "Point on Sale",
      description: "Manage your POS",
      navigateTo: "pos",
    },
    {
      image: StaffImage,
      text: "Staff",
      description: "Create your Team",
      navigateTo: "staff",
    },

    {
      image: PasswordImage,
      text: "Password Management",
      description: "setup all password",
      navigateTo: "password",
    },
    {
      image: Settings,
      text: "Settings",
      description: "All settings in one place",
      navigateTo: "settings",
    },
  ],
  services: [
    {
      image: HibizImage,
      text: "Explore Page",
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
            navigateTo: "select-menu",
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

    {
      image: Events,
      text: "Birthday Events",
      description: "Add your offers for Birthday",
      navigateTo: "events",
    },
    {
      image: ImageGrid,
      text: "My Gallery",
      description: "Show about ambience & vibe",
      navigateTo: "thumbnail",
    },
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
      image: WhatzappImage,
      text: "WhatsApp",
      description: "Manage your WhatsApp",
      navigateTo: "whatzapp",
    },
    {
      image: WhatzappImage,
      text: "Instagram",
      description: "Manage your Instagram",
      navigateTo: "instagram",
    },
    ...(!isPosEnabled
      ? [
          {
            image: Analytics,
            text: "Analytics",
            description: "Get insights of your business",
            navigateTo: "analytics",
          },
        ]
      : []),
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
